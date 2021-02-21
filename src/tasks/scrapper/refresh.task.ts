import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';
import minimist from 'minimist';

import {logger} from '@tasks/utils/logger';
import {safeToString} from '@shared/helpers/safeToString';
import {safeToNumber} from '@shared/helpers/safeToNumber';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '@scrapper/Scrapper.module';
import {ScrapperRefreshService} from '@scrapper/service/actions';
import {ScrapperService} from '@scrapper/service';
import {ScrapperMetadataKind} from '@scrapper/entity';

/**
 * Refreshes all latest entities
 *
 * @param {Object} config
 */
async function refreshLatest(
  {website, ...config}: Parameters<ScrapperRefreshService['refreshLatest']>[0] & {
    website?: string,
  },
) {
  const app = await NestFactory.create(AppModule);
  const scrapperMod = app.select(ScrapperModule);

  app.enableShutdownHooks();

  await (
    app
      .select(ScrapperModule)
      .get(ScrapperRefreshService)
      .refreshLatest(
        {
          ...config,
          ...website && {
            scrappersGroups: [
              scrapperMod.get(ScrapperService).getScrappersGroupByWebsiteURL(website),
            ],
          },
        },
      )
  );

  await app.close();
}

/**
 * Refreshes all from single scrapper
 *
 * @param {Object} attrs
 */
async function refreshScrapper(
  {
    page,
    website,
    kind,
  }: {
    page: any,
    website: string,
    kind: ScrapperMetadataKind,
  },
) {
  const app = await NestFactory.create(AppModule);
  const scrapperMod = app.select(ScrapperModule);
  app.enableShutdownHooks();

  await (
    scrapperMod
      .get(ScrapperRefreshService)
      .execScrapper(
        {
          kind,
          scrappersGroup: scrapperMod.get(ScrapperService).getScrappersGroupByWebsiteURL(website),
          maxIterations: null,
          initialPage: page,
        },
      )
  );

  await app.close();
}

/**
 * Fetches latest (single website page) reviews
 *
 * @export
 */
export const refreshLatestTask: TaskFunction = async () => {
  const {kind, website} = minimist(process.argv.slice(2));

  logger.log('Refreshing latest items...');
  await refreshLatest(
    {
      kind: safeToNumber(ScrapperMetadataKind[kind]),
      maxIterations: 1,
      website,
    },
  );
  logger.log('Latest items refreshed!');
};

/**
 * Fetches latest (all website pages) reviews
 *
 * @export
 */
export const refreshAllTask: TaskFunction = async () => {
  const {initialPage, website, kind} = minimist(process.argv.slice(2));

  logger.log('Refreshing all items...');

  if (website) {
    await refreshScrapper(
      {
        kind: safeToNumber(ScrapperMetadataKind[kind]),
        page: initialPage,
        website,
      },
    );
  } else {
    await refreshLatest(
      {
        kind: safeToNumber(ScrapperMetadataKind[kind]),
        maxIterations: null,
      },
    );
  }

  logger.log('All items refreshed!');
};

/**
 * Loads single item
 *
 * @export
 */
export const refreshSingleTask: TaskFunction = async () => {
  const {remoteId, website, kind} = minimist(process.argv.slice(2));

  logger.log('Refresh item...');

  const app = await NestFactory.create(AppModule);
  const scrapperMod = app.select(ScrapperModule);
  app.enableShutdownHooks();

  await (
    scrapperMod
      .get(ScrapperRefreshService)
      .refreshSingle(
        {
          kind: safeToNumber(ScrapperMetadataKind[kind]),
          remoteId: safeToString(remoteId),
          scrappersGroup: scrapperMod.get(ScrapperService).getScrappersGroupByWebsiteURL(website),
        },
      )
  );

  await app.close();
  logger.log('Item refreshed!');
};
