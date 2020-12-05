/* eslint-disable import/no-default-export */
require('dotenv').config();

type AppEnv = Partial<{
  server: {
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
} = process.env;

export const GLOBAL_CONFIG: Record<string, AppEnv> = {
  development: {
    server: {
      apiConfig: {
        url: 'http://localhost:3002/api',
      },
      listen: {
        port: +APP_PORT,
        address: APP_LISTEN_ADDRESS,
      },
    },
    client: {
      apiConfig: {
        url: 'https://bookmeter.org/api',
      },
    },
  },
};
