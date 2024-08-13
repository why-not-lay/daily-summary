import { Logger } from "pino";

const SOURCE = 'api-interceptor';

const createCLog = (logger: Logger) => {
  const info = (type: string, message: string) => {
    logger.info({
      type,
      message,
      source: SOURCE,
      timestamp: Date.now(),
    });
  }

  const error = (message: string) => {
    logger.error({
      message,
      type: 'error',
      source: SOURCE,
      timestamp: Date.now(),
    })
  }

  return {
    info,
    error,
  }
}

export {
  createCLog
}