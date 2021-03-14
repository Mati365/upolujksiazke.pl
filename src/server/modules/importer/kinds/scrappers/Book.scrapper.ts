import {Language} from '@shared/enums/language';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {BookBindingKind, BookProtection, BookType} from '@server/modules/book/modules/release/BookRelease.entity';
import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  ScrapperResult,
  WebsiteScrapperItemInfo,
} from '@scrapper/service/shared';

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
    'audiobook': BookType.AUDIOBOOK,
    'cd': BookType.AUDIOBOOK,
    'cd mp3': BookType.AUDIOBOOK,
    'mp3': BookType.AUDIOBOOK,
    'ebook': BookType.EBOOK,
    'książka': BookType.PAPER,
    /* eslint-enable quote-props */
  },
);

export const BOOK_TYPE_TITLE_REGEX = new RegExp(
  '(?<left>.*)?(?:[\\s.,(]|^)*(?<type>cd(?:\\s*mp3)?|ebook|audiobook)(?:[\\s.,)]|$)(?<right>.*)?',
  'i',
);

export type BookScrappedPropsMap = Record<string, [string, cheerio.Cheerio]>;

export type BookScrapperInfo = WebsiteScrapperItemInfo<CreateBookDto> & {
  kind: ScrapperMetadataKind.BOOK,
};

export type BookProcessResult = ScrapperResult<BookScrapperInfo[]>;

export interface BookAvailabilityParser<DataType = any, Metadata = never> {
  parseAvailability(data: DataType): Promise<{meta?: Metadata, result: CreateBookAvailabilityDto[]}>,
}
