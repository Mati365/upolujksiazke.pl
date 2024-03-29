import * as path from 'path';

import {DefaultUrlsConfig} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';
import {WykopScrappersGroupConfig} from '@server/modules/importer/sites/wykop/WykopScrappersGroup';
import {WykopAPI} from '@server/modules/importer/sites/wykop/api/WykopAPI';
import {SitemapServiceOptions} from '@server/modules/sitemap/services/Sitemap.service';

/* eslint-disable import/no-default-export */
require('dotenv').config();

type DefaultConfigBookShopNames = (
  'literaturaGildia' | 'gildia' | 'matras'
  | 'woblink' | 'bonito' | 'granice'
  | 'skupszop' | 'dadada' | 'aros'
  | 'publio' | 'hrosskar' | 'madbooks'
  | 'gandalf' | 'ibuk' | 'woblink'
  | 'taniaksiazka' | 'lekturyGov'
  | 'bryk' | 'streszczenia' | 'klp'
  | 'polskina5' | 'eszkola' | 'krytycznymOkiem'
  | 'carrefour' | 'legimi' | 'biedronka'
);

export type AppEnv = Partial<{
  shared: {
    repo: {
      url: string,
      hidden?: boolean,
    },
    website: {
      name: string,
      url: string,
    },
  },
  server: {
    instances: number,
    paths: {
      public: string,
    },
    jwt: {
      secret: string,
      expireSeconds: number,
    },
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
    sitemap: SitemapServiceOptions,
    parsers: Record<DefaultConfigBookShopNames, DefaultUrlsConfig> & {
      wykop: WykopScrappersGroupConfig & {
        bots: {
          summary: {
            tag: string,
          },
        },
      },
    },
  },
  client: Partial<{
    analytics: {
      key: string,
    },
    apiConfig: {
      url: string,
    },
  }>,
}>;

const {
  DB_NAME,
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_PORT,
  JWT_SECRET,
  JWT_EXPIRE_IN_SECONDS,
  APP_INSTANCES = 2,
  APP_PORT = 3000,
  APP_LISTEN_ADDRESS = 'localhost',
  HTTPS_KEY_PATH,
  HTTPS_CERT_PATH,
  REDIS_PORT = '6379',
  REDIS_HOST = 'localhost',
  REDIS_PREFIX = 'upolujksiazke:',
  WYKOP_KEY,
  WYKOP_SECRET,
  WYKOP_ACCOUNT_NAME,
  WYKOP_ACCOUNT_KEY,
  CDN_PUBLIC_URL,
  CDN_LOCAL_PATH,
  ES_HOST,
  SITEMAP_OUTPUT_PATH,
  SITE_HOSTNAME = 'upolujksiazke.pl',
} = process.env;

const PUBLIC_PATH = path.resolve(__dirname, 'public/');

export const GLOBAL_CONFIG: Record<string, AppEnv> = {
  shared: {
    shared: {
      repo: {
        url: 'https://github.com/Mati365/upolujksiazke.pl',
        hidden: false,
      },
      website: {
        name: SITE_HOSTNAME,
        url: `https://${SITE_HOSTNAME}`,
      },
    },
    server: {
      instances: +APP_INSTANCES,
      paths: {
        public: PUBLIC_PATH,
      },
      jwt: {
        secret: JWT_SECRET,
        expireSeconds: +JWT_EXPIRE_IN_SECONDS,
      },
      sitemap: {
        outputPath: SITEMAP_OUTPUT_PATH || path.resolve(PUBLIC_PATH, 'sitemaps'),
        urlNestedPath: 'sitemaps',
        hostname: `https://${SITE_HOSTNAME}`,
      },
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
        node: `http://${ES_HOST}:9200`,
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
        polskina5: {
          id: 1,
          homepageURL: 'https://www.polskina5.pl/',
          logoURL: 'https://www.polskina5.pl/favicon.ico',
        },
        eszkola: {
          id: 2,
          homepageURL: 'https://eszkola.pl/',
          searchURL: 'https://eszkola.pl/szukaj',
          logoURL: 'https://eszkola.pl/favicon.ico',
        },
        skupszop: {
          id: 3,
          homepageURL: 'https://skupszop.pl/',
          searchURL: 'https://skupszop.pl/wyszukiwarka',
          logoURL: 'https://skupszop.pl/static/store/img/webp/icon11.webp',
        },
        dadada: {
          id: 4,
          homepageURL: 'https://dadada.pl/',
        },
        klp: {
          id: 5,
          homepageURL: 'https://klp.pl/',
          searchURL: 'https://lektury.klp.pl',
          logoURL: 'https://klp.pl/favicon.ico',
        },
        granice: {
          id: 6,
          homepageURL: 'https://www.granice.pl/',
          searchURL: 'https://www.granice.pl/wyszukaj/',
        },
        bryk: {
          id: 7,
          homepageURL: 'https://www.bryk.pl/',
          searchURL: 'https://www.bryk.pl/wyniki-wyszukiwania.html',
        },
        streszczenia: {
          id: 8,
          homepageURL: 'https://streszczenia.pl/',
          withSubdomains: true,
        },
        hrosskar: {
          id: 9,
          homepageURL: 'https://hrosskar.blogspot.com',
        },
        literaturaGildia: {
          id: 10,
          homepageURL: 'https://www.literatura.gildia.pl/',
          searchURL: 'https://portal.gildia.pl/szukanie',
        },
        gildia: {
          id: 11,
          homepageURL: 'https://www.gildia.pl/',
          searchURL: 'https://www.gildia.pl/szukaj',
          logoURL: 'https://www.gildia.pl/favicon.ico',
        },
        woblink: {
          id: 12,
          homepageURL: 'https://woblink.com',
          searchURL: 'https://woblink.com/katalog/al',
        },
        taniaksiazka: {
          id: 13,
          homepageURL: 'https://www.taniaksiazka.pl',
          searchURL: 'https://www.taniaksiazka.pl/Szukaj/',
        },
        matras: {
          id: 14,
          homepageURL: 'https://www.matras.pl',
          searchURL: 'https://www.matras.pl/wyszukiwanie',
        },
        madbooks: {
          id: 15,
          homepageURL: 'https://madbooks.pl/',
          searchURL: 'https://madbooks.pl/s',
        },
        ibuk: {
          id: 16,
          homepageURL: 'https://www.ibuk.pl/',
          searchURL: 'https://www.ibuk.pl/szukaj/list',
        },
        gandalf: {
          id: 17,
          homepageURL: 'https://www.gandalf.com.pl/',
          searchURL: 'https://www.gandalf.com.pl/ex',
        },
        bonito: {
          id: 18,
          homepageURL: 'https://bonito.pl',
        },
        aros: {
          id: 19,
          homepageURL: 'https://aros.pl',
        },
        lekturyGov: {
          id: 20,
          homepageURL: 'https://lektury.gov.pl/',
          apiURL: 'https://api.lektury.gov.pl/api/',
        },
        publio: {
          id: 21,
          homepageURL: 'https://www.publio.pl',
          searchURL: 'https://www.publio.pl/szukaj.html',
        },
        wykop: {
          id: 22,
          homepageURL: 'https://wykop.pl',
          bots: {
            summary: {
              tag: 'bookmeterstats',
            },
          },
          api: new WykopAPI(
            {
              authConfig: {
                key: WYKOP_KEY,
                secret: WYKOP_SECRET,
                account: {
                  name: WYKOP_ACCOUNT_NAME,
                  key: WYKOP_ACCOUNT_KEY,
                },
              },
            },
          ),
        },
        krytycznymOkiem: {
          id: 24,
          homepageURL: 'https://krytycznymokiem.blogspot.com/',
        },
        carrefour: {
          id: 25,
          homepageURL: 'https://www.carrefour.pl/',
          // eslint-disable-next-line max-len
          logoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Carrefour_logo.svg/748px-Carrefour_logo.svg.png',
        },
        legimi: {
          id: 26,
          homepageURL: 'https://www.legimi.pl',
        },
        biedronka: {
          id: 27,
          homepageURL: 'https://biedronka.pl/',
          // eslint-disable-next-line max-len
          logoURL: 'https://prowly-uploads.s3.eu-west-1.amazonaws.com/uploads/8222/assets/147468/original-26306b7177f0be2509e0e785e9b7e1c4.png',
        },
      },
    },
  },
  development: {
    client: {
      apiConfig: {
        url: `http://lvh.me:${APP_PORT}/api/v1`,
      },
    },
  },
  production: {
    client: {
      apiConfig: {
        url: `https://${SITE_HOSTNAME}/api/v1`,
      },
      analytics: {
        key: 'G-DX3LGWSRBQ',
      },
    },
  },
};
