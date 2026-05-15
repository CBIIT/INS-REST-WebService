import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const queryGenerator = require('./resourceQueryGenerator.js');
import {
  normalSearchText,
  normalFilters,
  normalReturnFields,
  normalOptions,
  normalOSQuery,
  makeExpectedScrollBody,
  normalCountQuery,
  filtersOnlyCountQuery,
  searchOnlyCountQuery,
} from './resourceQueryGenerator.test.fixtures.js';

describe('getSearchQueryV2', () => {
  it('should handle undefined parameters', () => {
    const result = queryGenerator.getSearchQueryV2(undefined, undefined, undefined, undefined);
    expect(result).toBeNull();

    const querySearchText = JSON.parse(JSON.stringify(normalOSQuery));
    delete querySearchText.query.bool.must;
    const resultSearchText = queryGenerator.getSearchQueryV2(undefined, normalFilters, normalOptions, normalReturnFields);
    expect(resultSearchText).toStrictEqual(querySearchText);
  });

  it('should handle null parameters', () => {
    const result = queryGenerator.getSearchQueryV2(null, null, null, null);
    expect(result).toBeNull();
  });

  it('should correctly handle empty parameters', () => {
    const result = queryGenerator.getSearchQueryV2('', {}, {}, []);
    expect(result).toBeNull();

    const querySearchText = JSON.parse(JSON.stringify(normalOSQuery));
    delete querySearchText.query.bool.must;
    const resultSearchText = queryGenerator.getSearchQueryV2('', normalFilters, normalOptions, normalReturnFields);
    expect(resultSearchText).toStrictEqual(querySearchText);
  });

  it('should handle parameters being the wrong type', () => {
    const resultSearchText = queryGenerator.getSearchQueryV2(12345, normalFilters, normalOptions, normalReturnFields);
    expect(resultSearchText).toBeNull();

    const resultFilters = queryGenerator.getSearchQueryV2(normalSearchText, 'not an object', normalOptions, normalReturnFields);
    expect(resultFilters).toBeNull();

    const resultFiltersArray = queryGenerator.getSearchQueryV2(normalSearchText, ['a', 'b'], normalOptions, normalReturnFields);
    expect(resultFiltersArray).toBeNull();

    const resultOptions = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, 'not an object', normalReturnFields);
    expect(resultOptions).toBeNull();

    const resultOptionsArray = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, [1, 2, 3], normalReturnFields);
    expect(resultOptionsArray).toBeNull();

    const resultReturnFields = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, normalOptions, 'not an array');
    expect(resultReturnFields).toBeNull();
  });

  it('should handle whitespace-only searchText', () => {
    const querySearchText = JSON.parse(JSON.stringify(normalOSQuery));
    delete querySearchText.query.bool.must;
    const result = queryGenerator.getSearchQueryV2('   ', normalFilters, normalOptions, normalReturnFields);
    expect(result).toStrictEqual(querySearchText);
  });

  it('should form a correct query when all parameters are provided', () => {
    const result = queryGenerator.getSearchQueryV2(normalSearchText, normalFilters, normalOptions, normalReturnFields);
    expect(result).toStrictEqual(normalOSQuery);
  });

  it('should handle page being nonpositive', () => {
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

  it('should ignore page size being nonpositive', () => {
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

  it('should enable scroll for deep pagination past 10,000', () => {
    const deepOptions = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: '1001',
        pageSize: '10',
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
    expect(result.body).toStrictEqual(makeExpectedScrollBody(10));
  });

  it('should not enable scroll when the request ends at 10,000', () => {
    const optionsAtLimit = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: 1,
        pageSize: 10000,
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

  it('should not enable scroll for shallow pages when page params are strings', () => {
    const stringOptions = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: '11',
        pageSize: '10',
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

  it('should enable scroll when page size alone exceeds 10,000', () => {
    const largePageSizeOptions = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: 1,
        pageSize: 10001,
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
      requestedFrom: 0,
      requestedSize: 10001,
    });
    expect(result.body).toStrictEqual(makeExpectedScrollBody(10001));
  });

  it('should enable scroll when the computed offset goes beyond 10,000', () => {
    const deepOffsetOptions = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: 1002,
        pageSize: 10,
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
      requestedFrom: 10010,
      requestedSize: 10,
    });
    expect(result.body).toStrictEqual(makeExpectedScrollBody(10));
  });

  it('should not enable scroll when pageInfo is missing', () => {
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

  it('should not enable scroll when pageInfo values are non-numeric or non-finite', () => {
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

  it('should enable scroll when page 2 with size 10,000 is requested', () => {
    const pageTwoAtMaxSize = {
      ...normalOptions,
      pageInfo: {
        ...normalOptions.pageInfo,
        page: 2,
        pageSize: 10000,
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
    expect(result.body).toStrictEqual(makeExpectedScrollBody(10000));
  });
});

describe('getResourceCountQuery', () => {
  it('should return a count query with both search and filters', () => {
    const result = queryGenerator.getResourceCountQuery(normalSearchText, normalFilters);
    expect(result).toStrictEqual(normalCountQuery);
  });

  it('should return an empty body when no search text and no filters are provided', () => {
    const resultUndefined = queryGenerator.getResourceCountQuery(undefined, undefined);
    expect(resultUndefined).toStrictEqual({});

    const resultEmpty = queryGenerator.getResourceCountQuery('   ', {});
    expect(resultEmpty).toStrictEqual({});
  });

  it('should return a filter-only count query when searchText has no terms', () => {
    const result = queryGenerator.getResourceCountQuery('   ', normalFilters);
    expect(result).toStrictEqual(filtersOnlyCountQuery);
  });

  it('should return a search-only count query when filters are empty or have no values', () => {
    const resultEmptyObj = queryGenerator.getResourceCountQuery(normalSearchText, {});
    expect(resultEmptyObj).toStrictEqual(searchOnlyCountQuery);

    const resultEmptyValues = queryGenerator.getResourceCountQuery(normalSearchText, {
      resource_tool_type: [],
      resource_research_area: [],
    });
    expect(resultEmptyValues).toStrictEqual(searchOnlyCountQuery);
  });

  it('should ignore invalid filter types and not throw', () => {
    const result = queryGenerator.getResourceCountQuery(normalSearchText, 'not an object');
    expect(result).toStrictEqual(searchOnlyCountQuery);

    const resultArray = queryGenerator.getResourceCountQuery(normalSearchText, ['a', 'b']);
    expect(resultArray).toStrictEqual(searchOnlyCountQuery);
  });
});