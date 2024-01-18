import { Response } from '../utils/request/type'

export interface KVPair<D> {
  key: string,
  value: D,
}

export interface LVPair<D> {
  label: string,
  value: D,
}

export interface FetcherParams<B = Record<string, any>, P = Record<string, any>, H = Record<string, string>> {
  headers?: H,
  body?: B,
  params?: P
}

export interface PageConfig {
  pageSize: number,
  pageNum: number,
}

export type Fetcher<T = any> = (FetcherParams?: FetcherParams) => Promise<Response<T>>