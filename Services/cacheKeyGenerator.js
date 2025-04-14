const { hasher } = require('node-object-hash');
let cacheKeyGenerator = {};

/**
 * Hashes a obj
 * @param {Object} obj The obj to hash
 */
const hash = async (obj) => {
  const hashSortCoerce = hasher({ sort: true, coerce: true });

  return hashSortCoerce.hash(obj);
}

cacheKeyGenerator.landingKey = () => {
  return "dr_landing";
};

cacheKeyGenerator.datasetsFilterKey = async (searchText, searchFilters) => {
  const filtersHash = await hash(searchFilters);
  const textHash = await hash(searchText);
  return `ds_filters_${textHash}_${filtersHash}`;
};

cacheKeyGenerator.datasetsCountKey = () => {
  return "ds_counts";
};

cacheKeyGenerator.filtersKey = (searchText, searchFilters) => {
  return `ds_filters`;
};

cacheKeyGenerator.participatingResourcesFiltersKey = () => {
  return "dr_filters";
};

cacheKeyGenerator.advancedFiltersKey = () => {
  return "ds_advanced_filters";
};

cacheKeyGenerator.datasetKey = (id) => {
  return `ds_item_${id}`;
};

cacheKeyGenerator.dataresourceKey = (id) => {
  return `dr_item_${id}`;
};

cacheKeyGenerator.siteUpdateDateKey = () => {
  return "app_site_update_date";
};

cacheKeyGenerator.getAggregationKey = (searchableText) => {
  return `ss_${searchableText}`;
};

cacheKeyGenerator.widgetUpdateKey = () => {
  return "widget_update";
};

cacheKeyGenerator.glossaryLettersKey = () => {
  return 'glossary_letters';
};

module.exports = cacheKeyGenerator;