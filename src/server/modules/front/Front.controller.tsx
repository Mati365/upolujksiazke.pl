import React from 'react';
import ReactDOMServer from 'react-dom/server';

import pug from 'pug';
import {Response, Request} from 'express';
import {Accepts} from '@server/common/decorators/Accepts.decorator';
import {Controller, Get, Res, Req} from '@nestjs/common';

import {MemoizeMethod} from '@shared/helpers/decorators/MemoizeMethod';
import {APP_ROUTES_LIST, PageRoot} from '@client/routes/Root';

import {preloadAsyncRouteProps} from '@client/components/utils/asyncRouteUtils';

import {ManifestService} from '../manifest/Manifest.service';
import {APIClientService} from '../api/services';
import {
  I18n,
  I18nContext,
} from '../i18n';

import htmlSkelTemplate from './templates/DefaultHTMLSkeleton.jade';

@Controller()
export class FrontController {
  constructor(
    private readonly manifestService: ManifestService,
    private readonly apiClientService: APIClientService,
  ) {}

  @MemoizeMethod
  getDefaultHTMLSkel() {
    return pug.compile(htmlSkelTemplate);
  }

  @Get('*')
  @Accepts('html')
  async index(
    @Res() res: Response, // eslint-disable-line @typescript-eslint/indent
    @Req() req: Request,
    @I18n() i18n: I18nContext,
  ) {
    const {
      manifestService: {files},
      apiClientService: {client},
    } = this;

    const preloadedRouteData = await preloadAsyncRouteProps(
      {
        routes: APP_ROUTES_LIST,
        path: req.path,
        ctx: {
          api: client,
        },
      },
    );

    const viewData = {
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

    const html = ReactDOMServer.renderToStaticMarkup(
      <PageRoot
        initialViewData={viewData}
        routerConfig={{
          location: req.url,
        }}
      />,
    );

    res.send(
      this.getDefaultHTMLSkel()(
        {
          lang: i18n.lang,
          viewData: JSON.stringify(viewData),
          files,
          html,
        },
      ),
    );
  }
}
