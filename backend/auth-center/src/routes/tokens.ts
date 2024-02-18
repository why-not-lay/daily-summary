import { FastifyBaseLogger, FastifyInstance, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from "fastify";
import { randomBytes } from 'crypto';
import { TokenType } from '../types/token.js';
import { config } from "../config/index.js";
import { LogType, MsgLogInfo } from "../types/log.js";
import { LogWrapper } from "../wrapper/log.js";
import { RespWrapper } from "../wrapper/resp.js";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";

export const TOKEN_TABLE = 'tokens'

export interface TokenRecord {
  tid: string,
  uid: string,
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

export const registerTokensRoutes = (fastify: FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  JsonSchemaToTsProvider
>) => {

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
              type: 'string',
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
      const tid = randomBytes(16).toString('hex');
      const token = randomBytes(32).toString('hex');
      const update = {
        tid,
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
        tid,
        token
      }));
    }
  )

  /**
   * 根据 tid 获取 token 信息
   */
  fastify.post(
    '/token/getByTid',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            tid: {
              type: 'string',
            }
          },
          required: ['tid']
        }
      }
    },
    async (req, reply)=> {
      const { tid } = req.body;
      const flag = FLAGS.BASE;
      let uid = '';
      let token = await fastify.redis.get(`tid:${tid}`);
      if(token) {
        const matchUid = await fastify.redis.get(`token:${token}`);
        uid = matchUid ?? '';
      } else {
        const sql = fastify.knex
                            .select('token', 'uid')
                            .from(TOKEN_TABLE)
                            .where({
                              tid,
                              flag,
                            })
                            .andWhere('expire_time', '>', Date.now())
                            .toString();
        const infos: MsgLogInfo = {
          msg: sql,
        }
        LogWrapper.log(LogType.MSG, infos);
        const records = await fastify.knex
                            .select('token', 'uid')
                            .from(TOKEN_TABLE)
                            .where({
                              tid,
                              flag,
                            })
                            .andWhere('expire_time', '>', Date.now());
        token = records.length ? records[0].token : '';
        if(token) {
          uid = records[0].uid;
          await Promise.all([
            await fastify.redis.set(`token:${token}`, `${uid}`, 'EX', config.server.defaultTokenLifetime),
            await fastify.redis.set(`tid:${tid}`, `${token}`, 'EX', config.server.defaultTokenLifetime),
          ]);
        }
      }
      return reply.send(RespWrapper.success({ token, uid }));
    }
  )

  /**
   * 获取 uid 获取 token
   */
  fastify.post(
    '/token/get',
    {
      schema: {
        // 请求体
        body: {
          type: 'object',
          properties: {
            uid: {
              type: 'string'
            },
            pageSize: {
              type: 'number',
              default: 10,
            },
            pageNum: {
              type: 'number',
              default: 1,
            },
            create_time_start: {
              type: 'number'
            },
            create_time_end: {
              type: 'number'
            },
            expire_time_start: {
              type: 'number'
            },
            expire_time_end: {
              type: 'number'
            },
          },
          required: ['uid']
        }
      }
    },
    async (req, reply) => {
      const flag = FLAGS.BASE;
      const { pageNum, pageSize, uid, create_time_end, create_time_start, expire_time_end, expire_time_start } = req.body;
      const sql = fastify.knex.select('tid', 'token', 'create_time', 'expire_time')
                                        .from<TokenRecord>(TOKEN_TABLE)
                                        .where({
                                          uid,
                                          flag,
                                        })
                                        .andWhere(builder => {
                                          if (typeof create_time_start === 'number' && typeof create_time_end === 'number') {
                                            builder.whereBetween('create_time', [create_time_start, create_time_end]);
                                          }
                                        })
                                        .andWhere(builder => {
                                          if (typeof expire_time_start === 'number' && typeof expire_time_end === 'number') {
                                            builder.whereBetween('expire_time', [expire_time_start, expire_time_end]);
                                          }
                                        })
                                        .offset((pageNum! - 1) * pageSize!)
                                        .limit(pageSize!)
                                        .toString();
      const infos: MsgLogInfo = {
        msg: sql,
      }
      LogWrapper.log(LogType.MSG, infos);
      const records = await fastify.knex.select('tid', 'token', 'create_time', 'expire_time')
                                        .from<TokenRecord>(TOKEN_TABLE)
                                        .where({
                                          uid,
                                          flag,
                                        })
                                        .andWhere(builder => {
                                          if (typeof create_time_start === 'number' && typeof create_time_end === 'number') {
                                            builder.whereBetween('create_time', [create_time_start, create_time_end]);
                                          }
                                        })
                                        .andWhere(builder => {
                                          if (typeof expire_time_start === 'number' && typeof expire_time_end === 'number') {
                                            builder.whereBetween('expire_time', [expire_time_start, expire_time_end]);
                                          }
                                        })
                                        .offset((pageNum! - 1) * pageSize!)
                                        .limit(pageSize!);
      const cur: {count: string}[] = await fastify.knex(TOKEN_TABLE).where({uid, flag}).count({count: '*'});
      const total = Number.parseInt(cur[0].count);
      return reply.send(RespWrapper.success({ records, total }));
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
            tid: {
              type: 'string',
            },
          },
          required: ['tid']
        }
      }
    }, 
    async (req, reply) => {
      const { tid } = req.body;
      const flag = FLAGS.DEL;
      const update = {
        flag,
      };
      const sql = fastify.knex(TOKEN_TABLE)
                         .insert(update)
                         .where({tid})
                         .toString();
      const infos: MsgLogInfo = {
        msg: sql,
      }
      LogWrapper.log(LogType.MSG, infos);
      await fastify.knex(TOKEN_TABLE).update(update).where({tid});
      const token = await fastify.redis.getdel(`tid:${tid}`);
      await fastify.redis.getdel(`token:${token}`);
      return reply.send(RespWrapper.success(null));
    }
  )

}