import { Knex } from 'knex';

declare module 'fastify' {
  interface FastifyInstance {
    sessions: Sessions,
    knex: Knex,
    cLog: {
      info: (type: string, message: string) => void,
      error: (message: string) => void,
    },
    detector: {
      addPendingUrls: (urls: string | string[]) => void;
      removePendingUrl: (urls: string | string[]) => void;
    }
  }

  interface FastifyRequest {
    session?: Session,
    right?: Rights,
  }
}

export enum Rights {
  private = 'private',
  public = 'public',
}

export interface ApiOriginPair {
  api: string,
  origin: string,
}

export interface ApiRecord {
  id?: number,
  api?: string,
  origin?: string,
  flag?: number
  // 毫秒单位时间戳
  create_time?: number,
  update_time?: number,
}

export interface Session {
  id?: string,
  timestamp?: number,
  [x: string]: any,
} 

export interface Sessions {
  getSession: (id: string) => Session | undefined,
  setSession: (id: string, session: Session) => void,
  startAutoClear: () => () => void,
}

export enum FLAGS {
  // 正常
  BASE = 1,
  // 删除位
  DEL = 1 << 1,
  // 暂停位
  OFF = 1 << 2,
  // 错误位
  ERR = 1 << 3  
}

export enum API_FLAGS {
  // 正常
  BASE = 1,
  // 删除位
  DEL = 1 << 1,
  // 暂停位
  OFF = 1 << 2,
  // 错误位
  ERR = 1 << 3  
}

export enum USER_FLAGS {
  // 正常
  BASE = 1,
  // 停止
  DEL = 1 << 1,
}


export interface UserRecord {
  uid: number,
  create_time: number,
  update_time: number,
  username: string,
  passwd: string,
  type: number,
  flag: number,
}