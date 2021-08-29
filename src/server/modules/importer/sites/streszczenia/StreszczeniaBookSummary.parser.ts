import {concatWithAnchor} from '@spider/helpers/concatWithAnchor';

import {BookSummaryKind} from '@shared/enums';
import {
  CreateBookSummaryDto,
  CreateBookSummaryHeaderDto,
} from '@server/modules/book/modules/summary/dto';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '@scrapper/service/shared';
import {RemoteArticleScrapper} from '../../modules/scrapper/service';

export class StreszczeniaBookSummaryParser extends WebsiteScrapperParser<CreateBookSummaryDto> {
  // eslint-disable-next-line max-len
  static BOOK_SUMMARY_HEADER_SELECTOR = '#box-elaboration h4 a, #box-charakter h4 a, #box-motive h4 a';

  /**
   * @inheritdoc
   */
  parse(page: AsyncURLParseResult): CreateBookSummaryDto {
    if (!page)
      return null;

    const {$, url} = page;
    const $footerItems = $(StreszczeniaBookSummaryParser.BOOK_SUMMARY_HEADER_SELECTOR);

    return new CreateBookSummaryDto(
      {
        kind: BookSummaryKind.SUMMARY,
        article: RemoteArticleScrapper.pickRemoteArticleDtoFromPage(page),
        headers: $footerItems.toArray().map(
          (el) => {
            const $el = $(el);

            return new CreateBookSummaryHeaderDto(
              {
                url: concatWithAnchor(url, $el.attr('href')),
                title: $el.attr('title'),
              },
            );
          },
        ),
      },
    );
  }
}
