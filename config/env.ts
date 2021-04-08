import {Options as SentryOptions} from '@sentry/types';
import {LogLevel} from '@sentry/types/dist/loglevel';

import {BookShopUrlsConfig} from '@importer/kinds/scrappers/BookShop.scrapper';
import {WykopAPIAuthParams} from '@sites/wykop/api/WykopAPI';

/* eslint-disable import/no-default-export */
require('dotenv').config();

type DefaultConfigBookShopNames = (
  'literaturaGildia' | 'gildia' | 'matras'
  | 'woblink' | 'bonito' | 'granice'
  | 'skupszop' | 'dadada' | 'aros'
  | 'publio' | 'hrosskar' | 'madbooks'
  | 'gandalf' | 'ibuk' | 'woblink'
  | 'taniaksiazka' | 'lekturyGov'
);

export type AppEnv = Partial<{
  shared: {
    website: {
      name: string,
    },
  },
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
    elasticsearchConfig: {
      node: string,
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
    sentry: Omit<SentryOptions, 'integrations'>,
    parsers: Record<DefaultConfigBookShopNames, BookShopUrlsConfig> & {
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
  APP_ENV = 'development',
  APP_INSTANCES = 1,
  APP_PORT = 3000,
  APP_LISTEN_ADDRESS = 'localhost',
  HTTPS_KEY_PATH,
  HTTPS_CERT_PATH,
  SENTRY_DSN,
  REDIS_PORT = '6379',
  REDIS_HOST = 'localhost',
  REDIS_PREFIX = 'upolujksiazke',
  WYKOP_KEY,
  WYKOP_SECRET,
  WYKOP_ACCOUNT_NAME,
  WYKOP_ACCOUNT_KEY,
  CDN_PUBLIC_URL,
  CDN_LOCAL_PATH,
} = process.env;

export const GLOBAL_CONFIG: Record<string, AppEnv> = {
  shared: {
    shared: {
      website: {
        name: 'upolujksiazke.pl',
      },
    },
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
      elasticsearchConfig: {
        node: 'http://localhost:9200',
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
      sentry: {
        dsn: SENTRY_DSN,
        environment: APP_ENV,
        logLevel: LogLevel.Debug,
        tracesSampleRate: 1.0,
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
          logoURL: 'https://skupszop.pl/favicon.ico',
        },
        dadada: {
          homepageURL: 'https://dadada.pl/',
        },
        granice: {
          homepageURL: 'https://www.granice.pl/',
          searchURL: 'https://www.granice.pl/wyszukaj/',
        },
        hrosskar: {
          homepageURL: 'https://hrosskar.blogspot.com',
        },
        literaturaGildia: {
          homepageURL: 'https://www.literatura.gildia.pl/',
          searchURL: 'https://portal.gildia.pl/szukanie',
        },
        gildia: {
          homepageURL: 'https://www.gildia.pl/',
          searchURL: 'https://www.gildia.pl/szukaj',
          logoURL: 'https://www.gildia.pl/favicon.ico',
        },
        woblink: {
          homepageURL: 'https://woblink.com',
          searchURL: 'https://woblink.com/katalog/al',
        },
        taniaksiazka: {
          homepageURL: 'https://www.taniaksiazka.pl',
          searchURL: 'https://www.taniaksiazka.pl/Szukaj/',
        },
        matras: {
          homepageURL: 'https://www.matras.pl',
          searchURL: 'https://www.matras.pl/wyszukiwanie',
        },
        madbooks: {
          homepageURL: 'https://madbooks.pl/',
          searchURL: 'https://madbooks.pl/s',
        },
        ibuk: {
          homepageURL: 'https://www.ibuk.pl/',
          searchURL: 'https://www.ibuk.pl/szukaj/list',
        },
        gandalf: {
          homepageURL: 'https://www.gandalf.com.pl/',
          searchURL: 'https://www.gandalf.com.pl/ex',
        },
        bonito: {
          homepageURL: 'https://bonito.pl',
        },
        aros: {
          homepageURL: 'https://aros.pl',
        },
        lekturyGov: {
          homepageURL: 'https://lektury.gov.pl/',
          apiURL: 'https://api.lektury.gov.pl/api/',
        },
        publio: {
          homepageURL: 'https://www.publio.pl',
          searchURL: 'https://www.publio.pl/szukaj.html',
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
