import esb from 'elastic-builder';

export function createNestedIdsAgg(name: string) {
  return (
    esb
      .nestedAggregation(name, name)
      .aggs([
        esb.termsAggregation(`${name}_ids`, `${name}.id`),
      ])
  );
}
