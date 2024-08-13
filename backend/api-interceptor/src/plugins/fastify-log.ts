import { FastifyError, FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import { createWriteStream } from 'pino-http-send';
import fp from 'fastify-plugin'
import pino from 'pino';
import { config } from '../config';
import { createCLog } from '../utils/log';


const logStream = createWriteStream({
  url: `${config.server.logOrigin}/log`,
});

const logPlugin: FastifyPluginCallback = (fastify: FastifyInstance, options, done: any) => {
  const pinoLogger = config.env === 'dev' ? (
    pino(
      {
        base: null,
        name: 'api-interceptor',
        level: 'info',
      }
    )
  ) : (
    pino(
      {
        base: null,
        name: 'api-interceptor',
        level: 'info',
      },
      pino.multistream([
        { level: 'info', stream: logStream }
      ])
    )
  );

  const cLog = createCLog(pinoLogger);

  fastify.decorate('cLog', cLog);

  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    const { id, ip, ips, method, originalUrl, hostname } = request;
    const logMsg = JSON.stringify({
      id,
      ip,
      ips,
      method,
      hostname,
      originalUrl,
    }); 
    fastify.cLog.info('onRequest', logMsg);
  });

  fastify.addHook('preValidation', async (request: FastifyRequest) => {
    const { id, headers, body} = request;
    let msg = '';
    if (['text/plain', 'application/json'].includes(headers['content-type']!)) {
      msg = JSON.stringify({
        id,
        body: body,
      });
    }
    fastify.cLog.info('preValidation', msg);
  });

  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const { code = -999, message, stack, statusCode = 500} = error;
    const realCode = typeof code === 'number' ? code : -999
    const msg = JSON.stringify({
      code,
      stack,
      statusCode,
      id: request.id,
      info: message,
    });
    fastify.cLog.error(msg);
    reply.status(statusCode).send({
      data: null,
      code: realCode,
      msg: message,
    });
  });
  done()
}

export default fp(logPlugin, { name: 'fastify-log' })