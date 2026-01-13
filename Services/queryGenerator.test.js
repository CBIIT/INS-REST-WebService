import { describe, it, expect } from 'vitest';
const queryGenerator = require('./queryGenerator.js');
const { DATASET_SEARCH_FIELDS } = require('../Utils/datasetFields.js');
import { normalSearchText, normalFilters, normalReturnFields, normalOptions } from './queryGenerator.test.fixtures.js';

// Opensearch
import { normalOSQuery, nullOSQuery, oSHighlightClause } from './queryGenerator.test.fixtures.js';

describe('getSearchQueryV2', () => {
  it('should handle undefined parameters', () => { // 1
    const result = queryGenerator.getSearchQueryV2(undefined, undefined, undefined, undefined);
    expect(result).toStrictEqual(nullOSQuery);
  });

  it('should handle null parameters', () => { // 2
    const result = queryGenerator.getSearchQueryV2(null, null, null, null);
    expect(result).toStrictEqual(nullOSQuery);
  });

  it('should correctly handle empty parameters', () => { // 3
    const result = queryGenerator.getSearchQueryV2('', {}, {}, []);
    expect(result).toStrictEqual(nullOSQuery);
  });

  it('should handle searchText being the wrong type', () => { // 4
    // Test with a number
    const resultNumber = queryGenerator.getSearchQueryV2(12345, null, null, null);
    expect(resultNumber).toStrictEqual(nullOSQuery);
  });

  it('should handle whitespace-only searchText', () => { // 5
    const result = queryGenerator.getSearchQueryV2('   ', null, null, null);
    expect(result).toStrictEqual(nullOSQuery);
  });

  it('should form a correct query when all parameters are provided', () => { // 6
    const result = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, normalOptions, normalReturnFields);
    expect(result).toStrictEqual(normalOSQuery);
  });

  it('should handle filters being the wrong type', () => { // 7
    // Pass filters as a string
    const resultString = queryGenerator.getSearchQueryV2(null, 'not an object', null, null);
    expect(resultString).toStrictEqual(nullOSQuery);

    // Pass filters as an array
    const resultArray = queryGenerator.getSearchQueryV2(null, ['a', 'b'], null, null);
    expect(resultArray).toStrictEqual(nullOSQuery);
  });

  it('should handle options being the wrong type', () => { // 8
    // Pass options as a string
    const resultString = queryGenerator.getSearchQueryV2(null, null, "not an object", null);
    expect(resultString).toStrictEqual(nullOSQuery);

    // Pass options as an array
    const resultArray = queryGenerator.getSearchQueryV2(null, null, [1,2,3], null);
    expect(resultArray).toStrictEqual(nullOSQuery);
  });

  it('should ignore page options being the wrong type', () => { // 9
    const optionsWithZeroPage = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: 0,
      },
    };
    const result = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, optionsWithZeroPage, normalReturnFields);
    expect(result).toStrictEqual(normalOSQuery);
  });

  it('should handle search only (no filters/options/fields)', () => {
    const searchText = 'multiple myeloma';
    const expectedQuery = {
      _source: false,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: 'multiple',
                fields: DATASET_SEARCH_FIELDS,
              },
            },
            {
              multi_match: {
                query: 'myeloma',
                fields: DATASET_SEARCH_FIELDS,
              },
            },
          ],
        },
      },
      highlight: oSHighlightClause,
    };
    const result = queryGenerator.getSearchQueryV2(searchText, null, null, []);
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle filters only (no search/options/fields)', () => {
    const expectedQuery = {
      _source: false,
      query: {
        bool: {
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
          must: [],
        },
      },
      highlight: oSHighlightClause,
    };
    const result = queryGenerator.getSearchQueryV2(null, normalFilters, null, []);
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle returnFields only (all else empty)', () => {
    const expectedQuery = {
      _source: ['dataset_title', 'description'],
      highlight: oSHighlightClause,
    };
    const result = queryGenerator.getSearchQueryV2(null, null, null, normalReturnFields);
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle options with pagination only', () => {
    const options = {
      pageInfo: {
        page: 3,
        pageSize: 25,
      },
    };
    const expectedQuery = {
      _source: false,
      size: 25,
      from: 50,
      highlight: oSHighlightClause,
    };
    const result = queryGenerator.getSearchQueryV2(null, null, options, []);
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle options with sorting only', () => {
    const options = {
      sort: {
        k: 'dataset_title_sort',
        v: 'desc',
      },
    };
    const expectedQuery = {
      _source: false,
      sort: [
        {
          dataset_title_sort: 'desc',
        },
      ],
      highlight: oSHighlightClause,
    };
    const result = queryGenerator.getSearchQueryV2(null, null, options, []);
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should treat filters with only empty arrays as empty', () => {
    const filters = {
      primary_disease: [],
      dataset_source_repo: [],
    };
    const result = queryGenerator.getSearchQueryV2(null, filters, null, []);
    expect(result).toStrictEqual(nullOSQuery);
  });

  it('should filter out search terms shorter than 3 chars and ignore punctuation', () => {
    const searchText = 'a b c $ foo';
    const expectedQuery = {
      _source: false,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: 'foo',
                fields: DATASET_SEARCH_FIELDS,
              },
            },
          ],
        },
      },
      highlight: oSHighlightClause,
    };
    const result = queryGenerator.getSearchQueryV2(searchText, null, null, []);
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle search and filters, but empty fields and options', () => {
    const searchText = 'multiple myeloma';
    const expectedQuery = {
      _source: false,
      query: {
        bool: {
          must: [
            {
              multi_match: { query: 'multiple', fields: DATASET_SEARCH_FIELDS },
            },
            {
              multi_match: { query: 'myeloma', fields: DATASET_SEARCH_FIELDS },
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
      highlight: oSHighlightClause,
    };
    const result = queryGenerator.getSearchQueryV2(searchText, normalFilters, {}, []);
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle only returnFields and filters', () => {
    const expectedQuery = {
      _source: [
        "dataset_title",
        "description"
      ],
      query: {
        bool: {
          filter: [
            {
              terms: {
                primary_disease: [
                  "Melanoma",
                  "Multiple Cancer Types"
                ]
              }
            },
            {
              terms: {
                dataset_source_repo: [
                  "CEDCD",
                  "dbGaP"
                ]
              }
            }
          ],
          must: []
        }
      },
      highlight: oSHighlightClause
    };
    const result = queryGenerator.getSearchQueryV2(null, normalFilters, {}, normalReturnFields);
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle options with page = 0 (invalid), should default from = 0', () => {
    const options = {
      pageInfo: {
        page: 0,
        pageSize: 20,
      },
    };
    const expectedQuery = {
      _source: false,
      size: 20,
      highlight: oSHighlightClause,
    };
    const result = queryGenerator.getSearchQueryV2(null, null, options, []);
    // 'from' should be omitted or 0 if page is invalid
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle negative page number gracefully', () => {
    const options = {
      pageInfo: {
        page: -3,
        pageSize: 15,
      },
    };
    const expectedQuery = {
      _source: false,
      size: 15,
      highlight: oSHighlightClause,
    };
    const result = queryGenerator.getSearchQueryV2(null, null, options, []);
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle negative pageSize gracefully (should not set size/from)', () => {
    const options = {
      pageInfo: {
        page: 2,
        pageSize: -10,
      },
    };
    const expectedQuery = {
      _source: false,
      highlight: oSHighlightClause,
    };
    const result = queryGenerator.getSearchQueryV2(null, null, options, []);
    // Negative size should ignore size/from
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle undefined parameters the same as null for all', () => {
    const expectedQuery = nullOSQuery;
    // All undefined
    const result = queryGenerator.getSearchQueryV2();
    expect(result).toStrictEqual(expectedQuery);
  });

  it('should handle undefined filters', () => {
    const result = queryGenerator.getSearchQueryV2('multiple myeloma', undefined, normalOptions, normalReturnFields);
    expect(result).toBeDefined();
    expect(result.query.bool.must.length).toBeGreaterThan(0);
  });

  it('should handle undefined options', () => {
    const result = queryGenerator.getSearchQueryV2('multiple myeloma', normalFilters, undefined, normalReturnFields);
    expect(result).toBeDefined();
    expect(result._source).toEqual(normalReturnFields);
    expect(result.query.bool.must.length).toBeGreaterThan(0);
  });

  it('should handle undefined returnFields', () => {
    const result = queryGenerator.getSearchQueryV2('multiple myeloma', normalFilters, normalOptions, undefined);
    expect(result).toBeDefined();
    expect(result._source).toEqual(false);
    expect(result.query.bool.must.length).toBeGreaterThan(0);
  });
});
