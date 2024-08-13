import { detect } from 'easy-detecting';
import fp from 'fastify-plugin'
import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { apiUpdator } from '../utils/api-update';
import { config } from '../config';

const FastifyDetect: FastifyPluginCallback = (fastify: FastifyInstance, options, done: any) => {
  if(!fastify.detector) {
    const { removeApis } = apiUpdator(fastify.knex);
    const { stop, addPendingUrls, removePendingUrl, setTimerInterval } = detect({
      urls: [],
      failCallback: async (urls: string[]) => {
        await removeApis(urls);
      }
    });
    setTimerInterval(config.detect.interval);
    fastify.decorate('detector', {
      addPendingUrls,
      removePendingUrl,
    });
    fastify.addHook('preClose', async () => {
      stop();
    })
  }
  done()
}

export default fp(FastifyDetect, { name: 'fastify-Detect' });