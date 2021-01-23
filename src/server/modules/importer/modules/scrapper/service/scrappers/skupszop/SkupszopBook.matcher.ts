import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {MatchRecordAttrs} from '../../shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../BookShopScrappersGroup';

export class SkupszopBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
  async searchRemoteRecord(
    scrapperInfo: MatchRecordAttrs<CreateBookDto>,
  ): Promise<ScrapperMatcherResult<CreateBookDto>> {
    console.info('s', scrapperInfo);
    return Promise.resolve(null);
  }
}
