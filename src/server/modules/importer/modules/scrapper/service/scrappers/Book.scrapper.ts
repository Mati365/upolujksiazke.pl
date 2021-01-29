import {Language} from '@server/constants/language';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {BookBindingKind, BookProtection} from '@server/modules/book/modules/release/BookRelease.entity';
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

export const PROTECTION_TRANSLATION_MAPPINGS = Object.freeze(
  {
    /* eslint-disable quote-props */
    'znak wodny': BookProtection.WATERMARK,
    /* eslint-enable quote-props */
  },
);

export const LANGUAGE_TRANSLATION_MAPPINGS = Object.freeze(
  {
    /* eslint-disable quote-props */
    'polski': Language.PL,
    'angielski': Language.EN,
    /* eslint-enable quote-props */
  },
);

export type BookScrappedPropsMap = Record<string, [string, cheerio.Cheerio]>;

export type BookScrapperInfo = WebsiteScrapperItemInfo<CreateBookReviewDto> & {
  kind: ScrapperMetadataKind.BOOK,
};

export type BookProcessResult = ScrapperResult<BookScrapperInfo[], ScrapperBasicPagination>;

export interface BookAvailabilityScrapperMatcher<DataType = any, Metadata = never> {
  searchAvailability(data: DataType): Promise<{meta?: Metadata, result: CreateBookAvailabilityDto[]}>,
}
