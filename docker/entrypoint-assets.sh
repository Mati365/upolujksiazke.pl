#!/bin/bash

set -e

while ! chmod 755 /data
do
  echo "Waiting for volumes ..."
done

. /docker-entrypoint.sh
