const parse = require('process-yargs-parser');

exports.minimist = parse;

/**
 * @param {string} usage
 * @param {string[]} positionalArgs
 * @returns {{ requiredFields: string[]; requiredValues: Record<string, string>; missingFields: string[]; }}
 */
exports.parseUsage = (usage, positionalArgs) => {
  const requiredFields = parseRequiredFields(usage);

  // 'go   run  -v <f1> [f2]' => 1
  const cmdCount = getCommands(usage).length;

  const requiredValues = requiredFields.reduce((acc, field, index) => {
    const item = isRestField(field) ?
      { [normalize(field)]: positionalArgs.slice(index + cmdCount) } :
      { [field]: positionalArgs[index + cmdCount] };

    return Object.assign({}, acc, item);
  }, Object.create(null));

  const normalized = requiredFields.map(normalize);

  const missingFields = normalized
    .slice(positionalArgs.length - cmdCount)
    ;

  return {
    requiredFields: normalized,
    requiredValues,
    missingFields,
  };
};

function isRestField(field) {
  return /\.\.\.$/.test(field);
}

function normalize(field) {
  return field.replace(/\.\.\.$/, '');
}

/**
 *
 * @param {string} usage
 * @example
 * getCommands('tinify set-key <key> <mode> <location>')
 * // => ['set-key']
 *
 * getCommand('tinify <imgs...>')
 * // => []
 */
function getCommands(usage) {
  return usage.split(/[\-\<\[]/).shift().trim().split(/ +/).slice(1);
}

function parseRequiredFields(str = '') {
  if (!str) {
    return [];
  }

  let matches = [];
  const requiredRegExp = /<([^>]+?)>/g;

  let result;

  while (result = requiredRegExp.exec(str)) {
    matches.push(result[1]);
  }

  return matches;
}
