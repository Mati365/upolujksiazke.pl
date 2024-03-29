import pug from 'pug';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {Helmet} from 'react-helmet';
import {StaticRouterContext} from 'react-router';
import {Response, Request} from 'express';
import {Controller, Get, Res, Req} from '@nestjs/common';
import {Accepts} from '@server/common/decorators/Accepts.decorator';

import {
  CLIENT_ENV,
  SHARED_ENV,
} from '@server/constants/env';

import {UA} from '@client/modules/ua';
import {APP_ROUTES_LIST, PageRoot} from '@client/routes/Root';

import {preloadAsyncRouteProps} from '@client/components/utils/asyncRouteUtils';

import {UseRefreshJWTInterceptor} from '../api/interceptors/RefreshJWTCookie.interceptor';
import {ManifestService} from '../manifest/Manifest.service';
import {APIClientService} from '../api/services/APIClient.service';
import {
  I18n,
  I18nContext,
} from '../i18n';

import htmlSkelTemplate from './templates/DefaultHTMLSkeleton.jade';

@Controller()
export class FrontController {
  private baseHTMLTemplate = pug.compile(htmlSkelTemplate);

  constructor(
    private readonly manifestService: ManifestService,
    private readonly apiClientService: APIClientService,
  ) {}

  @Get('*')
  @Accepts('html')
  @UseRefreshJWTInterceptor
  async index(
    @Res() res: Response, // eslint-disable-line @typescript-eslint/indent
    @Req() req: Request,
    @I18n() i18n: I18nContext,
  ) {
    const {
      baseHTMLTemplate,
      manifestService: {files},
      apiClientService: {client},
    } = this;

    const preloadedRouteData = await preloadAsyncRouteProps(
      {
        routes: APP_ROUTES_LIST,
        search: req.query,
        path: req.path,
        ctx: {
          api: client,
        },
      },
    );

    const {useragent} = req;
    const ua: UA = {
      mobile: useragent.isMobile,
      tablet: useragent.isTablet,
      desktop: useragent.isDesktop,
    };

    const viewData = {
      ua,
      env: {
        shared: SHARED_ENV,
        client: CLIENT_ENV,
      },

      lang: {
        current: i18n.lang,
        translations: {
          [i18n.lang]: i18n.currentLangPack,
        },
      },

      ...preloadedRouteData && {
        asyncRoute: {
          [preloadedRouteData.id]: preloadedRouteData.props,
        },
      },
    };

    const context: StaticRouterContext = {};
    const html = ReactDOMServer.renderToStaticMarkup(
      <PageRoot
        initialViewData={viewData}
        routerConfig={{
          location: req.url,
          context,
        }}
      />,
    );

    const helmet = Helmet.renderStatic();
    if (context.url) {
      res.redirect(301, context.url);
      return;
    }

    res.send(
      baseHTMLTemplate(
        {
          gtagKey: CLIENT_ENV.analytics?.key,
          lang: i18n.lang,
          viewData: JSON.stringify(viewData),
          meta: `
            ${helmet.title.toString()}
            ${helmet.meta.toString()}
            ${helmet.link.toString()}
          `,
          files,
          html,
        },
      ),
    );
  }
}
