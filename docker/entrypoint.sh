#!/bin/sh

export $(grep -v '^#' /etc/app.envs | xargs)

node /app/dist/server.js
