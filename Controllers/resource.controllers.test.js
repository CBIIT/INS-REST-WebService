import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { foundResource } from './resource.controllers.test.fixtures.js';

const resourceService = require('../Services/resource.service.js');
const resourceControllers = require('./resource.controllers.js');

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
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return a success response when the resource is found', async () => {
    vi.spyOn(resourceService, 'searchById').mockResolvedValue(foundResource);

    const req = { params: { uuid: 'resource-uuid-1' } };
    const res = { status: vi.fn(), json: vi.fn() };

    await resourceControllers.getById(req, res);

    expect(resourceService.searchById).toHaveBeenCalledWith('resource-uuid-1');
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: foundResource,
    });
  });
});