/**
 * @param {T[]} arr
 * @returns {T}
 */
exports.last = function last(arr) {
  return arr[arr.length - 1];
}

/**
 * isString
 * @param {any} obj
 * @returns {boolean}
 */
exports.isString = function isString(obj) {
  return typeof obj === 'string';
}

/**
 * isFunction
 * @param {any} obj
 * @returns {boolean}
 */
exports.isFunction = function isFunction(obj) {
  return typeof obj === 'function';
}

/**
 * @param {string} path
 */
exports.isRemoteFile = (path) => /^https?:\/\//.test(path);
