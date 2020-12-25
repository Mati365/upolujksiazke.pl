import {WykopAPIAuthParams} from '@server/modules/importer/modules/scrapper/service/scrappers/wykop/api/WykopAPI';

/* eslint-disable import/no-default-export */
require('dotenv').config();

export type AppEnv = Partial<{
  server: {
    instances: number,
    ssl: {
      key: string,
      cert: string,
    },
    apiConfig: {
      url: string,
    },
    listen: {
      port: number,
      address: string,
    },
    redisConfig: {
      port: number,
      host: string,
      prefix: string,
    },
    dbConfig: {
      dbName: string,
      host: string,
      user: string,
      password: string,
      port: number,
    },
    parsers: {
      wykop: WykopAPIAuthParams,
    },
  },
  client: {
    apiConfig: {
      url: string,
    },
  },
}>;

const {
  DB_NAME,
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_PORT,
  APP_INSTANCES = 1,
  APP_PORT = 3000,
  APP_LISTEN_ADDRESS = 'localhost',
  HTTPS_KEY_PATH,
  HTTPS_CERT_PATH,
  REDIS_PORT = '6379',
  REDIS_HOST = 'localhost',
  REDIS_PREFIX = 'bookmeter-queue',
  WYKOP_KEY,
  WYKOP_SECRET,
  WYKOP_ACCOUNT_NAME,
  WYKOP_ACCOUNT_KEY,
} = process.env;

export const GLOBAL_CONFIG: Record<string, AppEnv> = {
  shared: {
    server: {
      instances: +APP_INSTANCES,
      ssl: {
        key: HTTPS_KEY_PATH,
        cert: HTTPS_CERT_PATH,
      },
      apiConfig: {
        url: `http://${APP_LISTEN_ADDRESS}:${APP_PORT}/api`,
      },
      listen: {
        port: +APP_PORT,
        address: APP_LISTEN_ADDRESS,
      },
      redisConfig: {
        port: +REDIS_PORT,
        host: REDIS_HOST,
        prefix: REDIS_PREFIX,
      },
      dbConfig: {
        dbName: DB_NAME,
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        port: +DB_PORT,
      },
      parsers: {
        wykop: {
          key: WYKOP_KEY,
          secret: WYKOP_SECRET,
          account: {
            name: WYKOP_ACCOUNT_NAME,
            key: WYKOP_ACCOUNT_KEY,
          },
        },
      },
    },
  },
  development: {
    client: {
      apiConfig: {
        url: `http://${APP_LISTEN_ADDRESS}:${APP_PORT}/api`,
      },
    },
  },
  production: {
    client: {
      apiConfig: {
        url: 'https://bookmeter.org/api',
      },
    },
  },
};
