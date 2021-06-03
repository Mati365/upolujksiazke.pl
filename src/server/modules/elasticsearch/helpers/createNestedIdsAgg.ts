import esb from 'elastic-builder';

/**
 * Creates aggregated paginated agg
 *
 * @export
 * @param {Object} attrs
 * @returns
 */
export function createNestedPaginatedAgg(
  {
    aggName,
    nestedDocName,
    field,
    withRootDocs,
    phrase,
    limit,
    offset,
  }: {
    aggName: string,
    nestedDocName: string,
    field: string,
    withRootDocs?: boolean,
    phrase?: string,
    limit?: number,
    offset?: number,
  },
) {
  const fieldPath = `${nestedDocName}.${field}`;
  let termsAgg = esb.termsAggregation(aggName, fieldPath);

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

  // it is a bit sucky
  // try to find a way to fuzzy filter
  const idsAggsList = [
    ...withRootDocs
      ? [esb.reverseNestedAggregation('parent_docs')]
      : [],
    esb.cardinalityAggregation('bucket_size', fieldPath),
    termsAgg,
  ];

  const agg: esb.Aggregation = esb.nestedAggregation(aggName, nestedDocName);
  if (phrase) {
    return agg.agg(
      esb
        .filterAggregation(
          'inner',
          esb.prefixQuery(`${nestedDocName}.name.autocomplete`, phrase),
        )
        .aggs(idsAggsList),
    );
  }

  return agg.aggs(idsAggsList);
}

/**
 * Create nested aggregation with ids field
 * and limit / offset / sort support
 *
 * @export
 * @param {string} name
 * @param {Object} attrs
 * @returns
 */
export function createNestedIdsAgg(
  name: string,
  attrs: Omit<Parameters<typeof createNestedPaginatedAgg>[0], 'aggName'|'nestedDocName'|'field'> = {},
) {
  return createNestedPaginatedAgg(
    {
      ...attrs,
      aggName: `${name}_ids`,
      nestedDocName: name,
      field: 'id',
    },
  );
}
