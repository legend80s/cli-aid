const { GREEN, EOS, BOLD } = require('./constants/colors')
const { last, isString } = require('./utils/lite-lodash')

exports.CLI = class CLI {
  static toString = String
  static toBoolean = target => target === 'true' || target === ''
  static toNumber = Number

  static defaultTransformer = String

  /**
   * @type {Array<[...string[], { to: (obj: any) => any; defaultVal: any; help: string; }]>}
   */
  static defaultSchema = [
    ['help', 'h', 'docs', '文档', { to: CLI.toBoolean, defaultVal: false, help: 'Show this help information.' }],
    ['version', 'v', { to: CLI.toBoolean, defaultVal: false, help: 'Show the version information' }],
  ]

  /**
   * @param {{ name: string; version: string; schema: [...string[], { to: (obj: any) => any; defaultVal: any; }]; }} options
   */
  constructor({ name, version, schema = [] } = {}) {
    /** @type {Array<[...string[], { to: (obj: any) => any; defaultVal: any; help: string; }]>} */
    this.schema = [...CLI.defaultSchema, ...schema];

    this.parsed = new Map();

    const packageInfo = { name, version };

    this
      .setUsageTips(packageInfo)
      .setVersion(packageInfo);
  }

  /**
   * set package.json
   * @public
   * @param {{ name: string; version: string }} packageInfo
   * @returns {CLI}
   */
  package(packageInfo) {
    this.setVersion(packageInfo);

    return this;
  }

  /**
   * @private
   * @param {{ name: string }}
   * @returns {CLI}
   */
  setUsageTips({ name }) {
    this.usageTips = name ? `$ ${name}` : '';

    return this;
  }

  /**
   * @param {{ name: string; version: string; }}
   * @returns {CLI}
   */
  setVersion({ name, version }) {
    this.versionTips = (name ? `${name}/${version || ''} ` : '') +
      `${process.platform}-${process.arch} node-${process.version}`

    return this;
  }

  /**
   * set usage tips
   * @public
   * @param {string} tips
   * @returns {CLI}
   */
  usage(tips) {
    this.usageTips = tips;

    return this;
  }

  /**
   * @param {[...string[], { to: (obj: any) => any; defaultVal: any; }]} schemaEntry
   * @returns {CLI}
   */
  option(...schemaEntry) {
    this.schema.push([...schemaEntry])

    return this;
  }

  /**
   * @param {string[]} argv
   * @returns {Map<string, any>}
   */
  parse(argv = []) {
    const parsed = argv
      // collect the args prefixed with '-' or '--' or '=' as cmd
      .filter(isCmdArg)
      .map(entry => {
        const splits = entry.match(/([^=]+)=?(.*)/);

        const key = splits[1].replace(/^-+/, '').trim();
        const val = splits[2].trim();

        return [key, val]
      });

    const argEntries = this.parseAgainstSchema(parsed);

    // collect the none-cmd args as rest
    argEntries.push(['rest', argv.filter(not(isCmdArg))])

    this.parsed = new Map(argEntries);

    this.after(parsed);

    return this.parsed;
  }

  /**
   * @private
   */
  after() {
    if (this.parsed.get('help')) {
      this.showHelp();

      process.exit(0);
    }

    if (this.parsed.get('version')) {
      this.showVersion();

      process.exit(0);
    }

    return this;
  }

  /**
   * @private
   */
  showHelp() {
    if (this.usageTips) {
      console.log(`\n${BOLD}USAGE${EOS}`);
      console.log(` ${this.usageTips}`);
    }

    console.log('');
    console.log(`${BOLD}OPTIONS${EOS}`);

    for (const option of this.schema) {
      const [key, ...alias] = option.filter(isString);
      const { help } = last(option);

      console.log(
        ` -`,
        `${GREEN}${key}${alias.length ? ' [' + alias.join('|') + ']:' : ':'}${EOS}`,
        help,
      );
    }

    console.log('');
  }

  /**
   * @private
   */
  showVersion() {
    console.log(this.versionTips)
  }

  /**
   * @private
   * @param {Array<[key: string, val: string]>} argEntries
   */
  parseAgainstSchema(argEntries) {
    return this.schema.reduce((acc, option) => {
      const [_, val] = argEntries.find(([key]) => option.includes(key)) || [];

      const { to = CLI.defaultTransformer, defaultVal } = last(option);
      const [normalizedKey] = option;

      acc.push([ normalizedKey, typeof val === 'undefined' ? defaultVal : to(val) ]);

      return acc;
    }, []);
  }
}

/**
 * @param {string} arg
 */
function isCmdArg(arg) {
  return arg.startsWith('-') || arg.includes('=');
}

function not(fn) {
  return (...args) => !fn(...args);
}
