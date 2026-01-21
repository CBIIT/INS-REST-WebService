/**
 * Fixtures for the dataset.service.test.js file
 */

export const inclusiveSearchText = ''; // Search text that matches all datasets
export const normalSearchText = 'multiple myeloma';
export const inclusiveFilters = {}; // Filters that match all datasets
export const normalFilters = {
  primary_disease: [
    "Melanoma",
    "Multiple Cancer Types",
  ],
  dataset_source_repo: [
    "CEDCD",
    "dbGaP",
  ],
};
export const inclusiveOptions = {}; // Options that match all datasets
export const normalOptions = {
  pageInfo: {
    page: 1,
    pageSize: 10,
  },
  sort: {
    name: "Dataset",
    k: "dataset_title_sort",
    v: "asc",
  },
};
