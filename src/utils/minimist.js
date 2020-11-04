const { isRemoteFile, isString } = require('./lite-lodash');

/**
 * Parse argv as minimist does.
 * @param {string[]} argv
 * @param {{ duplicateArgumentsArray: boolean; }} options.duplicateArgumentsArray Should arguments be coerced into an array when duplicated:
 * -x 1 -x 2 => { _: [], x: [1, 2] }
 * https://www.npmjs.com/package/yargs-parser#duplicate-arguments-array
 * @returns {Record<string, any>}
 */
exports.minimist = (argv = [], { duplicateArgumentsArray = false } = {}) => {
  const parsed = argv
    // collect the args prefixed with '-' or '--' or '=' as cmd
    .filter(isCmdArg)
    .map(entry => {
      // console.log('entry:', entry);

      const splits = entry.match(/([^=]+)=?(.*)/);

      const key = splits[1].replace(/^-+/, '').trim();
      const val = splits[2].trim();

      // console.log({ key, val });

      return [key, toNumber(toBoolean(val))]
    })
    .reduce((acc, [key, val]) => {
      // if (acc[key] && duplicateArgumentsArray) {
      //   acc[key] = [acc[key], val]
      // }

      // acc[key] = val;

      return {
        ...acc,

        [key]: isDefined(acc[key]) && duplicateArgumentsArray ?
          [...arraify(acc[key]), val] :
          val,
      };
    }, Object.create(null));

  // collect the none-cmd args as rest
  parsed._ = argv.filter(not(isCmdArg));

  return parsed;
}

function toBoolean(val) {
  return val === '' ? true : val;
}

function toNumber(val) {
  // console.log('toNumber val:', val);
  if (isNumberString(val)) {
    return Number(val);
  }

  return val;
}

/**
 * @param {any} str
 */
function isNumberString(val) {
  if (!isString(val)) {
    return false;
  }

  if (Number.isNaN(Number(val))) {
    return false;
  }

  return true;
}

/**
 * @param {string} arg
 */
function isCmdArg(arg) {
  return arg.startsWith('-') || (!isRemoteFile(arg) && arg.includes('='));
}

function not(fn) {
  return (...args) => !fn(...args);
}

function isDefined(obj) {
  return !isUndefined(obj);
}

function isUndefined(obj) {
  return typeof obj === 'undefined';
}

function arraify(obj) {
  return Array.isArray(obj) ? obj : [obj];
}
