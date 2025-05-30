const logger = require('../Components/logger');
const cache = require('../Components/cache');
const config = require('../Config');
const path = require('path');
const { Parser } = require('json2csv');
const { datasetFields } = require('../Utils/datasetFields');
const datasetService = require('../Services/dataset.service');

const search = async (req, res) => {
  const body = req.body;
  const data = {};
  const filters = body.filters ?? {};
  const options = {};
  const pageInfo = body.pageInfo ?? {page: 1, pageSize: 10};
  const searchText = body.search_text?.trim() ?? '';
  const sort = body.sort ?? {k: 'dbGaP_phs', v: 'asc'};

  if (pageInfo.page !== parseInt(pageInfo.page, 10) || pageInfo.page <= 0) {
    pageInfo.page = 1;
  }
  if (pageInfo.pageSize !== parseInt(pageInfo.pageSize, 10) || pageInfo.pageSize <= 0) {
    pageInfo.pageSize = 10;
  }
  // if(sort.k === "primary_dataset_scope") {
  //   sort.name = "Primary Dataset Scope";
  //   sort.k = "primary_dataset_scope";
  // } else if (sort.k === "dataset_name.raw") {
  //   sort.name = "Dataset";
  //   sort.k = "dataset_name.raw";
  // } else if (sort.k === "case_id") {
  //   sort.name = "Cases";
  //   sort.k = "case_id";
  // } else if (sort.k === "sample_id") {
  //   sort.name = "Samples";
  //   sort.k = "sample_id";
  // } else {
  //   sort.name = "Resource";
  //   sort.k = "data_resource_id";
  // }
  if (!(sort.v && ['asc', 'desc'].includes(sort.v))) {
    sort.v = 'asc';
  }

  options.pageInfo = pageInfo;
  options.sort = sort;
  data.sort = sort;
  data.pageInfo = options.pageInfo;

  const searchResult = await datasetService.search(searchText, filters, options);

  if (searchResult.total !== 0 && (options.pageInfo.page - 1) * options.pageInfo.pageSize >= searchResult.total) {
    let lastPage = Math.ceil(searchResult.total / options.pageInfo.pageSize);
    options.pageInfo.page = lastPage;
    const searchResultAgain = await datasetService.search(searchText, filters, options);
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

const export2CSV = async (req, res) => {
  const body = req.body;
  const csvFields = Object.entries(datasetFields).map(([naturalName, propertyName]) => ({
    label: naturalName,
    value: propertyName,
  }));
  const filters = body.filters ?? {};
  const options = {};
  const pageInfo = {page: 1, pageSize: 10000};
  const searchText = body.search_text?.trim() ?? '';
  const sort = body.sort ?? {k: 'dataset_title', v: 'asc'};

  if (pageInfo.page !== parseInt(pageInfo.page, 10) || pageInfo.page <= 0) {
    pageInfo.page = 1;
  }
  if (pageInfo.pageSize !== parseInt(pageInfo.pageSize, 10) || pageInfo.pageSize <= 0) {
    pageInfo.pageSize = 10000;
  }
  // if(sort.k === "primary_dataset_scope") {
  //   sort.name = "Primary Dataset Scope";
  //   sort.k = "primary_dataset_scope";
  // } else if (sort.k === "dataset_name.raw") {
  //   sort.name = "Dataset";
  //   sort.k = "dataset_name.raw";
  // } else if (sort.k === "case_id") {
  //   sort.name = "Cases";
  //   sort.k = "case_id";
  // } else if (sort.k === "sample_id") {
  //   sort.name = "Samples";
  //   sort.k = "sample_id";
  // } else {
  //   sort.name = "Resource";
  //   sort.k = "data_resource_id";
  // }
  if (!(sort.v && ['asc', 'desc'].includes(sort.v))) {
    sort.v = 'asc';
  }

  options.pageInfo = pageInfo;
  options.sort = sort;
  const searchResult = await datasetService.export2CSV(searchText, filters, options);
  const json2Csv = new Parser({ fields: csvFields });
  const csv = json2Csv.parse(searchResult);
  res.header('Content-Type', 'text/csv');
  res.attachment('export.csv');
  res.send(csv);
};

const getById = async (req, res) => {
  const datasetId = req.params.datasetId;
  const searchResult = await datasetService.searchById(datasetId);
  res.json({status:'success', data: searchResult});
};

const getFilters = async (req, res) => {
  const body = req.body;
  const searchText = body.search_text?.trim() ?? '';
  const searchFilters = body.filters ?? {};

  const filters = await datasetService.getFilters(searchText, searchFilters);

  res.json({status: 'success', data: filters});
};

const getAdvancedFilters = async (req, res) => {
  let advancedFilters = await datasetService.getAdvancedFilters();
  res.json({status: 'success', data: advancedFilters});
};

const getDatasetCount = async (req, res) => {
  let options = {};
  let filters = [];
  let searchText = '';
  options.pageInfo = {page: 1, pageSize: 10};
  options.sort = {k: 'dbGaP_phs', v: 'asc'};
  const searchResult = await datasetService.search(searchText, filters, options);
  res.json({status: 'success', data: searchResult.total});
}

module.exports = {
	search,
  export2CSV,
  getFilters,
	getById,
  getAdvancedFilters,
  getDatasetCount,
};