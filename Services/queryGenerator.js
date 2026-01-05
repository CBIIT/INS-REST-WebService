const { query } = require("winston");
const config = require("../Config");
const { values } = require("lodash");
const { DATASET_SEARCH_FIELDS, DATASET_HIGHLIGHT_FIELDS } = require('../Utils/datasetFields.js');

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
  // Handle null parameter
  if (!filters) {
    return null;
  }

  // Ignore filters with no values selected
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([field, values]) => values.length > 0)
  );

  // If no filters, then return null
  if (Object.entries(cleanedFilters).length <= 0) {
    return null;
  }

  const clause = Object.entries(cleanedFilters).map(([field, values]) => ({
    'terms': {
      [field]: values
    }
  }));

  return clause;
}

queryGenerator.getHighlightClause = () => {
  const fieldsMap = DATASET_HIGHLIGHT_FIELDS.reduce((acc, field) => {
    acc[field] = { number_of_fragments: 0 };
    return acc;
  }, {});

  return {
    pre_tags: ["<b>"],
    post_tags: ["</b>"],
    fields: fieldsMap,
  };
};

queryGenerator.getTextSearchConditions = (searchText) => {
  // Handle null parameter
  if (!searchText) {
    return [];
  }

  const conditions = [];
  const searchTerms = searchText.trim().split(' ').map(
    term => term.trim()
  ).filter(
    term => term.length > 2
  );
  const uniqueSearchTerms = searchTerms.filter((term, idx) => {
    return searchTerms.indexOf(term) === idx;
  });

  // Add a search condition for finding each term in any of the dataset fields
  uniqueSearchTerms.forEach((term) => {
    const dsl = {
      'multi_match': {
        'query': term,
        'fields': DATASET_SEARCH_FIELDS,
      }
    };

    conditions.push(dsl);
  });

  return conditions;
};

queryGenerator.getSearchQueryV2 = (searchText, filters, options, returnFields) => {
  const body = {};
  const compoundQuery = {
    'bool': {
      'must': [],
    },
  };
  const filtersClause = queryGenerator.getFiltersClause(filters);
  const textSearchClause = queryGenerator.getTextSearchConditions(searchText);

  body['_source'] = returnFields && returnFields.length > 0 ? returnFields : false;

  if (options?.pageInfo?.pageSize) {
    body.size = options.pageInfo.pageSize;

    if (options.pageInfo.page) {
      body.from = body.size * (options.pageInfo.page - 1);
    }
  }

  if (filtersClause != null) {
    compoundQuery.bool['filter'] = filtersClause;
  }

  if (textSearchClause != null) {
    compoundQuery.bool.must = textSearchClause;
  }

  if (compoundQuery.bool.must.length > 0 || compoundQuery.bool.filter) {
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
    body.sort = []; // Initialize a list of sort clauses
    const sortClause = {};
    sortClause[options.sort.k] = options.sort.v; // In our API, "k" is the property name, and "v" is the direction
    body.sort.push(sortClause);
  }

  body.highlight = queryGenerator.getHighlightClause();

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
  const textSearchClause = queryGenerator.getTextSearchConditions(searchText);

  if (filtersClause != null) {
    compoundQuery.bool['filter'] = filtersClause;
  }

  if (textSearchClause != null) {
    compoundQuery.bool.must = textSearchClause;
  }

  if (compoundQuery.bool.must.length > 0 || compoundQuery.bool.filter) {
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