import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify, { FastifyError, FastifyReply, FastifyRequest, RouteShorthandOptions } from "fastify";
import { createWriteStream } from 'pino-http-send';
import FastifyKnex from "./plugins/fastify-knex.js";
import FastifyRedis from "@fastify/redis";
import FastifyReplyFrom from '@fastify/reply-from';
import { config } from './config/index.js';
import { whiteListInterceptor } from './interceptor/while-list.js';
import { decrypt } from './interceptor/decrypt.js';
import { RespWrapper } from './wrapper/resp.js';
import { errorMapping } from './errors/constant.js';
import { SelfError } from './errors/self-error.js';

interface ApiRecord {
  id?: number,
  api: string,
  origin: string,
  flag: number
  // 毫秒单位时间戳
  create_time: number,
  update_time: number,
}

interface ApiOriginPair {
  api: string,
  origin: string,
}

enum FLAGS {
  // 正常
  BASE = 1,
  // 删除位
  DEL = 1 << 1,
  // 暂停位
  OFF = 1 << 2,
  // 错误位
  ERR = 1 << 3  
}

const TABLE = 'apis';
const CACHE_KEY = 'api_cache';

const logStream = createWriteStream({
  url: 'http://localhost:10050/log',
});

const fastify = Fastify({
  logger: {
    name: 'api-interceptor',
    level: 'info',
    stream: logStream,
  },
}).withTypeProvider<JsonSchemaToTsProvider>();

// redis
fastify.register(FastifyRedis, {
  host: '127.0.0.1'
})

// mysql
fastify.register(FastifyKnex, {
  client: 'mysql2',
  connection: {
    host : config.db.host,
    port : config.db.port,
    user : config.db.user,
    password : config.db.password,
    database : 'api_db'
  },
});

// 请求转发
fastify.register(FastifyReplyFrom);

// 拦截
fastify.addHook('onRequest', whiteListInterceptor);
fastify.addHook('preValidation', decrypt);

// 错误处理
fastify.setErrorHandler((error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
  const { code } = error;
  const { statusCode, code: realCode, msg } = errorMapping[code] ?? errorMapping.ERROR_UNKNOWN;
  reply.status(statusCode).send(RespWrapper.error({
    code: realCode,
    msg
  }))
});

const validateOrigin = (origin: string) => /^(https?):\/\/(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(:\d+)?$/.test(origin);

const getPairs = async (apis: string[], flag = FLAGS.BASE) => {
  const origins = await fastify.redis.hmget(CACHE_KEY, ...apis);
  const pairs = origins.map((origin, idx) => ({
    api: apis[idx],
    origin: origin,
  }));
  const uncached = pairs.filter(pair => typeof pair.origin !== 'string');
  if(uncached.length === 0){
    return pairs;
  }
  const sql = fastify.knex.select('origin', 'api').from<ApiRecord>(TABLE).where('flag', flag).andWhere(builder => builder.whereIn('api', uncached.map(pair => pair.api))).toString();
  fastify.log.info(sql)
  const res: ApiOriginPair[] = await fastify.knex.select('origin', 'api').from<ApiRecord>(TABLE).where('flag', flag).andWhere(builder => builder.whereIn('api', uncached.map(pair => pair.api)));
  if(res.length > 0) {
    const updates: Record<string, string> = {};
    res.forEach(pair => {
      const { origin, api } = pair;
      const target = uncached.find(pair => pair.api === api);
      updates[api] = origin;
      if(target) {
        target.api = api;
        target.origin = origin;
      }
    });
    await fastify.redis.hset(CACHE_KEY, updates);
    return pairs;
  }
  return pairs;
}

const bindSchema: RouteShorthandOptions = {
  schema: {
    // 请求体
    body: {
      type: 'object',
      properties: {
        // ApiOriginPair[]
        pairs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              api: {type: 'string'},
              origin: {type: 'string'},
            },
            required: ['api', 'origin']
          },
          default: [],
        },
      },
    }
  }
}

/**
 * 注册接口
 */
fastify.post<{
  Body: {
    pairs: ApiOriginPair[]
  }
}>('/bind', bindSchema, async (req, reply) => {
  const { pairs } = req.body;
  const targetFlag = FLAGS.BASE;
  const updates: ApiRecord[] = pairs.map(pair => ({
    ...pair,
    flag: targetFlag,
    update_time: Date.now(),
    create_time: Date.now(),
  }));
  if(pairs.length > 0) {
    const apis = pairs.map(pair => pair.api);

    const sql = fastify.knex(TABLE).insert(updates).onConflict('api').merge(['origin', 'update_time', 'flag']).toString();
    fastify.log.info(sql)
    await fastify.knex(TABLE).insert(updates).onConflict('api').merge(['origin', 'update_time', 'flag']);
    // 清除旧缓存
    await fastify.redis.hdel(CACHE_KEY, ...apis);
  }
  return reply.send(RespWrapper.success(null));
})

/**
 * 解绑接口
 */
fastify.post(
  '/unbind',
  {
    schema: {
      // 请求体
      body: {
        type: 'object',
        properties: {
          apis: {
            type: 'array',
            items: {
              type: 'string'
            },
          }
        },
        required: ['apis']
      }
    }
  }, 
  async (req, reply) => {
    const { apis } = req.body;
    const targetFlag = FLAGS.BASE | FLAGS.OFF;
    if (apis.length > 0) {
      // 清除缓存
      await fastify.redis.hdel(CACHE_KEY, ...apis);
      // 设置数据 flag
      const sql = fastify.knex(TABLE).update({
        flag: targetFlag,
        update_time: Date.now(),
      }).whereIn('api', apis).toString();
      fastify.log.info(sql)
      await fastify.knex(TABLE).update({
        flag: targetFlag,
        update_time: Date.now(),
      }).whereIn('api', apis);
    }
    return reply.send(RespWrapper.success(null));
  }
)

fastify.get('*', async (req, reply) => {
  const { url } = req;
  const pair = (await getPairs([url]))?.[0] ?? {};
  const { origin } = pair;
  if(validateOrigin(String(origin))) {
    return reply.from(`${origin}${url}`);
  } else {
    const { type, msg } = errorMapping.ERROR_NOT_FOUND
    throw new SelfError(msg, type);
  }
})

fastify.post('*', async (req, reply) => {
  const { url } = req;
  const pair = (await getPairs([url]))?.[0] ?? {};
  const { origin } = pair;
  if(validateOrigin(String(origin))) {
    return reply.from(`${origin}${url}`);
  } else {
    const { type, msg } = errorMapping.ERROR_NOT_FOUND
    throw new SelfError(msg, type);
  }
})

fastify.listen({ port: config.server.port, host: config.server.host }, err => {
  if (err) throw err
  console.log(`server listening on ${config.server.port}`)
})