import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify, { FastifyError, FastifyReply, FastifyRequest, RouteShorthandOptions } from "fastify";
import FastifyKnex from "./plugins/fastify-knex.js";
import { config } from './config/index.js';

interface ApiRecord {
  id?: number,
  log: any,
  // 毫秒单位时间戳
  create_time: number,
}

const TABLE = 'logs';

const fastify = Fastify({
  logger: true,
}).withTypeProvider<JsonSchemaToTsProvider>();

// mysql
fastify.register(FastifyKnex, {
  logLevel: 'info',
  client: 'mysql2',
  connection: {
    host : config.db.host,
    port : config.db.port,
    user : config.db.user,
    password : config.db.password,
    database : 'log_db'
  },
});


/**
 * 日志接收接口
 */
fastify.post(
  '/log',
  async (req, reply) => {
    const { body } = req;
    const { logs } = (body as { logs: any[] });
    const { name } = logs[0] ?? {};
    const updates = logs.map(log => ({
      log,
      source: name,
      create_time: Date.now(),
    }))
    await fastify.knex(TABLE).insert(updates);
    return reply.send({ log: true });
  }
)

fastify.listen({ port: config.server.port, host: config.server.host }, err => {
  if (err) throw err
  console.log(`server listening on ${config.server.port}`)
})