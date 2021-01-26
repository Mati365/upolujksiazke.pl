import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';

export class SkupszopBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
  async searchRemoteRecord(
    scrapperInfo: MatchRecordAttrs<CreateBookDto>,
  ): Promise<ScrapperMatcherResult<CreateBookDto>> {
    console.info('s', scrapperInfo);
    return Promise.resolve(null);
  }
}
