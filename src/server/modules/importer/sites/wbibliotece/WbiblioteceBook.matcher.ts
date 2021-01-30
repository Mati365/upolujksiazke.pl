import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';

export class WbiblioteceBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
  extractFromFetchedPage(result: AsyncURLParseResult): Promise<ScrapperMatcherResult<CreateBookDto>> {
    console.info(result);
    throw new Error('Method not implemented.');
  }

  async searchRemoteRecord(
    scrapperInfo: MatchRecordAttrs<CreateBookDto>,
  ): Promise<ScrapperMatcherResult<CreateBookDto>> {
    console.info('s', scrapperInfo);
    return Promise.resolve(null);
  }
}
