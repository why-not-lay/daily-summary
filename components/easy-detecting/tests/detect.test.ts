import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { detect } from '../src';

const api = '/api/detect';

test('测试监测能否正常停止', async () => {
  const url = `http://127.0.0.1:8000${api}`;
  const mock = new MockAdapter((axios as any));
  const data = '';
  mock.onGet(`${url}/200`).reply(200, data);
  let times = 0;

  await new Promise((resolve) => {
    const { stop, setTimerInterval } = detect({
      urls: [
        `${url}/200`,
      ],
      finishCallback: (states: any[]) => {
        times += 1;
        if (times === 3) {
          stop();
          resolve(states);
        }
      }
    });
    setTimerInterval(100);
  });

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 500);
  });

  expect(times).toBe(3);
});


test('测试三次两链接监测返回', async () => {
  const url = `http://127.0.0.1:8000${api}`;
  const mock = new MockAdapter((axios as any));
  const data = '';
  mock.onGet(`${url}/200`).reply(200, data);
  mock.onGet(`${url}/404`).reply(404, data);

  const states: any[] = await new Promise((resolve) => {
    let times = 0;
    const { stop, setTimerInterval } = detect({
      urls: [
        `${url}/200`,
        `${url}/404`,       
        `${url}/500`,       
      ],
      finishCallback: (states: any[]) => {
        times += 1;
        if (times === 3) {
          stop();
          resolve(states);
        }
      }
    });
    setTimerInterval(100);
  });

  expect(states).toEqual([
    {
      url: `${url}/200`,
      active: true,
      retry: 0,
    },
    {
      url: `${url}/404`,
      active: false,
      retry: 3,
    },
    {
      url: `${url}/500`,
      active: false,
      retry: 3,
    }
  ]);
});

test('测试失联链接后逻辑', async () => {
  const url = `http://127.0.0.1:8000${api}`;
  const mock = new MockAdapter((axios as any));
  const data = '';
  mock.onGet(`${url}/404`).reply(404, data);
  let inactivedUrls: string[] = [];

  const states: any[] = await new Promise((resolve) => {
    let times = 0;
    const { stop, setTimerInterval } = detect({
      urls: [
        `${url}/404`,       
      ],
      failCallback: (urls: string[]) => {
        inactivedUrls = urls;
      },
      finishCallback: (states: any[]) => {
        times += 1;
        if (times === 4) {
          stop();
          resolve(states);
        }
      }
    });
    setTimerInterval(100);
  });

  const res = {
    states,
    inactivedUrls,
  }

  expect(res).toEqual({
    states: [],
    inactivedUrls: [
      `${url}/404`,       
    ]
  });
});

test('测试监测过程中新增地址逻辑', async () => {
  const url = `http://127.0.0.1:8000${api}`;
  const mock = new MockAdapter((axios as any));
  const data = '';
  mock.onGet(`${url}/200`).reply(200, data);
  mock.onGet(`${url}/new`).reply(200, data);

  const states: any[] = await new Promise((resolve) => {
    let times = 0;
    const { stop, setTimerInterval, addPendingUrls } = detect({
      urls: [
        `${url}/200`,
      ],
      finishCallback: (states: any[]) => {
        times += 1;
        if (times === 3) {
          stop();
          resolve(states);
        }
      }
    });
    setTimeout(() => {
      addPendingUrls([
        `${url}/new`,
      ])
    }, 150);
    setTimerInterval(100);
  });

  expect(states).toEqual([
    {
      url: `${url}/200`,
      active: true,
      retry: 0,
    },
    {
      url: `${url}/new`,
      active: true,
      retry: 0,
    },
  ]);
});

test('测试监测过程中删除地址逻辑', async () => {
  const url = `http://127.0.0.1:8000${api}`;
  const mock = new MockAdapter((axios as any));
  const data = '';
  mock.onGet(`${url}/200`).reply(200, data);
  mock.onGet(`${url}/201`).reply(200, data);

  const states: any[] = await new Promise((resolve) => {
    let times = 0;
    const { stop, setTimerInterval, removePendingUrl } = detect({
      urls: [
        `${url}/200`,
        `${url}/201`,
      ],
      finishCallback: (states: any[]) => {
        times += 1;
        if (times === 3) {
          stop();
          resolve(states);
        }
      }
    });
    setTimeout(() => {
      removePendingUrl([
        `${url}/201`,
      ])
    }, 150);
    setTimerInterval(100);
  });

  expect(states).toEqual([{
    url: `${url}/200`,
    active: true,
    retry: 0,
  }]);
});

test('测试监测过程大批量请求', async () => {
  const maxReq = 50;
  const url = `http://127.0.0.1:8000${api}`;
  const mock = new MockAdapter((axios as any));
  const data = '';
  mock.onGet(new RegExp(`${url}`)).reply(200, data);
  const urls = Array.from({length: maxReq}, (_, k) => `${url}/${k}`);

  const states: any[] = await new Promise((resolve) => {
    const { stop, setTimerInterval } = detect({
      urls,
      finishCallback: (states: any[]) => {
        stop();
        resolve(states);
      }
    });
    setTimerInterval(100);
  });

  const targetStates = urls.map(url => ({
    url,
    active: true,
    retry: 0,
  }));

  expect(states).toEqual(targetStates);
});
