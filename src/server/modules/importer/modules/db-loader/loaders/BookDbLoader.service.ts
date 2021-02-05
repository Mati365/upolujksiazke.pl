import * as R from 'ramda';
import stringSimilarity from 'string-similarity';
import {plainToClass} from 'class-transformer';
import {In} from 'typeorm';
import {
  Inject, Injectable,
  Logger, forwardRef,
} from '@nestjs/common';

import {mapObjValuesToPromise} from '@shared/helpers/async/mapObjValuesToPromise';
import {mergeWithoutNulls} from '@shared/helpers/mergeWithoutNulls';
import {parameterize} from '@shared/helpers/parameterize';

import {BookService} from '@server/modules/book/Book.service';
import {BookPublisherService} from '@server/modules/book/modules/publisher/BookPublisher.service';

import {CreateBookDto} from '@server/modules/book';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {BookReleaseEntity} from '@server/modules/book/modules/release/BookRelease.entity';
import {ScrapperMetadataEntity, ScrapperMetadataKind} from '../../scrapper/entity';

import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {ScrapperMatcherService} from '../../scrapper/service/actions';
import {ScrapperService} from '../../scrapper/service/Scrapper.service';

@Injectable()
export class BookDbLoader implements MetadataDbLoader {
  private readonly logger = new Logger(BookDbLoader.name);

  constructor(
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
    private readonly scrapperMatcherService: ScrapperMatcherService,
    private readonly scrapperService: ScrapperService,
    private readonly publisherService: BookPublisherService,
  ) {}

  /**
   * @inheritdoc
   */
  extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const book = plainToClass(CreateBookDto, metadata.content);

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
   * @memberof BookDbLoader
   */
  static isEnoughToBeScrapped(book: CreateBookDto) {
    return (
      book.authors?.length > 0 && !!book.title
    );
  }

  /**
   * Merges book into one and loads to DB
   *
   * @param {CreateBookDto[]} books
   * @returns
   * @memberof BookDbLoader
   */
  async mergeAndExtractBooksToDb(books: CreateBookDto[]) {
    const {scrapperService, bookService} = this;

    const allReleases = R.unnest(R.pluck('releases', books));
    const releaseBook = (
      await BookReleaseEntity.findOne(
        {
          select: ['bookId'],
          where: [
            {
              title: In(R.pluck('title', allReleases)),
            },
            {
              isbn: In(R.pluck('isbn', allReleases)),
            },
          ],
        },
      )
    );

    const websites = await scrapperService.findOrCreateWebsitesByUrls(
      R.pluck(
        'url',
        R.unnest(R.pluck('availability', allReleases)),
      ),
    );

    const releases = (
      allReleases
        .filter(({isbn}) => !!isbn)
        .map((release) => new CreateBookReleaseDto(
          {
            ...release,
            availability: release.availability.map(
              (availability) => new CreateBookAvailabilityDto(
                {
                  ...availability,
                  bookId: releaseBook?.id,
                  websiteId: websites[
                    scrapperService.getScrappersGroupByWebsiteURL(availability.url).websiteURL
                  ].id,
                },
              ),
            ),
          },
        ))
    );

    return bookService.upsert(
      new CreateBookDto(
        {
          id: releaseBook?.id,
          ...mergeWithoutNulls(books),
          releases: await this.fixSimilarNamedReleasesPublishers(releases),
        },
      ),
    );
  }

  /**
   * Lookups book to be present in other websites and loads to DB
   *
   * @param {Object} attrs
   * @memberof BookDbLoader
   */
  async matchAndExtractToDb(
    {
      book,
    }: {
      book: CreateBookDto,
    },
  ) {
    const {logger, scrapperMatcherService} = this;
    if (!BookDbLoader.isEnoughToBeScrapped(book))
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

    return this.mergeAndExtractBooksToDb(matchedBooks);
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
   * @memberof BookDbLoader
   */
  private async fixSimilarNamedReleasesPublishers(
    releases: CreateBookReleaseDto[],
    similarity: number = 0.7,
    minCompareLength: number = 6,
  ) {
    const {publisherService} = this;
    const similarPublisherReleases = releases.reduce(
      (acc, release) => {
        release = release.mapPublisher(
          (publisher) => new CreateBookPublisherDto(
            {
              ...publisher,
              parameterizedName: parameterize(publisher.name),
            },
          ),
        );

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
            .createQueryWithSimilarNames(groupedReleases[0].publisher.name)
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

    return R.unnest(R.values(mappedReleases));
  }
}
