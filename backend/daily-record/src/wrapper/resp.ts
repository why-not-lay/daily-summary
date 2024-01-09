import { STATUS } from "../types/status.js";

export interface ServerError {
  code: number,
  msg: string,
}


export const RespWrapper = {
  info(code: number, data: any, msg?: string) {
    return {
      code,
      data,
      msg: msg ?? null
    }
  },
  success(data: any) {
    return this.info(STATUS.SUCCESS, data, 'success');
  },
  error(error: ServerError) {
    return this.info(error.code, null, error.msg);
  }
}
