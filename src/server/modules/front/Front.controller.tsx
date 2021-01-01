import React from 'react';
import {Helmet} from 'react-helmet';
import {Cache} from 'cache-manager';
import {Response, Request} from 'express';
import {Accepts} from '@server/common/decorators/Accepts.decorator';
import {
  CACHE_MANAGER,
  Controller, Get,
  Inject, Req, Res,
} from '@nestjs/common';

import {MAGIC_ASYNC_DATA_CONTEXT} from '@client/hooks/useSSRPromiseAttach/wrapHydratedAsyncTree';
import {
  CLIENT_ENV,
  SERVER_ENV,
} from '@server/constants/env';

import {ssrRenderAsyncTree} from '@client/hooks/useSSRPromiseAttach/ssrRenderAsyncTree';

import {AttachedPromise} from '@client/hooks/useSSRPromiseAttach';
import {PageRootHTML, SSR_HEAD_TAGS_MAGIC} from '@client/containers/PageRootHTML';
import {LangHydrate} from '@client/i18n/utils/createLangPack';
import {APICookieTokenAccessor} from '@client/modules/api/utils/APICookieTokenAccessor';
import {RequestCookiesDriver} from '@client/modules/api/utils/drivers';
import {UA} from '@client/modules/ua/UAProvider';

import {ManifestService} from '../manifest/Manifest.service';
import {I18n, I18nContext} from '../i18n';

@Controller()
export class FrontController {
  constructor(
    private manifest: ManifestService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /* eslint-disable @typescript-eslint/indent */
  @Get('*')
  @Accepts('html')
  async index(
    @Res() res: Response,
    @Req() req: Request,
    @I18n() i18n: I18nContext,
  ) {
    const {
      manifest,
      cacheManager,
    } = this;

    const hydrateLang: LangHydrate = {
      lang: i18n.lang,
      packs: i18n.service.getPacks(),
    };

    const {useragent} = req;
    const ua: UA = {
      mobile: useragent.isMobile,
      tablet: useragent.isTablet,
      desktop: useragent.isDesktop,
    };

    const html = await ssrRenderAsyncTree(
      {
        htmlModifier: (renderedHTML: string) => {
          const helmet = Helmet.renderStatic();

          return renderedHTML.replace(
            SSR_HEAD_TAGS_MAGIC,
            [
              helmet.title,
              helmet.meta,
              helmet.link,
            ]
              .map((el) => el.toString())
              .join(''),
          );
        },
        readParentCache(uuid: string) {
          return cacheManager.get(uuid) as any;
        },
        async mapperFn(val: AttachedPromise) {
          const {cacheParams} = val;
          const data = await val.executor();

          cacheManager.set(
            cacheParams.key,
            {
              data,
            },
            {
              ttl: cacheParams.expire,
            },
          );

          return data;
        },
      },
    )(
      (asyncAcc) => (
        <PageRootHTML
          lang={i18n.lang}
          manifest={manifest.files}
          provideRootProps={{
            ua,
            routerConfig: {
              location: req.url,
            },
            apiConfig: {
              ...SERVER_ENV.apiConfig,
              tokenAccessor: new APICookieTokenAccessor(
                {
                  cookiesDriver: new RequestCookiesDriver(req, res),
                },
              ),
            },
            hydrateLang,
          }}
          provideAsGlobals={{
            ua,
            i18n: hydrateLang,
            env: CLIENT_ENV,
            ssrTime: Date.now(),
            [MAGIC_ASYNC_DATA_CONTEXT]: asyncAcc.toJSON,
          }}
        />
      ),
    );

    res.send(`<!DOCTYPE html>${html}`);
  }
  /* eslint-enable @typescript-eslint/indent */
}
