import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {ScrapperMetadataKind} from '../../entity';
import {
  ScrapperBasicPagination,
  ScrapperResult,
  WebsiteScrapperItemInfo,
} from '../shared';

export type BookScrapperInfo = WebsiteScrapperItemInfo<CreateBookReviewDto> & {
  kind: ScrapperMetadataKind.BOOK,
};

export type BookProcessResult = ScrapperResult<BookScrapperInfo[], ScrapperBasicPagination>;

export interface BookAvailabilityScrapperMatcher<DataType = any> {
  searchAvailability(data: DataType): Promise<CreateBookAvailabilityDto[]>,
}
