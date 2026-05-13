import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import {
  foundResource,
  normalFiltersResult,
  normalRequestBody,
  normalSearchResult,
  openSearchErrorMessage,
} from './resource.controllers.test.fixtures.js';

const resourceService = require('../Services/resource.service.js');
const resourceControllers = require('./resource.controllers.js');
const { RESOURCE_DEFAULT_SORT_FIELD } = require('../Utils/resourceFields.js');

describe('getById', () => {
  it('should return a failure response when the resource is not found', async () => {
    vi.spyOn(resourceService, 'searchById').mockResolvedValue(null);

    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const req = { params: { uuid: 'missing-resource-uuid' } };
    const res = { status, json: vi.fn() };

    await resourceControllers.getById(req, res);

    expect(resourceService.searchById).toHaveBeenCalledWith('missing-resource-uuid');
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      status: 'failure',
      error: 'No resource found with the provided UUID',
    });
  });

  it('should return a success response when the resource is found', async () => {
    vi.spyOn(resourceService, 'searchById').mockResolvedValue(foundResource);

    const req = { params: { uuid: 'resource-uuid-1' } };
    const res = { status: vi.fn(), json: vi.fn() };

    await resourceControllers.getById(req, res);

    expect(resourceService.searchById).toHaveBeenCalledWith('resource-uuid-1');
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: foundResource,
    });
  });
});

describe('search', () => {
  it('should return an error response when the resource search fails', async () => {
    vi.spyOn(resourceService, 'search').mockResolvedValue({
      error: openSearchErrorMessage,
    });

    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const req = {
      body: normalRequestBody,
    };
    const res = { status, json: vi.fn() };

    await resourceControllers.search(req, res);

    expect(resourceService.search).toHaveBeenCalledWith(normalRequestBody.search_text, normalRequestBody.filters, {
      pageInfo: normalRequestBody.pageInfo,
      sort: { k: RESOURCE_DEFAULT_SORT_FIELD, v: 'asc' },
    });
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      status: 'error',
      aggs: 'all',
      data: {},
      error: openSearchErrorMessage,
    });
  });

  it('should return a success response for a normal request body', async () => {
    vi.spyOn(resourceService, 'search').mockResolvedValue(normalSearchResult);

    const requestBody = {
      ...normalRequestBody,
      pageInfo: { ...normalRequestBody.pageInfo },
    };
    const req = {
      body: requestBody,
    };
    const res = { status: vi.fn(), json: vi.fn() };

    await resourceControllers.search(req, res);

    expect(resourceService.search).toHaveBeenCalledWith(normalRequestBody.search_text, normalRequestBody.filters, {
      pageInfo: requestBody.pageInfo,
      sort: { k: RESOURCE_DEFAULT_SORT_FIELD, v: 'asc' },
    });
    expect(requestBody.pageInfo).toStrictEqual(normalRequestBody.pageInfo);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: {
        sort: { k: RESOURCE_DEFAULT_SORT_FIELD, v: 'asc' },
        pageInfo: {
          ...normalRequestBody.pageInfo,
          total: normalSearchResult.total,
        },
        result: normalSearchResult.data,
        aggs: normalSearchResult.aggs,
      },
    });
  });
});

describe('getFilters', () => {
  it('should return an error response when the filters query fails', async () => {
    vi.spyOn(resourceService, 'getFilters').mockResolvedValue({
      error: openSearchErrorMessage,
    });

    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const req = {
      body: normalRequestBody,
    };
    const res = { status, json: vi.fn() };

    await resourceControllers.getFilters(req, res);

    expect(resourceService.getFilters).toHaveBeenCalledWith(normalRequestBody.search_text, normalRequestBody.filters);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      status: 'error',
      data: {},
      error: openSearchErrorMessage,
    });
  });

  it('should return a success response for a normal request body', async () => {
    vi.spyOn(resourceService, 'getFilters').mockResolvedValue(normalFiltersResult);

    const req = {
      body: normalRequestBody,
    };
    const res = { status: vi.fn(), json: vi.fn() };

    await resourceControllers.getFilters(req, res);

    expect(resourceService.getFilters).toHaveBeenCalledWith(normalRequestBody.search_text, normalRequestBody.filters);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: normalFiltersResult,
    });
  });
});