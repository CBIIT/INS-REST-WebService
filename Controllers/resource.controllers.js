const logger = require('../Components/logger');
const cache = require('../Components/cache');
const config = require('../Config');
const path = require('path');
const { RESOURCE_DEFAULT_SORT_FIELD } = require('../Utils/resourceFields');
const { getObjectParam, getStringParam } = require('../Utils/params');
const resourceService = require('../Services/resource.service');

const search = async (req, res) => {
  const body = getObjectParam(req, 'body');
  const data = {};
  const filters = getObjectParam(body, 'filters');
  const options = {};
  const pageInfo = getObjectParam(body, 'pageInfo', {page: 1, pageSize: 10});
  const searchText = getStringParam(body, 'search_text');
  const sort = getObjectParam(body, 'sort', {k: RESOURCE_DEFAULT_SORT_FIELD, v: 'asc'});

  if (pageInfo.page !== parseInt(pageInfo.page, 10) || pageInfo.page <= 0) {
    pageInfo.page = 1;
  }
  if (pageInfo.pageSize !== parseInt(pageInfo.pageSize, 10) || pageInfo.pageSize <= 0) {
    pageInfo.pageSize = 10;
  }
  if (!(sort?.v && ['asc', 'desc'].includes(sort.v))) {
    sort.v = 'asc';
  }

  options.pageInfo = pageInfo;
  options.sort = sort;
  data.sort = sort;
  data.pageInfo = { ...options.pageInfo };

  const searchResult = await resourceService.search(searchText, filters, options);

  // Error response if there's an error
  if (searchResult.error) {
    res.status(500).json({
      status: "error",
      aggs: 'all',
      data: {},
      error: searchResult.error,
    });
    return;
  }

  if (searchResult.total !== 0 && (options.pageInfo.page - 1) * options.pageInfo.pageSize >= searchResult.total) {
    let lastPage = Math.ceil(searchResult.total / options.pageInfo.pageSize);
    options.pageInfo.page = lastPage;
    const searchResultAgain = await resourceService.search(searchText, filters, options);
    data.pageInfo.page = options.pageInfo.page;
    data.pageInfo.total = searchResultAgain.total;
    data.result = searchResultAgain.data;
    data.aggs = searchResultAgain.aggs;
  } else {
    data.pageInfo.total = searchResult.total;
    data.result = searchResult.data;
    data.aggs = searchResult.aggs;
  }

  res.json({status:"success", data: data});
};

const getById = async (req, res) => {
  const resourceId = req.params.uuid || req.params.resourceId;
  const searchResult = await resourceService.searchById(resourceId);

  if (!searchResult) {
    res.status(404).json({
      status: 'failure',
      error: 'No resource found with the provided UUID',
    });
    return;
  }

  res.json({status:'success', data: searchResult});
};

const getFilters = async (req, res) => {
  const body = getObjectParam(req, 'body');
  const searchText = getStringParam(body, 'search_text');
  const searchFilters = getObjectParam(body, 'filters');

  const filters = await resourceService.getFilters(searchText, searchFilters);

  // Error response if there's an error
  if (filters.error) {
    res.status(500).json({
      status: "error",
      data: {},
      error: filters.error,
    });
    return;
  }

  res.json({status: 'success', data: filters});
};

module.exports = {
	search,
  getFilters,
	getById,
};