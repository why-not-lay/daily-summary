import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import FastifyGracefulShutdown from 'fastify-graceful-shutdown';
import Axios from 'axios';
import { createWriteStream } from 'pino-http-send';
import FastifyKnex from "./plugins/fastify-knex.js";
import { config } from './config/index.js';
import { RespWrapper } from './wrapper/resp.js';
import { errorMapping } from './errors/constant.js';

const request = Axios.create();

interface RecordRecord {
  id?: number,
  prev?: number,
  source: string,
  action: string,
  status: string,
  flag: number,
  // 毫秒单位时间戳
  create_time: number,
}

enum FLAGS {
  // 正常
  BASE = 1,
  // 删除位
  DEL = 1 << 1,
}

const TABLE = 'daily_records';

const logStream = createWriteStream({
  url: 'http://localhost:10050/log',
});

const fastify = Fastify({
  logger: {
    name: 'daily-record',
    level: 'info',
    stream: logStream,
  },
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.register(FastifyGracefulShutdown);
// mysql
fastify.register(FastifyKnex, {
  client: 'mysql2',
  connection: {
    host : config.db.host,
    port : config.db.port,
    user : config.db.user,
    password : config.db.password,
    database : 'record_db'

  },
});

const origin = config.server.origin;
const apis = [
  '/record/add',
  '/record/get',
  '/record/getOpts',
];

// hook
fastify.addHook('onReady', async () => {
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
      fastify.log.info('接口绑定成功');
    } else {
      fastify.log.error(`[接口绑定失败]: ${msg}`);
    }
  } catch (error) {
    fastify.log.error(`[接口绑定失败]: 绑定过程出错`);
    throw error;
  }
});

fastify.addHook('onClose', async () => {
  try {
    const resp = await request('http://127.0.0.1:3000/unbind', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: { apis }
    });
    const { code, msg } = resp.data;
    if(code === 0) {
      fastify.log.info('接口解绑成功');
    } else {
      fastify.log.error(`[接口解绑失败]: ${msg}`);
    }
  } catch (error) {
    fastify.log.error(`[接口解绑失败]: 解绑过程出错`);
    throw error;
  }
});

// 错误处理
fastify.setErrorHandler((error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
  const { code } = error;
  const { statusCode, code: realCode, msg } = errorMapping[code] ?? errorMapping.ERROR_UNKNOWN;
  reply.status(statusCode).send(RespWrapper.error({
    code: realCode,
    msg
  }))
});

const getTotal = async () => {
  const cur: {count: string}[] = await fastify.knex(TABLE).count({count: '*'});
  const total = Number.parseInt(cur[0].count);
  return total;
}

/**
 * 添加记录
 */
fastify.post(
  '/record/add',
  {
    schema: {
      // 请求体
      body: {
        type: 'object',
        properties: {
          prev: { type: 'number' },
          source: { type: 'string' }, 
          action: { type: 'string' },
          status: { type: 'string' },
        },
        required: ['source', 'action']
      }
    }
  },
  async (req, reply) => {
    const { prev, source, action, status } = req.body;
    const targetFlag = FLAGS.BASE;
    const update = {
      prev: prev ? prev : -1,
      source,
      action,
      status,
      flag: targetFlag,
      create_time: Date.now(),
    };
    const sql = fastify.knex(TABLE).insert(update).toString();
    fastify.log.info(sql);
    const ids: string[] = await fastify.knex(TABLE).insert(update).returning('id');
    return reply.send(RespWrapper.success({ ids }));
  }
);

/**
 * 获取记录
 */
fastify.post(
  '/record/get',
  {
    schema: {
      // 请求体
      body: {
        type: 'object',
        properties: {
          pageSize: {
            type: 'number',
            default: 10,
          },
          pageNum: {
            type: 'number',
            default: 1,
          },
          source: { type: 'string' }, 
          action: { type: 'string' },
          status: { type: 'string' },
          create_time_start: {type: 'number'},
          create_time_end: {type: 'number'},
        },
      }
    }
  },
  async (req, reply) => {
    const { pageNum, pageSize, source, action, status, create_time_start, create_time_end } = req.body;
    const conditions: Record<string, any> = {};
    if (source) {
      conditions.source = source;
    }
    if (action) {
      conditions.action = action;
    }
    if (status) {
      conditions.status = status;
    }
    const sql = fastify.knex.select('id', 'source', 'action', 'status', 'prev', 'create_time')
                                      .from<RecordRecord>(TABLE)
                                      .where(conditions)
                                      .andWhere(builder => {
                                        if (typeof create_time_start === 'number' && typeof create_time_end === 'number') {
                                          builder.whereBetween('create_time', [create_time_start, create_time_end]);
                                        }
                                      })
                                      .offset((pageNum! - 1) * pageSize!)
                                      .limit(pageSize!)
                                      .toString();
    fastify.log.info(sql);
    const records = await fastify.knex.select('id', 'source', 'action', 'status', 'prev', 'create_time')
                                      .from<RecordRecord>(TABLE)
                                      .where(conditions)
                                      .andWhere(builder => {
                                        if (typeof create_time_start === 'number' && typeof create_time_end === 'number') {
                                          builder.whereBetween('create_time', [create_time_start, create_time_end]);
                                        }
                                      })
                                      .offset((pageNum! - 1) * pageSize!)
                                      .limit(pageSize!);
    const total = await getTotal();
    return reply.send(RespWrapper.success({ records, total }));
  }
);

/**
 * 获取所有特定属性选项
 */
fastify.post(
  '/record/getOpts',
  {
    schema: {
      body: {
        type: 'object',
        properties: {
          type: { type: 'string' },
        },
      },
    }
  },
  async (req, reply) => {
    const { type } = req.body;
    let res: any[] = [];
    if (['source', 'status'].includes(type ?? '')) {
      const sql = fastify.knex.distinct(type!).from<RecordRecord>(TABLE).toString();
      fastify.log.info(sql);
      res = await fastify.knex.distinct(type!).from<RecordRecord>(TABLE);
      res = res.map(item => item[type!]);
    }
    return reply.send(RespWrapper.success({ res }));
  }
);

fastify.listen({ port: config.server.port, host: config.server.host }, err => {
  if (err) throw err
  console.log(`server listening on ${config.server.port}`)
})