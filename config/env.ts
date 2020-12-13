import {WykopAPIAuthParams} from '@server/modules/scrapper/service/websites/wykop/WykopAPI';

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
