import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {ScrapperMetadataKind} from '../../entity';
import {
  ScrapperBasicPagination,
  ScrapperResult,
  WebsiteScrapperItemInfo,
} from '../shared';

export type BookReviewScrapperInfo = WebsiteScrapperItemInfo<CreateBookReviewDto> & {
  kind: ScrapperMetadataKind.BOOK_REVIEW,
};

export type BookReviewProcessResult = ScrapperResult<BookReviewScrapperInfo[], ScrapperBasicPagination>;
