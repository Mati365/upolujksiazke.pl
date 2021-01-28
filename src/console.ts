import * as path from 'path';
import {NestFactory} from '@nestjs/core';
import Logger from 'purdy';
import awaitOutside from 'await-outside';
import repl from 'pretty-repl';

import {DB_ENTITIES} from '@server/modules/database/config/dbConfig';
import * as AppModules from '@server/modules';

const LOGGER_OPTIONS = {
  indent: 2,
  depth: 1,
};

(async () => {
  const context = await NestFactory.createApplicationContext(AppModules.AppModule);
  context.enableShutdownHooks();

  const server = repl.start(
    {
      useColors: true,
      prompt: '> ',
      writer: (value: object): string => Logger.stringify(value, LOGGER_OPTIONS),
      ignoreUndefined: true,
    },
  );

  Object.assign(
    server.context,
    {
      app: context,
      ...AppModules,
      ...DB_ENTITIES,
    },
  );

  server.setupHistory(
    path.resolve(__dirname, '../tmp/.node_history'),
    (err: any) => err && console.error('Repl history error:', err),
  );

  awaitOutside.addAwaitOutsideToReplServer(server);
})();