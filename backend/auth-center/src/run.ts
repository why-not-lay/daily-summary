import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { createWriteStream } from 'pino-http-send';
import FastifyGracefulShutdown from 'fastify-graceful-shutdown';
import FastifyKnex from "./plugins/fastify-knex.js";
import FastifyRedis from "@fastify/redis";
import { config } from './config/index.js';
import { RespWrapper } from './wrapper/resp.js';
import { errorMapping } from './errors/constant.js';
import { requestLogInterceptor } from './interceptor/request-log.js';
import { responseLogInterceptor } from './interceptor/response-log.js';
import { LogWrapper } from './wrapper/log.js';
import { ErrLogInfo, LogType } from './types/log.js';
import { bind, unbind } from './interceptor/register-api.js';
import { registerAuthRoutes, registerTokensRoutes } from './routes/index.js';


const logStream = createWriteStream({
  url: `${config.server.logOrigin}/log`,
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
if(config.server.isRegister) {
  fastify.addHook('onReady', bind);
  fastify.addHook('onClose', unbind);
}
fastify.addHook('onRequest', requestLogInterceptor);
fastify.addHook('onResponse', responseLogInterceptor);

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

// 注册路由
registerAuthRoutes(fastify);
registerTokensRoutes(fastify);

fastify.listen({ port: config.server.port, host: config.server.host }, err => {
  if (err) throw err
  console.log(`server listening on ${config.server.port}`)
})