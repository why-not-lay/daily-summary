import 'dotenv/config';

interface ApiServerConfig {
  env: string,
  detect: {
    api: string,
    interval: number,
  },
  server: {
    port: number,
    host: string,
    logOrigin: string,
  },
  db: {
    host: string,
    port: number,
    user: string,
    password: string,
  }
  key: {
    private: string,
    public: string,
    iv: string,
  },
  session: {
    lifetime: number,
    intervalForClear: number,
  }
}

export const config: ApiServerConfig = {
  env: process.env.NODE_ENV ?? 'dev',
  detect: {
    api: process.env.DETECT_API ?? '/detect',
    interval: process.env.DETECT_INTERVAL ? Number.parseInt(process.env.DETECT_INTERVAL) : 30 * 1000,
  },
  server: {
    host: process.env.SERVER_HOST ?? 'localhost',
    port: process.env.SERVER_PORT ? Number.parseInt(process.env.SERVER_PORT) : 3000,
    logOrigin: process.env.SERVER_LOG_ORIGIN ?? '',
  },
  db: {
    host : process.env.DB_HOST ?? 'localhost',
    port : process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
    user : process.env.DB_USER ?? 'root',
    password : process.env.DB_PASSWORD ?? '',
  },
  key: {
    public: process.env.KEY_PUBLIC_RSA ?? '',
    private: process.env.KEY_PRIVATE_RSA ?? '',
    iv: process.env.KEY_IV ?? 'OOOOAAAABBBBCCCC',
  },
  session: {
    lifetime: 60 * 60 * 1000,
    intervalForClear: 10 * 60 * 1000,
  }
}