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
const cache = require('../Components/cache');
const cacheKeyGenerator = require('./cacheKeyGenerator.js');
const queryGenerator = require('./resourceQueryGenerator.js');
const resourceService = require('./resource.service.js');
const { RESOURCE_DETAILS_RETURN_FIELDS } = require('../Utils/resourceFields.js');
import {
  inclusiveFilters,
  inclusiveOptions,
  inclusiveSearchText,
  normalFilters,
  normalOptions,
  normalSearchText,
  normalOpensearchResults,
  errorOpensearchResults,
  resourceByIdOpensearchResults,
  resourceByIdResult,
  resourceId,
} from './resource.service.test.fixtures.js';

beforeEach(() => {
  vi.restoreAllMocks();

  vi.spyOn(elasticsearch, 'searchWithAggregations').mockResolvedValue(normalOpensearchResults);
  vi.spyOn(elasticsearch, 'search').mockResolvedValue(resourceByIdOpensearchResults);
  vi.spyOn(elasticsearch, 'count').mockResolvedValue(normalOpensearchResults.hits.total.value);
  vi.spyOn(cache, 'getValue').mockReturnValue(undefined);
  vi.spyOn(cache, 'setValue').mockImplementation(() => undefined);
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

describe('searchById', () => {
  it('should return only the expected fields from a cached resource', async () => {
    cache.getValue.mockReturnValue(resourceByIdResult);
    const resourceKeySpy = vi.spyOn(cacheKeyGenerator, 'resourceKey');

    const result = await resourceService.searchById(resourceId);

    expect(resourceKeySpy).toHaveBeenCalledWith(resourceId);
    expect(elasticsearch.search).not.toHaveBeenCalled();
    expect(cache.setValue).not.toHaveBeenCalled();
    RESOURCE_DETAILS_RETURN_FIELDS.forEach((field) => {
      expect(result).toHaveProperty(field);
    });
  });

  it('should return and cache only the expected fields when querying by id', async () => {
    const resourceKeySpy = vi.spyOn(cacheKeyGenerator, 'resourceKey');
    const getResourceByIdQuerySpy = vi.spyOn(queryGenerator, 'getResourceByIdQuery');

    const result = await resourceService.searchById(resourceId);

    expect(resourceKeySpy).toHaveBeenCalledWith(resourceId);
    expect(getResourceByIdQuerySpy).toHaveBeenCalledWith(resourceId);
    expect(elasticsearch.search).toHaveBeenCalledTimes(1);
    RESOURCE_DETAILS_RETURN_FIELDS.forEach((field) => {
      expect(result).toHaveProperty(field);
    });
    expect(cache.setValue).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.any(Number));
  });

  it('should return null when querying by id finds no resource', async () => {
    elasticsearch.search.mockResolvedValue({ hits: [] });

    const result = await resourceService.searchById(resourceId);

    expect(result).toBeNull();
    expect(cache.setValue).not.toHaveBeenCalled();
  });
});