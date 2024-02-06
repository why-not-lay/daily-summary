import 'dotenv/config';

interface ApiServerConfig {
  server: {
    port: number,
    host: string,
    origin: string,
    isRegister: boolean,
    registerOrigin: string,
    defaultTokenLifetime: number,
    defaultTokenUnlimit: number,
  },
  db: {
    host: string,
    port: number,
    user: string,
    password: string,
  }
  redis: {
    host: string,
    port: number,
  }
}

export const config: ApiServerConfig = {
  server: {
    host: process.env.SERVER_HOST ?? 'localhost',
    port: process.env.SERVER_PORT ? Number.parseInt(process.env.SERVER_PORT) : 3000,
    origin: process.env.SERVER_ORIGIN ?? '',
    isRegister: !!process.env.SERVER_IS_REGISTER,
    registerOrigin: process.env.SERVER_REGISTER_ORIGIN ?? '',
    // 单位为秒
    defaultTokenLifetime: process.env.SERVER_DEFAULT_TOKEN_LIFETIME ? Number.parseInt(process.env.SERVER_DEFAULT_TOKEN_LIFETIME) : 1 * 24 * 60 * 60,
    // 单位为秒
    defaultTokenUnlimit: process.env.SERVER_DEFAULT_TOKEN_UNLIMIT ? Number.parseInt(process.env.SERVER_DEFAULT_TOKEN_UNLIMIT) : 365 * 24 * 60 * 60 * 100
  },
  db: {
    host : process.env.DB_HOST ?? 'localhost',
    port : process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
    user : process.env.DB_USER ?? 'root',
    password : process.env.DB_PASSWORD ?? '',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: process.env.REDIS_PORT ? Number.parseInt(process.env.REDIS_PORT) : 6379,
  }
}