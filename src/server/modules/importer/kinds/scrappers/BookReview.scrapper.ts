import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  ScrapperResult,
  WebsiteScrapperItemInfo,
} from '@scrapper/service/shared';

export type BookReviewScrapperInfo = WebsiteScrapperItemInfo<CreateBookReviewDto> & {
  kind: ScrapperMetadataKind.BOOK_REVIEW,
};

export type BookReviewProcessResult = ScrapperResult<BookReviewScrapperInfo[]>;
