// Default sort field for dataset search
const DATASET_DEFAULT_SORT_FIELD = 'dataset_title_sort';

// Dataset fields eligible for text search
const DATASET_SEARCH_FIELDS = [
  // 'dataset_uuid',
  'dataset_source_repo.search',
  'dataset_title.search',
  // 'description.search',
  'description_anchorless.search',
  'experimental_approaches.search',
  'dataset_source_id.search',
  'dataset_source_url.search',
  'institute.search',
  'PI_name.search',
  // 'GPA',
  'dataset_doc.search',
  // POC_name,
  // POC_email,
  // 'dataset_maximum_age_at_baseline',
  // 'dataset_minimum_age_at_baseline',
  'dataset_pmid.search',
  // 'dataset_year_enrollment_ended',
  // 'dataset_year_enrollment_started',
  'funding_source.search',
  // 'release_date',
  'limitations_for_reuse.search',
  'assay_method.search',
  'study_type.search',
  'primary_disease.search',
  // 'participant_count',
  // 'sample_count',
  'study_links.search',
  'related_genes.search',
  'related_diseases.search',
  'related_terms.search',
];

// Fields to highlight in dataset search results
const DATASET_HIGHLIGHT_FIELDS = DATASET_SEARCH_FIELDS;

// Fields to return in dataset search results
const DATASET_RETURN_FIELDS = [
  // 'dataset_uuid',
  'dataset_source_repo',
  'dataset_title',
  'description',
  'experimental_approaches',
  'dataset_source_id',
  'dataset_source_url',
  'institute',
  'PI_name',
  // 'GPA',
  'dataset_doc',
  // POC_name,
  // POC_email,
  'dataset_maximum_age_at_baseline',
  'dataset_minimum_age_at_baseline',
  'dataset_pmid',
  'dataset_year_enrollment_ended',
  'dataset_year_enrollment_started',
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
];

// Opensearch properties mapped to dataset search return fields
const DATASET_SEARCH_RETURN_MAPPING_EXCEPTIONS = {
  'description_anchorless': 'description',
}
const DATASET_SEARCH_RETURN_MAPPING = {
  ...DATASET_RETURN_FIELDS.filter(field => !Object.values(DATASET_SEARCH_RETURN_MAPPING_EXCEPTIONS).includes(field)) // Exclude some fields
  .reduce((acc, str) => ({ // By default, Opensearch property has same name as return field
    ...acc,
    [str]: str,
  }), {}),
  ...DATASET_SEARCH_RETURN_MAPPING_EXCEPTIONS, // Special fields are mapped here
};

// Map column names to properties for dataset CSV export
const datasetFields = {
  'Dataset UUID': 'dataset_uuid',
  'Dataset Title': 'dataset_title',
  'Description': 'description',
  'Experimental Approaches': 'experimental_approaches',
  'Dataset Source ID': 'dataset_source_id',
  'Dataset Source Repository': 'dataset_source_repo',
  'Dataset Source URL': 'dataset_source_url',
  'Institute': 'institute',
  'Principal Investigator(s)': 'PI_name',
  // Specifically exclude GPA, because we don't display it anywhere
  // 'Grant Program Administrator': 'GPA',
  'Division/Office/Center': 'dataset_doc',
  'PMID': 'dataset_pmid',
  'Funding Source': 'funding_source',
  'Release Date': 'release_date',
  'Limitations for Reuse': 'limitations_for_reuse',
  'Assay Method': 'assay_method',
  'Study Type': 'study_type',
  'Primary Disease': 'primary_disease',
  'Number of Participants': 'participant_count',
  'Number of Samples': 'sample_count',
  'Study Link(s)': 'study_links',
  'Related Gene(s)': 'related_genes',
  'Related Disease(s)': 'related_diseases',
  'Related Term(s)': 'related_terms',
};

module.exports = {
  DATASET_DEFAULT_SORT_FIELD,
  DATASET_SEARCH_FIELDS,
  DATASET_HIGHLIGHT_FIELDS,
  DATASET_RETURN_FIELDS,
  DATASET_SEARCH_RETURN_MAPPING,
  datasetFields,
};
