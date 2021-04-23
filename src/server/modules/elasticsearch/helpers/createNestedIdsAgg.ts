import esb from 'elastic-builder';

export function createNestedIdsAgg(
  name: string,
  {
    withRootDocs,
  }: {
    withRootDocs?: boolean,
  } = {},
) {
  return (
    esb
      .nestedAggregation(name, name)
      .aggs([
        ...withRootDocs
          ? [esb.reverseNestedAggregation('root_docs')]
          : [],
        esb.cardinalityAggregation('bucket_size', `${name}.id`),
        esb.termsAggregation(`${name}_ids`, `${name}.id`),
      ])
  );
}
