import {APICountedBucket, APICountedRecord} from '@api/APIRecord';

export type CountedEsKeyRecord = APICountedRecord<{
  id: string,
}>;

export type CountedBucketValue = APICountedBucket<CountedEsKeyRecord['record']>;

/**
 * Maps _key, doc_count buckets into id, count pairs
 *
 * @export
 * @param {any[]} buckets
 * @returns
 */
export function mapEsBucketsItems(buckets: any[]): CountedEsKeyRecord[] {
  return buckets?.map(
    ({key: id, doc_count: count}) => ({
      count,
      record: {
        id,
      },
    }),
  );
}

/**
 * Extract non neested bucket info
 *
 * @export
 * @param {*} bucket
 * @param {String} path
 * @returns {CountedBucketValue}
 */
export function extractBucket(bucket: any, path?: string): CountedBucketValue {
  if (!bucket)
    return null;

  const buckets = (path ? bucket[path] : bucket)?.buckets;
  if (!buckets)
    return null;

  const items = mapEsBucketsItems(buckets);
  return {
    items,
    total: {
      bucket: bucket.bucket_size?.value ?? items.length,
      parent: bucket.parent_docs?.doc_count,
    },
  };
}

/**
 * Inherits total and maps all items in bucket
 *
 * @export
 * @template R
 * @param {(record: CountedEsKeyRecord) => APICountedRecord<R>} fn
 * @param {CountedBucketValue} countedBucket
 * @returns {APICountedBucket<R>}
 */
export function mapBucketItems<R>(
  fn: (record: CountedEsKeyRecord) => APICountedRecord<R>,
  countedBucket: CountedBucketValue,
): APICountedBucket<R> {
  if (!countedBucket)
    return null;

  const {total, items} = countedBucket;
  return {
    items: items.map(fn),
    total,
  };
}

/**
 * Picks id fields to record in bucket
 *
 * @export
 * @param {*} agg
 * @param {String} path
 * @returns
 */
export function extractAndMapIdsBucketItems(agg: any, path?: string) {
  return mapBucketItems(
    ({count, record}) => ({
      record: +record.id,
      count,
    }),
    extractBucket(agg, path),
  );
}
