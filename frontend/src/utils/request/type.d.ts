export interface Response<T = any> {
  code: number;
  data: T;
  msg: string | null;
}

export type RequestConfig = {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: Record<string, any>;
  params?: Record<string, string>;
  isMock?: boolean,
} & Record<string, any>

export type Request<DataType> = (config: RequestConfig) => Response<DataType>
