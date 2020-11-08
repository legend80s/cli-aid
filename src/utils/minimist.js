const { isString } = require('./lite-lodash');

/**
 * Parse argv as yargs-parser does.
 * @param {string[]} argv
 * 'duplicate-arguments-array' Should arguments be coerced into an array when duplicated:
 * -x 1 -x 2 => { _: [], x: [1, 2] }
 * https://www.npmjs.com/package/yargs-parser#duplicate-arguments-array
 * @returns {Record<string, string | number | boolean | any[]>}
 */
exports.minimist = function parse(
  argv = [],
  {
    'duplicate-arguments-array': duplicateArgumentsArray = false,
    'short-option-groups': shortOptionGroups = true,
  } = {},
) {
  const result = Object.create(null);

  result._ = [];

  // shallow copy not to make argv dirty by `args.splice`
  const args = [...argv];

  for (let i = 0, step = 1; i < args.length; i += step) {
    const entry = String(args[i]);

    if (entry == '--') {
      result._.push(...args.slice(i + 1));

      break;
    }

    if (shortOptionGroups && hasGroupedFlags(entry)) {
      const scattered = cutGroupedFlags(entry);

      args.splice(i, 1, ...scattered)

      step = 0;
      continue;
    }

    step = 1;

    if (!entry.startsWith('-')) {
      result._.push(entry);

      continue;
    }

    if (entry.includes('=')) {
      const idx = entry.indexOf('=');
      const key = normalizeKey(entry.slice(0, idx));

      const val = entry.slice(idx + 1)

      insert(result, key, val, { shouldGroupDuplicateArgs: duplicateArgumentsArray })

      continue;
    }

    const next = String(args[i + 1]);
    const key = normalizeKey(entry);
    const atEnd = i + 1 === args.length;

    if (atEnd || next.startsWith('-')) {
      insert(result, key, true, { shouldGroupDuplicateArgs: duplicateArgumentsArray });

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

  if (!shouldGroupDuplicateArgs || originalVal === undefined) {
    result[key] = coercedNewVal;
  } else {
    result[key] = getValues(result, key, coercedNewVal);
  }

  if (key[0] !== '-') {
    return;
  }

  key = removeAllBeginningHyphens(key);
  result[key];

  if (!shouldGroupDuplicateArgs || result[key] === undefined) {
    result[key] = coercedNewVal;
  } else {
    result[key] = getValues(result, key, coercedNewVal);
  }
}

/**
 *
 * @param arg
 *
 * @example
 * hasGroupedFlags('-xy') // => true
 * hasGroupedFlags('-xy=hello') // => true
 * hasGroupedFlags('-x=hello') // => false
 */
function hasGroupedFlags(arg) {
  return arg.length >= 3 && arg[0] === '-' && arg[1] !== '-' & arg[2] !== '=';
}

/**
 *
 * @param {string} arg
 * @example
 * cutGroupedFlags('-xy') // => -x -y
 * cutGroupedFlags('-xy=hello') // => -x -y hello
 */
function cutGroupedFlags(arg) {
  const [flagGroup, val] = arg.split('=');
  const scattered = flagGroup.slice(1).split('').map(arg => `-${arg}`);

  return val === undefined ? scattered : scattered.concat(val);
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

function toArray(obj) {
  return Array.isArray(obj) ? obj : [obj];
}
