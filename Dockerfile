FROM node:16 as builder

ARG sentry_org
ARG sentry_project
ARG sentry_auth_token

ENV NODE_ENV production
ENV SENTRY_ORG $sentry_org
ENV SENTRY_PROJECT $sentry_project
ENV SENTRY_AUTH_TOKEN $sentry_auth_token

RUN apt-get update \
  && apt-get install -y python3 make g++

COPY package.json ./
RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile --production=false

COPY . ./
RUN yarn build:production

FROM node:16 as runner

ENV DB_PORT 5432
ENV REDIS_PORT 6379
ENV REDIS_PREFIX upolujksiazke-queue

ENV NODE_ENV production
ENV APP_ENV production
ENV APP_PORT 3002
ENV APP_INSTANCES 1
ENV APP_LISTEN_ADDRESS 0.0.0.0

ENV CDN_LOCAL_PATH /data/upolujksiazke/cdn
ENV SITEMAP_OUTPUT_PATH /data/upolujksiazke/sitemaps

WORKDIR /app
RUN apt-get update \
 && apt-get install -y exiv2 imagemagick python3 make g++

COPY ./docker/entrypoint.sh ./
COPY --from=builder gulpfile.js tsconfig.json package.json ./
COPY --from=builder gulpfile.js src ./src/
COPY --from=builder gulpfile.js dist ./dist/
COPY --from=builder gulpfile.js public ./public/

RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile --production=true \
  && chmod +x ./entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]
