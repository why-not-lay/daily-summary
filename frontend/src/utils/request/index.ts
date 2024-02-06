import { RequestConfig, Response } from "./type";
import { isNone } from "../validate";
import { getMocker } from "../../mock";
import { encryptByRSA, encryptByAes, decryptByAes } from "../encrypt";
import { getView } from "../../context/context-provider";

const DEFAULT_REQUEST_INIT: RequestInit = {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  },
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

const before = (config: RequestConfig) => {
  const { url, headers, body, method } = config;
  const { token, tid } = getView();
  const isEncrypt = process.env.REACT_APP_ENCRYPTED
  if (isEncrypt && method === 'POST') {
    const encrypted = ['/auth/user'].includes(url) ? encryptByRSA(JSON.stringify(body)) : encryptByAes(token!, JSON.stringify(body));
    config.body = {
      tid,
      xxx: encrypted
    }
    if (headers) {
      headers.encrypted = '1';
    } else {
      config.headers = {
        encrypted: '1',
      }
    }
  }
}

const after = (
  config: { headers: Headers & { encrypted?: string }, resp: any }
) => {
  const { headers, resp } = config;
  const encrypted = headers.get('encrypted');
  const { token } = getView();
  if(encrypted) {
    const { xxx } = resp;
    const decrypted = decryptByAes(token!, xxx);
    config.resp = JSON.parse(decrypted);
  }
}

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

  before(config);

  const urlObj = new URL(url, window.location.origin);
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
      if(key === 'headers') {
        (init as any)[key] = {
         ...defaultVal,
         ...val,
        }
      }
      if(key === 'body') {
       (init as any)[key] = JSON.stringify(val) 
      }
    }
  });
  const req = new Request(url, init);
  const rawResp = await fetch(req);
  const resp = await rawResp.json();
  const respConfig = { resp, headers: rawResp.headers };

  after(respConfig);

  return respConfig.resp;
}

export { request };