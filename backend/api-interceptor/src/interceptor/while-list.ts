import { FastifyReply, FastifyRequest } from "fastify";
import { config } from "../config/index.js";
import { SelfError } from "../errors/self-error.js";
import { errorMapping } from "../errors/constant.js";

export const whiteListInterceptor = (req: FastifyRequest, reply: FastifyReply, done: () => void) => {
  const { url, ip } = req;
  const path = url.split('?')?.[0] ?? ''
  if(['/bind', '/unbind'].includes(path) && !config.server.whiteList.includes(ip)) {
    throw new SelfError('无权限', errorMapping.ERROR_NOT_WHITE_LIST.type);
  } else {
    done();
  }
}