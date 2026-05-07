import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const elasticsearch = require('../Components/elasticsearch');
const resourceService = require('./resource.service.js');
import {
  inclusiveFilters,
  inclusiveOptions,
  inclusiveSearchText,
  normalFilters,
  normalOptions,
  normalSearchText,
  normalOpensearchResults,
  errorOpensearchResults,
} from './resource.service.test.fixtures.js';

beforeEach(() => {
  vi.restoreAllMocks();

  vi.spyOn(elasticsearch, 'searchWithAggregations').mockResolvedValue(normalOpensearchResults);
  vi.spyOn(elasticsearch, 'count').mockResolvedValue(normalOpensearchResults.hits.total.value);
});

describe('search', () => {
  it('should have a data key in the results object', async () => {
    const result = await resourceService.search(normalSearchText, normalFilters, normalOptions);
    expect(elasticsearch.searchWithAggregations).toHaveBeenCalled();
    expect(result).toHaveProperty('data');
  });

  it('should have the correct type for data in the results object', async () => {
    const result = await resourceService.search(normalSearchText, normalFilters, normalOptions);
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should have a total key in the results object', async () => {
    const result = await resourceService.search(normalSearchText, normalFilters, normalOptions);
    expect(result).toHaveProperty('total');
  });

  it('should have the correct type for total in the results object', async () => {
    const result = await resourceService.search(normalSearchText, normalFilters, normalOptions);
    expect(result.total).toBeTypeOf('number');
  });

  it('should return default results if all parameters are undefined', async () => {
    const result = await resourceService.search(undefined, undefined, undefined);
    const inclusiveResult = await resourceService.search(inclusiveSearchText, inclusiveFilters, inclusiveOptions);
    expect(result).toEqual(inclusiveResult);
  });

  it('should return default results if all parameters are null', async () => {
    const result = await resourceService.search(null, null, null);
    const inclusiveResult = await resourceService.search(inclusiveSearchText, inclusiveFilters, inclusiveOptions);
    expect(result).toEqual(inclusiveResult);
  });

  it('should return the same results for null searchText as for empty searchText', async () => {
    const resultNull = await resourceService.search(null, normalFilters, normalOptions);
    const resultEmpty = await resourceService.search('', normalFilters, normalOptions);
    expect(resultNull).toEqual(resultEmpty);
  });

  it('should return the same results for null filters as for empty filters', async () => {
    const resultNull = await resourceService.search(normalSearchText, null, normalOptions);
    const resultEmpty = await resourceService.search(normalSearchText, {}, normalOptions);
    expect(resultNull).toEqual(resultEmpty);
  });

  it('should return the same results for null options as for empty options', async () => {
    const resultNull = await resourceService.search(normalSearchText, normalFilters, null);
    const resultEmpty = await resourceService.search(normalSearchText, normalFilters, {});
    expect(resultNull).toEqual(resultEmpty);
  });

  it('should handle Opensearch error response', async () => {
    const error = new Error('Test Opensearch failure');
    error.body = errorOpensearchResults;
    vi.spyOn(elasticsearch, 'searchWithAggregations').mockRejectedValue(error);

    const result = await resourceService.search(normalSearchText, normalFilters, normalOptions);

    expect(elasticsearch.searchWithAggregations).toHaveBeenCalled();
    expect(result).toHaveProperty('error');
    expect(result.error).toBeDefined();
  });
});