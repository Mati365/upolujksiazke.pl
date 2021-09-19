import {Injectable, Logger} from '@nestjs/common';
import {In} from 'typeorm';
import * as R from 'ramda';

import {
  timeout,
  uniqFlatHashByProp,
} from '@shared/helpers';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';

import {BookEntity} from '@server/modules/book/entity/Book.entity';
import {BookReleaseEntity} from '@server/modules/book/modules/release/BookRelease.entity';
import {EsBookIndex} from '@server/modules/book/modules/search/indices/EsBook.index';
import {CardBookSearchService} from '@server/modules/book/modules/search/service';
import {BookAvailabilityService} from '@server/modules/book/modules/availability/BookAvailability.service';
import {BookReleaseService} from '@server/modules/book/modules/release/BookRelease.service';
import {BookStatsService} from '@server/modules/book/modules/stats/services';
import {WebsiteInfoScrapperService} from '../../modules/scrapper/service/scrappers/WebsiteInfoScrapper';
import {ScrapperService} from '../../modules/scrapper/service/Scrapper.service';
import {ScrapperMatcherService} from '../../modules/scrapper/service/actions/ScrapperMatcher.service';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

@Injectable()
export class BookScrapperTaskRunner {
  private readonly logger = new Logger(BookScrapperTaskRunner.name);

  constructor(
    private readonly scrapperMatcherService: ScrapperMatcherService,
    private readonly websiteInfoService: WebsiteInfoScrapperService,
    private readonly bookEsIndex: EsBookIndex,
    private readonly bookCardSearchService: CardBookSearchService,
    private readonly bookAvailabilityService: BookAvailabilityService,
    private readonly bookReleaseService: BookReleaseService,
    private readonly bookStatsService: BookStatsService,
    private readonly scrapperService: ScrapperService,
  ) {}

  /**
   * Iterates over all books and fetches availability for single scrapper.
   * Used when new scrapper is added.
   *
   * @async
   * @param {Object} attrs
   * @memberof BookScrapperTaskRunner
   */
  async fetchAvailabilityForScrapper(
    {
      scrapperGroupId,
      delay = 1000,
    }: {
      scrapperGroupId: number,
      delay?: number,
    },
  ) {
    const {
      logger,
      bookCardSearchService,
      websiteInfoService,
      scrapperService,
    } = this;

    const group = scrapperService.getScrapperGroupById(scrapperGroupId);
    if (!group) {
      logger.warn(`Mssing scrapper group with ID ${scrapperGroupId}!`);
      return;
    }

    const website = await websiteInfoService.findOrCreateWebsiteEntity(group.websiteInfoScrapper);
    if (!website) {
      logger.warn(`Mssing website for scrapper group with ID ${scrapperGroupId}!`);
      return;
    }

    const iterator = bookCardSearchService.createIdsIteratedQuery(
      {
        pageLimit: 30,
        query: (
          BookEntity
            .createQueryBuilder('b')
            .andWhere('NOT(:scrapperGroupId = ANY(b."scrappersIds"))', {scrapperGroupId})
        ),
      },
    );

    for await (const [, booksIds] of iterator) {
      for await (const bookId of booksIds) {
        try {
          await this.searchAndCreateAvailability(
            {
              bookId,
              websiteId: website.id,
              scrapperGroupsIds: [
                group.id,
              ],
            },
          );
        } catch (e) {
          logger.error(e);
        }

        if (delay > 0)
          await timeout(delay);
      }
    }
  }

  /**
   * Perform search for book in only one scrapper group and
   * assigns to book newly matched releases or assigns availability
   * to already present releases
   *
   * @private
   * @param {Object} attrs
   * @memberof BookScrapperTaskRunner
   */
  private async searchAndCreateAvailability(
    {
      scrapperGroupsIds,
      bookId,
      websiteId,
    }: {
      scrapperGroupsIds: number[],
      bookId: number,
      websiteId: number,
    },
  ) {
    const {
      scrapperMatcherService,
      bookAvailabilityService,
      bookReleaseService,
      bookStatsService,
      bookEsIndex,
      logger,
    } = this;

    const book = await bookEsIndex.getByID(
      bookId,
      {
        _source: ['defaultTitle', 'authors', 'isbns'],
      },
    );

    const {matchedItems} = await scrapperMatcherService.searchRemoteRecord<CreateBookDto>(
      {
        kind: ScrapperMetadataKind.BOOK,
        data: new CreateBookDto(
          {
            ...book as any,
            id: bookId,
            releases: (book.isbns || []).map(
              (isbn) => new CreateBookReleaseDto(
                {
                  title: book.defaultTitle,
                  isbn,
                },
              ),
            ),
          },
        ),
        scrapperGroupsIds,
      },
    );

    if (!matchedItems?.length) {
      logger.warn(`Book with ID ${bookId} not matched in scrapper group!`);
      return;
    }

    // picks first book, ignore others
    const [{result: bookDto}] = matchedItems;

    // try to assign missing releases ids to availability,
    // if not present create new release
    const dbCachedReleases = uniqFlatHashByProp(
      'isbn',
      await BookReleaseEntity.find(
        {
          select: ['id', 'isbn'],
          where: {
            isbn: In(R.pluck('isbn', bookDto.releases).filter(Boolean)),
          },
        },
      ),
    );

    const mappedReleases = bookDto.releases.map((release) => new CreateBookReleaseDto(
      {
        ...release,
        id: dbCachedReleases[release.isbn]?.id,
      },
    ));

    // save to database availability for releases that are already created
    if (!R.isEmpty(dbCachedReleases)) {
      const newAvailabilityList = R.reduce(
        (acc, release) => {
          if (R.isNil(release.id))
            return acc;

          return [
            ...acc,
            ...release.availability.map((availability) => new CreateBookAvailabilityDto(
              {
                ...availability,
                websiteId,
                releaseId: release.id,
              },
            )),
          ];
        },
        [],
        mappedReleases,
      );

      await bookAvailabilityService.upsertList(newAvailabilityList);
    }

    const releasesToBeCreated = (
      mappedReleases
        .filter(
          (release) => R.isNil(release.id) && !!release.isbn,
        )
        .map(
          (release) => new CreateBookReleaseDto(
            {
              ...release,
              bookId,
              availability: release.availability.map(
                (availability) => new CreateBookAvailabilityDto(
                  {
                    ...availability,
                    websiteId,
                  },
                ),
              ),
            },
          ),
        )
    );

    if (!R.isEmpty(releasesToBeCreated))
      await bookReleaseService.upsertList(releasesToBeCreated);

    // refresh prices stats etc
    await bookStatsService.refreshBookStats(bookId);
  }
}
