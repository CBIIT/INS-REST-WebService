/**
 * Fixtures for the resourceQueryGenerator.test.js file
 */
const { RESOURCE_SEARCH_FIELDS } = require('../Utils/resourceFields.js');
const queryGenerator = require('./resourceQueryGenerator.js');

// Input parameters
export const normalSearchText = 'multiple myeloma';
export const normalFilters = {
  resource_tool_type: [
    "Analysis Tools",
    "Datasets and Databases"
  ],
  resource_research_area: [
      "Cancer Omics",
      "Cancer Biology"
  ]
};
export const normalReturnFields = ['resource_title', 'resource_short_description'];
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

// Reference queries
export const oSHighlightClause = queryGenerator.getHighlightClause();
export const normalOSQuery = {
  _source: ['resource_title', 'resource_short_description'],
  size: 10,
  from: 0,
  query: {
    bool: {
      must: [
        {
          multi_match: {
            query: 'multiple',
            fields: RESOURCE_SEARCH_FIELDS,
          },
        },
        {
          multi_match: {
            query: 'myeloma',
            fields: RESOURCE_SEARCH_FIELDS,
          },
        },
      ],
      filter: [
        {
          terms: {
            resource_tool_type: [
              "Analysis Tools",
              "Datasets and Databases"
            ],
          },
        },
        {
          terms: {
            resource_research_area: [
                "Cancer Omics",
                "Cancer Biology"
            ]
          },
        },
      ],
    },
  },
  sort: [
    {
      resource_title_sort: 'asc',
    },
  ],
  highlight: oSHighlightClause,
};

export const makeExpectedScrollBody = (requestedSize) => ({
  ...normalOSQuery,
  from: 0,
  size: requestedSize,
});

export const normalCountQuery = {
  query: normalOSQuery.query,
};

export const filtersOnlyCountQuery = {
  query: {
    bool: {
      must: [],
      filter: normalOSQuery.query.bool.filter,
    },
  },
};

export const searchOnlyCountQuery = {
  query: {
    bool: {
      must: normalOSQuery.query.bool.must,
    },
  },
};