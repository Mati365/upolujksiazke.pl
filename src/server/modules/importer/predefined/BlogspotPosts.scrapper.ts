import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';
import {concatWithAnchor} from '@spider/helpers/concatWithAnchor';
import {extractPathname} from '@shared/helpers';

import {ScrapperResult} from '@scrapper/service/shared';
import {ScrapperMetadataKind} from '@scrapper/entity/ScrapperMetadata.entity';
import {
  SpiderQueueProxyScrapper,
  SpiderQueueScrapperInfo,
} from '@importer/kinds/scrappers/SpiderQueueProxy.scrapper';

export class BlogspotPostsScrapper extends SpiderQueueProxyScrapper {
  /**
   * @inheritdoc
   */
  protected async processPage(page: string): Promise<ScrapperResult<SpiderQueueScrapperInfo[], string>> {
    const {websiteURL} = this;
    const $ = (await parseAsyncURLIfOK(
      page ?? concatUrls(websiteURL, 'search/label/recenzja'),
    ))?.$;

    if (!$)
      return null;

    const result: SpiderQueueScrapperInfo[] = (
      $('body .content .content-outer .post[itemtype="http://schema.org/BlogPosting"]')
        .toArray()
        .map((item: cheerio.Element) => {
          const url = concatWithAnchor(
            this.websiteURL,
            $(item).find('h3[itemprop="name"] > a').attr('href'),
          );

          return {
            kind: ScrapperMetadataKind.URL,
            remoteId: extractPathname(url),
            parserSource: null,
            url,
          };
        })
    );

    const nextPagePath = $('#blog-pager-older-link > a').attr('href');
    return {
      result,
      ptr: {
        nextPage: nextPagePath && concatWithAnchor(websiteURL, nextPagePath),
      },
    };
  }
}
