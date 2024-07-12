import { ERROR_NAME, SERVER_ERRORS } from "../src";

test('测试错误结果是否正常', async () => {
  expect(SERVER_ERRORS[ERROR_NAME.INTERNAL_SERVER]).toEqual({
    code: -5,
    desc: '服务器内部出错',
  })
});