import {Logger} from '@nestjs/common';
import chalk from 'chalk';

import {underscoreParameterize} from '@shared/helpers/parameterize';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';
import {normalizeISBN} from '@server/common/helpers';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';

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

    const $wideText = $('#yui-main .content .widetext');
    const text = $wideText.text();

    const result = new CreateBookDto(
      {
        title: $('h1').text().trim(),
        description: $wideText.find('p[align="justify"]').text().trim(),
        releases: [
          new CreateBookReleaseDto(
            {
              isbn: normalizeISBN(text.match(/ISBN: ([\w-]+)/)?.[1]),
              totalPages: (+text.match(/Liczba stron: (\d+)/)?.[1]) || 0,
            },
          ),
        ],
      },
    );

    console.info(result);
    return {
      result,
    };
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
