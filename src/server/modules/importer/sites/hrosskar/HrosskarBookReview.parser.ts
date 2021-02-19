import * as R from 'ramda';

import {normalizeISBN} from '@server/common/helpers';

import {VotingStatsEmbeddable} from '@server/modules/shared/VotingStats.embeddable';
import {WebsiteScrapperParser} from '@scrapper/service/shared';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookReviewerDto} from '@server/modules/book/modules/reviewer/dto/CreateBookReviewer.dto';

export class HrosskarBookReviewParser extends WebsiteScrapperParser<CreateBookReviewDto> {
  parse({$, url}: AsyncURLParseResult): CreateBookReviewDto {
    const blogPost = $('[itemprop="blogPost"]');
    const description = $(blogPost).find('p').text();
    const bookInfo = $(blogPost).find('div').text();
    const header = $(blogPost).find('h3.post-title[itemprop=\'name\']').text();

    const [title, author] = R.map(R.trim, R.splitAt(
      header.lastIndexOf('-'),
      header,
    ));

    const isbn = normalizeISBN(bookInfo.match(/ISBN:\s*([\w-]+)/)?.[1]);
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

    const rating = description.match(/Ocena:\s(\d+)\s*\/\s*(\d+)/)?.slice(1, 3);
    return new CreateBookReviewDto(
      {
        book,
        url,
        showOnlyAsQuote: true,
        description: R.trim(
          description.substr(0, description.lastIndexOf('Ocena:')),
        ),
        rating: (
          rating?.length === 2
            ? ((+rating[0]) / (+rating[1])) * 10
            : null
        ),
        remoteId: $(blogPost).find('[itemprop=\'postId\']').attr('content'),
        publishDate: new Date($('a.timestamp-link [itemprop=\'datePublished\']').attr('title')),
        stats: new VotingStatsEmbeddable(
          {
            comments: $('#comment-holder .comment').length,
          },
        ),
        reviewer: new CreateBookReviewerDto(
          {
            name: $(blogPost).find('[itemprop="author"] [itemprop="name"]').text(),
          },
        ),
      },
    );
  }
}
