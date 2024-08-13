import { shutdonwNoExit, start } from "../src/run";
import { bind, createKnex, decryptFromAES, encryptFromAES, encryptFromRSA, getRandomBits, login, request } from "./util";
import { createTempApi } from "./util";
import { config } from "../src/config";
import { Knex } from "knex";
import { createHash } from "crypto";
import { ApiOriginPair } from "../src/types/define";


const username = 'test';
const password = 'test123';
const origin = `http://${config.server.host}:${config.server.port}`;
const testHost = '127.0.0.1';
const testPort = 13333;

const testOrigin = `http://${testHost}:${testPort}`;
const postApi = `${getRandomBits(5)}`;

const forwardBody = {
  test: 1,
}

const successResp = {
  code: 0,
  msg: 'success',
  data: 'success',
}

describe('加解密', () => {
  let db: Knex;
  let apiStopHandler: () => Promise<void>;
  let targetApi: string = '';
  let pairs: ApiOriginPair[] = [];
  const hash = createHash('sha256') .update(password).digest('hex');
  beforeAll(async () => {
    await start();
    db = await createKnex({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
    });
    const apiObj = await createTempApi(testOrigin, {
      id: postApi,
      method: 'post',
      statusCode: 200,
      resp: successResp,
    })
    targetApi = apiObj.targetApi;
    apiStopHandler = apiObj.stop;
    pairs = [{
      api: targetApi,
      origin: testOrigin,
    }];
    await bind(origin, pairs);
  });

  test('rsa 加解密', async () => {
    const headers = {
      encrypted: '1',
    }
    const body = {
      username,
      password: hash,
    }
    const encrypted = encryptFromRSA(JSON.stringify(body));
    const { data } = await request({
      url: `${origin}/auth/user`,
      method: 'post',
      headers,
      body: {
        xxx: encrypted
      }
    });
    expect({
      tidLen: 32,
      tokenLen: 64,
    }).toEqual({
      tidLen: data?.tid?.length,
      tokenLen: data?.token?.length,
    });
  });

  test('aes 加解密', async () => {
    const { data } = await login(`${origin}/auth/user`, username, password);
    const { tid, token } = data;
    const headers = {
      tid,
      encrypted: '1',
    }

    const userBuffer = Buffer.from(hash, 'hex');
    const tokenBuffer = Buffer.from(token, 'hex');
    const encryptToken = Buffer.from(
      new Array(32).fill(0).map((_, idx) => userBuffer[idx] ^ tokenBuffer[idx])
    ).toString('hex');

    const encrypted =  encryptFromAES(JSON.stringify(forwardBody), encryptToken);
    const respData = await request({
      url: `${origin}${targetApi}`,
      method: 'post',
      headers,
      body: {
        xxx: encrypted
      }
    });
    const decryptedStr = decryptFromAES((respData as any).xxx, encryptToken);
    const decrypted = JSON.parse(decryptedStr);
    expect(decrypted).toEqual(successResp);
  });

  afterAll(async () => {
    await shutdonwNoExit();
    await db('apis').whereIn('api', pairs.map(pair => pair.api)).del();
    await db.destroy();
    await apiStopHandler();
  });
});