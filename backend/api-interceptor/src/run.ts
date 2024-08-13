import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify, { RouteShorthandOptions } from "fastify";
import { config } from './config';
import { RespWrapper } from './wrapper/resp';
import { apiUpdator } from './utils/api-update';
import { ApiOriginPair } from './types/define';
import { FastifyAuth, FastifySessions, FastifyCrypto, FastifyLog, FastifyKnex, FastifyDetect, FastifyFoward } from './plugins'
import { createAuth } from './utils/auth';
import { CustomError } from './errors/custom-error';
import { ERROR_NAME } from 'dconstant-error-type';


const fastify = Fastify({
  logger: false,
}).withTypeProvider<JsonSchemaToTsProvider>();

// custom logger
fastify.register(FastifyLog);

// mysql
fastify.register(FastifyKnex, {
  client: 'mysql2',
  connection: {
    host : config.db.host,
    port : config.db.port,
    user : config.db.user,
    password : config.db.password,
    database : 'gateway_db'
  },
});
// sessions
fastify.register(FastifySessions);

// auth
fastify.register(FastifyAuth);

// crypto
fastify.register(FastifyCrypto);

// forward
fastify.register(FastifyFoward);

// auto-api-detect
fastify.register(FastifyDetect)

const bindSchema: RouteShorthandOptions = {
  schema: {
    // 请求体
    body: {
      type: 'object',
      properties: {
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
  const { addPendingUrls } = fastify.detector;
  const { updateApis } = apiUpdator(fastify.knex);
  if(pairs.length > 0) {
    const regex = /^(http(s)?:\/\/)[a-zA-Z0-9.-]+(:\d+)?$/;
    const isPass = pairs.every(pair => regex.test(pair.origin));
    if (!isPass) {
      throw new CustomError({
        name: ERROR_NAME.REQ_BODY
      });
    }
    fastify.cLog.info('binding apis', `add apis: ${pairs.map(pair => `[${pair.api} => ${pair.origin}]`).join(' ')}`);
    await updateApis(pairs);
    addPendingUrls(pairs.map(pair => `${pair.origin}${config.detect.api}`));
  }
  return reply.send(RespWrapper.success(null));
});

/**
 * 用户登录
 */
fastify.post<{
  Body: {
    username: string,
    password: string,
  }
}>(
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
            type: 'string',
          },
        },
        required: ['username', 'password'],
      }
    }
  },
  async (req, reply) => {
  const { username, password } = req.body;
  const { authUser } = createAuth(fastify);
  const { token, tid } = await authUser(username, password);
  if (!tid) {
    throw new CustomError({
      name: ERROR_NAME.NO_AUTHORITY
    });
  }
  return reply.send(RespWrapper.success({
    tid,
    token,
  }));
})

const start = async () => {
  try {
    const { host, port } = config.server;
    await fastify.listen({ port, host });
    fastify.cLog.info('start', `server start at ${host}:${port}`);
  } catch (error: any) {
    console.error(error);
    fastify.cLog.error(error?.message ?? 'unknown error happens while starting');
    process.exit(1)
  }
}

const shutdown = async () => {
  try {
    await fastify.close();
    fastify.cLog.info('close', 'Server closed');
  } catch (err: any) {
    console.error(err);
    fastify.cLog.error(err?.message ?? 'unknown error happens while starting');
    process.exit(1)
  }
  process.exit(0);
};

const shutdonwNoExit = async () => {
  try {
    await fastify.close();
    fastify.cLog.info('close', 'Server closed');
  } catch (err: any) {
    console.error(err);
    fastify.cLog.error(err?.message ?? 'unknown error happens while starting');
  }
}

export {
  start,
  shutdown,
  shutdonwNoExit,
}