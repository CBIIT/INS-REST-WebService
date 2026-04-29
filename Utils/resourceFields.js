// Default sort field for resource search
const RESOURCE_DEFAULT_SORT_FIELD = 'resource_title_sort';

// Resource fields eligible for text search
const RESOURCE_SEARCH_FIELDS = [
  // 'resource_uuid',
  // 'resource_source_id',
  'resource_title.search',
  'resource_short_description_anchorless.search',
  'resource_source_url.search',
  'resource_tool_type.search',
  'resource_tool_subtype.search',
  'resource_research_area.search',
  'resource_research_type.search',
  'resource_access.search',
  'resource_doc.search',
  'resource_poc_name.search',
  'resource_poc_email.search',
  'resource_full_description_anchorless.search',
];

// Fields to highlight in resource search results
const RESOURCE_HIGHLIGHT_FIELDS = RESOURCE_SEARCH_FIELDS;

// Fields to return in resource search results
const RESOURCE_RETURN_FIELDS = [
  // 'resource_uuid',
  // 'resource_source_id',
  'resource_title',
  'resource_short_description',
  'resource_source_url',
  'resource_tool_type',
  'resource_tool_subtype',
  'resource_research_area',
  'resource_research_type',
  'resource_access',
  'resource_doc',
  'resource_poc_name',
  'resource_poc_email',
  'resource_full_description',
];

// Opensearch properties that need to be mapped to different return fields
const RESOURCE_SEARCH_RETURN_MAPPING_EXCEPTIONS = {
  'resource_short_description_anchorless': 'resource_short_description',
  'resource_full_description_anchorless': 'resource_full_description',
};

// Opensearch properties mapped to resource search return fields
const RESOURCE_SEARCH_RETURN_MAPPING = {
  ...RESOURCE_RETURN_FIELDS.filter(field => !Object.values(RESOURCE_SEARCH_RETURN_MAPPING_EXCEPTIONS).includes(field)) // Exclude some fields
  .reduce((acc, str) => ({ // By default, Opensearch property has same name as return field
    ...acc,
    [str]: str,
  }), {}),
  ...RESOURCE_SEARCH_RETURN_MAPPING_EXCEPTIONS, // Special fields are mapped here
};

module.exports = {
  RESOURCE_DEFAULT_SORT_FIELD,
  RESOURCE_SEARCH_FIELDS,
  RESOURCE_HIGHLIGHT_FIELDS,
  RESOURCE_RETURN_FIELDS,
  RESOURCE_SEARCH_RETURN_MAPPING,
};
