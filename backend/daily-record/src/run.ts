import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import FastifyGracefulShutdown from 'fastify-graceful-shutdown';
import { createWriteStream } from 'pino-http-send';
import FastifyKnex from "./plugins/fastify-knex.js";
import { config } from './config/index.js';
import { RespWrapper } from './wrapper/resp.js';
import { errorMapping } from './errors/constant.js';
import { LogWrapper } from './wrapper/log.js';
import { ErrLogInfo, LogType, MsgLogInfo } from './types/log.js';
import { bind, unbind } from './interceptor/register-api.js';
import { SelfError } from './errors/self-error.js';

interface RecordRecord {
  uid: string,
  id: string,
  prev?: string,
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
  url: `${config.server.logOrigin}/log`,
});

const fastify = Fastify({
  logger: {
    name: 'daily-record',
    level: 'info',
    stream: logStream,
  },
}).withTypeProvider<JsonSchemaToTsProvider>();

// logger
LogWrapper.setLogger(fastify.log.info.bind(fastify.log));

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

if(config.server.isRegister) {
  fastify.addHook('onReady', bind);
  fastify.addHook('onClose', unbind);
}

// 错误处理
fastify.setErrorHandler((error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
  const { code, stack, message: realMsg } = error;
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
          uid: {type: 'string'},
          records: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {type: 'string'},
                prev: { type: 'string' },
                source: { type: 'string' }, 
                action: { type: 'string' },
                status: { type: 'string' },
                create_time: {type: 'number'},
              },
              required: ['id', 'source', 'action', 'create_time'],
            },
          },
        },
        required: ['records', 'uid'],
      }
    }
  },
  async (req, reply) => {
    const { records, uid } = req.body;
    if(records.length === 0) {
      return reply.send(RespWrapper.success({ ids: [] }));
    }
    const targetFlag = FLAGS.BASE;
    // 检测数据格式
    const isTypeOK = records.every(record => record.id.length === 16);
    if(!isTypeOK) {
      throw new SelfError('数据类型有误', errorMapping.ERROR_REQ_BODY_PARAMS.type);
    }
    const updates = records.map(record => ({
      ...record,
      uid,
      prev: record.prev ? record.prev : Array.from({length: 16}, () => '-').join(''),
      flag: targetFlag,
    }));

    const sql = fastify.knex(TABLE).insert(updates).onConflict('id').ignore().toString();
    const infos: MsgLogInfo = {
      msg: sql,
    }
    LogWrapper.log(LogType.MSG, infos);

    await fastify.knex(TABLE).insert(updates).onConflict('id').ignore();
    return reply.send(RespWrapper.success(null));
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
          uid: { type: 'string' },
          source: { type: 'string' }, 
          action: { type: 'string' },
          status: { type: 'string' },
          create_time_start: {type: 'number'},
          create_time_end: {type: 'number'},
        },
        required: ['uid'],
      }
    }
  },
  async (req, reply) => {
    const { pageNum, pageSize, source, action, status, create_time_start, create_time_end, uid } = req.body;
    const conditions: Record<string, any> = { uid };
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
    const infos: MsgLogInfo = {
      msg: sql,
    }
    LogWrapper.log(LogType.MSG, infos);

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
          uid: { type: 'string' },
          type: { type: 'string' },
        },
        required: ['uid'],
      },
    }
  },
  async (req, reply) => {
    const { type, uid } = req.body;
    let res: any[] = [];
    if (['source', 'status'].includes(type ?? '')) {
      const sql = fastify.knex.distinct(type!).from<RecordRecord>(TABLE).where({ uid }).toString();
      const infos: MsgLogInfo = {
        msg: sql,
      }
      LogWrapper.log(LogType.MSG, infos);

      res = await fastify.knex.distinct(type!).from<RecordRecord>(TABLE).where({ uid });
      res = res.map(item => item[type!]);
    }
    return reply.send(RespWrapper.success({ res }));
  }
);

fastify.listen({ port: config.server.port, host: config.server.host }, err => {
  if (err) throw err
  console.log(`server listening on ${config.server.port}`)
})