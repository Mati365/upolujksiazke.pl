/* eslint-disable import/no-default-export */
require('dotenv').config();

type AppEnv = Partial<{
  server: {
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
  APP_PORT = 3000,
  APP_LISTEN_ADDRESS = 'localhost',
  HTTPS_KEY,
  HTTPS_CERT,
} = process.env;

export const GLOBAL_CONFIG: Record<string, AppEnv> = {
  shared: {
    server: {
      ssl: {
        key: HTTPS_KEY,
        cert: HTTPS_CERT,
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
