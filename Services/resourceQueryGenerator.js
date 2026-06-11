const {
  RESOURCE_HIGHLIGHT_FIELDS,
  RESOURCE_IDENTIFIER_FIELD,
  RESOURCE_SEARCH_FIELDS,
} = require('../Utils/resourceFields.js');

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
          'resource_title',
          // "data_resource_name",
          // "resource_name",
          // "desc",
          // "primary_resource_scope",
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
  // Handle null or invalid parameter
  if (
    !filters ||
    typeof filters !== 'object' ||
    Array.isArray(filters)
  ) {
    return null;
  }

  // Ignore filters with no values selected
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([field, values]) => Array.isArray(values) && values.length > 0)
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
  const fieldsMap = RESOURCE_HIGHLIGHT_FIELDS.reduce((acc, field) => {
    acc[field] = { number_of_fragments: 0 };
    return acc;
  }, {});

  return {
    pre_tags: ["<b>"],
    post_tags: ["</b>"],
    fields: fieldsMap,
  };
};

queryGenerator.getSortClause = (options) => {
  // Handle null or wrong type
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return null;
  }

  // Check whether a sort object exists
  if (!options.sort || typeof options.sort !== 'object' || Array.isArray(options.sort)) {
    return null;
  }

  // Check whether the sort object has a 'k' and 'v' property
  if (!options.sort.k || !options.sort.v) {
    return null;
  }

  // Check whether the sort property and direction are strings
  if (typeof options.sort.k !== 'string' || typeof options.sort.v !== 'string') {
    return null;
  }

  // Return the sort clause
  return {
    [options.sort.k]: options.sort.v,
  };
};

queryGenerator.getTextSearchConditions = (searchText) => {
  // Handle null parameter
  if (!searchText || typeof searchText !== 'string') {
    return null;
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

  // Check again that actual search terms exist
  if (uniqueSearchTerms.length <= 0) {
    return null;
  }

  // Add a search condition for finding each term in any of the resource fields
  uniqueSearchTerms.forEach((term) => {
    const dsl = {
      'multi_match': {
        'query': term,
        'fields': RESOURCE_SEARCH_FIELDS,
      }
    };

    conditions.push(dsl);
  });

  return conditions;
};

/**
 * Constructs a search query for the resources index
 * @param {String} searchText The text to search for
 * @param {Object} filters The filters to apply
 * @param {Object} options Sort and pagination options
 * @param {Array} returnFields The fields to return
 * @returns {Object|null} The OpenSearch query body object, or a scroll request descriptor when deep pagination is required, or null if validation fails.
 */
queryGenerator.getSearchQueryV2 = (searchText, filters, options, returnFields) => {
  const MAX_RESULT_WINDOW = 10000;
  const DEFAULT_SCROLL_KEEPALIVE = '2m';

  const body = {
    from: 0,
    size: 10,
  };
  const compoundQuery = {
    'bool': {
    },
  };
  let filtersClause;
  let sortClause;
  let textSearchClause;

  // Check searchText type
  // Loose null equality treats undefined as null
  if (searchText != null && typeof searchText !== 'string') {
    return null;
  }

  // Check filters type
  if (filters != null && (typeof filters !== 'object' || Array.isArray(filters))) {
    return null;
  }

  // Check options type
  if (options != null && (typeof options !== 'object' || Array.isArray(options))) {
    return null;
  }

  // Check returnFields type and length
  if (!Array.isArray(returnFields) || returnFields.length <= 0) {
    return null;
  }

  filtersClause = queryGenerator.getFiltersClause(filters);
  textSearchClause = queryGenerator.getTextSearchConditions(searchText);

  body['_source'] = returnFields ?? false;

  // We already verified that options is the right type if it's not null
  // We must still verify that options is truthy
  if (options) {
    const pageSize = Number(options.pageInfo?.pageSize);
    if (Number.isFinite(pageSize) && pageSize > 0) {
      body.size = Math.trunc(pageSize);
    }

    const page = Number(options.pageInfo?.page);
    if (Number.isFinite(page) && page > 0) {
      body.from = body.size * (Math.trunc(page) - 1);
    }
  }

  sortClause = queryGenerator.getSortClause(options);

  if (sortClause != null) {
    body.sort = [sortClause];
  }

  if (filtersClause != null) {
    compoundQuery.bool['filter'] = filtersClause;
  }

  if (textSearchClause != null) {
    compoundQuery.bool.must = textSearchClause;
  }

  if (compoundQuery.bool.must?.length > 0 || compoundQuery.bool.filter) {
    body.query = compoundQuery;
  }

  body.highlight = queryGenerator.getHighlightClause();

  const requestedFrom = Number(body.from ?? 0);
  const requestedSize = Number(body.size ?? 10);
  const safeRequestedFrom = Number.isFinite(requestedFrom) ? requestedFrom : 0;
  const safeRequestedSize = Number.isFinite(requestedSize) ? requestedSize : 10;
  const needsScroll = (safeRequestedFrom + safeRequestedSize) > MAX_RESULT_WINDOW;

  if (!needsScroll) {
    return body;
  }

  // Scroll requests should not rely on `from`/deep pagination; we fetch batches and discard until offset.
  const scrollBody = {
    ...body,
    from: 0,
  };

  return {
    useScroll: true,
    scroll: DEFAULT_SCROLL_KEEPALIVE,
    requestedFrom: safeRequestedFrom,
    requestedSize: safeRequestedSize,
    body: scrollBody,
  };
};

/**
 * Generates a bucket aggregation query on resource properties
 * @param {String} searchText The text to search for
 * @param {Object} searchFilters The filters to apply
 * @param {String} excludedField The field to exclude from the filters
 * @returns {Object} Opensearch query to retrieve filter counts
 */
queryGenerator.getResourceFiltersQuery = (searchText, searchFilters, excludedField) => {
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
/**
 * Generates a count query for Opensearch using the same filters as getSearchQueryV2 and getResourceFiltersQuery.
 * @param {String} searchText The text to search for
 * @param {Object} searchFilters The filters to apply
 * @returns {Object} Opensearch count query
 */
queryGenerator.getResourceCountQuery = (searchText, searchFilters) => {
  const body = {};

  // Build the main compound query using existing query logic
  const compoundQuery = {
    'bool': {
      'must': [],
    },
  };

  const filtersClause = queryGenerator.getFiltersClause(searchFilters);
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

  return body;
};

queryGenerator.getResourceByIdQuery = (id) => {
  return {
    size: 1,
    from: 0,
    query: {
      term: {
        [RESOURCE_IDENTIFIER_FIELD]: id,
      },
    },
  };
};

module.exports = queryGenerator;