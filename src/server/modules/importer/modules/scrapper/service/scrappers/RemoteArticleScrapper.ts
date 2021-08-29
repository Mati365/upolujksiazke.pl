import {concatWithAnchor} from '@spider/helpers/concatWithAnchor';
import {extractPathname} from '@shared/helpers';

import {AsyncURLParseResult, parseAsyncURL} from '@server/common/helpers/fetchAsyncHTML';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto/CreateImageAttachment.dto';
import {CreateRemoteArticleDto} from '@server/modules/remote/dto/CreateRemoteArticle.dto';

export class RemoteArticleScrapper {
  /**
   * Fetches remote article dto from parse result
   *
   * @static
   * @param {AsyncURLParseResult} {$, url}
   * @returns
   * @memberof SocialTagsScrapper
   */
  static pickRemoteArticleDtoFromPage({$, url}: AsyncURLParseResult) {
    const coverUrl = $('meta[property="og:image"]').attr('content');
    const title = (
      $('meta[property="og:title"]').attr('content')
        || $('title, TITLE').first().text()
    );

    // description tag is more rich, see bryk.pl
    const description = (
      $('meta[name="description"], meta[name="Description"], meta[property="og:description"]')
        .first()
        ?.attr('content')
    );

    return new CreateRemoteArticleDto(
      {
        remoteId: extractPathname(url) || url,
        url: $('meta[property="og:url"]').attr('content') || url,
        title,
        description,
        ...coverUrl && {
          cover: coverUrl && new CreateImageAttachmentDto(
            {
              originalUrl: concatWithAnchor(url, coverUrl),
            },
          ),
        },
      },
    );
  }

  /**
   * Gets remote article dto from URL
   *
   * @static
   * @param {string} url
   * @returns
   * @memberof RemoteArticleScrapper
   */
  static async fetchRemoteArticleFromURL(url: string) {
    return RemoteArticleScrapper.pickRemoteArticleDtoFromPage(
      await parseAsyncURL(url),
    );
  }
}
