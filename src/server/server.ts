import 'isomorphic-fetch';

import {useContainer} from 'class-validator';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';

import {NestFactory, Reflector} from '@nestjs/core';
import {ExpressAdapter, NestExpressApplication} from '@nestjs/platform-express';
import {ClassSerializerInterceptor, ValidationPipe} from '@nestjs/common';

import {AppEnv, SERVER_ENV} from './constants/env';

import {LoggerInterceptor} from './common/interceptors/Logger.interceptor';
import {ClusterService} from './common/services/Cluster.service';
import {AppModule} from './modules';

if (typeof File === 'undefined')
  (global as any).File = class {};

if (typeof FormData === 'undefined')
  (global as any).FormData = class {};

async function forkApp(
  {
    ssl,
    address,
    port,
  }: {
    ssl: AppEnv['server']['ssl'],
    address: string,
    port: number,
  },
) {
  const server = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );

  app
    .enableShutdownHooks()
    .use(
      express.static(path.resolve(__dirname, 'public/no-prefix')),
    )
    .use(
      '/cdn',
      express.static(SERVER_ENV.cdn.localPath),
    )
    .use(
      '/public',
      express.static(SERVER_ENV.paths.public, {fallthrough: false}),
    )
    .use(cookieParser())
    .useGlobalPipes(
      new ValidationPipe(
        {
          whitelist: true,
          transform: true,
          forbidUnknownValues: true,
          forbidNonWhitelisted: true,
          skipMissingProperties: true,
        },
      ),
    )
    .useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
      new LoggerInterceptor,
    );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useContainer(
    app.select(AppModule),
    {
      fallbackOnErrors: true,
    },
  );

  app.enableCors();
  await app.init();

  if (ssl.cert) {
    https
      .createServer(
        {
          key: fs.readFileSync(ssl.key),
          cert: fs.readFileSync(ssl.cert),
        },
        server,
      )
      .listen(port + 1);

    console.info(`🚀 APP server is running at https://${address}:${port + 1}!`);
  } else {
    http
      .createServer(server)
      .listen(port);
  }

  console.info(`🚀 APP server is running at http://${address}:${port}!`);
}

ClusterService.clusterize(
  () => {
    forkApp(
      {
        ssl: SERVER_ENV.ssl,
        address: SERVER_ENV.listen.address,
        port: SERVER_ENV.listen.port,
      },
    );
  },
);
