import axios from 'axios';
import { wait } from '../src';

const api = '/api/detect';
const hostname = '127.0.0.1';
const port = 8000;

test('测试是否正常响应', async () => {
  const close = await wait({
    api,
    port,
    hostname,
  });
  const resp = await axios.get(`http://${hostname}:${port}${api}`);
  const stateCode = resp.status;
  close(); 
  expect(stateCode).toBe(200);
});

test('测试是否错误响应', async () => {
  const close = await wait({
    api,
    port,
    hostname,
  });
  let err: any;
  try {
    await axios.get(`http://${hostname}:${port}${api}/1`);
  } catch (error) {
    err = error;
  }
  close(); 
  expect(err).toBeDefined();
});


test('测试是否正常关闭', async () => {
  const close = await wait({
    api,
    port,
    hostname,
  });
  close(); 
  let error:any;
  try {
    await axios.get(`http://${hostname}:${port}${api}`, {
      timeout: 1000
    });
  } catch (err) {
    error = err;
  }
  expect(error).toBeDefined();
});