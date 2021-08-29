import {concatWithAnchor} from '@spider/helpers/concatWithAnchor';

import {BookSummaryKind} from '@shared/enums';
import {
  CreateBookSummaryDto,
  CreateBookSummaryHeaderDto,
} from '@server/modules/book/modules/summary/dto';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '@scrapper/service/shared';
import {RemoteArticleScrapper} from '../../modules/scrapper/service';

export class BrykBookSummaryParser extends WebsiteScrapperParser<CreateBookSummaryDto> {
  // eslint-disable-next-line max-len
  static BOOK_SUMMARY_HEADER_SELECTOR = '.lectureContentContainer .how-to-write-item .bottom-navigation .rectangle-action > .tableOfContentsItem';

  /**
   * @inheritdoc
   */
  parse(page: AsyncURLParseResult): CreateBookSummaryDto {
    if (!page)
      return null;

    const {$, url} = page;
    const $footerItems = $(BrykBookSummaryParser.BOOK_SUMMARY_HEADER_SELECTOR);

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
                title: $el.find('.navigation-element-title').text(),
              },
            );
          },
        ),
      },
    );
  }
}
