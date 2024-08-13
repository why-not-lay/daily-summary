import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin'
import { createSessions } from '../utils/session';
import { Session } from '../types/define';

const sessionsPlugin: FastifyPluginCallback = (fastify: FastifyInstance, options, done: any) => {
  const sessions = createSessions();
  const stop = sessions.startAutoClear();
  fastify.decorate('sessions', sessions);
  fastify.decorateRequest('session', undefined);
  // 在校验数据前，绑定会话数据
  fastify.addHook('preValidation', (req: FastifyRequest, reply: FastifyReply, done) => {
    let session: Session | undefined = undefined;
    let id: string = '';
    const { headers } = req;
    const { tid } = headers;
    if (typeof tid === 'string') {
      id = tid;
      session = sessions.getSession(tid);
    }
    req.session = session;
    done();
  });
  fastify.addHook('preClose', async () => {
    stop();
  });
  done()
}


export default fp(sessionsPlugin, { name: 'fastify-sessions' })