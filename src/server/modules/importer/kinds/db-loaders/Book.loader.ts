import * as R from 'ramda';
import stringSimilarity from 'string-similarity';
import pMap from 'p-map';
import {validate} from 'class-validator';
import {plainToClass} from 'class-transformer';
import {EventEmitter2} from 'eventemitter2';
import {
  Inject, Injectable,
  Logger, forwardRef,
} from '@nestjs/common';

import {objPropsToPromise} from '@shared/helpers/async/mapObjValuesToPromise';
import {parameterize} from '@shared/helpers/parameterize';
import {safeToString} from '@shared/helpers';

import {BookAuthorService} from '@server/modules/book/modules/author/BookAuthor.service';
import {EsFuzzyBookSearchService} from '@server/modules/book/modules/search/service';
import {BookService} from '@server/modules/book/services/Book.service';
import {BookPublisherService} from '@server/modules/book/modules/publisher/BookPublisher.service';

import {
  BookEntity,
  CreateBookDto,
} from '@server/modules/book';

import {CreateBookSeriesDto} from '@server/modules/book/modules/series/dto/CreateBookSeries.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {
  CreateBookVolumeDto,
  DEFAULT_BOOK_VOLUME_NAME,
} from '@server/modules/book/modules/volume/dto/CreateBookVolume.dto';

import {ScrapperMetadataKind} from '@scrapper/entity';
import {InlineMetadataObject, MetadataDbLoader} from '@db-loader/MetadataDbLoader.interface';
import {ScrapperMatcherService} from '@scrapper/service/actions';
import {ScrapperService} from '@scrapper/service/Scrapper.service';
import {BookImportedEvent} from './events/BookImported.event';

import {
  mergeBooks,
  mergeReleases,
  normalizeBookTitle,
  normalizePublisherTitle,
} from '../scrappers/helpers';

type BookExtractorAttrs = {
  checkCacheBeforeSearch?: boolean,
  skipIfAlreadyInDb?: boolean,
  skipCacheLookup?: boolean,

  /**
   * Some dtos have typos
   *
   * @see {@link https://www.wykop.pl/wpis/30809175/2-266-1-2-265-tytul-harry-potter-i-kamien-filozofi/}
   */
  skipDtoMerge?: boolean,
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
    @Inject(forwardRef(() => BookAuthorService))
    private readonly bookAuthorService: BookAuthorService,
    @Inject(forwardRef(() => EsFuzzyBookSearchService))
    private readonly esFuzzyBookSearchService: EsFuzzyBookSearchService,
    private readonly scrapperMatcherService: ScrapperMatcherService,
    private readonly scrapperService: ScrapperService,
    private readonly publisherService: BookPublisherService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * @inheritdoc
   */
  extractMetadataToDb(metadata: InlineMetadataObject) {
    const {logger} = this;
    const book = plainToClass(CreateBookDto, metadata.content);

    if (!book) {
      logger.error('Book not matched!');
      return null;
    }

    return this.searchAndExtractToDb(
      book,
      {
        checkCacheBeforeSearch: true,
      },
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
      !!book && book.authors?.length > 0 && !!book.title
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
  async searchAndExtractToDb(
    book: CreateBookDto,
    attrs: BookExtractorAttrs = {},
  ) {
    const {
      esFuzzyBookSearchService,
      logger,
      scrapperMatcherService,
    } = this;

    if (!BookDbLoaderService.isEnoughToBeScrapped(book))
      return null;

    if (attrs.checkCacheBeforeSearch) {
      const cachedBook: BookEntity = await esFuzzyBookSearchService.findAlreadyCachedSimilarToBooks([book]);
      if (cachedBook)
        return cachedBook;

      attrs.skipCacheLookup = true;
    }

    const {
      matchedItems,
      notMatchedInScrappers,
    } = await scrapperMatcherService.searchRemoteRecord<CreateBookDto>(
      {
        kind: ScrapperMetadataKind.BOOK,
        data: book,
      },
    );

    const matchedBooks = R.map(
      ({result, scrappersGroup}) => new CreateBookDto(
        {
          ...result,
          scrappersIds: [scrappersGroup.id],
        },
      ),
      matchedItems,
    );

    if (R.isEmpty(matchedBooks)) {
      logger.warn(`Book ${JSON.stringify(book)} not matched!`);
      return null;
    }

    // make sure that even empty scrappers results saved their ids
    const [firstBook, ...restBooks] = matchedBooks;
    if (notMatchedInScrappers.length)
      firstBook.scrappersIds.push(...R.pluck('id', notMatchedInScrappers));

    const extractedBooks = await this.extractVolumeGroupedBooks(
      [
        mergeBooks(
          attrs.skipDtoMerge
            ? [firstBook]
            : [firstBook, book],
        ),
        ...restBooks,
      ],
      attrs,
    );

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
   * Corrects all wrong assigned to book releases and volumes
   * and extracts all to database
   *
   * @param {CreateBookDto[]} books
   * @param {BookExtractorAttrs} [attrs={}]
   * @memberof BookDbLoaderService
   */
  private async extractVolumeGroupedBooks(books: CreateBookDto[], attrs: BookExtractorAttrs = {}) {
    // add volume and series to all book releases
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

    // check if releases are assigned to proper book
    // by grouping them by volumes
    let volumes: Record<string, CreateBookDto[]> = {};
    normalizedReleasesBooks.forEach(({book, volumesReleases}) => {
      volumesReleases.forEach(([{volume, series}, release]) => {
        // create new book
        const volumeBook = new CreateBookDto(
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
            volume: new CreateBookVolumeDto(
              {
                name: volume,
              },
            ),
          },
        );

        (volumes[volume] ||= []).push(volumeBook);
      });
    });

    // some books has duplicated ISBNs between volumes
    // please check for example "Uczta dla wron: Sieć spisków"
    // its move edition has the same ISBN as book edition
    // try to assign isbn to largest volume
    const isbnsQueues: Record<string, {volume: string|number, queue: CreateBookDto[]}> = {};
    const reversedVolumes = R.reverse(R.sortBy(R.identity, R.keys(volumes).map((n) => +n)));

    volumes = reversedVolumes.reduce(
      (acc, volumeName) => {
        const volumeBooks = [...volumes[volumeName]];

        for (let i = 0; i < volumeBooks.length;) {
          const volumeBook = volumeBooks[i];
          const release = volumeBook.releases[0];
          const cachedIsbnQueue = isbnsQueues[release.isbn];

          if (cachedIsbnQueue && cachedIsbnQueue.volume !== volumeName) {
            cachedIsbnQueue.queue.push(volumeBook);
            volumeBooks.splice(i, 1);
          } else {
            ++i;
            isbnsQueues[release.isbn] = {
              queue: volumeBooks,
              volume: volumeName,
            };
          }
        }

        acc[volumeName] = volumeBooks;
        return acc;
      },
      {},
    );

    // extract all rearranged books to db
    return pMap(
      R.values(volumes),
      (volumeBooks) => this.mergeAndExtractBookToDb(volumeBooks, attrs),
      {
        concurrency: 1,
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
  private async mergeAndExtractBookToDb(
    books: CreateBookDto[],
    attrs: BookExtractorAttrs = {},
  ) {
    const {
      bookService,
      bookAuthorService,
      esFuzzyBookSearchService,
      eventEmitter,
    } = this;

    if (R.isEmpty(books))
      return null;

    const allReleases = R.unnest(R.pluck('releases', books));
    let cachedBook: BookEntity = null;

    if (!attrs.skipCacheLookup) {
      cachedBook = await esFuzzyBookSearchService.findAlreadyCachedSimilarToBooks(books, allReleases);
      if (attrs.skipIfAlreadyInDb && cachedBook)
        return cachedBook;
    }

    const normalizedReleases = await this.normalizeReleases(allReleases);
    if (!normalizedReleases)
      return null;

    const mergedBooks = mergeBooks(books);
    const dto = new CreateBookDto(
      {
        ...mergedBooks,
        ...cachedBook && {
          id: cachedBook.id,
          parameterizedSlug: cachedBook.parameterizedSlug,
        },
        ...await objPropsToPromise(
          {
            releases: this.fixSimilarNamedReleasesPublishers(normalizedReleases),
            authors: bookAuthorService.mergeAliasedDtos(mergedBooks.authors),
          },
        ),
      },
    );

    const book = await bookService.upsert(dto);
    await eventEmitter.emitAsync(
      'loader.book.imported',
      new BookImportedEvent(book, dto),
    );

    return book;
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
      allReleases.filter(({isbn}) => !!isbn || safeToString(isbn).length < 7),
      async (release) => {
        let publisher = release.publisher || null;
        if (publisher && (await validate(publisher)).length > 0)
          publisher = null;

        const publisherName = publisher && normalizePublisherTitle(publisher.name);
        return new CreateBookReleaseDto(
          {
            ...release,
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
