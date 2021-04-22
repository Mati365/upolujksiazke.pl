import * as R from 'ramda';

export type CountedBucketValue = {
  id: string,
  count: number,
};

/**
 * Extract buckets list from nested path
 *
 * @export
 * @param {string} path
 * @param {object} agg
 * @returns
 */
export function extractNestedBuckets(path: string, agg: object) {
  if (!agg)
    return null;

  return agg[path]?.buckets;
}

/**
 * Maps _key, doc_count buckets into id, count pairs
 *
 * @export
 * @param {any[]} buckets
 * @returns
 */
export function mapCountedBucketsPairs(buckets: any[]) {
  return buckets?.map(
    ({key: id, doc_count: count}) => ({
      id,
      count,
    }),
  );
}

/**
 * Extracs id/count from bucket
 *
 * @export
 * @param {string} path
 * @param {object} agg
 * @returns {CountedBucketValue[]}
 */
export const extractNestedBucketsPairs = R.curry((path: string, agg: object) : CountedBucketValue[] => {
  const buckets = extractNestedBuckets(path, agg);
  if (!buckets?.length)
    return null;

  return mapCountedBucketsPairs(buckets);
});
