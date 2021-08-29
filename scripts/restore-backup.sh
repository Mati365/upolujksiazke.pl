#!/bin/bash

export $(egrep -v '^#' $(dirname $0)/../.env | xargs)

WORKING_DIR=/tmp/upolujksiazke-restore
PROJECT_DIR=$(pwd)
TMP_DUMP_FILE="$WORKING_DIR/$(basename $1)"

export PGPASSFILE=$PROJECT_DIR/.pgpass

# copy files into tmp
if [ -d "$WORKING_DIR" ]; then rm -Rf $WORKING_DIR; fi
mkdir -p $WORKING_DIR
cp $1 $WORKING_DIR
cd $WORKING_DIR
tar -xf $TMP_DUMP_FILE
rm $TMP_DUMP_FILE

# restore db
dropdb $DB_NAME
createdb $DB_NAME
psql $DB_NAME < "$WORKING_DIR/db.dump"

# restore images
rm -rf $CDN_LOCAL_PATH
mkdir -p $CDN_LOCAL_PATH
tar -xf cdn.tar -C $CDN_LOCAL_PATH

# reindex elasticsearch
cd $PROJECT_DIR
node_modules/.bin/gulp entity:reindex:all
redis-cli flushdb

# cleanup
rm -Rf $WORKING_DIR
echo "Backup loaded!"
