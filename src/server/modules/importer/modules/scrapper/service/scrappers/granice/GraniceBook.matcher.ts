import {BookEntity} from '@server/modules/book/Book.entity';
import {ScrapperMatcher, ScrapperMatcherResult} from '../../shared/ScrapperMatcher';
import {BookScrapperInfo} from '../Book.scrapper';
import {BookShopScrappersGroupConfig} from '../BookShopScrappersGroup';

export class GraniceBookMatcher implements ScrapperMatcher<BookScrapperInfo, BookEntity> {
  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {}

  async matchRecord(scrapperInfo: BookScrapperInfo): Promise<ScrapperMatcherResult<BookEntity>> {
    console.info('s', scrapperInfo);
    return Promise.resolve(null);
  }
}
