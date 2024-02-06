import 'dotenv/config';

interface ApiServerConfig {
  server: {
    port: number,
    host: string,
    whiteList: string[],
    authOrigin: string,
  },
  db: {
    host: string,
    port: number,
    user: string,
    password: string,
  }
  key: {
    rsa: string,
    iv: string,
  },
  redis: {
    host: string,
    port: number,
  }
}

export const config: ApiServerConfig = {
  server: {
    host: process.env.SERVER_HOST ?? 'localhost',
    port: process.env.SERVER_PORT ? Number.parseInt(process.env.SERVER_PORT) : 3000,
    whiteList: process.env.SERVER_WHITE_LIST?.split(',') ?? [],
    authOrigin: process.env.SERVER_AUTH_ORIGIN ?? '',
  },
  db: {
    host : process.env.DB_HOST ?? 'localhost',
    port : process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
    user : process.env.DB_USER ?? 'root',
    password : process.env.DB_PASSWORD ?? '',
  },
  key: {
    rsa: process.env.KEY_RSA ?? '',
    iv: process.env.KEY_IV ?? 'QXk1T5WteDpmhR2h',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: process.env.REDIS_PORT ? Number.parseInt(process.env.REDIS_PORT) : 6379,
  }
}