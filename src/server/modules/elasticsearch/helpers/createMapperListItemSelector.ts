export function createMapperListItemSelector(alias: string) {
  return [
    `${alias}.id as "id"`,
    `${alias}.name as "name"`,
    `${alias}.parameterizedName as "parameterizedName"`,
  ];
}
