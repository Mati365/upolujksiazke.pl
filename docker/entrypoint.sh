#!/bin/sh

set -e

export $(grep -v '^#' /etc/app.envs | xargs)

cat /etc/app.envs
cd /app

sleep 7
chmod 755 /data

rm -rf /data/upolujksiazke/public 2>/dev/null
cp -r public/ /data/upolujksiazke/public

yarn migration:run
node dist/server.js
