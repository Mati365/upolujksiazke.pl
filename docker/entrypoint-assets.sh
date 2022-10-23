#!/bin/sh

set -e

sleep 5
chmod 755 /data

nginx -g 'daemon off;'
