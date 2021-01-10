import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {MatchRecordAttrs} from '../../shared/WebsiteScrappersGroup';
import {ScrapperMatcher, ScrapperMatcherResult} from '../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../BookShopScrappersGroup';

export class SkupszopBookMatcher extends ScrapperMatcher<CreateBookDto> {
  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async searchRemoteRecord(
    scrapperInfo: MatchRecordAttrs<CreateBookDto>,
  ): Promise<ScrapperMatcherResult<CreateBookDto>> {
    console.info('s', scrapperInfo);
    return Promise.resolve(null);
  }
}
