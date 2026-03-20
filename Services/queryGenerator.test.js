import { describe, it, expect } from 'vitest';
const queryGenerator = require('./queryGenerator.js');
const { DATASET_SEARCH_FIELDS } = require('../Utils/datasetFields.js');
import { normalSearchText, normalFilters, normalReturnFields, normalOptions } from './queryGenerator.test.fixtures.js';

// Opensearch
import { normalOSQuery, oSHighlightClause, expectedScrollBody } from './queryGenerator.test.fixtures.js';

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

  it('should enable scroll for deep pagination past 10,000', () => { // 9
    const deepOptions = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: "1001", // test numeric strings (as from query params)
        pageSize: "10", // from = 10 * (1001 - 1) = 10000
      },
    };

    const result = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      deepOptions,
      normalReturnFields
    );

    expect(result).toMatchObject({
      useScroll: true,
      requestedFrom: 10000,
      requestedSize: 10,
    });
    expect(result.body).toBeTruthy();
    expect(result.body.from).toBe(0);
  });

  it('should not enable scroll when the request ends at 10,000', () => { // 10
    const optionsAtLimit = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: 1,
        pageSize: 10000, // from=0, from+size = 10000 (no scroll)
      },
    };

    const result = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      optionsAtLimit,
      normalReturnFields
    );

    expect(result?.useScroll).toBeUndefined();
    expect(result.from).toBe(0);
    expect(result.size).toBe(10000);
  });

  it('should not enable scroll for shallow pages when page params are strings', () => { // 11
    const stringOptions = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: "11", // from = 10 * (11 - 1) = 100
        pageSize: "10", // from + size = 110 (no scroll)
      },
    };

    const result = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      stringOptions,
      normalReturnFields
    );

    expect(result?.useScroll).toBeUndefined();
    expect(result.from).toBe(100);
    expect(result.size).toBe(10);
  });

  it('should enable scroll when page size alone exceeds 10,000', () => { // 12
    const largePageSizeOptions = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: 1,
        pageSize: 10001, // from=0, from+size = 10001 (scroll)
      },
    };

    const result = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      largePageSizeOptions,
      normalReturnFields
    );

    expect(result).toMatchObject({
      useScroll: true,
      scroll: '2m',
      scrollBatchSize: 1000,
      requestedFrom: 0,
      requestedSize: 10001,
    });
    expect(result.body).toStrictEqual(expectedScrollBody);
  });

  it('should enable scroll when the computed offset goes beyond 10,000', () => { // 13
    const deepOffsetOptions = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: 1002, // from = 10 * (1002 - 1) = 10010
        pageSize: 10, // from + size = 10020 (scroll)
      },
    };

    const result = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      deepOffsetOptions,
      normalReturnFields
    );

    expect(result).toMatchObject({
      useScroll: true,
      scroll: '2m',
      scrollBatchSize: 1000,
      requestedFrom: 10010,
      requestedSize: 10,
    });
    expect(result.body).toStrictEqual(expectedScrollBody);
  });

  it('should not enable scroll when pageInfo is missing', () => { // 14
    const optionsNoPageInfo = { ...normalOptions };
    delete optionsNoPageInfo.pageInfo;

    const result = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      optionsNoPageInfo,
      normalReturnFields
    );

    expect(result?.useScroll).toBeUndefined();
    expect(result).toStrictEqual(normalOSQuery);
  });

  it('should not enable scroll when pageInfo values are non-numeric or non-finite', () => { // 15
    const badPageInfoStrings = {
      ...normalOptions,
      pageInfo: {
        page: 'foo',
        pageSize: 'bar',
      },
    };
    const badPageInfoInfinity = {
      ...normalOptions,
      pageInfo: {
        page: 1,
        pageSize: Infinity,
      },
    };

    const resultStrings = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      badPageInfoStrings,
      normalReturnFields
    );
    expect(resultStrings?.useScroll).toBeUndefined();
    expect(resultStrings).toStrictEqual(normalOSQuery);

    const resultInfinity = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      badPageInfoInfinity,
      normalReturnFields
    );
    expect(resultInfinity?.useScroll).toBeUndefined();
    expect(resultInfinity).toStrictEqual(normalOSQuery);
  });

  it('should enable scroll when page 2 with size 10,000 is requested', () => { // 16
    const pageTwoAtMaxSize = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: 2, // from = 10000
        pageSize: 10000, // from + size = 20000 (scroll)
      },
    };

    const result = queryGenerator.getSearchQueryV2(
      normalSearchText,
      normalFilters,
      pageTwoAtMaxSize,
      normalReturnFields
    );

    expect(result).toMatchObject({
      useScroll: true,
      requestedFrom: 10000,
      requestedSize: 10000,
    });
    expect(result.body).toStrictEqual(expectedScrollBody);
  });
});
