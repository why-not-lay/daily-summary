import { FastifyReply, FastifyRequest } from "fastify";
import { privateDecrypt, createDecipheriv, constants as cryptoConstants } from 'crypto';
import { config } from "../config/index.js";
import { SelfError } from "../errors/self-error.js";
import { errorMapping } from "../errors/constant.js";
import Axios from "axios";
import { ErrLogInfo, LogType, MsgLogInfo } from "../types/log.js";
import { LogWrapper } from "../wrapper/log.js";

const request = Axios.create();

const decryptFromRSA = (data: string) => {
  const decrypted = privateDecrypt({
    key: config.key.rsa,
    padding: cryptoConstants.RSA_PKCS1_PADDING,
  }, Buffer.from(data, 'base64'));
  return decrypted.toString('utf-8');
}

const decryptFromAES = (data: string, key: string) => {
  const algorithmn = 'aes-256-cbc';
  const decipher = createDecipheriv(algorithmn, Buffer.from(key, 'hex'), config.key.iv);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;  
}

const getToken = async (tid: string) => {
  let token = '';
  try {
    const resp = await request({
      url: `${config.server.authOrigin}/token/getByTid`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        tid,
      }
    });
    const { code, msg, data } = resp.data;
    if(code === 0) {
      token = data.token;
      const logInfo: MsgLogInfo = {
        msg: `${tid}-${token}`
      }
      LogWrapper.log(LogType.MSG, logInfo);
    } else {
      const logInfo: ErrLogInfo = {
        realMsg: msg,
        msg: '获取 token 失败',
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
      msg: '获取 token 出错',
    }
    LogWrapper.log(LogType.ERR, logInfo);
  } finally {
    return token;
  }
}

export const decrypt = async (req: FastifyRequest, reply: FastifyReply) => {
  const { headers, body, method, url } = req;
  const path = url.split('?')?.[0] ?? ''
  const { encrypted } = headers;
  if (method.toLocaleLowerCase() === 'post' && ['/bind', '/unbind'].includes(path)) {
    return;
  }
  if (encrypted && method.toLocaleLowerCase() === 'post') {
    const { xxx, tid } = (body as any);
    if(typeof xxx !== 'string') {
      throw new SelfError('数据类型有误', errorMapping.ERROR_REQ_BODY_PARAMS.type);
    }
    try {
      let decrypted = '';
      if(path === '/auth/user') {
        decrypted = decryptFromRSA(xxx);
      } else {
        if(typeof tid !== 'string') {
          throw new SelfError('数据类型有误', errorMapping.ERROR_REQ_BODY_PARAMS.type);
        }
        const token = await getToken(tid);
        decrypted = decryptFromAES(xxx, token);
        req.token = token;
      }
      req.body = JSON.parse(decrypted);
    } catch (error) {
      throw new SelfError('数据解密失败', errorMapping.ERROR_DECRYPT.type);
    }
  }
}