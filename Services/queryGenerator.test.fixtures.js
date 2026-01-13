/**
 * Fixtures for the queryGenerator.test.js file
 */
const { DATASET_SEARCH_FIELDS } = require('../Utils/datasetFields.js');
const queryGenerator = require('./queryGenerator.js');

// Input parameters
export const normalSearchText = 'multiple myeloma';
export const normalFilters = {
  primary_disease: [
    "Melanoma",
    "Multiple Cancer Types",
  ],
  dataset_source_repo: [
    "CEDCD",
    "dbGaP",
  ],
};
export const normalReturnFields = ['dataset_title', 'description'];
export const normalOptions = {
  pageInfo: {
    page: 1,
    pageSize: 10,
  },
  sort: {
    name: "Dataset",
    k: "dataset_title_sort",
    v: "asc",
  },
};

// Reference queries
export const oSHighlightClause = queryGenerator.getHighlightClause();
export const normalOSQuery = {
  _source: ['dataset_title', 'description'],
  size: 10,
  from: 0,
  query: {
    bool: {
      must: [
        {
          multi_match: {
            query: "multiple",
            fields: DATASET_SEARCH_FIELDS,
          },
        },
        {
          multi_match: {
            query: "myeloma",
            fields: DATASET_SEARCH_FIELDS,
          },
        },
      ],
      filter: [
        {
          terms: {
            primary_disease: [
              "Melanoma",
              "Multiple Cancer Types",
            ],
          },
        },
        {
          terms: {
            dataset_source_repo: [
              "CEDCD",
              "dbGaP",
            ],
          },
        },
      ],
    },
  },
  sort: [
    {
      dataset_title_sort: "asc",
    },
  ],
  highlight: oSHighlightClause,
};
export const nullOSQuery = {
  _source: false,
  highlight: oSHighlightClause,
};
