import {
  safeArray,
  safeJsonParse,
} from '@shared/helpers';

import {
  normalizeISBN,
  normalizeParsedText,
} from '@server/common/helpers';

import {BookType} from '@shared/enums';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {
  BookAvailabilityParser,
  LANGUAGE_TRANSLATION_MAPPINGS,
} from '@importer/kinds/scrappers/Book.scrapper';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';

export class LegimiBookParser
  extends WebsiteScrapperParser<CreateBookDto>
  implements BookAvailabilityParser<AsyncURLParseResult, {bookSchema: object}> {
  /**
   * @inheritdoc
   */
  parseAvailability({$, url}: AsyncURLParseResult) {
    // double call of safeJsonParse removes unicode escape
    const initialState = safeJsonParse(
      safeJsonParse(`"${
        $
          .html()
          .match(/window\["initialReduxState"\] = JSON.parse\("([^"]*)"\)/)?.[1]
      }"`),
    );

    if (!initialState)
      return null;

    const bookState = initialState.bookContainer.response.book;
    return Promise.resolve(
      {
        bookState,
        result: [
          new CreateBookAvailabilityDto(
            {
              url,
              remoteId: bookState.id,
              inStock: bookState.isAvailable,
              inAbonament: bookState.isInSubscription,
              totalRatings: bookState.rating.totalVotes || null,
              avgRating: (bookState.rating.averageRate * 2) || null,
              price: bookState.priceValue,
            },
          ),
        ],
      },
    );
  }

  /**
   * @inheritdoc
   */
  async parse(bookPage: AsyncURLParseResult) {
    if (!bookPage)
      return null;

    const availabilityResult = await this.parseAvailability(bookPage);
    if (!availabilityResult)
      return null;

    const {
      bookState,
      result: availability,
    } = availabilityResult;

    const {
      images,
      ebook,
    } = bookState;

    const title = normalizeParsedText(bookState.title);
    const release = new CreateBookReleaseDto(
      {
        availability,
        title,
        totalPages: ebook?.pages,
        description: normalizeParsedText(bookState.description),
        isbn: normalizeISBN(bookState.isbn),
        lang: LANGUAGE_TRANSLATION_MAPPINGS[bookState.language],
        publishDate: bookState.publicationYear,
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: images[500] || images[400] || images[200],
          },
        ),
        ...ebook && {
          type: BookType.EBOOK,
          publisher: new CreateBookPublisherDto(
            {
              name: ebook.publisher.name,
            },
          ),
        },
      },
    );

    return new CreateBookDto(
      {
        defaultTitle: title,
        authors: bookState.authors.map(({name}) => new CreateBookAuthorDto(
          {
            name,
          },
        )),
        categories: (
          safeArray(bookState.category)
            .filter(Boolean)
            .map(({name}) => new CreateBookCategoryDto(
              {
                name,
              },
            ))
        ),
        releases: [
          release,
        ],
      },
    );
  }
}
