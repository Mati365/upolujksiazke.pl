import {concatWithAnchor} from '@spider/helpers/concatWithAnchor';

import {BookSummaryKind} from '@shared/enums';
import {
  CreateBookSummaryDto,
  CreateBookSummaryHeaderDto,
} from '@server/modules/book/modules/summary/dto';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '@scrapper/service/shared';
import {RemoteArticleScrapper} from '../../modules/scrapper/service';

export class KlpBookSummaryParser extends WebsiteScrapperParser<CreateBookSummaryDto> {
  /**
   * @inheritdoc
   */
  parse(page: AsyncURLParseResult): CreateBookSummaryDto {
    if (!page)
      return null;

    const {$, url} = page;
    const $footerItems = $('#sidebar .menux li a, #ie78 a[href^="#"]');

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
