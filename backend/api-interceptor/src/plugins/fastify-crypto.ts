import { privateDecrypt, createDecipheriv, constants as cryptoConstants, createCipheriv } from 'crypto';
import { config } from '../config';
import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin'
import { CustomError } from '../errors/custom-error';
import { ERROR_NAME } from 'dconstant-error-type';
import { Rights } from '../types/define';

const decryptFromRSA = (data: string) => {
  const decrypted = privateDecrypt({
    key: config.key.private,
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

const encryptFromAES = (data: string, key: string) => {
  const algorithmn = 'aes-256-cbc';
  const cipher = createCipheriv(algorithmn, Buffer.from(key, 'hex'), config.key.iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;  
}

const cryptoPlugin: FastifyPluginCallback = (fastify: FastifyInstance, options, done: any) => {
  // 解密过程
  fastify.addHook('preValidation', async (req: FastifyRequest, reply: FastifyReply) => {
    const { headers, body, method, url, session } = req;
    const path = url.split('?')?.[0] ?? ''
    const { encrypted } = headers;
    const token: string = session?.token || '';
    const right = req.right;
    if (right === Rights.public) {
      return;
    }
    if (typeof body !== 'object') {
      return;
    }
    // 已加密数据需要解密
    if (encrypted && method.toLocaleLowerCase() === 'post') {
      const { xxx } = (body as any);
      if(typeof xxx !== 'string') {
        throw new CustomError({
          name: ERROR_NAME.REQ_BODY,
        });
      }
      try {
        let decrypted = '';
        if(path === '/auth/user') {
          decrypted = decryptFromRSA(xxx);
        } else {
          decrypted = decryptFromAES(xxx, token);
        }
        req.body = JSON.parse(decrypted);
      } catch (error) {
        throw new CustomError({
          name: ERROR_NAME.INTERNAL_SERVER,
        });
      }
    }
  });

  // 加密过程
  fastify.addHook('preSerialization', async (req: FastifyRequest, reply: FastifyReply, payload: any) => {
    const { headers, method, session } = req;
    const { encrypted } = headers;
    const token: string = session?.token || '';
    const right = req.right;
    if (right === Rights.public) {
      return payload;
    }
    if(encrypted && token && method.toLocaleLowerCase() === 'post') {
      try {
        const encryptedData = encryptFromAES(JSON.stringify(payload), token);
        reply.header('encrypted', '1');
        return {
          xxx: encryptedData
        }
      } catch (error) {
        throw new CustomError({
          name: ERROR_NAME.INTERNAL_SERVER,
        })
      }
    }
    return payload;
  });

  done()
}


export default fp(cryptoPlugin, { name: 'fastify-crypto' });