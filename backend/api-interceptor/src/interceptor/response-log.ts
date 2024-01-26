import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Log, LogType, RespLogInfo } from "../types/log.js";
import { LogWrapper } from "../wrapper/log.js";

export const responseLogInterceptor = (req: FastifyRequest, reply: FastifyReply, done: () => void) => {
  const { ip, originalUrl, id: requestId } = req;
  const { statusCode } = reply;
  const headers = reply.getHeaders()
  const infos: RespLogInfo = {
      ip,
      headers,
      requestId,
      statusCode,
      api: originalUrl,
    }
  LogWrapper.log(LogType.RESP, infos);
  done();
}