FROM node:18 as runner

WORKDIR /app

ENV DB_PORT 5432
ENV REDIS_PORT 6379
ENV REDIS_PREFIX 'upolujksiazke/'

ENV NODE_OPTIONS '--insecure-http-parser --openssl-legacy-provider'
ENV NODE_ENV production
ENV APP_ENV production

ENV APP_PORT 80
ENV APP_INSTANCES 1
ENV APP_LISTEN_ADDRESS 0.0.0.0

ENV CDN_LOCAL_PATH /data/upolujksiazke/cdn
ENV SITEMAP_OUTPUT_PATH /data/upolujksiazke/sitemaps

RUN apt-get update \
  && apt-get install -y exiv2 imagemagick python3 make g++ \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./docker/entrypoint.sh ./

RUN yarn install --frozen-lockfile --production=false \
  && chmod +x ./entrypoint.sh

COPY ./ .

RUN yarn run build:production \
  && yarn install --production --ignore-scripts --prefer-offline \
  && yarn cache clean \
  && rm -rf ./assets ./doc ./test

ENTRYPOINT [ "/app/entrypoint.sh" ]
