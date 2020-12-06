import 'isomorphic-fetch';

import {useContainer} from 'class-validator';
import path from 'path';
import cookieParser from 'cookie-parser';
import express from 'express';
import http from 'http';
import https from 'https';

import {NestFactory, Reflector} from '@nestjs/core';
import {ExpressAdapter, NestExpressApplication} from '@nestjs/platform-express';
import {ClassSerializerInterceptor} from '@nestjs/common';

import {ENV} from './constants/env';

import {LoggerInterceptor} from './interceptors/Logger.interceptor';
import {AppModule} from './modules/App.module';
import {ClusterService} from './services/Cluster.service';

if (typeof File === 'undefined')
  (global as any).File = class {};

if (typeof FormData === 'undefined')
  (global as any).FormData = class {};

async function forkApp(
  {
    address,
    port,
  }: {
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
    .use(
      express.static(path.resolve(__dirname, 'public/no-prefix')),
    )
    .use(
      '/public',
      express.static(path.resolve(__dirname, 'public/'), {fallthrough: false}),
    )
    .use(cookieParser())
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

  http
    .createServer(server)
    .listen(ENV.server.listen.port);

  if (ENV.server.ssl.cert) {
    https
      .createServer(ENV.server.ssl, server)
      .listen(ENV.server.listen.port + 1);
  }

  console.info(`🚀 API server is running at http://${address}:${port}!`);
}

ClusterService.clusterize(
  () => {
    forkApp(
      {
        address: ENV.server.listen.address,
        port: ENV.server.listen.port,
      },
    );
  },
);
