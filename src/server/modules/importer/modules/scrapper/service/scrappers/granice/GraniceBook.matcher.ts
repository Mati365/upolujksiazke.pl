import {ScrapperMatcher, ScrapperMatcherResult} from '../../shared/ScrapperMatcher';
import {BookScrapperInfo} from '../Book.scrapper';
import {BookShopScrappersGroupConfig} from '../BookShopScrappersGroup';

export class GraniceBookMatcher extends ScrapperMatcher<BookScrapperInfo> {
  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async matchRecord(scrapperInfo: BookScrapperInfo): Promise<ScrapperMatcherResult<BookScrapperInfo>> {
    console.info('s', scrapperInfo);
    return Promise.resolve(null);
  }
}
