import { FastifyInstance, FastifyPluginCallback, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin'
import { Rights } from '../types/define';
import { CustomError } from '../errors/custom-error';
import { ERROR_NAME } from 'dconstant-error-type';

const publicUrls: string[] = [
  '/bind',
];

const fastifyAuth: FastifyPluginCallback = (fastify: FastifyInstance, options, done: any) => {
  fastify.decorateRequest('right', undefined);

  fastify.addHook('preValidation', async (request: FastifyRequest) => {
    const { originalUrl } = request;
    const url = originalUrl.split('?')[0];
    // 公开路径不鉴权
    if (publicUrls.includes(url)) {
      request.right = Rights.public;
    } else {

      request.right = Rights.private;
      if (url === '/auth/user') {
        return;
      }
      const session = request.session;
      if (!session) {
        throw new CustomError({
          name: ERROR_NAME.NO_AUTHORITY,
        });
      }
    }
  });
  done()
}

export default fp(fastifyAuth, { name: 'fastify-auth' });