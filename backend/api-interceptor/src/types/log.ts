import { IncomingHttpHeaders } from "http";

export enum LogType {
  REQ ='request',
  RESP = 'response',
  ERR = 'error',
  MSG = 'message',
}

export interface Log<T = any> {
  isCustom: boolean,
  timestamp: number,
  type: string,
  infos?: T,
}

export interface ReqLogInfo {
  id: string,
  ip: string,
  api: string,
  method: string,
  hostname: string,
  headers: IncomingHttpHeaders,
}

export interface RespLogInfo {
  requestId: string,
  ip: string,
  api: string,
  headers: any,
  statusCode: number,
}

export interface ErrLogInfo {
  stack?: string,
  realMsg: string,
  msg: string,
  code: number,
}

export interface MsgLogInfo {
  msg: string,
}

