import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {ScrapperMatcher, ScrapperMatcherResult} from '../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../BookShopScrappersGroup';

export class MatrasBookMatcher extends ScrapperMatcher<CreateBookDto> {
  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async matchRecord(scrapperInfo: CreateBookDto): Promise<ScrapperMatcherResult<CreateBookDto>> {
    console.info('s', scrapperInfo);
    return Promise.resolve(null);
  }
}
