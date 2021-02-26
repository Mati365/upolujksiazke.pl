import React from 'react';
import ReactDOMServer from 'react-dom/server';

import pug from 'pug';
import {Response, Request} from 'express';
import {Accepts} from '@server/common/decorators/Accepts.decorator';
import {Controller, Get, Res} from '@nestjs/common';

// import {ENV} from '@server/constants/env';
import {MemoizeMethod} from '@shared/helpers/decorators/MemoizeMethod';
import {PageRoot} from '@client/routes/Root';

import htmlSkelTemplate from './templates/DefaultHTMLSkeleton.jade';
import {ManifestService} from '../manifest/Manifest.service';
import {I18n, I18nContext} from '../i18n';

@Controller()
export class FrontController {
  constructor(
    private manifestService: ManifestService,
  ) {}

  @MemoizeMethod
  getDefaultHTMLSkel() {
    return pug.compile(htmlSkelTemplate);
  }

  @Get('*')
  @Accepts('html')
  async index(
    @Res() res: Response, // eslint-disable-line @typescript-eslint/indent
    @Res() req: Request,
    @I18n() i18n: I18nContext,
  ) {
    const {manifestService: {files}} = this;
    const html = ReactDOMServer.renderToStaticMarkup(
      <PageRoot
        routerConfig={{
          location: req.url,
        }}
      />,
    );

    res.send(
      this.getDefaultHTMLSkel()(
        {
          lang: i18n.lang,
          files,
          html,
        },
      ),
    );
  }
}
