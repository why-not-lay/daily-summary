import { FastifyInstance } from 'fastify';
import { USER_FLAGS, UserRecord } from '../types/define';
import { randomBytes } from 'crypto';

const USER_TABLE = 'users'

const createAuth = (fastify: FastifyInstance) => {
  const { knex, sessions } = fastify;

  const authUser = async (username: string, password: string) => {
    const tokenInfos = {
      tid: '',
      token: '',
    } 
    const users = await knex.select('passwd', 'uid')
                                    .from<UserRecord>(USER_TABLE)
                                    .where({
                                      username,
                                      flag: USER_FLAGS.BASE,
                                    })
    const user = users?.[0];
    if(user && user.passwd === password) {
      // 用 tid 作为 sessionId
      const tid = randomBytes(16).toString('hex');
      const randomBuffer = randomBytes(32);
      const userBuffer = Buffer.from(password, 'hex');
      const randomToken = randomBuffer.toString('hex');
      // 临时 token
      const token = Buffer.from(
        new Array(32).fill(0).map((_, idx) => userBuffer[idx] ^ randomBuffer[idx])
      ).toString('hex');
      sessions.setSession(tid, {
        id: tid,
        uid: user.uid,
        token,
      });
      tokenInfos.tid = tid;
      tokenInfos.token = randomToken;
    }
    return tokenInfos;
  }

  return {
    authUser
  }
}

export {
  createAuth,
}