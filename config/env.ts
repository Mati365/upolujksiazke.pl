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
  },
  client: {
    apiConfig: {
      url: string,
    },
  },
}>;

const {
  APP_INSTANCES = 1,
  APP_PORT = 3000,
  APP_LISTEN_ADDRESS = 'localhost',
  HTTPS_KEY_PATH,
  HTTPS_CERT_PATH,
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
