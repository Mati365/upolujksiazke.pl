import esb from 'elastic-builder';

export function createNestedIdsAgg(
  name: string,
  {
    withRootDocs,
    size,
  }: {
    withRootDocs?: boolean,
    size?: number,
  } = {},
) {
  let termsAggregation = esb.termsAggregation(`${name}_ids`, `${name}.id`);
  if (size)
    termsAggregation = termsAggregation.size(size);

  return (
    esb
      .nestedAggregation(name, name)
      .aggs([
        ...withRootDocs
          ? [esb.reverseNestedAggregation('root_docs')]
          : [],
        esb.cardinalityAggregation('bucket_size', `${name}.id`),
        termsAggregation,
      ])
  );
}
