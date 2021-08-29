import esb from 'elastic-builder';

export function wrapWithFilteredGlobalAgg(
  {
    name,
    filterQuery,
    aggs,
  }: {
    name: string,
    filterQuery?: esb.Query,
    aggs: esb.Aggregation[],
  },
) {
  const globalAgg = esb.globalAggregation(name);

  if (!filterQuery)
    return globalAgg.aggs(aggs);

  return globalAgg.agg(
    esb
      .filterAggregation('inner', filterQuery)
      .aggs(aggs),
  );
}

export function extractGlobalAgg(agg: any, pickNestedAgg?: string) {
  if (!agg)
    return null;

  if ('inner' in agg) {
    return (
      pickNestedAgg
        ? agg.inner[pickNestedAgg]
        : agg.inner
    );
  }

  if (pickNestedAgg in agg)
    return agg[pickNestedAgg];

  return agg;
}
