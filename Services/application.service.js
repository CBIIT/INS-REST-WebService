const getSiteDataUpdate = async () => {
  // TODO: Return the site's latest data update date from the cache when available.
  // Otherwise, retrieve the "Site Data Update" value from the data source,
  // cache it using the site update date key and config.itemTTL, and return it.
  throw new Error("getSiteDataUpdate is not implemented");
};

const getWidgetUpdate = async () => {
  // TODO: Return cached widget updates when available. Otherwise, retrieve the
  // three most recent changelog entries, ordered by post date descending, with
  // their ID, log type, title, post date, content type, and description.
  // Cache nonempty results using the widget update key and config.itemTTL,
  // then return the entries.
  throw new Error("getWidgetUpdate is not implemented");
};

const getSiteUpdate = async (pageInfo) => {
  // TODO: Retrieve site changelog entries with log_type = 1, ordered by post
  // date descending. Paginate using the one-based pageInfo.page and pageInfo.pageSize.
  // Return each entry's ID, post date, content type, and title, mapping its
  // description to highlight and its details to description.
  throw new Error("getSiteUpdate is not implemented");
};

/**
 * Retrieves glossary terms by specified glossary term names
 * @param {string[]} termNames Array of names of glossary terms to search for
 * @returns {object} Map of glossary term names to glossary terms
 */
const getGlossaryTerms = async (termNames) => {
  // TODO: Retrieve glossary terms matching termNames, or all terms when the
  // array is empty, ordered by term name. Return an object mapping each term
  // name to its definition, or an empty object when no terms match.
  throw new Error("getGlossaryTerms is not implemented");
};

/**
 * Retrieves glossary terms whose names start with the specified letter
 * @param {string} firstLetter The letter that the term names should start with
 * @returns {object[]} Array of glossary terms
 */
const getGlossaryTermsByFirstLetter = async (firstLetter) => {
  // TODO: Validate that firstLetter is exactly one character, then retrieve
  // glossary terms beginning with it, ordered by term name. Include each term's
  // name, category, definition, and reference. Return an object keyed by
  // firstLetter containing the matching terms, or an empty array for no matches.
  throw new Error("getGlossaryTermsByFirstLetter is not implemented");
};

/**
 * Retrieves a list of all letters that glossary terms start with
 * @returns {string[]} List of letters
 */
const getFirstLettersInGlossary = async () => {
  // TODO: Return the cached glossary letter map when available. Otherwise,
  // retrieve the distinct uppercase first letters of glossary term names and
  // build an object mapping every letter A–Z to whether matching terms exist.
  // Cache the map using the glossary letters key and config.itemTTL, then return it.
  throw new Error("getFirstLettersInGlossary is not implemented");
};

module.exports = {
  getFirstLettersInGlossary,
  getGlossaryTerms,
  getGlossaryTermsByFirstLetter,
  getSiteDataUpdate,
  getSiteUpdate,
  getWidgetUpdate,
};
