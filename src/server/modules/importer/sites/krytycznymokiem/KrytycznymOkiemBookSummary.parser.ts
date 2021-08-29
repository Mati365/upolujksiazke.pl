import * as R from 'ramda';

import {WebsiteScrapperParser} from '@scrapper/service/shared';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {CreateRemoteArticleDto} from '@server/modules/remote/dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {BookSummaryKind} from '@shared/enums';

export class KrytycznymOkiemBookSummaryParser extends WebsiteScrapperParser<CreateBookSummaryDto> {
  parse({$, url}: AsyncURLParseResult): CreateBookSummaryDto {
    const blogPost = $('[itemprop="blogPost"]');
    const header = $(blogPost).find('h3.post-title[itemprop=\'name\']').text();

    const matchResult = header.match(/["„](?<title>[^"„”]+)["”] (?<author>.*)/);
    if (!matchResult)
      return null;

    const coverUrl = $('head meta[property="og:image"]').attr('content');
    const {title, author} = R.mapObjIndexed(R.trim, matchResult.groups);
    const book = new CreateBookDto(
      {
        defaultTitle: title,
        releases: [
          new CreateBookReleaseDto(
            {
              title,
            },
          ),
        ],
        authors: [
          new CreateBookAuthorDto(
            {
              name: author,
            },
          ),
        ],
      },
    );

    return new CreateBookSummaryDto(
      {
        book,
        kind: BookSummaryKind.REVIEW,
        article: new CreateRemoteArticleDto(
          {
            url,
            remoteId: $(blogPost).find('[itemprop=\'postId\']').attr('content'),
            title: $('title').text().trim(),
            description: 'Blog krytycznoliteracki Jarosława Czechowicza.',
            cover: (
              coverUrl
                ? new CreateImageAttachmentDto(
                  {
                    originalUrl: coverUrl,
                  },
                )
                : null
            ),
          },
        ),
      },
    );
  }
}
