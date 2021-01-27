import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {BookBindingKind} from '@server/modules/book/modules/release/BookRelease.entity';
import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {ScrapperMetadataKind} from '../../entity';
import {
  ScrapperBasicPagination,
  ScrapperResult,
  WebsiteScrapperItemInfo,
} from '../shared';

export const BINDING_TRANSLATION_MAPPINGS = Object.freeze(
  {
    /* eslint-disable quote-props */
    'miękka': BookBindingKind.NOTEBOOK,
    'twarda': BookBindingKind.HARDCOVER,
    'miękka ze skrzydełkami': BookBindingKind.NOTEBOOK,
    /* eslint-enable quote-props */
  },
);

export type BookScrapperInfo = WebsiteScrapperItemInfo<CreateBookReviewDto> & {
  kind: ScrapperMetadataKind.BOOK,
};

export type BookProcessResult = ScrapperResult<BookScrapperInfo[], ScrapperBasicPagination>;

export interface BookAvailabilityScrapperMatcher<DataType = any> {
  searchAvailability(data: DataType): Promise<CreateBookAvailabilityDto[]>,
}
