import { REQUEST_URL, RESPONSE_CODE } from "../constant/common";
import { Fetcher } from "../types/common";
import { dailyListMocker } from "./mocker/daily-list";

const generateMockerStore = () => {
  const store = new Map<string, Fetcher>();

  const registerMocker = (path: string, mocker: Fetcher) => {
    store.set(path, mocker);
  }

  const getMocker = (path: string) => {
    return store.get(path) ?? (async () => {
      return {
        code: RESPONSE_CODE.UNSET_MOCKER,        
        data: null,
        msg: '未设置 mocker'
      }
    })
  }

  return {
    registerMocker,
    getMocker,
  }
}

const { registerMocker, getMocker } = generateMockerStore();

/**
 * 注册 mocker
 */
registerMocker(REQUEST_URL.DAILY_LIST_REQ, dailyListMocker)

export {
  registerMocker,
  getMocker,
}