import {CreateBookSummaryDto} from '@server/modules/book/modules/summary/dto';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';
import {WebsiteScrapperItemInfo} from '../../modules/scrapper/service/shared';

export type BookSummaryScrapperInfo = WebsiteScrapperItemInfo<CreateBookSummaryDto> & {
  kind: ScrapperMetadataKind.BOOK_SUMMARY,
};
