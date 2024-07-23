import axios from "axios";

const MAX_RETRY = 3;
const MAX_REQ = 10;
const INTERVAL = 30 * 1000;

interface UrlState {
  url: string,
  active: boolean,
  retry: number,
}

const detectUrl = async (url: string) => {
  let isFail = false;
  try {
    const resp = await axios.get(url);
    if (!(/^2\d\d$/.test(`${resp.status}`))) {
      isFail = true;
    }
  } catch (error) {
    isFail = true;
  }
  return {
    [url]: isFail
  };
}

const requestPool = async (urls: string[]) => {
  let responses: {[x: string]: boolean}[] = [];
  for (let i = 0; i < urls.length; i += MAX_REQ) {
    const resps = await Promise.all(urls.slice(i, i + MAX_REQ).map(url => detectUrl(url)));
    responses = [
      ...responses,
      ...resps,
    ];
  }
  return responses;
}

const createLoop = (
  failCallback?: (urls: string[]) => void,
  finishCallback?: (states: UrlState[]) => void
) => {
  const config = {
    interval: INTERVAL,
  }
  
  let pendingUrlStates: UrlState[] = [];

  const state: { running: boolean, timer?: NodeJS.Timeout } = {
    running: false,
    timer: undefined,
  }

  const startDetecting = () => {
    state.running = true;
    state.timer = setInterval(async () => {
      if (!state.running) {
        return;
      }
      const responses = await requestPool(pendingUrlStates.map(state => state.url));
      // 更新状态
      responses.forEach(resp => {
        const [ url, isFail ] = Object.entries(resp)[0];
        const target = pendingUrlStates.find(state => state.url === url);
        if (target) {
          if (isFail) {
            target.retry += 1;
          } else {
            target.retry = 0;
          }
          if (target.retry === MAX_RETRY) {
            target.active = false;
          }
        }
      });
      // 回调失联的地址
      const inactivedUrls = pendingUrlStates.filter(state => !state.active).map(state => state.url);
      if (typeof failCallback === 'function' && inactivedUrls.length > 0) {
        if (!state.running) {
          return;
        }
        try {
          await failCallback(inactivedUrls);
        } catch (error) {
          console.error(error);
        }
      }

      // 回调所有地址
      if (typeof finishCallback === 'function') {
        if (!state.running) {
          return;
        }
        try {
          await finishCallback(JSON.parse(JSON.stringify(pendingUrlStates)));
        } catch (error) {
          console.error(error);
        }
      }

      // 清除失联的地址
      removePendingUrl(inactivedUrls);
    }, config.interval);
  }

  const stopDetecting = () => {
    state.running = false;
    clearInterval(state.timer);
  }

  // 添加待侦测的地址
  const addPendingUrls = (urls: string | string[]) => {
    urls = typeof urls === 'string' ? [ urls ] : urls;
    // 去重
    const detectingUrls = new Set(pendingUrlStates.map(state => state.url));
    urls = urls.filter(url => !detectingUrls.has(url));
    const urlStates = typeof urls === 'string' ? (
      [{
        url: urls,
        active: true,
        retry: 0,
      }]
    ) : (
      urls.map(url => ({
        url,
        active: true,
        retry: 0,
      }))
    );
    pendingUrlStates = [
      ...pendingUrlStates,
      ...urlStates,
    ];
  }

  // 删除侦测地址
  const removePendingUrl = (urls: string | string[]) => {
    const targetUrls = typeof urls === 'string' ? [urls] : urls;
    pendingUrlStates = pendingUrlStates.filter(state => !targetUrls.includes(state.url));
  }

  // 设置时间间隔
  const setTimerInterval = (interval: number) => {
    stopDetecting();
    config.interval = interval;
    startDetecting();
  }

  return {
    startLoop: () => {
      startDetecting();
    },
    stopLoop: () => {
      stopDetecting();
    },
    addPendingUrls,
    removePendingUrl,
    setTimerInterval,
  } 
}

// 监测
export const detect = (config: {
  urls: string[],
  interval?: number,
  failCallback?: (urls: string[]) => void,
  finishCallback?: (states: UrlState[]) => void,
}) => {
  const { urls, interval, failCallback, finishCallback } = config;
  const {
    startLoop,
    stopLoop,
    addPendingUrls,
    removePendingUrl,
    setTimerInterval,
  } = createLoop(failCallback, finishCallback);

  addPendingUrls(urls);
  interval && setTimerInterval(interval);

  startLoop();
  return {
    stop: stopLoop,
    addPendingUrls,
    setTimerInterval,
    removePendingUrl,
  }
}
