import * as R from 'ramda';

import {VotingStatsEmbeddable} from '@server/modules/shared/VotingStats.embeddable';
import {WebsiteScrapperParser} from '@scrapper/service/shared';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookReviewerDto} from '@server/modules/book/modules/reviewer/dto/CreateBookReviewer.dto';

export class KrytycznymOkiemBookReviewParser extends WebsiteScrapperParser<CreateBookReviewDto> {
  parse({$, url}: AsyncURLParseResult): CreateBookReviewDto {
    const blogPost = $('[itemprop="blogPost"]');
    const postBody = $(blogPost).find('.post-body');

    const description = postBody.html();
    const header = $(blogPost).find('h3.post-title[itemprop=\'name\']').text();

    const matchResult = header.match(/["„](?<title>[^"„”]+)["”] (?<author>.*)/);
    if (!matchResult)
      return null;

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

    return new CreateBookReviewDto(
      {
        book,
        url,
        hiddenContent: true,
        description: description.replaceAll('\n', '<br />'),
        remoteId: $(blogPost).find('[itemprop=\'postId\']').attr('content'),
        publishDate: new Date($('a.timestamp-link [itemprop=\'datePublished\']').attr('title')),
        stats: new VotingStatsEmbeddable(
          {
            comments: $('#comment-holder .comment, #comments .comment-body').length,
          },
        ),
        reviewer: new CreateBookReviewerDto(
          {
            name: $(blogPost).find('[itemprop="author"] [itemprop="name"]').text() || 'krytycznymokiem',
          },
        ),
      },
    );
  }
}
