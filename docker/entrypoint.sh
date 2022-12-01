#!/bin/sh

export $(grep -v '^#' /etc/app.envs | xargs)

cd /app

yarn migration:run
node /dist/server.js
