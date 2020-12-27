import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';
import minimist from 'minimist';
import * as R from 'ramda';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '../Scrapper.module';
import {ScrapperService} from '../service/Scrapper.service';
import {ScrapperMetadataKind} from '../entity';

/**
 * Refreshes all reviews
 *
 * @param {Parameters<ScrapperService['refreshLatest']>[0]} config
 */
async function refreshReviews(config: Parameters<ScrapperService['refreshLatest']>[0]) {
  const app = await NestFactory.create(AppModule);

  await (
    app
      .select(ScrapperModule)
      .get(ScrapperService)
      .refreshLatest(config)
  );

  app.close();
}

/**
 * Refreshes all reviews from single scrapper
 *
 * @param {Object} attrs
 */
async function refreshScrapperReviews(
  {
    page,
    website,
    kind,
  }: {
    page: number,
    website: string,
    kind: ScrapperMetadataKind,
  },
) {
  const app = await NestFactory.create(AppModule);
  const scrapper = (
    app
      .select(ScrapperModule)
      .get(ScrapperService)
  );

  await scrapper.execScrapper(
    {
      kind,
      scrappersGroup: scrapper.getScrappersGroupByWebsiteURL(website),
      maxIterations: null,
      initialPage: {
        page,
      },
    },
  );

  app.close();
}

/**
 * Fetches latest (single website page) reviews
 *
 * @export
 */
export const refreshLatestReviewsTask: TaskFunction = async () => {
  const {kind} = minimist(process.argv.slice(2));

  logger.log('Refreshing latest reviews...');
  await refreshReviews(
    {
      kind: +ScrapperMetadataKind[kind],
      maxIterations: 1,
    },
  );
  logger.log('Latest reviews refreshed!');
};

/**
 * Fetches latest (all website pages) reviews
 *
 * @export
 */
export const refreshAllReviewsTask: TaskFunction = async () => {
  const {initialPage, website, kind} = minimist(process.argv.slice(2));

  logger.log('Refreshing all reviews...');

  if (website) {
    await refreshScrapperReviews(
      {
        kind: +ScrapperMetadataKind[kind],
        page: (+initialPage) || 1,
        website,
      },
    );
  } else {
    await refreshReviews(
      {
        kind: +ScrapperMetadataKind[kind],
        maxIterations: null,
      },
    );
  }

  logger.log('Latest all refreshed!');
};

/**
 * Loads single review
 *
 * @export
 */
export const refreshSingleTask: TaskFunction = async () => {
  const {remoteId, website, kind} = minimist(process.argv.slice(2));

  logger.log('Refresh review...');
  const app = await NestFactory.create(AppModule);
  const scrapper: ScrapperService = (
    app
      .select(ScrapperModule)
      .get(ScrapperService)
  );

  await scrapper.refreshSingle(
    {
      kind: +ScrapperMetadataKind[kind],
      remoteId: R.toString(remoteId),
      scrappersGroup: scrapper.getScrappersGroupByWebsiteURL(website),
    },
  );

  app.close();
  logger.log('Review refreshed!');
};
