#!/bin/sh

set -e

export $(grep -v '^#' /etc/app.envs | xargs)

cat /etc/app.envs
cd /app

while [ -n $(chmod 755 /data) ]; do
  echo "Try again";
done;

rm -rf /data/upolujksiazke/public 2>/dev/null
cp -r public/ /data/upolujksiazke/public

yarn migration:run
node dist/server.js
