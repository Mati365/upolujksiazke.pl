import {Language} from '@server/constants/language';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {BookBindingKind, BookProtection, BookType} from '@server/modules/book/modules/release/BookRelease.entity';
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
    'hiszpański': Language.ES,
    'rosyjski': Language.RU,
    'niemiecki': Language.DE,
    'francuski': Language.FR,
    'ukraiński': Language.UKR,
    'włoski': Language.IT,
    /* eslint-enable quote-props */
  },
);

export const BOOK_TYPE_TRANSLATION_MAPPINGS = Object.freeze(
  {
    /* eslint-disable quote-props */
    'audiobook': BookType.AUDIO_BOOK,
    'ebook': BookType.EBOOK,
    'paper': BookType.PAPER,
    /* eslint-enable quote-props */
  },
);

export type BookScrappedPropsMap = Record<string, [string, cheerio.Cheerio]>;

export type BookScrapperInfo = WebsiteScrapperItemInfo<CreateBookDto> & {
  kind: ScrapperMetadataKind.BOOK,
};

export type BookProcessResult = ScrapperResult<BookScrapperInfo[], ScrapperBasicPagination>;

export interface BookAvailabilityParser<DataType = any, Metadata = never> {
  parseAvailability(data: DataType): Promise<{meta?: Metadata, result: CreateBookAvailabilityDto[]}>,
}
