import { REQUEST_URL } from "../constant/common";
import { FetcherParams } from "../types/common";
import { request } from "../utils/request";

export interface DailyRow {
  id: string,
  source: string,
  action: string,
  createTime: number,
}

export interface DailyData {
  total: number,
  records: DailyRow[],
}

export interface DailyOpt {
  res: string[]
}

export const dailyListReq = (fetcherParams?: FetcherParams, isMock = false) => {
  return request<DailyData>({
    isMock,
    url: REQUEST_URL.DAILY_LIST_REQ,
    method: 'POST',
    body: fetcherParams?.body,
    params: fetcherParams?.params,
    headers: fetcherParams?.headers,
  });
}

export const dailyOptReq = (fetcherParams?: FetcherParams, isMock = false) => {
  return request<DailyOpt>({
    isMock,
    url: REQUEST_URL.DAILY_OPT_REQ,
    method: 'POST',
    body: fetcherParams?.body,
    params: fetcherParams?.params,
    headers: fetcherParams?.headers,
  });
}
