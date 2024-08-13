import fp from 'fastify-plugin'
import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import { apiUpdator } from '../utils/api-update';
import { CustomError } from '../errors/custom-error';
import { ERROR_NAME } from 'dconstant-error-type';
import axios from 'axios';

const ignoredApis: string[] = [
  '/bind',
  '/auth/user'
];

const instance = axios.create();

const fastifyFoward: FastifyPluginCallback = (fastify: FastifyInstance, options, done: any) => {
  const { getPair } = apiUpdator(fastify.knex);
  fastify.addHook('preValidation', async (req: FastifyRequest, reply: FastifyReply) => {
    const { originalUrl, headers, method, body, query } = req;
    const api = originalUrl.split('?')[0];
    if (ignoredApis.includes(api)) {
      return;
    }
    const pair = await getPair(api);
    if (!pair) {
      throw new CustomError({
        name: ERROR_NAME.PAGE_NOT_FOUNT
      });
    }
    const { origin } = pair;
    const newHeaders = {...headers}
    // 重新计算请求体长度
    delete newHeaders['content-length'];
    delete newHeaders['encrypted'];
    let statusCode = 500;
    let respHeaders: any;
    let respData: any = null;

    try {
      const resp = await instance.request({
        method,
        headers: newHeaders,
        url: `${origin}${api}`,
        params: query,
        data: body,
        timeout: 2000,
      });
      statusCode = resp.status;
      respHeaders = resp.headers;
      respData = resp.data;
    } catch (error: any) {
      if (error.response) {
        statusCode = error.response.status;
        respHeaders = error.response.headers;
        respData = error.response.data;
      } else {
        throw error;
      }
    }
    reply.code(statusCode).headers(respHeaders).send(respData);
  });
  done();
}

export default fp(fastifyFoward, { name: 'fastify-Detect' });