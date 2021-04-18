import {concatWithAnchor} from '@spider/helpers/concatWithAnchor';

import {BookSummaryKind} from '@shared/enums';
import {
  CreateBookSummaryDto,
  CreateBookSummaryHeaderDto,
} from '@server/modules/book/modules/summary/dto';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '@scrapper/service/shared';
import {RemoteArticleScrapper} from '../../modules/scrapper/service';

export class EszkolaBookSummaryParser extends WebsiteScrapperParser<CreateBookSummaryDto> {
  /**
   * @inheritdoc
   */
  parse(page: AsyncURLParseResult): CreateBookSummaryDto {
    if (!page)
      return null;

    const {$, url} = page;
    const $footerItems = $('#right-menu .right-box ul.list-categories li .list-subcategories a');

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
                title: $el.text(),
              },
            );
          },
        ),
      },
    );
  }
}
