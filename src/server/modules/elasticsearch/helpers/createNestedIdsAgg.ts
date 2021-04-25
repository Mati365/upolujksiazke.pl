import esb from 'elastic-builder';

export function createNestedIdsAgg(
  name: string,
  {
    withRootDocs,
    limit,
    offset,
  }: {
    withRootDocs?: boolean,
    limit?: number,
    offset?: number,
  } = {},
) {
  let termsAgg = esb.termsAggregation(`${name}_ids`, `${name}.id`);

  if (offset) {
    let bucketSort: esb.BucketSortAggregation = esb.bucketSortAggregation('limit');
    termsAgg = termsAgg.size(1000); // sucky :(

    if (limit)
      bucketSort = bucketSort.size(limit);

    if (offset)
      bucketSort = bucketSort.from(offset);

    termsAgg = termsAgg.agg(bucketSort);
  } else if (limit)
    termsAgg = termsAgg.size(limit);

  return (
    esb
      .nestedAggregation(name, name)
      .aggs([
        ...withRootDocs
          ? [esb.reverseNestedAggregation('parent_docs')]
          : [],
        esb.cardinalityAggregation('bucket_size', `${name}.id`),
        termsAgg,
      ])
  );
}
