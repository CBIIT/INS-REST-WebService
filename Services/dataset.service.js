const config = require('../Config');
const elasticsearch = require('../Components/elasticsearch');
const cache = require('../Components/cache');
const mysql = require('../Components/mysql');
const queryGenerator = require('./queryGenerator');
const cacheKeyGenerator = require('./cacheKeyGenerator');
const utils = require('../Utils');

const FACET_FILTERS = [
  'dataset_source_repo',
  'primary_disease',
]

const search = async (searchText, filters, options) => {
  let result = {};
  searchText = searchText.replace(/[^a-zA-Z0-9]+/g, ' '); // Ignore special characters
  let searchableText = utils.getSearchableText(searchText);
  if (false && searchableText !== "") {
    let aggregationKey = cacheKeyGenerator.getAggregationKey(searchableText);
    let aggregation = cache.getValue(aggregationKey);
    if (!aggregation) {
      let query = queryGenerator.getSearchAggregationQuery(searchText);
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
  
  const returnFields = [
    // 'dataset_uuid',
    'dataset_source_repo',
    'dataset_title',
    'description',
    'dataset_source_id',
    'dataset_source_url',
    'PI_name',
    // 'GPA',
    'dataset_doc',
    'dataset_pmid',
    'funding_source',
    'release_date',
    'limitations_for_reuse',
    'assay_method',
    'study_type',
    'primary_disease',
    'participant_count',
    'sample_count',
    'study_links',
    'related_genes',
    'related_diseases',
    'related_terms',
    'dataset_year_enrollment_started',
    'dataset_year_enrollment_ended',
    'dataset_minimum_age_at_baseline',
    'dataset_maximum_age_at_baseline'
  ];
  let query = queryGenerator.getSearchQueryV2(searchText, filters, options, returnFields);
  let searchResults = await elasticsearch.searchWithAggregations(config.indexDS, query);
  let datasets = searchResults.hits.hits.map((ds) => {
    if (ds.inner_hits) {
      const terms = Object.keys(ds.inner_hits);
      const additionalHitsDict = {};
      if (terms.length > 0) {
        terms.forEach((t) => {
          ds.inner_hits[t].hits.hits.forEach((hit) => {
            if (!additionalHitsDict[hit._nested.offset]) {
              additionalHitsDict[hit._nested.offset] = {};
              additionalHitsDict[hit._nested.offset].source = hit._source;
              additionalHitsDict[hit._nested.offset].highlight = [];
            }
            additionalHitsDict[hit._nested.offset].highlight = additionalHitsDict[hit._nested.offset].highlight.concat(hit.highlight['additional.attr_set.k']);
          });
        });
      }
      const additionalHits = [];
      for (let key in additionalHitsDict) {
        const tmp = {};
        tmp.content = additionalHitsDict[key].source;
        tmp.highlight = {};
        tmp.highlight['additional.attr_set.k'] = utils.consolidateHighlight(additionalHitsDict[key].highlight);
        additionalHits.push(tmp);
      }
      return {content: ds._source, highlight: ds.highlight, additionalHits: additionalHits};
    }
    return {content: ds._source, highlight: ds.highlight};
  });
  result.total = searchResults.hits.total.value;
  result.data = datasets;
  return result;
};

const export2CSV = async (searchText, filters, options) => {
  const returnFields = [
    'dataset_uuid',
    'dataset_source_repo',
    'dataset_title',
    'description',
    'dataset_source_id',
    'dataset_source_url',
    'PI_name',
    // 'GPA',
    'dataset_doc',
    'dataset_pmid',
    'funding_source',
    'release_date',
    'limitations_for_reuse',
    'assay_method',
    'study_type',
    'primary_disease',
    'participant_count',
    'sample_count',
    'study_links',
    'related_genes',
    'related_diseases',
    'related_terms',
    'dataset_year_enrollment_started',
    'dataset_year_enrollment_ended',
    'dataset_minimum_age_at_baseline',
    'dataset_maximum_age_at_baseline'
  ];
  const query = queryGenerator.getSearchQueryV2(searchText, filters, options, returnFields);
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

  // Must obtain counts for each filter as if the filter were not applied
  await Promise.all(FACET_FILTERS.map(async (filterName) => {
    // Obtain counts from Opensearch
    const query = queryGenerator.getDatasetFiltersQuery(searchText, searchFilters, filterName);
    const filtersResponse = await elasticsearch.searchWithAggregations(config.indexDS, query);

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