import * as R from 'ramda';

import {
  normalizeISBN,
  normalizeParsedText,
} from '@server/common/helpers';

import {BookSummaryKind} from '@shared/enums';
import {WebsiteScrapperParser} from '@scrapper/service/shared';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {CreateRemoteArticleDto} from '@server/modules/remote/dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';

export class HrosskarBookSummaryParser extends WebsiteScrapperParser<CreateBookSummaryDto> {
  parse({$, url}: AsyncURLParseResult): CreateBookSummaryDto {
    const blogPost = $('[itemprop="blogPost"]');
    const postBody = $(blogPost).find('.post-body');

    const description = postBody.text();
    const bookInfo = $(postBody).find('div').text();
    const header = $(blogPost).find('h3.post-title[itemprop=\'name\']').text();
    let [title, author] = R.map(R.trim, header.split(' - '));

    [title] = title.split(',');
    if (!author)
      author = normalizeParsedText(bookInfo.match(/Autor:\s*(.*)\n/i)?.[1]);

    const coverUrl = $('head meta[property="og:image"]').attr('content');
    const isbn = normalizeISBN(bookInfo.match(/ISBN:\s*([\w-]+)/i)?.[1]);
    const book = new CreateBookDto(
      {
        defaultTitle: title,
        releases: [
          new CreateBookReleaseDto(
            {
              isbn,
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
            description,
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
