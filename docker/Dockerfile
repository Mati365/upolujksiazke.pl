FROM node:14.15.1-alpine3.10
ARG APP_ENV
ARG NODE_ENV

ENV APP_ENV $APP_ENV
ENV NODE_ENV $NODE_ENV

COPY . ./web
WORKDIR /web

RUN yarn install --production=false --silent
RUN yarn run build:production
RUN yarn install --production=true --silent
RUN yarn cache clean

EXPOSE 3000
