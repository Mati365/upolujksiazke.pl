import * as R from 'ramda';
import stringSimilarity from 'string-similarity';
import pMap from 'p-map';
import {validate} from 'class-validator';
import {plainToClass} from 'class-transformer';
import {
  Inject, Injectable,
  Logger, forwardRef,
} from '@nestjs/common';

import {objPropsToPromise} from '@shared/helpers/async/mapObjValuesToPromise';
import {parameterize} from '@shared/helpers/parameterize';
import {pickLongestArrayItem} from '@shared/helpers';
import {trimBorderSpecialCharacters} from '@server/common/helpers/text/trimBorderSpecialCharacters';

import {BookService} from '@server/modules/book/services/Book.service';
import {BookPublisherService} from '@server/modules/book/modules/publisher/BookPublisher.service';

import {
  BookEntity,
  CreateBookDto,
  FuzzyBookSearchService,
} from '@server/modules/book';

import {CreateBookSeriesDto} from '@server/modules/book/modules/series/dto/CreateBookSeries.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {
  CreateBookVolumeDto,
  DEFAULT_BOOK_VOLUME_NAME,
} from '@server/modules/book/modules/volume/dto/CreateBookVolume.dto';

import {
  ScrapperMetadataEntity,
  ScrapperMetadataKind,
} from '@scrapper/entity';

import {MetadataDbLoader} from '@db-loader/MetadataDbLoader.interface';
import {ScrapperMatcherService} from '@scrapper/service/actions';
import {ScrapperService} from '@scrapper/service/Scrapper.service';

import {
  mergeBooks,
  mergeReleases,
  normalizeBookTitle,
  normalizeHTML,
  normalizePublisherTitle,
} from '../scrappers/helpers';

type BookExtractorAttrs = {
  skipIfAlreadyInDb?: boolean,
  skipCacheLookup?: boolean,
};

/**
 * Normalize already parsed books and load them to db
 *
 * @export
 * @class BookDbLoaderService
 * @implements {MetadataDbLoader}
 */
@Injectable()
export class BookDbLoaderService implements MetadataDbLoader {
  private readonly logger = new Logger(BookDbLoaderService.name);

  constructor(
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
    @Inject(forwardRef(() => FuzzyBookSearchService))
    private readonly fuzzyBookSearchService: FuzzyBookSearchService,
    private readonly scrapperMatcherService: ScrapperMatcherService,
    private readonly scrapperService: ScrapperService,
    private readonly publisherService: BookPublisherService,
  ) {}

  /**
   * @inheritdoc
   */
  extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const {logger} = this;
    const book = plainToClass(CreateBookDto, metadata.content);

    if (!book) {
      logger.error('Book not matched!');
      return null;
    }

    return this.parseTitlesAndExtractBooksToDb(
      [
        book,
      ],
    );
  }

  /**
   * Checks if book should be matched using matcher
   *
   * @static
   * @param {CreateBookDto} book
   * @returns
   * @memberof BookDbLoaderService
   */
  static isEnoughToBeScrapped(book: CreateBookDto) {
    return (
      book.authors?.length > 0 && !!book.title
    );
  }

  /**
   * Lookups book to be present in other websites and loads to DB
   *
   * @param {CreateBookDto} book
   * @param {BookExtractorAttrs} [attrs={}]
   * @returns
   * @memberof BookDbLoaderService
   */
  async searchAndExtractToDb(book: CreateBookDto, attrs: BookExtractorAttrs = {}) {
    const {
      logger,
      scrapperMatcherService,
    } = this;

    if (!BookDbLoaderService.isEnoughToBeScrapped(book))
      return null;

    const matchedBooks = R.pluck(
      'result',
      await scrapperMatcherService.searchRemoteRecord<CreateBookDto>(
        {
          kind: ScrapperMetadataKind.BOOK,
          data: book,
        },
      ),
    );

    if (R.isEmpty(matchedBooks)) {
      logger.warn(`Book ${JSON.stringify(book)} not matched!`);
      return null;
    }

    const extractedBooks = await this.parseTitlesAndExtractBooksToDb(matchedBooks, attrs);
    const searchSlug = book.genSlug();

    return R.reduce(
      (acc, item) => {
        const similarity = stringSimilarity.compareTwoStrings(searchSlug, item.parameterizedSlug);
        if (!acc.book || similarity > acc.similarity) {
          return {
            book: item,
            similarity,
          };
        }

        return acc;
      },
      {
        book: null,
        similarity: null,
      } as {
        book: BookEntity,
        similarity: number,
      },
      extractedBooks,
    ).book;
  }

  /**
   * Groups book by release volume and extract them to db
   *
   * @param {CreateBookDto[]} books
   * @param {BookExtractorAttrs} [attrs={}]
   * @memberof BookDbLoaderService
   */
  async parseTitlesAndExtractBooksToDb(books: CreateBookDto[], attrs: BookExtractorAttrs = {}) {
    // extract volume info from all reelases titles, assign type based on title and edition
    const normalizedReleasesBooks = books.map((book) => ({
      book,
      volumesReleases: book.releases.map(
        (release): [{volume: string, series: string}, CreateBookReleaseDto] => {
          if (R.isNil(release.title)) {
            return [
              {
                volume: DEFAULT_BOOK_VOLUME_NAME,
                series: null,
              },
              release,
            ];
          }

          const {
            edition, title, type,
            series, volume,
          } = normalizeBookTitle(release.title);

          return [
            {
              volume,
              series,
            },
            new CreateBookReleaseDto(
              {
                ...release,
                title,
                type: release.type ?? type,
                edition: release.edition ?? edition,
              },
            ),
          ];
        },
      ),
    }));

    // group books by volume and rearrange releases
    const volumes: Record<string, CreateBookDto[]> = {};
    normalizedReleasesBooks.forEach(({book, volumesReleases}) => {
      volumesReleases.forEach(([{volume, series}, release]) => {
        (volumes[volume] ||= []).push(
          new CreateBookDto(
            {
              ...book,
              defaultTitle: release.title,
              releases: [release],
              series: series && [
                new CreateBookSeriesDto(
                  {
                    name: series,
                  },
                ),
              ],
              authors: (
                book.authors?.length > 0
                  ? book.authors
                  : R.find(({authors}) => authors?.length > 0, books)?.authors
              ),
              volume: new CreateBookVolumeDto(
                {
                  name: volume,
                },
              ),
            },
          ),
        );
      });
    });

    // extract all rearranged books to db
    return pMap(
      R.values(volumes),
      (volumeBooks) => this.mergeAndExtractBookToDb(volumeBooks, attrs),
      {
        concurrency: 2,
      },
    );
  }

  /**
   * Merges book into one and loads to DB
   *
   * @see
   *  All releases should have equal volume values!
   *
   * @param {CreateBookDto[]} books
   * @param {BookExtractorAttrs} attrs
   * @returns
   * @memberof BookDbLoaderService
   */
  private async mergeAndExtractBookToDb(books: CreateBookDto[], attrs: BookExtractorAttrs = {}) {
    const {
      fuzzyBookSearchService,
      bookService,
    } = this;

    if (R.isEmpty(books))
      return null;

    const allReleases = R.unnest(R.pluck('releases', books));
    let cachedBook: BookEntity = null;

    if (!attrs.skipCacheLookup) {
      cachedBook = await fuzzyBookSearchService.findAlreadyCachedSimilarToBooks(books, allReleases);
      if (attrs.skipIfAlreadyInDb && cachedBook)
        return cachedBook;
    }

    const authors = pickLongestArrayItem(R.pluck('authors', books))?.map(
      (author) => new CreateBookAuthorDto(
        {
          ...author,
          description: normalizeHTML(author.description),
          name: trimBorderSpecialCharacters(author.name),
        },
      ),
    );

    const normalizedReleases = await this.normalizeReleases(allReleases);
    if (!normalizedReleases)
      return null;

    return bookService.upsert(
      new CreateBookDto(
        {
          ...mergeBooks(books),
          ...cachedBook && {
            id: cachedBook.id,
            parameterizedSlug: cachedBook.parameterizedSlug,
          },
          releases: await this.fixSimilarNamedReleasesPublishers(normalizedReleases),
          authors,
        },
      ),
    );
  }

  /**
   * Merges releases with same isbn
   *
   * @async
   * @param {CreateBookReleaseDto[]} allReleases
   * @returns
   */
  private async normalizeReleases(allReleases: CreateBookReleaseDto[]) {
    const {scrapperService} = this;
    const websites = await scrapperService.findOrCreateWebsitesByUrls(
      R.pluck(
        'url',
        [
          ...R.unnest(R.pluck('availability', allReleases)),
          ...R.unnest(R.pluck('reviews', allReleases)),
        ].filter(Boolean),
      ),
    );

    // book normalization
    const releases = await pMap(
      allReleases.filter(({isbn}) => !!isbn),
      async (release) => {
        let publisher = release.publisher || null;
        if (publisher && (await validate(publisher)).length > 0)
          publisher = null;

        const publisherName = publisher && normalizePublisherTitle(publisher.name);
        return new CreateBookReleaseDto(
          {
            ...release,
            description: normalizeHTML(release.description),
            publisher: publisher && new CreateBookPublisherDto(
              {
                ...publisher,
                name: publisherName,
                parameterizedName: parameterize(publisherName),
              },
            ),
            reviews: release.reviews?.map(
              (review) => new CreateBookReviewDto(
                {
                  ...review,
                  websiteId: websites[review.url].id,
                },
              ),
            ),
            availability: release.availability?.map(
              (availability) => new CreateBookAvailabilityDto(
                {
                  ...availability,
                  websiteId: websites[availability.url].id,
                },
              ),
            ),
          },
        );
      },
      {
        concurrency: 4,
      },
    );

    if (R.isEmpty(releases))
      return null;

    const groupedReleases = R.values(
      R.groupBy(
        R.prop('isbn'),
        releases,
      ),
    );

    return groupedReleases.map(
      (items) => new CreateBookReleaseDto(
        mergeReleases(items),
      ),
    );
  }

  /**
   * Some publishers are called similar. Merge them into one.
   *
   * @example
   *  publishers: ['superNova'], 'supernowa', 'superNOWA'] is merged into ['superNova']
   *
   * @private
   * @param {CreateBookReleaseDto[]} releases
   * @param {number} [similarity=0.7]
   * @param {number} [minCompareLength=6]
   * @returns
   * @memberof BookDbLoaderService
   */
  private async fixSimilarNamedReleasesPublishers(
    releases: CreateBookReleaseDto[],
    similarity: number = 0.7,
    minCompareLength: number = 6,
  ) {
    const {publisherService} = this;
    const similarPublisherReleases = releases.reduce(
      (acc, release) => {
        if (!release.publisher)
          return acc;

        const {publisher: {parameterizedName}} = release;
        if (parameterizedName.length < minCompareLength) {
          acc[parameterizedName] ??= [];
          acc[parameterizedName].push(release);
          return acc;
        }

        const prevKeys = R.keys(acc);
        let bestMatch: stringSimilarity.Rating = null;
        if (!R.isEmpty(prevKeys))
          ({bestMatch} = stringSimilarity.findBestMatch(parameterizedName, R.keys(acc)));

        if (bestMatch?.rating > similarity)
          acc[bestMatch.target].push(release);
        else
          acc[parameterizedName] = [release];

        return acc;
      },
      {} as Record<string, CreateBookReleaseDto[]>,
    );

    const similarNames = await objPropsToPromise(
      R.mapObjIndexed(
        (groupedReleases) => (
          publisherService
            .createSimilarNamedQuery(groupedReleases[0].publisher.name)
            .limit(1)
            .select('name')
            .execute()
            .then((record) => record?.[0]?.name)
        ),
        similarPublisherReleases,
      ),
    );

    const mappedReleases = R.mapObjIndexed(
      (groupedReleases, parametrizedKey) => R.map(
        (release) => release.mapPublisher(
          (publisher) => new CreateBookPublisherDto(
            {
              ...publisher,
              description: normalizeHTML(publisher.description),
              name: similarNames[parametrizedKey] ?? groupedReleases[0].publisher.name ?? publisher.name,
              parameterizedName: null,
            },
          ),
        ),
        groupedReleases,
      ),
      similarPublisherReleases,
    );

    return [
      ...R.filter(R.propSatisfies(R.isNil, 'publisher'), releases),
      ...R.unnest(R.values(mappedReleases)),
    ];
  }
}
