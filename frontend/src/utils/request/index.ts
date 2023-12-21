import { RequestConfig, Response } from "./type";
import { isNone } from "../validate";
import { getMocker } from "../../mock";


const DEFAULT_REQUEST_INIT: RequestInit = {
  method: 'GET',
  headers: {},
};

const INIT_KEYS = [
  'method',
  'headers',
  'body',
  'mode',
  'credentials',
  'cache',
  'redirect',
  'referrer',
  'integrity',
]

const request: <T = any>(config: RequestConfig) => Promise<Response<T>> = async (config: RequestConfig) => {
  let { url, params = {}, isMock } = config;
  if(isMock) {
    const mocker = getMocker(url);
    const resp = await mocker({
      params,
      body: config.body,
      headers: config.headers,
    });
    return resp;
  }

  const urlObj = new URL(url)
  Object.entries(params).forEach(entry => {
    const [key, val] = entry;
    urlObj.searchParams.set(key, val);
  });
  url = urlObj.href;

  const init: RequestInit = {};
  INIT_KEYS.forEach(key => {
    const val = config[key];
    const defaultVal = (DEFAULT_REQUEST_INIT as any)[key];
    if(!isNone(defaultVal) || !isNone(val)) {
      (init as any)[key] = val ?? defaultVal;
    }
  });
  const req = new Request(url, init);
  const rawResp = await fetch(req);
  const resp = await rawResp.json();
  return resp;
}

export { request };