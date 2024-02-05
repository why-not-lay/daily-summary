import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { createWriteStream } from 'pino-http-send';
import FastifyGracefulShutdown from 'fastify-graceful-shutdown';
import FastifyKnex from "./plugins/fastify-knex.js";
import FastifyRedis from "@fastify/redis";
import { config } from './config/index.js';
import { RespWrapper } from './wrapper/resp.js';
import { errorMapping } from './errors/constant.js';
import { SelfError } from './errors/self-error.js';
import { requestLogInterceptor } from './interceptor/request-log.js';
import { responseLogInterceptor } from './interceptor/response-log.js';
import { LogWrapper } from './wrapper/log.js';
import { ErrLogInfo, LogType, MsgLogInfo } from './types/log.js';
import { randomBytes } from 'crypto';
import { TokenType } from './types/token.js';
import { bind, unbind } from './interceptor/register-api.js';

interface UserRecord {
  uid: number,
  create_time: number,
  update_time: number,
  username: string,
  passwd: string,
  type: number,
  flag: number,
}

interface TokenRecord {
  tid: number,
  uid: number,
  token: string,
  create_time: number,
  expire_time: number,
  flag: number,
}

enum FLAGS {
  // 正常
  BASE = 1,
  // 停止位
  DEL = 1 << 1,
}

const UESR_TABLE = 'users';
const TOKEN_TABLE = 'tokens'

const logStream = createWriteStream({
  url: 'http://localhost:10050/log',
});

const fastify = Fastify({
  logger: {
    name: 'auth-center',
    level: 'info',
    stream: logStream,
  },
}).withTypeProvider<JsonSchemaToTsProvider>();

// 设置 logger
LogWrapper.setLogger(fastify.log.info.bind(fastify.log));

fastify.register(FastifyGracefulShutdown);

// redis
fastify.register(FastifyRedis, {
  host: config.redis.host,
  port: config.redis.port,
})

// mysql
fastify.register(FastifyKnex, {
  client: 'mysql2',
  connection: {
    host : config.db.host,
    port : config.db.port,
    user : config.db.user,
    password : config.db.password,
    database : 'auth_db'
  },
});

// 拦截
fastify.addHook('onReady', bind);
fastify.addHook('onRequest', requestLogInterceptor);
fastify.addHook('onResponse', responseLogInterceptor);
fastify.addHook('onClose', unbind);

// 错误处理
fastify.setErrorHandler((error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
  const { code, message: realMsg, stack } = error;
  const { statusCode, code: realCode, msg } = errorMapping[code] ?? errorMapping.ERROR_UNKNOWN;
  const infos: ErrLogInfo = {
    msg,
    stack,
    realMsg,
    code: realCode,
  }
  LogWrapper.log(LogType.ERR, infos);
  reply.status(statusCode).send(RespWrapper.error({
    code: realCode,
    msg
  }))
});


/**
 * 新建 token
 */
fastify.post(
  '/token/create',
  {
    schema: {
      // 请求体
      body: {
        type: 'object',
        properties: {
          uid: {
            type: 'number',
          },
        },
        required: ['uid']
      }
    }
  }, 
  async (req, reply) => {
    const { uid } = req.body;
    const type = TokenType.GEN;
    const flag = FLAGS.BASE;
    const token = randomBytes(32).toString('hex');
    const update = {
      uid,
      type,
      flag,
      token,
      create_time: Date.now(),
      expire_time: Date.now() + config.server.defaultTokenUnlimit * 1000,
    };
    const sql = fastify.knex(TOKEN_TABLE)
                       .insert(update)
                       .toString();
    const infos: MsgLogInfo = {
      msg: sql,
    }
    LogWrapper.log(LogType.MSG, infos);
    await fastify.knex(TOKEN_TABLE).insert(update);
    return reply.send(RespWrapper.success({
      token
    }));
  }
)

/**
 * 删除 token
 */
fastify.post(
  '/token/delete',
  {
    schema: {
      // 请求体
      body: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
        },
        required: ['token']
      }
    }
  }, 
  async (req, reply) => {
    const { token } = req.body;
    const flag = FLAGS.DEL;
    const update = {
      flag,
    };
    const sql = fastify.knex(TOKEN_TABLE)
                       .insert(update)
                       .where({token})
                       .toString();
    const infos: MsgLogInfo = {
      msg: sql,
    }
    LogWrapper.log(LogType.MSG, infos);
    await fastify.knex(TOKEN_TABLE).update(update).where({token});
    await fastify.redis.getdel(`token:${token}`);
    return reply.send(RespWrapper.success(null));
  }
)

/**
 * token 校验
 */
fastify.post(
  '/auth/token',
  {
    schema: {
      // 请求体
      body: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
        },
        required: ['token']
      }
    }
  }, 
  async (req, reply) => {
    const { token } = req.body;
    const flag = FLAGS.BASE;
    let uid = await fastify.redis.get(`token:${token}`);
    if(typeof uid !== 'string') {
      const sql = fastify.knex.select('token', 'uid')
                              .from<TokenRecord>(TOKEN_TABLE)
                              .where({
                                token,
                                flag,
                              })
                              .andWhere('expire_time', '>', Date.now())
                              .toString();
      const infos: MsgLogInfo = {
        msg: sql,
      }
      LogWrapper.log(LogType.MSG, infos);
      const tokens = await fastify.knex.select('token', 'uid')
                                        .from<TokenRecord>(TOKEN_TABLE)
                                        .where({
                                          token,
                                          flag,
                                        })
                                        .andWhere('expire_time', '>', Date.now());
      if(tokens.length === 0) {
        throw new SelfError('未通过认证', errorMapping.ERROR_AUTH.type);
      }
      uid = tokens[0].uid;
      await fastify.redis.set(`token:${token}`, `${uid}`, 'EX', config.server.defaultTokenLifetime);
    }
    return reply.send(RespWrapper.success({
      uid: Number.parseInt(uid!)
    }));
  }
)

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
    const randomBuffer = randomBytes(32);
    const userBuffer = Buffer.from(user.passwd, 'hex');
    const randomToken = randomBuffer.toString('hex');
    const token = Buffer.from(
      new Array(32).fill(0).map((_, idx) => userBuffer[idx] ^ randomBuffer[idx])
    ).toString('hex');
    await fastify.redis.set(`token:${token}`, `${user.uid}`, 'EX', config.server.defaultTokenLifetime); // 存储 token 并设置过期时间
    return reply.send(RespWrapper.success({
      token: randomToken
    }));
  }
)

fastify.listen({ port: config.server.port, host: config.server.host }, err => {
  if (err) throw err
  console.log(`server listening on ${config.server.port}`)
})