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
  const batchSize = 10000;
  const body = {
    ...(scrollQuery.body ?? {}),
    from: 0,
    size: batchSize,
  };

  let scrollId;
  let firstResponse;
  let hits = [];
  let seen = 0;
  const pageHits = [];

  const takeFromBatch = (batch) => {
    if (!batch || batch.length <= 0 || pageHits.length >= requestedSize) {
      seen += batch?.length ?? 0;
      return;
    }

    const batchEnd = seen + batch.length;
    if (batchEnd <= requestedFrom) {
      // Skip entire batch before we reach the requested window.
      seen = batchEnd;
      return;
    }

    const startInBatch = Math.max(0, requestedFrom - seen);
    const remaining = requestedSize - pageHits.length;
    const endInBatch = Math.min(batch.length, startInBatch + remaining);

    if (endInBatch > startInBatch) {
      pageHits.push(...batch.slice(startInBatch, endInBatch));
    }

    // We've consumed this entire batch from the scroll stream.
    seen = batchEnd;
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
