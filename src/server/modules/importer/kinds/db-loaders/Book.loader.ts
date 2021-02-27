import * as R from 'ramda';
import stringSimilarity from 'string-similarity';
import pMap from 'p-map';
import {validate} from 'class-validator';
import {plainToClass} from 'class-transformer';
import {
  Inject, Injectable,
  Logger, forwardRef,
} from '@nestjs/common';

import {mapObjValuesToPromise} from '@shared/helpers/async/mapObjValuesToPromise';
import {mergeWithoutNulls} from '@shared/helpers/mergeWithoutNulls';
import {parameterize} from '@shared/helpers/parameterize';
import {pickLongestArrayItem} from '@shared/helpers';

import {BookService} from '@server/modules/book/Book.service';
import {BookPublisherService} from '@server/modules/book/modules/publisher/BookPublisher.service';

import {BookEntity, CreateBookDto, FuzzyBookSearchService} from '@server/modules/book';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {CreateBookVolumeDto} from '@server/modules/book/modules/volume/dto/CreateBookVolume.dto';
import {ScrapperMetadataEntity, ScrapperMetadataKind} from '@scrapper/entity';

import {MetadataDbLoader} from '@db-loader/MetadataDbLoader.interface';
import {ScrapperMatcherService} from '@scrapper/service/actions';
import {ScrapperService} from '@scrapper/service/Scrapper.service';

import {
  normalizeBookTitle,
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

    return this.mergeAndExtractBooksToDb(
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

    return this.extractBookVolumesToDb(matchedBooks, attrs);
  }

  /**
   * Groups book by release volume and extract them to db
   *
   * @param {CreateBookDto[]} books
   * @param {BookExtractorAttrs} [attrs={}]
   * @memberof BookDbLoaderService
   */
  async extractBookVolumesToDb(books: CreateBookDto[], attrs: BookExtractorAttrs = {}) {
    return null;
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
      scrapperService,
      fuzzyBookSearchService,
      bookService,
    } = this;

    const allReleases = R.unnest(R.pluck('releases', books));
    let cachedBook: BookEntity = null;

    if (!attrs.skipCacheLookup) {
      cachedBook = await fuzzyBookSearchService.findAlreadyCachedSimilarToBooks(books, allReleases);
      if (attrs.skipIfAlreadyInDb && cachedBook)
        return cachedBook;
    }

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
    // todo: add group by volume!
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

    const mergedBook = mergeWithoutNulls(books, (key, a, b) => {
      switch (key) {
        case 'series':
        case 'prizes':
        case 'categories':
        case 'tags':
          return [...(a || []), ...(b || [])];

        default:
          return a ?? b;
      }
    });

    const bookTitleProps = normalizeBookTitle(mergedBook.defaultTitle || mergedBook.title);
    return bookService.upsert(
      new CreateBookDto(
        {
          ...mergedBook,
          ...cachedBook && {
            id: cachedBook.id,
            parameterizedSlug: cachedBook.parameterizedSlug,
          },
          defaultTitle: bookTitleProps.title,
          releases: await this.fixSimilarNamedReleasesPublishers(releases),
          authors: pickLongestArrayItem(R.pluck('authors', books)),
          volume: mergedBook.volume ?? (bookTitleProps.volume && new CreateBookVolumeDto(
            {
              name: bookTitleProps.volume,
            },
          )),
        },
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

    const similarNames = await mapObjValuesToPromise<string>(
      R.identity,
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

// todo:
// - Write tests below
// - Fix grouping by volume
// - Uncomment scrappers.service
// gulp scrapper:refresh:single --remoteId 2017/01/opowiadania-zebrane-tom-2.html --website hrosskar.blogspot.com --kind BOOK_REVIEW
