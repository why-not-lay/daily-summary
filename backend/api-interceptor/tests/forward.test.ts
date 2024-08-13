import { start, shutdonwNoExit } from "../src/run";
import { bind, createKnex, getRandomBits, login, request } from "./util";
import { createTempApi } from "./util";
import { config } from "../src/config";
import { Knex } from "knex";
import { ERROR_NAME, SERVER_ERRORS } from "dconstant-error-type";
import { ApiOriginPair } from "../src/types/define";

const username = 'test';
const password = 'test123';
const origin = `http://${config.server.host}:${config.server.port}`;
const testHost = '127.0.0.1';
const testPort = 13333;

const testOrigin = `http://${testHost}:${testPort}`;

const successCode = 200
const postApi = `${getRandomBits(5)}`;
const getApi = `${getRandomBits(5)}`;
const successRespData = {
  code: 0,
  msg: 'success',
  data: [],
}

const errorCode = 400
const errorApi = `${getRandomBits(5)}`;
const errorRespData = {
  code: SERVER_ERRORS[ERROR_NAME.NO_AUTHORITY].code,
  data: null,
  msg: SERVER_ERRORS[ERROR_NAME.NO_AUTHORITY].desc,
}

const notExistApi = `/${getRandomBits(5)}`;

describe('接口转发', () => {
  let db: Knex;
  let tid: string = '';
  let pairs: ApiOriginPair[] = [];
  let successGetApi: string = '';
  let successPostApi: string = '';
  let errorPostApi: string = '';
  let tempApiStopHandlers: (() => Promise<void>)[] = [];
  beforeAll(async () => {
    await start();
    db = await createKnex({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
    });
    const successGetObj = await createTempApi(testOrigin, {
      id: getApi,
      method: 'get',
      statusCode: successCode,
      resp: successRespData,
    });
    const successPostObj = await createTempApi(testOrigin, {
      id: postApi,
      method: 'post',
      statusCode: successCode,
      resp: successRespData,
    });
    const errorPostObj = await createTempApi(testOrigin, {
      id: errorApi,
      method: 'post',
      statusCode: errorCode,
      resp: errorRespData,
    });
    successGetApi = successGetObj.targetApi;
    successPostApi = successPostObj.targetApi;
    errorPostApi = errorPostObj.targetApi;
    pairs = [
      {
        api: successGetApi,
        origin: testOrigin,
      },
      {
        api: successPostApi,
        origin: testOrigin,
      },
      {
        api: errorPostApi,
        origin: testOrigin,
      },
      // 不存在的 origin
      {
        api: notExistApi,
        origin: `http://${testHost}:9999`,
      },
    ]
    tempApiStopHandlers = [
      successGetObj.stop,
      successPostObj.stop,
      errorPostObj.stop,
    ]
    const {data} = await login(`${origin}/auth/user`, username, password);
    tid = data.tid;
    await bind(origin, pairs);
  })

  test('正常转发', async () => {
    const headers = {
      tid,
      'Content-Type': 'application/json',
    }
    const postForwardResp = await request({
      url: `${origin}${successGetApi}`,
      method: 'get',
      headers,
      body: {},
    });
    const getForwardResp = await request({
      url: `${origin}${successPostApi}`,
      method: 'post',
      headers,
      body: {},
    });
    const errorForwardResp = await request({
      url: `${origin}${errorPostApi}`,
      method: 'post',
      headers,
      body: {},
    });
    expect({getForwardResp, postForwardResp, errorForwardResp}).toEqual({
      getForwardResp: successRespData,
      postForwardResp: successRespData,
      errorForwardResp: errorRespData,
    });
  });

  test('转发未绑定地址', async () => {
    const headers = {
      tid,
    }
    const resp = await request({
      url: `${origin}/test/unbind`,
      method: 'post',
      headers,
      body: {},
    });
    expect(resp).toEqual({
      code: SERVER_ERRORS[ERROR_NAME.PAGE_NOT_FOUNT].code,
      data: null,
      msg: SERVER_ERRORS[ERROR_NAME.PAGE_NOT_FOUNT].desc,
    });
  });

  test('转发地址不存在', async () => {
    const headers = {
      tid,
      'Content-Type': 'application/json',
    }
    const resp = await request({
      url: `${origin}${notExistApi}`,
      method: 'post',
      headers,
    });
    expect({
      code: resp.code,
      data: resp.data,
    }).toEqual({
      code: -999,
      data: null,
    });
  });

  afterAll(async () => {
    await shutdonwNoExit();
    await db('apis').whereIn('api', pairs.map(pair => pair.api)).del();
    await db.destroy();
    await Promise.all(tempApiStopHandlers.map(handler => handler()));
  });
});
