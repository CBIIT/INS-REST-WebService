const { query } = require("winston");
const config = require("../Config");
const { values } = require("lodash");
const DATASET_FIELDS = [
  // 'dataset_uuid',
  'dataset_title',
  'description',
  // 'dataset_maximum_age_at_baseline',
  // 'dataset_minimum_age_at_baseline',
  'dataset_source_id',
  'dataset_source_repo',
  'dataset_source_url',
  // 'dataset_year_enrollment_ended',
  // 'dataset_year_enrollment_started',
  'PI_name',
  // 'GPA',
  'dataset_doc',
  'dataset_pmid',
  'funding_source',
  // 'release_date',
  'limitations_for_reuse',
  'assay_method',
  'study_type',
  'primary_disease',
  // 'participant_count',
  // 'sample_count',
  'study_links',
  'related_genes',
  'related_diseases',
  'related_terms',
];

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
  agg.myAgg.terms.field = "dbGaP_phs";
  agg.myAgg.terms.size = 1000;

  // body.aggs = agg;
  return body;
};

queryGenerator.getFiltersClause = (filters) => {
  // Ignore filters with no values selected
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([field, values]) => values.length > 0)
  );

  // If no filters, then return null
  if (Object.entries(cleanedFilters).length <= 0) {
    return null;
  }

  const clause = {
    'bool': {
      'must': Object.entries(cleanedFilters).map(([field, values]) => ({
        'terms': {
          [field]: values
        }
      }))
    }
  };

  return clause;
}

queryGenerator.getTextSearchClause = (searchText) => {
  const clause = {
    'bool': {
      'should': []
    }
  };
  const strArr = searchText.trim().split(' ');
  const result = strArr.map(
    term => term.trim()
  ).filter(
    term => term.length > 2
  );
  const keywords = result.length === 0 ? '' : result.join(' ');

  // No search terms, so return null
  if (keywords == '') {
    return null;
  }

  const termArr = keywords.split(' ').map((t) => t.trim());
  const uniqueTermArr = termArr.filter((t, idx) => {
    return termArr.indexOf(t) === idx;
  });
  uniqueTermArr.filter((term) => term.trim() != '').forEach((term) => {
    let dsl = {};
    let searchTerm = term.trim();

    dsl.multi_match = {
      'query': searchTerm,
      'fields': DATASET_FIELDS.map((field) => `${field}.search`),
    };
    clause.bool.should.push(dsl);
  });

  return clause;
};

queryGenerator.getSearchQueryV2 = (searchText, filters, options) => {
  const body = {};
  const compoundQuery = {
    'bool': {
      'must': [],
    },
  };
  const filtersClause = queryGenerator.getFiltersClause(filters);
  const textSearchClause = queryGenerator.getTextSearchClause(searchText);

  if (options) {
    body.size = options.pageInfo.pageSize;
    body.from = (options.pageInfo.page - 1 ) * options.pageInfo.pageSize;
  }

  if (filtersClause != null) {
    compoundQuery.bool.must.push(filtersClause);
  }

  if (textSearchClause != null) {
    compoundQuery.bool.must.push(textSearchClause);
  }

  if (compoundQuery.bool.must.length > 0) {
    body.query = compoundQuery;
  }

  let agg = {};
  agg.myAgg = {};
  agg.myAgg.terms = {};
  agg.myAgg.terms.field = "dbGaP_phs";
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
      'dataset_uuid': { number_of_fragments: 0 },
      'dataset_title': { number_of_fragments: 0 },
      'description': { number_of_fragments: 0 },
      'dataset_source_id': { number_of_fragments: 0 },
      'dataset_source_repo': { number_of_fragments: 0 },
      'dataset_source_url': { number_of_fragments: 0 },
      'PI_name': { number_of_fragments: 0 },
      'GPA': { number_of_fragments: 0 },
      'dataset_doc': { number_of_fragments: 0 },
      'dataset_pmid': { number_of_fragments: 0 },
      'funding_source': { number_of_fragments: 0 },
      // 'release_date': { number_of_fragments: 0 },
      'limitations_for_reuse': { number_of_fragments: 0 },
      'assay_method': { number_of_fragments: 0 },
      'study_type': { number_of_fragments: 0 },
      'primary_disease': { number_of_fragments: 0 },
      // 'participant_count': { number_of_fragments: 0 },
      // 'sample_count': { number_of_fragments: 0 },
      'study_links': { number_of_fragments: 0 },
      'related_genes': { number_of_fragments: 0 },
      'related_diseases': { number_of_fragments: 0 },
      'related_terms': { number_of_fragments: 0 },
    },
  };
  return body;
};

/**
 * Generates a bucket aggregation query on dataset properties
 * @param {String} searchText The text to search for
 * @param {Object} searchFilters The filters to apply
 * @param {String} excludedField The field to exclude from the filters
 * @returns {Object} Opensearch query to retrieve filter counts
 */
queryGenerator.getDatasetFiltersQuery = (searchText, searchFilters, excludedField) => {
  // Borrow some of the search query
  const body = {};
  const compoundQuery = {
    'bool': {
      'must': [],
    },
  };
  const filtersClause = queryGenerator.getFiltersClause(Object.fromEntries(
    Object.entries(searchFilters).filter( // Remove excluded field from filters
      ([filterName]) => filterName != excludedField
    )
  ));
  const textSearchClause = queryGenerator.getTextSearchClause(searchText);

  if (filtersClause != null) {
    compoundQuery.bool.must.push(filtersClause);
  }

  if (textSearchClause != null) {
    compoundQuery.bool.must.push(textSearchClause);
  }

  if (compoundQuery.bool.must.length > 0) {
    body.query = compoundQuery;
  }

  // Customize search query
  body.aggs = {};
  body.size = 0;
  delete query.highlight;

  // Aggregate on the target field
  body.aggs[excludedField] = {
    'terms': {
      'field': excludedField,
      'order': {
        '_key': 'asc'
      },
      'size': 100000
    }
  };

  return body;
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