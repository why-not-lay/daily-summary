import { Log, LogType } from "../types/log"
import { FastifyLogFn } from "fastify"

interface LogWrapper {
  logger: null | FastifyLogFn,
  log: <T>(type: LogType, infos: T) => void,
  setLogger: (logger: FastifyLogFn) => void,
  [name: string]: any
}

export const LogWrapper: LogWrapper = {
  logger: null,
  setLogger(logger: FastifyLogFn) {
    this.logger = logger;
  },
  log: function<T = any>(type: LogType, infos: T) {
    const log: Log<T> = {
      type,
      timestamp: Date.now(),
      isCustom: true,
      infos
    };
    this.logger?.(log);
  }
}