import {BookShopUrlsConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';
import {WykopAPIAuthParams} from '@sites/wykop/api/WykopAPI';

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
      database: string,
      host: string,
      username: string,
      password: string,
      port: number,
    },
    cdn: {
      publicUrl: string,
      localPath: string,
    },
    parsers: {
      literaturaGildia: BookShopUrlsConfig,
      gildia: BookShopUrlsConfig,
      matras: BookShopUrlsConfig,
      bonito: BookShopUrlsConfig,
      granice: BookShopUrlsConfig,
      skupszop: BookShopUrlsConfig,
      wykop: {
        homepageURL: string,
        authConfig: WykopAPIAuthParams,
      },
      wikipedia: {
        homepageURL: string,
        clientOptions: {
          apiUrl?: string,
          origin?: string,
        },
      },
      eisbn: {
        homepageURL: string,
        tmp: {
          folder: string,
          dbFiles: {
            records: string,
            publishers: string,
          },
        },
      },
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
  CDN_PUBLIC_URL,
  CDN_LOCAL_PATH,
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
        database: DB_NAME,
        host: DB_HOST,
        username: DB_USER,
        password: DB_PASS,
        port: +DB_PORT,
      },
      cdn: {
        publicUrl: CDN_PUBLIC_URL,
        localPath: CDN_LOCAL_PATH,
      },
      parsers: {
        wykop: {
          homepageURL: 'https://wykop.pl',
          authConfig: {
            key: WYKOP_KEY,
            secret: WYKOP_SECRET,
            account: {
              name: WYKOP_ACCOUNT_NAME,
              key: WYKOP_ACCOUNT_KEY,
            },
          },
        },
        skupszop: {
          homepageURL: 'https://skupszop.pl/',
          searchURL: 'https://skupszop.pl/wyszukiwarka',
        },
        granice: {
          homepageURL: 'https://www.granice.pl/',
          searchURL: 'https://www.granice.pl/wyszukaj/',
        },
        literaturaGildia: {
          homepageURL: 'https://www.literatura.gildia.pl/',
          searchURL: 'https://portal.gildia.pl/szukanie',
        },
        gildia: {
          homepageURL: 'https://www.gildia.pl/',
          searchURL: 'https://www.gildia.pl/szukaj',
        },
        matras: {
          homepageURL: 'https://www.matras.pl',
          searchURL: 'https://www.matras.pl/wyszukiwanie',
        },
        bonito: {
          homepageURL: 'https://bonito.pl',
        },
        wikipedia: {
          homepageURL: 'https://pl.wikipedia.org',
          clientOptions: {
            apiUrl: 'http://pl.wikipedia.org/w/api.php',
            origin: '*',
          },
        },
        eisbn: {
          homepageURL: 'https://e-isbn.pl',
          tmp: {
            folder: 'isbn-db',
            dbFiles: {
              records: 'records.xml',
              publishers: 'publishers.xml',
            },
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
