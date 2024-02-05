import { config } from "../config/index.js";
import { LogWrapper } from "../wrapper/log.js";
import { LogType, MsgLogInfo, ErrLogInfo } from "../types/log.js";
import Axios from 'axios';
import { errorMapping } from "../errors/constant.js";

const request = Axios.create();

const origin = config.server.origin;
const apis = [
  '/auth/user',
  '/auth/token',
  '/token/create',
  '/token/delete',
];

const bind = async () => {
  try {
    const resp = await request({
      url: `${config.server.registerOrigin}/bind`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        pairs: apis.map(api => ({ api, origin })),
      }
    })
    const { code, msg } = resp.data;
    if(code === 0) {
      const logInfo: MsgLogInfo = {
        msg: '接口绑定成功',
      }
      LogWrapper.log(LogType.MSG, logInfo);
    } else {
      const logInfo: ErrLogInfo = {
        realMsg: msg,
        msg: '接口绑定失败',
        code,
      }
      LogWrapper.log(LogType.ERR, logInfo);
    }
  } catch (error : any) {
    const { code } = errorMapping.ERROR_UNKNOWN;
    const logInfo: ErrLogInfo = {
      code,
      realMsg: error?.message ?? '',
      stack: error?.stack ?? '',
      msg: '接口绑定出错',
    }
    LogWrapper.log(LogType.ERR, logInfo);
    throw error;
  }
}

const unbind = async () => {
  try {
    const logInfo: MsgLogInfo = {
      msg: '接口解绑',
    }
    LogWrapper.log(LogType.MSG, logInfo);
    const resp = await request({
      url: `${config.server.registerOrigin}/unbind`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: { apis }
    });
    const { code, msg } = resp.data;
    if(code === 0) {
      const logInfo: MsgLogInfo = {
        msg: '接口解绑成功',
      }
      LogWrapper.log(LogType.MSG, logInfo);
    } else {
      const logInfo: ErrLogInfo = {
        realMsg: msg,
        msg: '接口解绑失败',
        code,
      }
      LogWrapper.log(LogType.ERR, logInfo);
    }
  } catch (error: any) {
    const { code } = errorMapping.ERROR_UNKNOWN;
    const logInfo: ErrLogInfo = {
      code,
      realMsg: error?.message ?? '',
      stack: error?.stack ?? '',
      msg: '接口解绑出错',
    }
    LogWrapper.log(LogType.ERR, logInfo);
    throw error;
  }
}

export {
  bind,
  unbind,
}