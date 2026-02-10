import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

// These modules are CommonJS (`require(...)`). Instead of relying on module mocking,
// we `spyOn` the exported functions and replace their implementation, which prevents
// any real OpenSearch calls.
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const elasticsearch = require("../Components/elasticsearch");
const datasetService = require("./dataset.service.js");
import {
  inclusiveFilters,
  inclusiveOptions,
  inclusiveSearchText,
  normalFilters,
  normalOptions,
  normalSearchText,
  normalOpensearchResults,
  errorOpensearchResults,
} from './dataset.service.test.fixtures.js';

beforeEach(() => {
  vi.restoreAllMocks();

  // Default mocked response shape expected by `dataset.service.search()`.
  // (It reads `searchResults.hits.hits` and `searchResults.hits.total.value`.)
  vi.spyOn(elasticsearch, "searchWithAggregations").mockResolvedValue(normalOpensearchResults);
});

describe('search', () => {
  it('should have a "data" key in the results object', async () => {
    const result = await datasetService.search(normalSearchText, normalFilters, normalOptions);
    expect(elasticsearch.searchWithAggregations).toHaveBeenCalled();
    expect(result).toHaveProperty('data');
  });

  it('should have the correct type for "data" in the results object', async () => {
    const result = await datasetService.search(normalSearchText, normalFilters, normalOptions);
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should have a "total" key in the results object', async () => {
    const result = await datasetService.search(normalSearchText, normalFilters, normalOptions);
    expect(result).toHaveProperty('total');
  });

  it('should have the correct type for "total" in the results object', async () => {
    const result = await datasetService.search(normalSearchText, normalFilters, normalOptions);
    expect(result.total).toBeTypeOf('number');
  });

  it('should return default results if all parameters are undefined', async () => {
    const result = await datasetService.search(undefined, undefined, undefined);
    const inclusiveResult = await datasetService.search(inclusiveSearchText, inclusiveFilters, inclusiveOptions);
    expect(result).toEqual(inclusiveResult);
  });

  it('should return default results if all parameters are null', async () => {
    const result = await datasetService.search(null, null, null);
    const inclusiveResult = await datasetService.search(inclusiveSearchText, inclusiveFilters, inclusiveOptions);
    expect(result).toEqual(inclusiveResult);
  });

  it('should return the same results for null searchText as for empty searchText', async () => {
    const resultNull = await datasetService.search(null, normalFilters, normalOptions);
    const resultEmpty = await datasetService.search('', normalFilters, normalOptions);
    expect(resultNull).toEqual(resultEmpty);
  });

  it('should return the same results for null filters as for empty filters', async () => {
    const resultNull = await datasetService.search(normalSearchText, null, normalOptions);
    const resultEmpty = await datasetService.search(normalSearchText, {}, normalOptions);
    expect(resultNull).toEqual(resultEmpty);
  });

  it('should return the same results for null options as for empty options', async () => {
    const resultNull = await datasetService.search(normalSearchText, normalFilters, null);
    const resultEmpty = await datasetService.search(normalSearchText, normalFilters, {});
    expect(resultNull).toEqual(resultEmpty);
  });

  it('should handle Opensearch error response', async () => {
    const error = new Error("Test Opensearch failure");
    let result;
    error.body = errorOpensearchResults;
    vi.spyOn(elasticsearch, "searchWithAggregations").mockRejectedValue(error);
    result = await datasetService.search(normalSearchText, normalFilters, normalOptions);
    expect(elasticsearch.searchWithAggregations).toHaveBeenCalled();
    expect(result).toHaveProperty('error');
    expect(result.error).toBeDefined();
  });
});
