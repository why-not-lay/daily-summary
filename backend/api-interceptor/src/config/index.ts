import 'dotenv/config';

interface ApiServerConfig {
  server: {
    port: number,
    host: string,
    whiteList: string[],
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
  },
  db: {
    host : process.env.DB_HOST ?? 'localhost',
    port : process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
    user : process.env.DB_USER ?? 'root',
    password : process.env.DB_PASSWORD ?? '',
  }
}