// import React from 'react';
// import {Helmet} from 'react-helmet';
import {Cache} from 'cache-manager';
import {Response} from 'express';
import {Accepts} from '@server/common/decorators/Accepts.decorator';
import {
  CACHE_MANAGER,
  Controller, Get,
  Inject, Res,
} from '@nestjs/common';

// import {
//   CLIENT_ENV,
//   SERVER_ENV,
// } from '@server/constants/env';

import {ManifestService} from '../manifest/Manifest.service';
// import {I18n, I18nContext} from '../i18n';

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
    // @Req() req: Request,
    // @I18n() i18n: I18nContext,
  ) {
    // const {
    //   manifest,
    //   cacheManager,
    // } = this;
    res.send('Hello world!');
  }
  /* eslint-enable @typescript-eslint/indent */
}
