const { isRemoteFile, isString } = require('./lite-lodash');

/**
 * Parse argv as minimist does.
 * @param {string[]} argv
 */
exports.minimist = (argv = []) => {
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
    });

  // collect the none-cmd args as rest
  parsed.rest =  argv.filter(not(isCmdArg));

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
