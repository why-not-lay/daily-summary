import 'dotenv/config';

interface ApiServerConfig {
  server: {
    port: number,
    host: string,
  },
  db: {
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
  }

}

export const config: ApiServerConfig = {
  server: {
    host: process.env.SERVER_HOST ?? 'localhost',
    port: process.env.SERVER_PORT ? Number.parseInt(process.env.SERVER_PORT) : 3000,
  },
  db: {
    host : process.env.DB_HOST ?? 'localhost',
    port : process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 8086,
    user : process.env.DB_USER ?? 'admin',
    password : process.env.DB_PASSWORD ?? '',
    database : process.env.DB_NAME ?? 'log',
  }
}