const { isRemoteFile, isString } = require('./lite-lodash');

/**
 * Parse argv as minimist does.
 * @param {string[]} argv
 * @param {{ duplicateArgumentsArray: boolean; }} options.duplicateArgumentsArray Should arguments be coerced into an array when duplicated:
 * -x 1 -x 2 => { _: [], x: [1, 2] }
 * https://www.npmjs.com/package/yargs-parser#duplicate-arguments-array
 * @returns {Record<string, any>}
 */
exports.minimist1 = (argv = [], { duplicateArgumentsArray = false } = {}) => {
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
          [...toArray(acc[key]), val] :
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

function toArray(obj) {
  return Array.isArray(obj) ? obj : [obj];
}

exports.minimist = function parse(argv = [], { duplicateArgumentsArray = false } = {}) {
  const result = Object.create(null);

  result._ = [];

  for (let i = 0, step = 1; i < argv.length; i += step) {
    const entry = String(argv[i]);

    if (entry == '--') { result._.push(...argv.slice(i + 1)); break; }

    if (!entry.startsWith('-')) { result._.push(entry); step = 1; continue; }

    if (entry.includes('=')) {
      const idx = entry.indexOf('=');
      const key = normalizeKey(entry.slice(0, idx));

      const val = entry.slice(idx + 1)

      insert(result, key, val, { shouldGroupDuplicateArgs: duplicateArgumentsArray })

      step = 1;
      continue;
    }

    const next = String(argv[i + 1]);
    const key = normalizeKey(entry);
    const atEnd = i + 1 === argv.length;

    if (atEnd || next.startsWith('-')) {
      insert(result, key, true, { shouldGroupDuplicateArgs: duplicateArgumentsArray });

      step = 1;
      continue;
    }

    insert(result, key, next, { shouldGroupDuplicateArgs: duplicateArgumentsArray });

    step = 2;
  }

  return result;
}

function removeAllBeginningHyphens(key) {
  return key.replace(/^-+/, '');
}

function normalizeKey(key) {
  return key.replace(/^-{1,2}/, '');
}

function getValues(arr, key, newVal) {
  const originalVal = arr[key];

  return  [...toArray(originalVal), newVal]
}

function insert(result, key, newVal, { shouldGroupDuplicateArgs = false }) {
  const originalVal = result[key];
  const coercedNewVal = toNumber(toBoolean(newVal));

  // console.log({result, key, newVal, coercedNewVal});

  if (shouldGroupDuplicateArgs && originalVal !== undefined) {
    result[key] = getValues(result, key, coercedNewVal);
  } else {
    result[key] = coercedNewVal;
  }

  if (!key.startsWith('-')) {
    return;
  }

  const keyWithoutBeginningHyphens = removeAllBeginningHyphens(key);
  const originalValWithoutBeginningHyphens = result[keyWithoutBeginningHyphens];

  if (shouldGroupDuplicateArgs && originalValWithoutBeginningHyphens !== undefined) {
    result[keyWithoutBeginningHyphens] = getValues(result, keyWithoutBeginningHyphens, coercedNewVal);
  } else {
    result[keyWithoutBeginningHyphens] = coercedNewVal;
  }
}
