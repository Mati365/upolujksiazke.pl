#!/bin/sh

set -e

export $(grep -v '^#' /etc/app.envs | xargs)

cat /etc/app.envs
cd /app

yarn migration:run
node dist/server.js
