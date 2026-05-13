import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

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
});