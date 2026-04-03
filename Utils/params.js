/**
 * Gets an object parameter from an object
 * @param {Object} obj The object to get the parameter from
 * @param {String} propName The name of the parameter to get
 * @param {Object} defaultReturn The default value to return if there are problems
 * @returns {Object} The parameter value
 */
const getObjectParam = (obj, propName, defaultReturn = {}) => {
  let val;

  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return defaultReturn;
  }

  if (!obj[propName]) {
    return defaultReturn;
  }

  if (typeof obj[propName] !== 'object' || Array.isArray(obj[propName])) {
    return defaultReturn;
  }

  val = obj[propName];

  return val;
};

/**
 * Gets a string parameter from an object
 * @param {Object} obj The object to get the parameter from
 * @param {String} propName The name of the parameter to get
 * @param {String} defaultReturn The default value to return if there are problems
 * @returns {String} The parameter value
 */
const getStringParam = (obj, propName, defaultReturn = '') => {
  let val = '';

  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return defaultReturn;
  }

  if (!obj[propName]) {
    return defaultReturn;
  }

  if (typeof obj[propName] !== 'string') {
    return defaultReturn;
  }

  val = obj[propName].trim();

  return val;
};

module.exports = {
  getObjectParam,
  getStringParam,
};