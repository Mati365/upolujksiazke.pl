import * as R from 'ramda';
import {SqlEntityManager} from '@mikro-orm/postgresql';
import {EntityRepository} from '@mikro-orm/core';
import {InjectRepository} from '@mikro-orm/nestjs';
import {Injectable, Logger} from '@nestjs/common';

import {WebsiteBookReviewScrapper} from './scrappers/BookReviewScrapper';
import {WykopScrapper} from './scrappers';
import {
  ScrapperMetadataEntity,
  ScrapperMetadataStatus,
  ScrapperWebsiteEntity,
} from '../entity';

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);

  private scrappers: WebsiteBookReviewScrapper[] = [
    new WykopScrapper,
  ];

  constructor(
    private readonly em: SqlEntityManager,

    @InjectRepository(ScrapperWebsiteEntity)
    private readonly websiteRepository: EntityRepository<ScrapperWebsiteEntity>,
  ) {}

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
   * Fetches data from single scrapper
   *
   * @private
   * @param {Object} params
   * @memberof ScrapperService
   */
  private async execScrapper(
    {
      scrapper,
      maxIterations = 1,
    }: {
      scrapper: WebsiteBookReviewScrapper,
      maxIterations?: number,
    },
  ) {
    const {websiteRepository, logger, em} = this;
    let website = await websiteRepository.findOne(
      {
        url: scrapper.websiteURL,
      },
    );

    if (!website) {
      website = await scrapper.fetchWebsiteEntity();
      await em.persistAndFlush(website);
    }

    // insert metadata
    let page = 0;
    for await (const scrappedPage of scrapper.iterator(maxIterations)) {
      logger.warn(`Scrapping ${++page} page of ${scrapper.websiteURL}!`);

      await em.transactional(async (transaction) => {
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

            const metadata = new ScrapperMetadataEntity(
              {
                website,
                remoteId: item.id,
                status: ScrapperMetadataStatus.NEW,
                content: item,
              },
            );

            transaction.persist(metadata);
          },
          scrappedPage,
        );
      });
    }
  }
}
