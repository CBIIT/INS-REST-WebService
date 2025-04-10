// Maps Dataset natural field names to property names
const datasetFields = {
  'Dataset UUID': 'dataset_uuid',
  'Dataset Title': 'dataset_title',
  'Description': 'description',
  'Dataset Source ID': 'dataset_source_id',
  'Dataset Source Repository': 'dataset_source_repo',
  'Dataset Source URL': 'dataset_source_url',
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
  datasetFields,
};

