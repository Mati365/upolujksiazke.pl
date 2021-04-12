import {Injectable} from '@nestjs/common';

import {concatWithAnchor} from '@spider/helpers/concatWithAnchor';
import {parseAsyncURL} from '@server/common/helpers/fetchAsyncHTML';

import {CreateImageAttachmentDto} from '@server/modules/attachment/dto/CreateImageAttachment.dto';
import {CreateRemoteArticleDto} from '@server/modules/remote/dto/CreateRemoteArticle.dto';

@Injectable()
export class RemoteArticleScrapperService {
  /**
   * Fetchs article and picks og:tags
   *
   * @param {CreateRemoteArticleDto} {url}
   * @returns
   * @memberof RemoteArticleScrapperService
   */
  async fetchRemoteArticleDto({url}: CreateRemoteArticleDto) {
    const {$} = await parseAsyncURL(url);
    const $head = $('head');

    const title = $head.find('meta[property="og:title"]').attr('content') || $head.find('title').text();
    const coverUrl = $head.find('meta[property="og:image"]').attr('content');

    // description tag is more rich, see bryk.pl
    const description = (
      $head.find('meta[name="description"]')
        || $head.find('meta[property="og:description"]')
    )?.attr('content');

    return new CreateRemoteArticleDto(
      {
        url: $head.find('meta[property="og:url"]').attr('content') || url,
        title,
        description,
        ...coverUrl && {
          logo: coverUrl && new CreateImageAttachmentDto(
            {
              originalUrl: concatWithAnchor(url, coverUrl),
            },
          ),
        },
      },
    );
  }
}
