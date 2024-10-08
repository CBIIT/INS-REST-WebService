const config = require("../Config");

let queryGenerator = {};

queryGenerator.getSearchAggregationQuery = (searchText) => {
  let body = {
    size: 10,
    from: 0
  };

  let compoundQuery = {};
  compoundQuery.bool = {};
  compoundQuery.bool.must = [];

  const strArr = searchText.trim().split(" ");
  const result = [];
  strArr.forEach((term) => {
    const t = term.trim();
    if (t.length > 2) {
      result.push(t);
    }
  });
  const keywords = result.length === 0 ? "" : result.join(" ");
  if(keywords != ""){
    const termArr = keywords.split(" ");
    termArr.forEach((term) => {
      let searchTerm = term.trim();
      if(searchTerm != ""){
        let clause = {};
        clause.bool = {};
        clause.bool.should = [];
        let dsl = {};
        dsl.multi_match = {};
        dsl.multi_match.query = searchTerm;
        //dsl.multi_match.analyzer = "standard_analyzer";
        dsl.multi_match.fields = [
          'dataset_title',
          // "data_resource_name",
          // "dataset_name",
          // "desc",
          // "primary_dataset_scope",
          // "poc",
          // "poc_email",
          // "published_in",
          // "program_name",
          // "project_name"
        ];
        // clause.bool.should.push(dsl);
        let nestedFields = [
        // "case_age.k",
        //   "case_age_at_diagnosis.k",
        //   "case_age_at_trial.k",
        //   "case_disease_diagnosis.k",
        //   "case_disease_diagnosis.s",
        //   "case_ethnicity.k",
        //   "case_gender.k",
        //   "case_proband.k",
        //   "case_race.k",
        //   "case_sex.k",
        //   "case_sex_at_birth.k",
        //   "case_treatment_administered.k",
        //   "case_treatment_outcome.k",
        //   "case_tumor_site.k",
        //   "case_tumor_site.s",
        //   "donor_age.k",
        //   "donor_disease_diagnosis.k",
        //   "donor_sex.k",
        //   "project_anatomic_site.k",
        //   "project_cancer_studied.k",
        //   "sample_analyte_type.k",
        //   "sample_anatomic_site.k",
        //   "sample_assay_method.k",
        //   "sample_composition_type.k",
        //   "sample_repository_name.k",
        //   "sample_is_cell_line.k",
        //   "sample_is_normal.k",
        //   "sample_is_xenograft.k"
        ];
        nestedFields.map((f) => {
          let idx = f.indexOf('.');
          let parent = f.substring(0, idx);
          dsl = {};
          dsl.nested = {};
          dsl.nested.path = parent;
          dsl.nested.query = {};
          dsl.nested.query.match = {};
          dsl.nested.query.match[f] = {"query":searchTerm};
          // clause.bool.should.push(dsl);
        });
        dsl = {};
        dsl.nested = {};
        dsl.nested.path = "projects";
        dsl.nested.query = {};
        dsl.nested.query.bool = {};
        dsl.nested.query.bool.should = [];
        let m = {};
        m.match = {
          "projects.p_k": searchTerm
        };
        // dsl.nested.query.bool.should.push(m);
        m = {};
        m.nested = {};
        m.nested.path = "projects.p_v";
        m.nested.query = {};
        m.nested.query.match = {};
        m.nested.query.match["projects.p_v.k"] = {"query":searchTerm};
        // dsl.nested.query.bool.should.push(m);
        // clause.bool.should.push(dsl);
    
        dsl = {};
        dsl.nested = {};
        dsl.nested.path = "additional";
        dsl.nested.query = {};
        dsl.nested.query.bool = {};
        dsl.nested.query.bool.should = [];
        m = {};
        m.match = {
          "additional.attr_name": searchTerm
        };
        // dsl.nested.query.bool.should.push(m);
        m = {};
        m.nested = {};
        m.nested.path = "additional.attr_set";
        m.nested.query = {};
        m.nested.query.match = {};
        m.nested.query.match["additional.attr_set.k"] = {"query":searchTerm};
        // dsl.nested.query.bool.should.push(m);
        // clause.bool.should.push(dsl);
        compoundQuery.bool.must.push(clause);
      }
    });
  } else {
    return null;
  }

  if (compoundQuery.bool.must.length > 0) {
    body.query = compoundQuery;
  }
  
  let agg = {};
  agg.myAgg = {};
  agg.myAgg.terms = {};
  agg.myAgg.terms.field = "data_resource_id";
  agg.myAgg.terms.size = 1000;

  // body.aggs = agg;
  return body;
};

queryGenerator.getSearchQueryV2 = (searchText, filters, options) => {
  const body = {};

  if (options) {
    body.size = options.pageInfo.pageSize;
    body.from = (options.pageInfo.page - 1 ) * options.pageInfo.pageSize;
  }

  let compoundQuery = {};
  compoundQuery.bool = {};
  compoundQuery.bool.must = [];

  const strArr = searchText.trim().split(" ");
  const result = [];
  strArr.forEach((term) => {
    const t = term.trim();
    if (t.length > 2) {
      result.push(t);
    }
  });
  const keywords = result.length === 0 ? "" : result.join(" ");
  if(keywords != ""){
    const termArr = keywords.split(" ").map((t) => t.trim());
    const uniqueTermArr = termArr.filter((t, idx) => {
      return termArr.indexOf(t) === idx;
    });
    uniqueTermArr.forEach((term) => {
      let searchTerm = term.trim();
      if(searchTerm != ""){
        let clause = {};
        clause.bool = {};
        clause.bool.should = [];
        let dsl = {};
        dsl.multi_match = {};
        dsl.multi_match.query = searchTerm;
        //dsl.multi_match.analyzer = "standard_analyzer";
        dsl.multi_match.fields = [
          'dataset_title',
          'description',
          'dbGaP_phs',
          'dbGaP_URL',
          'PI_name',
          'GPA',
          'dataset_doc',
          'dataset_pmid',
          'funding_source',
          // 'release_date',
          'limitations_for_reuse',
          'assay_method',
          'data_type',
          'study_type',
          'analyte_type',
          'primary_disease',
          'anatomic_site',
          'age',
          'sex',
          'ethnicity',
          'race',
          'sample_is_normal',
          // 'participant_count',
          // 'sample_count',
          'ancestry',
          'study_links',
          'related_genes',
          'related_diseases',
          'related_terms',
        ].map((field) => `${field}.search`);
        clause.bool.should.push(dsl);
        let nestedFields = [
        // "case_age.k",
        //   "case_age_at_diagnosis.k",
        //   "case_age_at_trial.k",
        //   "case_disease_diagnosis.k",
        //   "case_disease_diagnosis.s",
        //   "case_ethnicity.k",
        //   "case_gender.k",
        //   "case_proband.k",
        //   "case_race.k",
        //   "case_sex.k",
        //   "case_sex_at_birth.k",
        //   "case_treatment_administered.k",
        //   "case_treatment_outcome.k",
        //   "case_tumor_site.k",
        //   "case_tumor_site.s",
        //   "donor_age.k",
        //   "donor_disease_diagnosis.k",
        //   "donor_sex.k",
        //   "project_anatomic_site.k",
        //   "project_cancer_studied.k",
        //   "sample_analyte_type.k",
        //   "sample_anatomic_site.k",
        //   "sample_assay_method.k",
        //   "sample_composition_type.k",
        //   "sample_repository_name.k",
        //   "sample_is_cell_line.k",
        //   "sample_is_normal.k",
        //   "sample_is_xenograft.k"
        ];
        nestedFields.map((f) => {
          let idx = f.indexOf('.');
          let parent = f.substring(0, idx);
          let dsl = {};
          dsl.nested = {};
          dsl.nested.path = parent;
          dsl.nested.query = {};
          dsl.nested.query.match = {};
          dsl.nested.query.match[f] = {"query":searchTerm};
          // clause.bool.should.push(dsl);
        });
        // let m = {};
        // dsl = {};
        // dsl.nested = {};
        // dsl.nested.path = "projects";
        // dsl.nested.query = {};
        // dsl.nested.query.bool = {};
        // dsl.nested.query.bool.should = [];
        // m.match = {
        //   "projects.p_k": searchTerm
        // };
        // dsl.nested.query.bool.should.push(m);
        /*
        m = {};
        m.nested = {};
        m.nested.path = "projects.p_v";
        m.nested.query = {};
        m.nested.query.match = {};
        m.nested.query.match["projects.p_v.k"] = {"query":searchTerm};
        dsl.nested.query.bool.should.push(m);
        */
        // clause.bool.should.push(dsl);
    
        dsl = {};
        dsl.nested = {};
        dsl.nested.path = "additional";
        dsl.nested.inner_hits = {};
        dsl.nested.inner_hits.name = searchTerm;
        dsl.nested.inner_hits.highlight = {
          pre_tags: ["<b>"],
          post_tags: ["</b>"],
          fields: {
            "additional.attr_set.k": {}
          }
        };
        dsl.nested.query = {};
        dsl.nested.query.bool = {};
        dsl.nested.query.bool.should = [];
        /*
        m = {};
        m.match = {
          "additional.attr_name": searchTerm
        };
        dsl.nested.query.bool.should.push(m);
        */
        /*
        m = {};
        m.nested = {};
        m.nested.path = "additional.attr_set";
        m.nested.query = {};
        m.nested.query.match = {};
        m.nested.query.match["additional.attr_set.k"] = {"query":searchTerm};
        dsl.nested.query.bool.should.push(m);
        clause.bool.should.push(dsl);
        */
        compoundQuery.bool.must.push(clause);
      }
    });
    
  }

  if (Object.entries(filters).length > 0) {
    const clause = {
      'bool': {
        'should': Object.entries(filters).map(([field, values]) => {
          return {
            'terms': {
              [field]: values
            }
          }
        })
      }
    };
    compoundQuery.bool.must.push(clause);
  }

  if (compoundQuery.bool.must.length > 0) {
    body.query = compoundQuery;
  }
  
  let agg = {};
  agg.myAgg = {};
  agg.myAgg.terms = {};
  agg.myAgg.terms.field = "data_resource_id";
  agg.myAgg.terms.size = 1000;

  // body.aggs = agg;
  // Add sort parameters
  if (options?.sort) {
    body.sort = [];
    const tmp = {};
    tmp[options.sort.k] = options.sort.v;
    body.sort.push(tmp);
  }

  body.highlight = {
    pre_tags: ["<b>"],
    post_tags: ["</b>"],
    fields: {
      'dataset_title': { number_of_fragments: 0 },
      'description': { number_of_fragments: 0 },
      'dbGaP_phs': { number_of_fragments: 0 },
      'dbGaP_URL': { number_of_fragments: 0 },
      'PI_name': { number_of_fragments: 0 },
      'GPA': { number_of_fragments: 0 },
      'dataset_doc': { number_of_fragments: 0 },
      'dataset_pmid': { number_of_fragments: 0 },
      'funding_source': { number_of_fragments: 0 },
      // 'release_date': { number_of_fragments: 0 },
      'limitations_for_reuse': { number_of_fragments: 0 },
      'assay_method': { number_of_fragments: 0 },
      'data_type': { number_of_fragments: 0 },
      'study_type': { number_of_fragments: 0 },
      'analyte_type': { number_of_fragments: 0 },
      'primary_disease': { number_of_fragments: 0 },
      'anatomic_site': { number_of_fragments: 0 },
      'age': { number_of_fragments: 0 },
      'sex': { number_of_fragments: 0 },
      'ethnicity': { number_of_fragments: 0 },
      'race': { number_of_fragments: 0 },
      'sample_is_normal': { number_of_fragments: 0 },
      // 'participant_count': { number_of_fragments: 0 },
      // 'sample_count': { number_of_fragments: 0 },
      'ancestry': { number_of_fragments: 0 },
      'study_links': { number_of_fragments: 0 },
      'related_genes': { number_of_fragments: 0 },
      'related_diseases': { number_of_fragments: 0 },
      'related_terms': { number_of_fragments: 0 },
    },
  };
  return body;
};

// Generates a bucket aggregation query on dataset properties
queryGenerator.getDatasetFiltersQuery = (searchText, searchFilters) => {
  // Borrow some of the search query
  const query = queryGenerator.getSearchQueryV2(searchText, searchFilters);

  // Customize search query
  query.aggs = {};
  query.size = 0;
  delete query.highlight;

  const BUCKET_FIELDS = [
    'primary_disease',
  ];

  // Aggregate on filter fields
  BUCKET_FIELDS.forEach((fieldName) => {
    query.aggs[fieldName] = {
      'terms': {
        'field': fieldName,
        'order': {
          '_key': 'asc'
        }
      }
    }
  });

  return query;
};

queryGenerator.getParticipatingResourcesSearchQuery = (filters, options) => {
  let query = {};
  const filterKeys = Object.keys(filters);
  if(filterKeys.length > 0){
    query.bool = {};
    query.bool.must = [];
    for(let k = 0; k < filterKeys.length; k ++){
      let attribute = "";
      if (filterKeys[k] === "resource_type") {
        attribute = "resource_type";
      }
      else if(filterKeys[k] === "data_content_type") {
        attribute = "data_content_type";
      }
      else {
        attribute = "";
      }
      
      if(attribute !== ""){
        let clause = {};
        clause.bool = {};
        clause.bool.should = [];
        filters[filterKeys[k]].map((item) => {
          let tmp = {};
          tmp.match = {};
          tmp.match[attribute] = item;
          clause.bool.should.push(tmp);
        });
        query.bool.must.push(clause);
      }
    }
    if(query.bool.must.length === 0){
      query = {};
      query.match_all = {};
    }
  }
  else{
    query.match_all = {};
  }

  let body = {
    size: options.pageInfo.pageSize,
    from: (options.pageInfo.page - 1 ) * options.pageInfo.pageSize
  };
  body.query = query;
  body.sort = [];
  let tmp = {};
  tmp["resource_name"] = "asc";
  // body.sort.push(tmp);
  return body;
};

queryGenerator.getDocumentSearchQuery = (keyword, options) => {
  let body = {
    size: options.pageInfo.pageSize,
    from: (options.pageInfo.page - 1 ) * options.pageInfo.pageSize
  };
  let query = {};
  const strArr = keyword.trim().split(" ");
  const result = [];
  strArr.forEach((term) => {
    const t = term.trim();
    if (t.length > 2) {
      result.push(t);
    }
  });
  const keywords = result.length === 0 ? "" : result.join(" ");
  if(keywords != ""){
    const termArr = keywords.split(" ");
    let compoundQuery = {};
    compoundQuery.bool = {};
    compoundQuery.bool.must = [];
    termArr.forEach((term) => {
      let searchTerm = term.trim();
      if(searchTerm != ""){
        let dsl = {};
        dsl.multi_match = {};
        dsl.multi_match.query = searchTerm;
        //dsl.multi_match.analyzer = "standard_analyzer";
        dsl.multi_match.fields = [
          "title", "description", "content"
        ];
        // compoundQuery.bool.must.push(dsl);
      }
    });
    body.query = compoundQuery;
  }
  else {
    query.match_all = {};
    body.query = query;
  }

  body.sort = [];
  let tmp = {};
  tmp["title.raw"] = "asc";
  // body.sort.push(tmp);

  body.highlight = {
    pre_tags: ["<b>"],
    post_tags: ["</b>"],
    fields: {
      "title": { number_of_fragments: 0 },
      "description": { number_of_fragments: 0 },
      "content": { number_of_fragments: 0 },
      "link": { number_of_fragments: 0 }
    },
  };
  return body;
};

queryGenerator.getDatasetByIdQuery = (id) => {
  let dsl = {};
  dsl.match = {};
  dsl.match.dataset_id = id;

  let body = {
    size: 1,
    from: 0
  };
  body.query = dsl;
  // body.sort = [{
  //   "dataset_id": "asc"
  // }];
  
  return body;
};

queryGenerator.getDataresourceByIdQuery = (id) => {
  let dsl = {};
  dsl.match = {};
  dsl.match.data_resource_id = id;

  let body = {
    size: 1,
    from: 0
  };
  body.query = dsl;
  // body.sort = [{
  //   "data_resource_id": "asc"
  // }];
  
  return body;
};

queryGenerator.getDatasetsByDataresourceIdQuery = (dataresourceId) => {
  let dsl = {};
  dsl.match = {};
  dsl.match.data_resource_id = dataresourceId;

  let body = {
    size: 1000,
    from: 0
  };
  body.query = dsl;
  // body.sort = [{
  //   "dataset_id": "asc"
  // }];
  
  return body;
};

module.exports = queryGenerator;