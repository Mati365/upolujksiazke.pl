import {Logger} from '@nestjs/common';
import chalk from 'chalk';

import {underscoreParameterize} from '@shared/helpers/parameterize';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {ScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';

export class LiteraturaGildiaBookMatcher extends ScrapperMatcher<CreateBookDto> {
  private readonly logger = new Logger(LiteraturaGildiaBookMatcher.name);

  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async matchRecord(scrapperInfo: CreateBookDto): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const {$} = await this.directSearch(scrapperInfo);
    console.info('s', $);

    return Promise.resolve(null);
  }

  /**
   * Skips search phrase and try to build that links directly to book
   *
   * @private
   * @param {CreateBookDto} {authors, title}
   * @returns
   * @memberof LiteraturaGildiaBookMatcher
   */
  private async directSearch({authors, title}: CreateBookDto) {
    const {config, logger} = this;
    const url = concatUrls(
      config.homepageURL,
      `tworcy/${underscoreParameterize(authors[0].name)}/${underscoreParameterize(title)}`,
    );

    logger.log(`Direct fetching ${chalk.bold(url)}!`);
    return parseAsyncURLIfOK(url);
  }
}
