const config = require('../Config');
const elasticsearch = require('../Components/elasticsearch');
const cache = require('../Components/cache');
const logger = require('../Components/logger');
const mysql = require('../Components/mysql');
const queryGenerator = require('./queryGenerator');
const cacheKeyGenerator = require('./cacheKeyGenerator');
const utils = require('../Utils');
const {
  DATASET_RETURN_FIELDS,
  DATASET_SEARCH_RETURN_MAPPING
} = require('../Utils/datasetFields.js');
const FACET_FILTERS = [
  'dataset_source_repo',
  'primary_disease',
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

  query = queryGenerator.getSearchQueryV2(searchableText, filters, options, Object.keys(DATASET_SEARCH_RETURN_MAPPING));

  if (query == null) {
    return result;
  }

  if (false && searchableText !== "") {
    let aggregationKey = cacheKeyGenerator.getAggregationKey(searchableText);
    let aggregation = cache.getValue(aggregationKey);
    if (!aggregation) {
      let query = queryGenerator.getSearchAggregationQuery(searchableText);
      let searchResults = await elasticsearch.searchWithAggregations(config.indexDS, query);
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
    searchResults = await elasticsearch.searchWithAggregations(config.indexDS, query);
  } catch (error) {
    logger.error(`Error searching datasets: ${error}`);
    return {
      error: error?.body?.error?.root_cause ? JSON.stringify(error.body.error.root_cause).replace(/\\n/g, '') : error.message,
    };
  }

  let datasets = searchResults.hits.hits.map((ds) => {
    // const content = ds._source;
    // const highlight = ds.highlight;

    // Rename return fields and highlights according to mappings
    const content = Object.keys(DATASET_SEARCH_RETURN_MAPPING).reduce((acc, key) => {
      if (!ds._source || !ds._source.hasOwnProperty(key)) {
        return acc;
      }

      acc[DATASET_SEARCH_RETURN_MAPPING[key]] = ds._source[key];
      return acc;
    }, {});
    const highlight = Object.keys(DATASET_SEARCH_RETURN_MAPPING).reduce((acc, key) => {
      if (!ds.highlight || !ds.highlight.hasOwnProperty(`${key}.search`)) {
        return acc;
      }

      acc[DATASET_SEARCH_RETURN_MAPPING[key]] = ds.highlight[`${key}.search`];
      return acc;
    }, {});

    // Isolate dataset_uuid from the rest of the content
    const { dataset_uuid, ...contentWithoutUuid } = content;

    if (!ds.inner_hits) {
      return {
        dataset_uuid,
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
      dataset_uuid,
      content: contentWithoutUuid,
      highlight: highlight,
      additionalHits: additionalHits
    };
  });

  const countQuery = queryGenerator.getDatasetCountQuery(searchableText, filters, options);
  const countResult = await elasticsearch.count(config.indexDS, countQuery);
  result.total = countResult;
  result.data = datasets;
  return result;
};

const export2CSV = async (searchText, filters, options) => {
  const query = queryGenerator.getSearchQueryV2(searchText, filters, options, DATASET_RETURN_FIELDS);
  const searchResults = await elasticsearch.search(config.indexDS, query);
  const datasets = searchResults.hits.map((dataset) => dataset._source);

  return datasets;
};

const searchById = async (id) => {
  let datasetKey = cacheKeyGenerator.datasetKey(id);
  let dataset = cache.getValue(datasetKey);
  if (!dataset) {
    let query = queryGenerator.getDatasetByIdQuery(id);
    let searchResults = await elasticsearch.search(config.indexDS, query);
    let datasets = searchResults.hits.map((ds) => {
      return ds._source;
    });
    dataset = datasets[0];
    cache.setValue(datasetKey, dataset, config.itemTTL);
  }
  return dataset;
};

/**
 * Obtains facet filters and counts for the Explore Datasets sidebar
 *
 * @returns {Map<string, Map<string, string>[]>} Map of filters with a list of their values and counts
 */
const getFilters = async (searchText, searchFilters) => {
  const filtersKey = await cacheKeyGenerator.datasetsFilterKey(searchText, searchFilters);
  let filters = cache.getValue(filtersKey);

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
    const query = queryGenerator.getDatasetFiltersQuery(searchText, searchFilters, filterName);

    try {
      filtersResponse = await elasticsearch.searchWithAggregations(config.indexDS, query);
    } catch (error) {
      logger.error(`Error searching datasets: ${error}`);
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

const getAdvancedFilters = async () => {
  let advancedFiltersKey = cacheKeyGenerator.advancedFiltersKey();
  let advancedFilters = cache.getValue(advancedFiltersKey);
  if (!advancedFilters) {
    //querying elasticsearch, save to dataresources cache
    //let sql = "select lt.term_name as name, lvs.permissible_value as value from lu_terms lt, lu_value_set lvs where lt.id = lvs.term_id and lt.term_name in (?,?,?,?,?,?,?,?,?,?,?,?)";
    let sql = 'select data_element, element_value, dataset_count from aggragation where data_element in (?,?,?,?,?,?,?,?,?,?,?,?,?)';

    let inserts = [
      'Case Disease Diagnosis',
      'Sample Is Cell Line',
      'Case Tumor Site',
      'Case Treatment Administered',
      'Case Treatment Outcome',
      'Sample Anatomic Site',
      'Sample Assay Method',
      'Sample Analyte Type',
      'Sample Composition Type',
      'Sample Is Normal',
      'Case Age at Diagnosis',
      'Case Ethnicity',
      'Case Race',
      'Case Sex'
    ];
    sql = mysql.format(sql, inserts);
    const result = await mysql.query(sql);
    //group by data
    advancedFilters = {};
    if(result.length > 0){
      result.map((kv) => {
        if(!advancedFilters[kv.data_element]){
          advancedFilters[kv.data_element] = [];
        }
        advancedFilters[kv.data_element].push(kv.element_value);
      });
      //add case count
      advancedFilters['Number of Cases'] = [
        '0 - 10 Cases',
        '10 - 100 Cases',
        '100 - 1000 Cases',
        '> 1000 Cases',
      ];
      //add sample count
      advancedFilters['Number of Samples'] = [
        '0 - 10 Samples',
        '10 - 100 Samples',
        '100 - 1000 Samples',
        '> 1000 Samples',
      ];
      //sort and top n
      for (let k in advancedFilters) {
        const tmp = advancedFilters[k];
        tmp.sort();
        //advancedFilters[k] = tmp.length > config.limitAdvancedFilterCount ? tmp.slice(0, config.limitAdvancedFilterCount) : tmp;
        advancedFilters[k] = tmp;
      }
      cache.setValue(advancedFiltersKey, advancedFilters, config.itemTTL);
    }
  }

  return advancedFilters;
};

const searchDatasetsByDataresourceId = async (dataresourceId) => {
  let query = queryGenerator.getDatasetsByDataresourceIdQuery(dataresourceId);
  let searchResults = await elasticsearch.search(config.indexDS, query);
  let datasets = searchResults.hits.map((ds) => {
    return ds._source;
  });
  return datasets;
}

module.exports = {
  search,
  export2CSV,
  searchById,
  getFilters,
  getAdvancedFilters,
  searchDatasetsByDataresourceId,
};