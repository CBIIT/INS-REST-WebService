let cacheKeyGenerator = {};

cacheKeyGenerator.landingKey = () => {
  return "dr_landing";
};

cacheKeyGenerator.datasetsFilterKey = () => {
  return "ds_filters";
};

cacheKeyGenerator.datasetsCountKey = () => {
  return "ds_counts";
};

cacheKeyGenerator.filtersKey = (searchText, searchFilters) => {
  return `ds_filters_${searchText}_${searchFilters}`;
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