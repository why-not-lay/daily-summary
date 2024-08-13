
import { ERROR_NAME, SERVER_ERRORS } from "dconstant-error-type";
import { config } from "../src/config"
import { shutdonwNoExit, start } from "../src/run";
import { ApiOriginPair } from "../src/types/define";
import { bind, createKnex, getRandomBits } from "./util";
import { Knex } from "knex";

const origin = `http://${config.server.host}:${config.server.port}`;

const prefix = '/test';

const errPairs: ApiOriginPair[] = [
  {
    api: `${prefix}/${getRandomBits(6)}`,
    origin: `http://127.0.0.1:9090/${getRandomBits(6)}`,
  },
  {
    api: `${prefix}/${getRandomBits(6)}`,
    origin: `https://example.com`,
  },
]

const pairs: ApiOriginPair[] = [
  {
    api: `${prefix}/${getRandomBits(6)}`,
    origin: `http://127.0.0.1:9090`,
  },
  {
    api: `${prefix}/${getRandomBits(6)}`,
    origin: `https://example.com`,
  },
  {
    api: `${prefix}/${getRandomBits(6)}`,
    origin: `https://127.0.0.1:8080`,
  },
];

describe('测试绑定接口', () => {

  let db:Knex;

  beforeAll(async () => {
    await start();
    db = await createKnex({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
    })
  });

  test('正常请求', async () => {
    const respData = await bind(origin, pairs);
    const values = pairs.map(pair => pair.api);
    const dbData = await db('apis').select('api', 'origin', 'flag').whereIn('api', values);
    await db('apis').whereIn('api', values).del();
    const targetDbData = pairs.map(pair => ({
      ...pair,
      flag: 1,
    }))
    targetDbData.sort((l: any, r: any) => (l.api > r.api ? 1 : (l.api === r.api ? 0 : -1)));
    dbData.sort((l: any, r: any) => (l.api > r.api ? 1 : (l.api === r.api ? 0 : -1)));
    expect({
      respData,
      dbData,
    }).toEqual({
      respData: {
        code: 0,
        data: null,
        msg: 'success'
      },
      dbData: targetDbData,
    })
  })

  test('错误源', async () => {
    const respData = await bind(origin, errPairs);
    const values = pairs.map(pair => pair.api);
    const dbData = await db('apis').select('api', 'origin', 'flag').whereIn('api', values);
    await db('apis').whereIn('api', values).del();
    expect({
      respData,
      dbData,
    }).toEqual({
      respData: {
        code: SERVER_ERRORS[ERROR_NAME.REQ_BODY].code,
        data: null,
        msg: SERVER_ERRORS[ERROR_NAME.REQ_BODY].desc,
      },
      dbData: [],
    })
  })

  afterAll(async () => {
    await shutdonwNoExit();
    await db.destroy();
  });
})

