import 'dotenv/config';

interface ApiServerConfig {
  server: {
    port: number,
    host: string,
    origin: string,
    isRegister: boolean,
    whiteList: string[],
    registerOrigin: string,
    logOrigin: string,
  },
  db: {
    host: string,
    port: number,
    user: string,
    password: string,
  }

}

export const config: ApiServerConfig = {
  server: {
    host: process.env.SERVER_HOST ?? 'localhost',
    port: process.env.SERVER_PORT ? Number.parseInt(process.env.SERVER_PORT) : 3000,
    whiteList: process.env.SERVER_WHITE_LIST?.split(',') ?? [],
    isRegister: !!process.env.SERVER_IS_REGISTER,
    origin: process.env.SERVER_ORIGIN ?? '',
    registerOrigin: process.env.SERVER_REGISTER_ORIGIN ?? '',
    logOrigin: process.env.SERVER_LOG_ORIGIN ?? '',
  },
  db: {
    host : process.env.DB_HOST ?? 'localhost',
    port : process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
    user : process.env.DB_USER ?? 'root',
    password : process.env.DB_PASSWORD ?? '',
  }
}