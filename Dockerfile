FROM node:16-alpine3.15 as builder

ARG sentry_org
ARG sentry_project
ARG sentry_auth_token

ENV NODE_ENV production
ENV SENTRY_ORG $sentry_org
ENV SENTRY_PROJECT $sentry_project
ENV SENTRY_AUTH_TOKEN $sentry_auth_token

RUN apk add python3 make g++

COPY . ./

RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile --production=false \
  && yarn build:production

FROM node:16-alpine3.15 as runner

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

RUN apk add exiv2 imagemagick

COPY ./docker/entrypoint.sh /usr/bin/

RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile --production=true \
  && chmod +x /usr/bin/entrypoint.sh

COPY --from=builder config /app/config
COPY --from=builder dist /app/dist
COPY --from=builder public /app/public
COPY --from=builder package.json /app

ENTRYPOINT [ "/usr/bin/entrypoint.sh" ]
