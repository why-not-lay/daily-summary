import axios from 'axios';
import { InfluxDB } from 'influx';
import { config } from '../src/config';
import { start, shutdonwNoExit } from '../src/run';

const bits = 'abcdefghijklmnoqrstuvwxyz';
const getRandomString = (len: number = 6) => {
  return Array.from({length: len}, () => bits[Math.floor(Math.random() * bits.length)]).join('');
}

const influx = new InfluxDB({
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.database,
  schema: [
    {
      measurement: 'log',
      fields: {},
      tags: [
        'source',
        'type',
      ]
    }
  ]
});

test('测试是否正常插入日志输入数据', async () => {
  const url = `http://${config.server.host}:${config.server.port}/log`;
  const now = Date.now(); 
  let results: any = null;
  let reqRespData: any = null;
  const val1 = getRandomString();
  const val2 = getRandomString();
  const val3 = getRandomString();
  const body = [
    {
      type: 'info',
      source: 'test_1',
      info: {
        timestamp: now + 1,
        message: val1
      }
    },
    {
      type: 'error',
      source: 'test_1',
      info: {
        timestamp: now + 2,
        message: val2,
      }
    },
    {
      type: 'info',
      source: 'test_2',
      info: {
        timestamp: now + 3,
        message: val3,
      }
    },
  ]
  try {
    await start();
    const resp = await axios.post(url, {
      logs: body
    });
    reqRespData = resp.data;
    results = await influx.query(`
       SELECT * FROM "log"
       WHERE time > now() - 2s
    `);
    await shutdonwNoExit();
  } catch (error) {
    console.error(error);
  }
  results = results.map((res: any) => ({
    message: res.message,
    source: res.source,
    timestamp: res.timestamp,
    type: res.type,
  }));
  const targets = body.map(item => ({
    message: item.info.message,
    source: item.source,
    timestamp: item.info.timestamp,
    type: item.type,
  }))
  results.sort((l: any, r: any) => l.timestamp - r.timestamp);
  targets.sort((l, r) => l.timestamp - r.timestamp);
  expect({
    results,
    reqRespData,
  }).toEqual({
    results: targets,
    reqRespData: '',
  });
});
