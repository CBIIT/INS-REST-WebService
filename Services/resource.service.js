const config = require('../Config/index.js');
const elasticsearch = require('../Components/elasticsearch.js');
const cache = require('../Components/cache.js');
const logger = require('../Components/logger.js');
const mysql = require('../Components/mysql.js');
const queryGenerator = require('./resourceQueryGenerator.js');
const cacheKeyGenerator = require('./cacheKeyGenerator.js');
const utils = require('../Utils/index.js');
const {
  RESOURCE_DETAILS_RETURN_FIELDS,
  RESOURCE_RETURN_FIELDS,
  RESOURCE_SEARCH_RETURN_MAPPING
} = require('../Utils/resourceFields.js');
const FACET_FILTERS = [
  'resource_tool_type',
  'resource_research_area',
]

const search = async (searchText, filters, options) => {
  let query = null;
  let result = {};
  let searchableText = null;
  let searchResults;

  // Check searchText type
  if (searchText && typeof searchText !== 'string') {
    return result;
  }

  // Check filters type
  if (filters && (typeof filters !== 'object' || Array.isArray(filters))) {
    return result;
  }

  // Check options type
  if (options && (typeof options !== 'object' || Array.isArray(options))) {
    return result;
  }

  // Format the search text
  if (searchText) {
    const sanitizedSearchText = searchText.replace(/[^a-zA-Z0-9]+/g, ' '); // Ignore special characters
    searchableText = utils.getSearchableText(sanitizedSearchText);
  }

  query = queryGenerator.getSearchQueryV2(searchableText, filters, options, Object.keys(RESOURCE_SEARCH_RETURN_MAPPING));

  if (query == null) {
    return result;
  }

  if (false && searchableText !== "") {
    let aggregationKey = cacheKeyGenerator.getAggregationKey(searchableText);
    let aggregation = cache.getValue(aggregationKey);
    if (!aggregation) {
      let query = queryGenerator.getSearchAggregationQuery(searchableText);
      let searchResults = await elasticsearch.searchWithAggregations(config.indexR, query);
      aggregation = searchResults.aggs.myAgg.buckets;
      //put in cache for 5 mins
      cache.setValue(aggregationKey, aggregation, config.itemTTL/288);
    }
    const aggs = aggregation.map((agg) => agg.key);
    result.aggs = aggs.join('|');
  } else {
    result.aggs = 'all';
  }
  
  try {
    searchResults = await elasticsearch.searchWithAggregations(config.indexR, query);
  } catch (error) {
    logger.error(`Error searching resources: ${error}`);
    return {
      error: error?.body?.error?.root_cause ? JSON.stringify(error.body.error.root_cause).replace(/\\n/g, '') : error.message,
    };
  }

  let resources = searchResults.hits.hits.map((ds) => {
    // const content = ds._source;
    // const highlight = ds.highlight;

    // Rename return fields and highlights according to mappings
    const content = Object.keys(RESOURCE_SEARCH_RETURN_MAPPING).reduce((acc, key) => {
      if (!ds._source || !ds._source.hasOwnProperty(key)) {
        return acc;
      }

      acc[RESOURCE_SEARCH_RETURN_MAPPING[key]] = ds._source[key];
      return acc;
    }, {});
    const highlight = Object.keys(RESOURCE_SEARCH_RETURN_MAPPING).reduce((acc, key) => {
      if (!ds.highlight || !ds.highlight.hasOwnProperty(`${key}.search`)) {
        return acc;
      }

      acc[RESOURCE_SEARCH_RETURN_MAPPING[key]] = ds.highlight[`${key}.search`];
      return acc;
    }, {});

    // Isolate resource_uuid from the rest of the content
    const { resource_uuid, ...contentWithoutUuid } = content;

    if (!ds.inner_hits) {
      return {
        resource_uuid,
        content: contentWithoutUuid,
        highlight: highlight
      };
    }

    const terms = Object.keys(ds.inner_hits);
    const additionalHitsDict = {};
    if (terms.length > 0) {
      terms.forEach((t) => {
        ds.inner_hits[t].hits.hits.forEach((hit) => {
          if (!additionalHitsDict[hit._nested.offset]) { // We currently don't use this code
            additionalHitsDict[hit._nested.offset] = {};
            additionalHitsDict[hit._nested.offset].source = hit._source;
            additionalHitsDict[hit._nested.offset].highlight = [];
          }
          additionalHitsDict[hit._nested.offset].highlight = additionalHitsDict[hit._nested.offset].highlight.concat(hit.highlight['additional.attr_set.k']);
        });
      });
    }
    const additionalHits = [];
    for (let key in additionalHitsDict) { // We currently don't use this code
      const tmp = {};
      tmp.content = additionalHitsDict[key].source;
      tmp.highlight = {};
      tmp.highlight['additional.attr_set.k'] = utils.consolidateHighlight(additionalHitsDict[key].highlight);
      additionalHits.push(tmp);
    }

    return {
      resource_uuid,
      content: contentWithoutUuid,
      highlight: highlight,
      additionalHits: additionalHits
    };
  });

  const countQuery = queryGenerator.getResourceCountQuery(searchableText, filters, options);
  const countResult = await elasticsearch.count(config.indexR, countQuery);
  result.total = countResult;
  result.data = resources;
  return result;
};

const searchById = async (id) => {
  let resourceKey = cacheKeyGenerator.resourceKey(id);
  let resource = cache.getValue(resourceKey);

  // Return cached resource, if available
  if (resource) {
    return resource;
  }

  let query = queryGenerator.getResourceByIdQuery(id);
  let searchResults = await elasticsearch.search(config.indexR, query);
  let resources = searchResults.hits.map((ds) => {
    return ds._source;
  });

  // Returns null if no hit
  if (resources.length === 0) {
    return null;
  }
  resource = RESOURCE_DETAILS_RETURN_FIELDS.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(resources[0], field)) {
      acc[field] = resources[0][field];
    }
    return acc;
  }, {});
  cache.setValue(resourceKey, resource, config.itemTTL);

  return resource;
};

/**
 * Obtains facet filters and counts for the Explore Resources sidebar
 *
 * @returns {Map<string, Map<string, string>[]>} Map of filters with a list of their values and counts
 */
const getFilters = async (searchText, searchFilters) => {
  const filtersKey = await cacheKeyGenerator.resourcesFilterKey(searchText, searchFilters);
  let filters = cache.getValue(filtersKey);
  let searchableText = null;

  // Return result if already cached
  if (filters) {
    return filters;
  }

  filters = {};

  // Check searchText type
  if (searchText && typeof searchText !== 'string') {
    return filters;
  }

  // Check filters type
  if (searchFilters && (typeof searchFilters !== 'object' || Array.isArray(searchFilters))) {
    return filters;
  }

  // Format the search text
  if (searchText) {
    const sanitizedSearchText = searchText.replace(/[^a-zA-Z0-9]+/g, ' '); // Ignore special characters
    searchableText = utils.getSearchableText(sanitizedSearchText);
  }

  // Must obtain counts for each filter as if the filter were not applied
  await Promise.all(FACET_FILTERS.map(async (filterName) => {
    // Obtain counts from Opensearch
    let filtersResponse;
    const query = queryGenerator.getResourceFiltersQuery(searchText, searchFilters, filterName);

    try {
      filtersResponse = await elasticsearch.searchWithAggregations(config.indexR, query);
    } catch (error) {
      logger.error(`Error searching resources: ${error}`);
      return {
        error: error?.body?.error?.root_cause ? JSON.stringify(error.body.error.root_cause).replace(/\\n/g, '') : error.message,
      };
    }

    // Extract counts from response
    filters[filterName] = filtersResponse.aggs[filterName].buckets.map((bucket) => ({
      'name': bucket.key,
      'count': bucket.doc_count
    }));
  }));

  cache.setValue(filtersKey, filters, config.itemTTL);

  return filters;
};

module.exports = {
  search,
  searchById,
  getFilters,
};