import { FastifyReply, FastifyRequest } from "fastify";
import { createCipheriv } from 'crypto';
import { config } from "../config/index.js";
import { SelfError } from "../errors/self-error.js";
import { errorMapping } from "../errors/constant.js";

const encryptFromAES = (data: string, key: string) => {
  const algorithmn = 'aes-256-cbc';
  const cipher = createCipheriv(algorithmn, Buffer.from(key, 'hex'), config.key.iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;  
}

export const encrypt = async (req: FastifyRequest, reply: FastifyReply, payload: any) => {
  const { headers, method, url } = req;
  const path = url.split('?')?.[0] ?? ''
  const { encrypted } = headers;
  if (method.toLocaleLowerCase() === 'post' && ['/bind', '/unbind', '/auth/user'].includes(path)) {
    return payload;
  }
  if(encrypted && method.toLocaleLowerCase() === 'post') {
    try {
      const encryptedData = encryptFromAES(JSON.stringify(payload), config.key.aes);
      reply.header('encrypted', '1');
      return {
        xxx: encryptedData
      }
    } catch (error) {
      throw new SelfError('数据加密失败', errorMapping.ERROR_ENCRYPT.type);
    }
  }
  return payload;
}