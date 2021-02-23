#!/bin/bash

export $(egrep -v '^#' $(dirname $0)/../.env | xargs)

WORKING_DIR=/tmp/bookmeter-backup
PROJECT_DIR=$(pwd)
BACKUP_FILENAME="dump-$(date +%Y%m%d%H%M%S).tar.gz"
BACKUP_HISTORY=5

REMOTE_NAME="mega_remote"
REMOTE_BACKUP_DIR="backup/bookmeter.org"

if [ -d "$WORKING_DIR" ]; then rm -Rf $WORKING_DIR; fi
mkdir -p "$WORKING_DIR"
cd $WORKING_DIR
echo "Creating backup in $WORKING_DIR directory..."

# Pack backup
tar -cf cdn.tar -C $CDN_LOCAL_PATH/ .
PGPASSFILE=$PROJECT_DIR/.pgpass pg_dump -c $DB_NAME > db.dump
tar -czf $BACKUP_FILENAME cdn.tar db.dump

# Send new backup to remote
rclone copyto -v $BACKUP_FILENAME $REMOTE_NAME:$REMOTE_BACKUP_DIR/$BACKUP_FILENAME

# Remove old files
rclone lsl $REMOTE_NAME:$REMOTE_BACKUP_DIR |
  sort -r -k2,3 |
  awk -v history=$BACKUP_HISTORY 'NR > history { print $4 }' |
  while read line; do
    rclone delete -v $REMOTE_NAME:$REMOTE_BACKUP_DIR/$line
  done

rm -Rf $WORKING_DIR
echo "Backup synchronized!"
