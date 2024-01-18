import { FastifyReply, FastifyRequest } from "fastify";
import { privateDecrypt, createDecipheriv, publicEncrypt, constants as cryptoConstants } from 'crypto';
import { config } from "../config/index.js";
import { SelfError } from "../errors/self-error.js";
import { errorMapping } from "../errors/constant.js";

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

export const decrypt = async (req: FastifyRequest, reply: FastifyReply) => {
  const { headers, body, method, url } = req;
  const path = url.split('?')?.[0] ?? ''
  const { encrypted } = headers;
  if (method.toLocaleLowerCase() === 'post' && ['/bind', '/unbind'].includes(path)) {
    return;
  }
  if (encrypted && method.toLocaleLowerCase() === 'post') {
    const { xxx } = (body as any);
    if(typeof xxx !== 'string') {
      throw new SelfError('xxx 数据类型有误', errorMapping.ERROR_REQ_BODY_PARAMS.type);
    }
    try {
      const decrypted = path === '/auth/user' ? decryptFromRSA(xxx) : decryptFromAES(xxx, config.key.aes);
      req.body = JSON.parse(decrypted);
    } catch (error) {
      throw new SelfError('数据解密失败', errorMapping.ERROR_DECRYPT.type);
    }
  }
}