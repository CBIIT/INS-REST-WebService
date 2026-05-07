/**
 * Fixtures for the resource.service.test.js file
 */

export const inclusiveSearchText = '';
export const normalSearchText = 'multiple myeloma';
export const inclusiveFilters = {};
export const normalFilters = {
  resource_tool_type: [
    'Analysis Tools',
    'Datasets and Databases',
  ],
  resource_research_area: [
    'Cancer Omics',
    'Cancer Biology',
  ],
};
export const inclusiveOptions = {};
export const normalOptions = {
  pageInfo: {
    page: 1,
    pageSize: 10,
  },
  sort: {
    name: 'Resource',
    k: 'resource_title_sort',
    v: 'asc',
  },
};

export const normalOpensearchResults = {
  hits: {
    total: {
      value: 42,
      relation: 'eq',
    },
    max_score: null,
    hits: [
      {
        _index: 'resources',
        _id: 'resource-1',
        _score: null,
        _source: {
          resource_uuid: 'resource-uuid-1',
          resource_title: 'Multiple Myeloma Data Portal',
          resource_short_description_anchorless: 'Portal for multiple myeloma datasets and tools.',
          resource_source_url: 'https://example.org/resource-1',
          resource_tool_type: 'Datasets and Databases',
          resource_tool_subtype: 'Portal',
          resource_research_area: 'Cancer Omics',
          resource_research_type: 'Translational Research',
          resource_access: 'Open',
          resource_doc: 'NCI',
          resource_poc_name: 'Jane Doe',
          resource_poc_email: 'jane@example.org',
          resource_full_description_anchorless: 'Detailed description for the multiple myeloma portal.',
        },
        highlight: {
          'resource_title.search': [
            '<b>Multiple</b> Myeloma Data Portal',
          ],
          'resource_short_description_anchorless.search': [
            'Portal for <b>multiple</b> <b>myeloma</b> datasets and tools.',
          ],
        },
        sort: [
          'multiplemyelomadataportal',
        ],
      },
      {
        _index: 'resources',
        _id: 'resource-2',
        _score: null,
        _source: {
          resource_uuid: 'resource-uuid-2',
          resource_title: 'Myeloma Analysis Toolkit',
          resource_short_description_anchorless: 'Analysis workflows for cancer omics studies.',
          resource_source_url: 'https://example.org/resource-2',
          resource_tool_type: 'Analysis Tools',
          resource_tool_subtype: 'Workflow',
          resource_research_area: 'Cancer Biology',
          resource_research_type: 'Bioinformatics',
          resource_access: 'Controlled',
          resource_doc: 'CCR',
          resource_poc_name: 'John Doe',
          resource_poc_email: 'john@example.org',
          resource_full_description_anchorless: 'Detailed description for the toolkit.',
        },
        highlight: {
          'resource_title.search': [
            '<b>Myeloma</b> Analysis Toolkit',
          ],
          'resource_research_area.search': [
            '<b>Cancer</b> Biology',
          ],
        },
        sort: [
          'myelomaanalysistoolkit',
        ],
      },
    ],
  },
  aggs: undefined,
};

export const errorOpensearchResults = {
  error: {
    root_cause: [
      {
        type: 'query_shard_exception',
        reason: 'No mapping found for [resource_title_sort] in order to sort on',
        index: 'resources',
        index_uuid: 'resource-index-uuid',
      },
    ],
    type: 'search_phase_execution_exception',
    reason: 'all shards failed',
    phase: 'query',
    grouped: true,
    failed_shards: [
      {
        shard: 0,
        index: 'resources',
        node: 'node-1',
        reason: {
          type: 'query_shard_exception',
          reason: 'No mapping found for [resource_title_sort] in order to sort on',
          index: 'resources',
          index_uuid: 'resource-index-uuid',
        },
      },
    ],
  },
  status: 400,
};