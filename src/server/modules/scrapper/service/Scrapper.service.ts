import * as R from 'ramda';
import chalk from 'chalk';
import {SqlEntityManager} from '@mikro-orm/postgresql';
import {Injectable, Logger} from '@nestjs/common';

import {ID} from '@shared/types';

import {
  BookReviewScrapperInfo,
  WebsiteBookReviewScrapper,
} from './scrappers/BookReviewScrapper';

import {WykopScrapper} from './scrappers';
import {WebsiteInfoScrapperService} from './WebsiteInfoScrapper.service';
import {
  ScrapperMetadataEntity,
  ScrapperMetadataStatus,
  ScrapperWebsiteEntity,
} from '../entity';

import {ScrapperBasicPagination} from './shared';

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);

  private scrappers: WebsiteBookReviewScrapper[] = [
    new WykopScrapper,
  ];

  constructor(
    private readonly em: SqlEntityManager,
    private readonly websiteInfoScrapper: WebsiteInfoScrapperService,
  ) {}

  /**
   * Wraps scrapper result into entity
   *
   * @static
   * @param {ScrapperWebsiteEntity} website
   * @param {BookReviewScrapperInfo} item
   * @param {ScrapperMetadataStatus} [status=ScrapperMetadataStatus.NEW]
   * @returns
   * @memberof ScrapperService
   */
  static scrapperResultToMetadataEntity(
    website: ScrapperWebsiteEntity,
    item: BookReviewScrapperInfo,
    status: ScrapperMetadataStatus = ScrapperMetadataStatus.NEW,
  ) {
    return new ScrapperMetadataEntity(
      {
        website,
        status,
        remoteId: item.id,
        content: item,
      },
    );
  }

  /**
   * Find single scrapper by assigned website URL
   *
   * @param {string} url
   * @returns {WebsiteBookReviewScrapper}
   * @memberof ScrapperService
   */
  getScrapperByWebsiteURL(url: string): WebsiteBookReviewScrapper {
    return R.find(
      R.propEq('websiteURL', url) as any,
      this.scrappers,
    );
  }

  /**
   * Fetch all scrappers website
   *
   * @param {Object} params
   * @memberof ScrapperService
   */
  async refreshLatest(
    {
      maxIterations = 1,
    }: {
      maxIterations?: number,
    } = {},
  ) {
    const {scrappers} = this;

    for (const scrapper of scrappers) {
      await this.execScrapper(
        {
          maxIterations,
          scrapper,
        },
      );
    }
  }

  /**
   * Loads single
   *
   * @param {Object} params
   * @returns {Promise<boolean>}
   * @memberof ScrapperService
   */
  async refreshSingle(
    {
      remoteId,
      scrapper,
    }: {
      remoteId: ID,
      scrapper: WebsiteBookReviewScrapper,
    },
  ): Promise<BookReviewScrapperInfo> {
    if (!scrapper)
      throw new Error('Missing scrapper!');

    const {em, websiteInfoScrapper} = this;
    const item = await scrapper.fetchSingle(remoteId);
    if (!item)
      return Promise.resolve(null);

    const website = await websiteInfoScrapper.findOrCreateWebsiteEntity(scrapper);
    const updatedEntity = ScrapperService.scrapperResultToMetadataEntity(website, item);
    delete updatedEntity.createdAt;

    await em
      .createQueryBuilder(ScrapperMetadataEntity)
      .update(updatedEntity)
      .where(
        {
          remoteId: item.id,
        },
      )
      .execute();

    return Promise.resolve(item);
  }

  /**
   * Saves already fetched scrapper results page
   *
   * @private
   * @param {Object} params
   * @returns
   * @memberof ScrapperService
   */
  private async storeScrappedPage(
    {
      website,
      scrappedPage,
    }: {
      website: ScrapperWebsiteEntity,
      scrappedPage: BookReviewScrapperInfo[],
    },
  ) {
    const {em} = this;

    return em.transactional(async (transaction) => {
      // detect which ids has been already scrapped
      const scrappedIds = R.pluck(
        'remoteId',
        await (
          transaction
            .createQueryBuilder(ScrapperMetadataEntity)
            .where(
              {
                remoteId: {
                  $in: R.pluck('id', scrappedPage),
                },
              },
            )
            .select(['remoteId'])
            .execute()
        ) as any[],
      );

      // create new metadata records
      R.forEach(
        (item) => {
          if (R.includes(item.id, scrappedIds))
            return;

          transaction.persist(
            ScrapperService.scrapperResultToMetadataEntity(website, item),
          );
        },
        scrappedPage,
      );
    });
  }

  /**
   * Fetches data from single scrapper
   *
   * @param {Object} params
   * @memberof ScrapperService
   */
  async execScrapper<T extends WebsiteBookReviewScrapper>(
    {
      maxIterations = 1,
      scrapper,
      initialPage,
    }: {
      scrapper: T,
      maxIterations?: number,
      initialPage?: ScrapperBasicPagination | string,
    },
  ) {
    const {logger, websiteInfoScrapper} = this;
    const website = await websiteInfoScrapper.findOrCreateWebsiteEntity(scrapper);

    // insert metadata
    let pageCounter = (
      typeof initialPage === 'string'
        ? null
        : initialPage?.page
    ) ?? 1;

    const iterator = scrapper.iterator(
      {
        maxIterations,
        initialPage: initialPage as any,
      },
    );

    for await (const scrappedPage of iterator) {
      logger.warn(
        `Scrapping ${pageCounter++} page of ${chalk.white(scrapper.websiteURL)} (items: ${scrappedPage.length})!`,
      );

      this.storeScrappedPage(
        {
          website,
          scrappedPage,
        },
      );
    }
  }
}
