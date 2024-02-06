import { FastifyBaseLogger, FastifyInstance, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from "fastify";
import { randomBytes } from 'crypto';
import { config } from "../config/index.js";
import { LogType, MsgLogInfo } from "../types/log.js";
import { LogWrapper } from "../wrapper/log.js";
import { RespWrapper } from "../wrapper/resp.js";
import { SelfError } from "../errors/self-error.js";
import { errorMapping } from "../errors/constant.js";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";

const UESR_TABLE = 'users';

interface UserRecord {
  uid: number,
  create_time: number,
  update_time: number,
  username: string,
  passwd: string,
  type: number,
  flag: number,
}

enum FLAGS {
  // 正常
  BASE = 1,
  // 停止位
  DEL = 1 << 1,
}

export const registerAuthRoutes = (fastify: FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  JsonSchemaToTsProvider
>) => {

  /**
   * 用户校验
   */
  fastify.post(
    '/auth/user',
    {
      schema: {
        // 请求体
        body: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
            },
            password: {
              type: 'string'
            }
          },
          required: ['username', 'password']
        }
      }
    }, 
    async (req, reply) => {
      const { username, password } = req.body;
      const flag = FLAGS.BASE;
      let sql = fastify.knex.select('passwd', 'uid')
                                      .from<UserRecord>(UESR_TABLE)
                                      .where({
                                        username,
                                        flag,
                                      })
                                      .toString();
      const infos: MsgLogInfo = {
        msg: sql,
      }
      LogWrapper.log(LogType.MSG, infos);
      const users = await fastify.knex.select('passwd', 'uid')
                                      .from<UserRecord>(UESR_TABLE)
                                      .where({
                                        username,
                                        flag,
                                      })
      const user = users?.[0];
      if(!user || user.passwd !== password) {
        throw new SelfError('未通过用户认证', errorMapping.ERROR_AUTH.type);
      }
      // 生成新的临时 token
      const randomId = randomBytes(16).toString('hex');
      const randomBuffer = randomBytes(32);
      const userBuffer = Buffer.from(user.passwd, 'hex');
      const randomToken = randomBuffer.toString('hex');
      const token = Buffer.from(
        new Array(32).fill(0).map((_, idx) => userBuffer[idx] ^ randomBuffer[idx])
      ).toString('hex');
      await fastify.redis.set(`token:${token}`, `${user.uid}`, 'EX', config.server.defaultTokenLifetime); // 存储 token 并设置过期时间
      await fastify.redis.set(`tid:${randomId}`, `${token}`, 'EX', config.server.defaultTokenLifetime);
      return reply.send(RespWrapper.success({
        tokenId: randomId,
        token: randomToken
      }));
    }
  )
}