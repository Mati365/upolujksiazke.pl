#!/bin/bash

set -e

while [ -n $(chmod 755 /data) ]; do
  echo "Try again";
done;

. /docker-entrypoint.sh
