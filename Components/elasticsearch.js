/**
 * Client for elasticsearch
 */
const { Client } = require("@elastic/elasticsearch");
//const { Client } = require("@opensearch-project/opensearch");
const logger = require("./logger");
const config = require("../Config");

const esClient = new Client({
    node: config.elasticsearch.host,
    requestTimeout: config.elasticsearch.requestTimeout
});

/*
const esClient = new Client({
  node: config.elasticsearch.host,
  requestTimeout: config.elasticsearch.requestTimeout
});
*/

const testConnection = async () => {
    const info = await esClient.ping();
    return info;
};

exports.testConnection = testConnection;

const searchPageWithScroll = async (searchIndex, scrollQuery) => {
  const requestedFrom = Math.max(0, scrollQuery.requestedFrom ?? 0);
  const requestedSize = Math.max(0, scrollQuery.requestedSize ?? 10);
  const scroll = scrollQuery.scroll ?? '2m';
  const batchSize = Math.max(1, Math.min(scrollQuery.scrollBatchSize ?? 1000, 10000));
  const body = {
    ...(scrollQuery.body ?? {}),
    from: 0,
    size: Math.max(1, Math.min((scrollQuery.body?.size ?? batchSize), batchSize)),
  };

  let scrollId;
  let firstResponse;
  let hits = [];
  let seen = 0;
  const pageHits = [];

  const takeFromBatch = (batch) => {
    for (const hit of batch) {
      if (seen >= requestedFrom && pageHits.length < requestedSize) {
        pageHits.push(hit);
      }
      seen += 1;
      if (pageHits.length >= requestedSize) {
        return;
      }
    }
  };

  try {
    const initial = await esClient.search({
      index: searchIndex,
      body,
      scroll,
    });
    firstResponse = initial.body;
    scrollId = firstResponse?._scroll_id;
    hits = firstResponse?.hits?.hits ?? [];

    takeFromBatch(hits);

    while (pageHits.length < requestedSize && hits.length > 0) {
      const next = await esClient.scroll({
        scroll_id: scrollId,
        scroll,
      });
      const nextBody = next.body;
      scrollId = nextBody?._scroll_id ?? scrollId;
      hits = nextBody?.hits?.hits ?? [];
      takeFromBatch(hits);
    }
  } finally {
    if (scrollId) {
      try {
        await esClient.clearScroll({ scroll_id: scrollId });
      } catch (e) {
        // Best-effort cleanup; ignore failures to clear scroll.
      }
    }
  }

  return {
    pageHits,
    total: firstResponse?.hits?.total,
    aggs: firstResponse?.aggregations,
  };
};

const search = async (searchIndex, query) => {
    if (query?.useScroll) {
      const { pageHits, total } = await searchPageWithScroll(searchIndex, query);
      return {
        total,
        hits: pageHits,
      };
    }

    const result = await esClient.search({
      index: searchIndex,
      body: query
    });
    return result.body.hits;
};

exports.search = search;

const searchWithAggregations = async (searchIndex, query) => {
  if (query?.useScroll) {
    const { pageHits, total, aggs } = await searchPageWithScroll(searchIndex, query);
    return {
      hits: {
        total,
        hits: pageHits,
      },
      aggs,
    };
  }

  const result = await esClient.search({
    index: searchIndex,
    body: query
  });
  return {hits: result.body.hits, aggs: result.body.aggregations};
};

exports.searchWithAggregations = searchWithAggregations;
/**
 * Retrieves the count of documents matching the query from Opensearch.
 *
 * @param {string} searchIndex - The name of the Opensearch index.
 * @param {Object} [query={}] - The query object for filtering documents.
 * @returns {Promise<number>} The count of matching documents.
 */

const count = async (searchIndex, query = {}) => {
  const result = await esClient.count({
    index: searchIndex,
    body: query
  });
  return result.body.count;
};

exports.count = count;
