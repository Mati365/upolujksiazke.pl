import 'isomorphic-fetch';

import {useContainer} from 'class-validator';
import path from 'path';
import cookieParser from 'cookie-parser';
import express from 'express';

import {NestFactory, Reflector} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
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
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors: true});

  app
    .use(
      express.static(path.resolve(__dirname, 'public/no-prefix')),
    )
    .use(
      '/public',
      express.static(path.resolve(__dirname, 'public/')),
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

  app.listen(port, address);
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
