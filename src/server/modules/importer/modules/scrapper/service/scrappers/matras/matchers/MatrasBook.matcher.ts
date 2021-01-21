import * as R from 'ramda';
import stringSimilarity from 'string-similarity';

import {buildURL} from '@shared/helpers';
import {concatUrls} from '@shared/helpers/concatUrls';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {MatchRecordAttrs} from '../../../shared/WebsiteScrappersGroup';
import {ScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';

export class MatrasBookMatcher extends ScrapperMatcher<CreateBookDto> {
  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    await this.searchByPhrase(data);
    return Promise.resolve(null);
  }

  /**
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof GraniceBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const {config} = this;
    const $ = (
      await parseAsyncURLIfOK(
        buildURL(
          config.searchURL,
          {
            szukaj: `${title} ${authors[0].name}`,
          },
        ),
      )
    )?.$;

    const lowerTitle = R.toLower(title);
    const bestMatch = R.head(R.sort(
      (a, b) => b[0] - a[0],
      $('#yui-main .content ul.long-list > li > a')
        .toArray()
        .map(
          (element): [number, string] => {
            const $element = $(element);
            const similarity = stringSimilarity.compareTwoStrings(
              lowerTitle,
              R.toLower($element.text().trim()),
            );

            if (!similarity)
              return null;

            return [
              similarity,
              $element.attr('href'),
            ];
          },
        )
        .filter(Boolean),
    ));

    if (bestMatch?.[0] > 0.8) {
      return parseAsyncURLIfOK(
        concatUrls(
          config.homepageURL,
          bestMatch[1],
        ),
      );
    }
    console.info($);

    return null;
  }
}
