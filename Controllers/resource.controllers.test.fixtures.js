export const foundResource = {
  resource_uuid: 'resource-uuid-1',
  resource_title: 'Multiple Myeloma Data Portal',
};

export const openSearchErrorMessage = 'OpenSearch query failed';

export const normalRequestBody = {
  filters: {},
  pageInfo: { page: 1, pageSize: 10 },
  search_text: 'multiple myeloma',
};

export const normalSearchResult = {
  total: 1,
  data: [foundResource],
  aggs: 'all',
};