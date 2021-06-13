export function getDefaultPaginationFilters(limit: number = 15) {
  return {
    offset: 0,
    limit,
  };
}

export function serializeFiltersToSearchParams(params: any) {
  if (!params)
    return null;

  return {
    offset: params.offset || 0,
    limit: params.limit || 30,
    phrase: params.phrase,
  };
}
