import {Logger} from '@nestjs/common';
import chalk from 'chalk';

import {normalizeParsedText} from '@server/common/helpers';
import {underscoreParameterize} from '@shared/helpers/parameterize';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';

import {ScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';

export class LiteraturaGildiaBookAuthorMatcher extends ScrapperMatcher<CreateBookAuthorDto> {
  private readonly logger = new Logger(LiteraturaGildiaBookAuthorMatcher.name);

  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async matchRecord(
    scrapperInfo: CreateBookAuthorDto,
    attrs?: {
      path: string,
    },
  ): Promise<ScrapperMatcherResult<CreateBookAuthorDto>> {
    const {config, logger} = this;
    const {name, description} = scrapperInfo;

    const url = concatUrls(
      config.homepageURL,
      attrs?.path ?? `tworcy/${underscoreParameterize(name)}`,
    );

    logger.log(`Direct fetching author from ${chalk.bold(url)}!`);

    const {$} = await parseAsyncURLIfOK(url);
    return {
      result: new CreateBookAuthorDto(
        {
          name: name ?? normalizeParsedText($('h1').text()),
          description: description ?? normalizeParsedText($('.widetext .visible-sentence')?.text()),
        },
      ),
    };
  }
}
