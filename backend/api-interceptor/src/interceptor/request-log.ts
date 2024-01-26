import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Log, LogType, ReqLogInfo } from "../types/log.js";
import { LogWrapper } from "../wrapper/log.js";

export const requestLogInterceptor = (req: FastifyRequest, reply: FastifyReply, done: () => void) => {
  const { ip, originalUrl, method, hostname, headers, id } = req;
  const infos: ReqLogInfo = {
    id,
    ip,
    method,
    headers,
    hostname,
    api: originalUrl,
  }
  LogWrapper.log(LogType.REQ, infos);
  done();
}