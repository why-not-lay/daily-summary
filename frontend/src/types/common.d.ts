import { Response } from '../utils/request/type'

export interface KVPair<D> {
  key: string,
  value: D,
}

export interface LVPair<D> {
  label: string,
  value: D,
}

export interface FetcherParams {
  headers?: Record<string, string>,
  body?: Record<string, any>,
  params?: Record<string, any>
}

export interface PageConfig {
  pageSize: number,
  pageNum: number,
}

export type Fetcher<T = any> = (FetcherParams?: FetcherParams) => Promise<Response<T>>