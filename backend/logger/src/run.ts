import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { config } from './config';
import { FieldType, InfluxDB } from 'influx';

interface Log {
  type: string,
  source: string,
  message: string,
  timestamp: number,
}

let isStart = false;

const fastify = Fastify({
  logger: {
    level: 'error'
  },
}).withTypeProvider<JsonSchemaToTsProvider>();

fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  reply.status(200).send('');
});

const fields = {
  timestamp: FieldType.INTEGER,
  message: FieldType.STRING,
}

const influx = new InfluxDB({
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.database,
  schema: [
    {
      fields,
      measurement: 'log',
      tags: [
        'source',
        'type',
      ]
    }
  ]
});

const testDBisExist = async () => {
  // 确保数据库已存在
  let isExist = false;
  try {
    const names = await influx.getDatabaseNames()
    if (!names.includes(config.db.database)) {
      await influx.createDatabase(config.db.database);
    }
    isExist = true;
  } catch (error) {
    fastify.log.error(`Error creating Influx database: ${error}`);
  }
  return isExist;
}

/**
 * 日志接收接口
 */
fastify.post<{
  Body: {
    logs: Log[]
  }
}>(
  '/log',
  {
    schema: {
      body: {
        type: 'object',
        properties: {
          logs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                },
                source: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                },
                timestamp: {
                  type: 'number'
                }
              },
              required: [
                'type',
                'source',
                'message',
                'timestamp'
              ]
            }
          }
        },
      }
    }
  },
  async (req, reply) => {
    const { body } = req;
    const { logs } = body;
    if (logs.length > 0) {
      const points = logs.map(({type, source, message, timestamp}) => ({
        measurement: 'log',
        tags: { type, source },
        fields: { message },
        timestamp: new Date(timestamp),
      }))
      await influx.writePoints(points);
    }
    return reply.send('');
  }
)

const start = async () => {
  try {
    const isExist = await testDBisExist();
    if (isExist) {
      await fastify.listen({ port: config.server.port, host: config.server.host });
      isStart = true;
      fastify.log.info('server start');
    }
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

const shutdown = async () => {
  try {
    if (!isStart) {
      return;
    }
    await fastify.close();
    fastify.log.info('Server closed');
  } catch (err) {
    fastify.log.error(err);
  }
  process.exit(0);
};

const shutdonwNoExit = async () => {
  try {
    if (!isStart) {
      return;
    }
    await fastify.close();
    fastify.log.info('Server closed');
  } catch (err) {
    fastify.log.error(err);
  }
}

export {
  start,
  shutdown,
  shutdonwNoExit,
}