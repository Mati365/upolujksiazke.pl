import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules/App.module';
import {WarmupCacheModule} from '@server/modules/cache/modules/warmup/WarmupCache.module';
import {WarmupCacheCron} from '@server/modules/cache/modules/warmup/WarmupCache.cron';

export const warmupCacheTask: TaskFunction = async () => {
  logger.log('Warming up cache...');

  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  await (
    app
      .select(WarmupCacheModule)
      .get(WarmupCacheCron)
      .warmupCache()
  );

  await app.close();
  logger.log('Cache refreshed!');
};
