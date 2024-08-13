import { SERVER_ERRORS, ERROR_NAME } from "dconstant-error-type";
import { config } from "../src/config"
import { shutdonwNoExit, start } from "../src/run";
import { login } from "./util";

const username = 'test';
const password = 'test123';
const origin = `http://${config.server.host}:${config.server.port}`;


describe('测试认证', () => {
  beforeAll(async () => {
    await start();
  });

  test('认证成功', async () => {
    const {data, msg, code} = await login(`${origin}/auth/user`, username, password);
    const { tid, token } = data;
    const compare = {
      code,
      msg,
      tidLen: tid.length,
      tokenLen: token.length,
    }
    expect(compare).toEqual({
      code: 0,
      msg: 'success',
      tidLen: 32,
      tokenLen: 64,
    })
  });

  test('认证失败', async () => {
    const respData = await login(`${origin}/auth/user`, username, '111');
    expect(respData).toEqual({
      code: SERVER_ERRORS[ERROR_NAME.NO_AUTHORITY].code,
      msg: SERVER_ERRORS[ERROR_NAME.NO_AUTHORITY].desc,
      data: null
    })
  });

  afterAll(async () => {
    await shutdonwNoExit();
  });
});