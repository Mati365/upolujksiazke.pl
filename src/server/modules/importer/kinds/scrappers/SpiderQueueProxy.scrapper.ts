import {$enum} from 'ts-enum-util';
import * as R from 'ramda';

import {concatUrls} from '@shared/helpers/concatUrls';

import {CanBePromise} from '@shared/types';
import {ScrapperMetadataKind} from '@scrapper/entity/ScrapperMetadata.entity';
import {
  AsyncScrapper,
  ScrapperResult,
  WebsiteScrapperItemInfo,
  WebsiteScrappersKindMap,
} from '@scrapper/service/shared';

export type SpiderQueueScrapperInfo = WebsiteScrapperItemInfo<null>;

/**
 * Spider queue interface, it just accepts attributes
 * and pushes them into db queue
 *
 * @export
 * @class SpiderQueueProxyScrapper
 * @extends {AsyncScrapper<SpiderQueueScrapperInfo[]>}
 * @template T
 */
export class SpiderQueueProxyScrapper extends AsyncScrapper<SpiderQueueScrapperInfo[], string> {
  constructor() {
    super(
      {
        pageProcessDelay: 1000,
      },
    );
  }

  /**
   * @inheritdoc
   */
  mapSingleItemResponse(remoteId: string): SpiderQueueScrapperInfo {
    const url = concatUrls(this.websiteURL, remoteId);

    return {
      kind: ScrapperMetadataKind.URL,
      parserSource: null,
      remoteId,
      url,
    };
  }

  /**
   * @inheritdoc
   */
  fetchSingle(remoteId: string): SpiderQueueScrapperInfo {
    return this.mapSingleItemResponse(remoteId);
  }

  /**
   * @inheritdoc
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected processPage(page: string): CanBePromise<ScrapperResult<SpiderQueueScrapperInfo[], string>> {
    throw new Error('Method not implemented.');
  }

  /**
   * Returns object with all kinds of scrapped data
   *
   * @static
   * @returns {Required<WebsiteScrappersKindMap>}
   * @memberof SpiderQueueProxyScrapper
   */
  static createKindProxy(): Required<WebsiteScrappersKindMap> {
    return <any> R.fromPairs(
      $enum(ScrapperMetadataKind)
        .map<[ScrapperMetadataKind, SpiderQueueProxyScrapper]>((kind) => [kind, new SpiderQueueProxyScrapper]),
    );
  }
}
