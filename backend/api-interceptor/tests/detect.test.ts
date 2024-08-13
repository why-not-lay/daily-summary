import { shutdonwNoExit, start } from "../src/run";
import { bind, createKnex, decryptFromAES, encryptFromAES, encryptFromRSA, getRandomBits, login, request } from "./util";
import { createTempApi } from "./util";
import { config } from "../src/config";
import { Knex } from "knex";
import { API_FLAGS, ApiOriginPair } from "../src/types/define";


const origin = `http://${config.server.host}:${config.server.port}`;
const testHost = '127.0.0.1';
const testPort = 13333;

const testOrigin = `http://${testHost}:${testPort}`;
const getApi = `detect`;

describe('定时检测', () => {
  let db: Knex;
  let apiStopHandler: () => Promise<void>;
  let targetApi: string = '';
  let pairs: ApiOriginPair[] = [];
  let targetData: any[] = [];
  beforeAll(async () => {
    await start();
    db = await createKnex({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
    });
    const apiObj = await createTempApi(testOrigin, {
      id: getApi,
      method: 'get',
      statusCode: 200,
      resp: null,
    })
    targetApi = apiObj.targetApi;
    apiStopHandler = apiObj.stop;
    pairs = [
      {
        api: targetApi,
        origin: testOrigin,
      },
      // 不存在
      {
        api: '/temp/aaaa',
        origin: 'http://127.0.0.1:13308',
      },
    ];
    targetData = [
      {
        api: targetApi,
        origin: testOrigin,
        flag: API_FLAGS.BASE,
      },
      // 不存在
      {
        api: '/temp/aaaa',
        origin: 'http://127.0.0.1:13308',
        flag: API_FLAGS.DEL,
      },
    ]
    await bind(origin, pairs);
  });

  test('自动检测', async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('');
      }, 2000);
    });
    const dbData = await db('apis').select('api', 'origin', 'flag').whereIn('api', pairs.map(pair => pair.api));
    targetData.sort((l: any, r: any) => (l.api > r.api ? 1 : (l.api === r.api ? 0 : -1)));
    dbData.sort((l: any, r: any) => (l.api > r.api ? 1 : (l.api === r.api ? 0 : -1)));
    expect(dbData).toEqual(targetData);
  });

  afterAll(async () => {
    await shutdonwNoExit();
    await db('apis').whereIn('api', pairs.map(pair => pair.api)).del();
    await db.destroy();
    await apiStopHandler();
  });
});