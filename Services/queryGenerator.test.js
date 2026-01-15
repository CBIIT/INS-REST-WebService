import { describe, it, expect } from 'vitest';
const queryGenerator = require('./queryGenerator.js');
const { DATASET_SEARCH_FIELDS } = require('../Utils/datasetFields.js');
import { normalSearchText, normalFilters, normalReturnFields, normalOptions } from './queryGenerator.test.fixtures.js';

// Opensearch
import { normalOSQuery, oSHighlightClause } from './queryGenerator.test.fixtures.js';

describe('getSearchQueryV2', () => {
  it('should handle undefined parameters', () => { // 1
    // Should be null, mainly because returnFields is undefined
    const result = queryGenerator.getSearchQueryV2(undefined, undefined, undefined, undefined);
    expect(result).toBeNull();

    // Undefined searchText is ok
    const querySearchText = JSON.parse(JSON.stringify(normalOSQuery));
    delete querySearchText.query.bool.must;
    const resultSearchText = queryGenerator.getSearchQueryV2(undefined, normalFilters, normalOptions, normalReturnFields);
    expect(resultSearchText).toStrictEqual(querySearchText);

    // TODO: Add tests showing that undefined filters and options are ok
  });

  it('should handle null parameters', () => { // 2
    // Should be null, mainly because returnFields is null
    const result = queryGenerator.getSearchQueryV2(null, null, null, null);
    expect(result).toBeNull();

    // TODO: Add tests showing that null searchText, filters and options are ok
  });

  it('should correctly handle empty parameters', () => { // 3
    // Should be null, mainly because returnFields is empty
    const result = queryGenerator.getSearchQueryV2('', {}, {}, []);
    expect(result).toBeNull();

    // Empty searchText is ok
    const querySearchText = JSON.parse(JSON.stringify(normalOSQuery));
    delete querySearchText.query.bool.must;
    const resultSearchText = queryGenerator.getSearchQueryV2('', normalFilters, normalOptions, normalReturnFields);
    expect(resultSearchText).toStrictEqual(querySearchText);

    // TODO: Add tests showing that empty filters and options are ok
  });

  it('should handle parameters being the wrong type', () => { // 4
    // Search text being the wrong type
    const resultSearchText = queryGenerator.getSearchQueryV2(12345, normalFilters, normalOptions, normalReturnFields);
    expect(resultSearchText).toBeNull();

    // Filters not being an object
    const resultFilters = queryGenerator.getSearchQueryV2(normalSearchText, 'not an object', normalOptions, normalReturnFields);
    expect(resultFilters).toBeNull();

    // Filters being an array
    const resultFiltersArray = queryGenerator.getSearchQueryV2(normalSearchText, ['a', 'b'], normalOptions, normalReturnFields);
    expect(resultFiltersArray).toBeNull();

    // Options being the wrong type
    const resultOptions = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, 'not an object', normalReturnFields);
    expect(resultOptions).toBeNull();

    // Options being an array
    const resultOptionsArray = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, [1,2,3], normalReturnFields);
    expect(resultOptionsArray).toBeNull();

    // Return fields not being an array
    const resultReturnFields = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, normalOptions, 'not an array');
    expect(resultReturnFields).toBeNull();
  });

  it('should handle whitespace-only searchText', () => { // 5
    const querySearchText = JSON.parse(JSON.stringify(normalOSQuery));
    delete querySearchText.query.bool.must;
    const result = queryGenerator.getSearchQueryV2('   ', normalFilters, normalOptions, normalReturnFields);
    expect(result).toStrictEqual(querySearchText);
  });

  it('should form a correct query when all parameters are provided', () => { // 6
    const result = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, normalOptions, normalReturnFields);
    expect(result).toStrictEqual(normalOSQuery);
  });

  it('should handle page being nonpositive', () => { // 7
    const optionsWithZeroPage = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: 0,
      },
    };
    const optionsWithNegativePage = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: -1,
      },
    };
    const result = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, optionsWithZeroPage, normalReturnFields);
    expect(result).toStrictEqual(normalOSQuery);
    const resultWithNegativePage = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, optionsWithNegativePage, normalReturnFields);
    expect(resultWithNegativePage).toStrictEqual(normalOSQuery);
  });

  it('should ignore page size being nonpositive', () => { // 8
    const optionsWithZeroPageSize = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        pageSize: 0,
      },
    };
    const optionsWithNegativePageSize = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        pageSize: -1,
      },
    };
    const resultZero = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      optionsWithZeroPageSize,
      normalReturnFields
    );
    expect(resultZero).toStrictEqual(normalOSQuery);

    const resultNegative = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      optionsWithNegativePageSize,
      normalReturnFields
    );
    expect(resultNegative).toStrictEqual(normalOSQuery);
  });
});
