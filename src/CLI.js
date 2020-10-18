const { GREEN, EOS, BOLD } = require('./constants/colors')
const { last, isString, isFunction } = require('./utils/lite-lodash')

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
    ['version', 'v', { to: CLI.toBoolean, defaultVal: false, help: 'Show the version information.' }],
  ]

  /**
   * @param {{ name: string; version: string; schema: [...string[], { to: (obj: any) => any; defaultVal: any; }]; }} options
   */
  constructor({ name, version, schema = [] } = {}) {
    /** @type {Array<[...string[], { to: (obj: any) => any; defaultVal: any; help: string; }]>} */
    this.schema = [...CLI.defaultSchema, ...schema];

    /** @type {Map<string, string | number | boolean>} */
    this.parsed = new Map();

    /**
     * @type {Array<{ name: string; helpTips: string; execute: (options: IParsedOptions) => any }>}
     */
    this.commands = [];

    const packageInfo = { name, version };

    this.packageInfo = packageInfo;

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
    this.packageInfo = packageInfo;
    this.setVersion(packageInfo);

    return this;
  }

  /**
   * @private
   * @param {{ name: string }}
   * @returns {CLI}
   */
  setUsageTips({ name }) {
    this.usageTips = name ? `$ ${name} [OPTIONS]` : '';

    return this;
  }

  /**
   * @param {{ name: string; version: string; }}
   * @returns {CLI}
   */
  setVersion({ name, version }) {
    const pkgVersion = name ? `${name}/${version || ''} ` : '';

    this.pkgVersionTips = pkgVersion;
    this.versionTips = `${pkgVersion}${process.platform}-${process.arch} node-${process.version}`

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
   * Add command.
   * @param cmd
   * @param {{ help: string; usage: string; }} options
   * @param {(options: Map<string, string | number | boolean | string[]>) => void} execute
   */
  command(cmd = '', options, execute = () => {}) {
    if (!cmd || !isString(cmd)) {
      console.warn('`cmd` not a string, command won\'t be executed');

      return;
    }

    if (isFunction(options)) {
      execute = options;
    }

    const command = {
      name: cmd,
      execute,
    };

    if (typeof options === 'object' && options) {
      const { help = '', usage = '' } = options;

      command.help = help;
      command.usage = usage;
    }

    this.commands.push(command);

    return this;
  }

  /**
   * @param {string[]} argv
   * @returns {Map<string, string | number | boolean>}
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

    this.after(this.parsed);

    return this.parsed;
  }

  /**
   * @private
   * @param {Map<string, any>} parsed
   */
  after(parsed) {
    if (parsed.get('help')) {
      this.showHelp();

      process.exit(0);
    }

    if (parsed.get('version')) {
      this.showVersion();

      process.exit(0);
    }

    const cmd = this.commands.find(cmd => this.isCmdPassed(cmd))

    cmd && cmd.execute(parsed);

    return this;
  }

  /**
   * @private
   */
  isCmdPassed(cmd) {
    return this.parsed.get('rest').includes(cmd.name);
  }
  /**
   * @private
   */
  showPkgVersion() {
    this.pkgVersionTips && console.log(this.pkgVersionTips)
  }

  /**
   * @private
   */
  showHelp() {
    // console.log('this.commands:', this.commands);
    // console.log('this.parsed.get(rest):', this.parsed.get('rest'));

    const cmd = this.commands.find(cmd =>
      this.isCmdPassed(cmd)
    );

    // console.log('cmd:', cmd);

    if (cmd) {
      this.showCommandUsageTips(cmd)

      return;
    }

    this.showPkgVersion();

    if (this.commands.length || this.usageTips) {
      console.log(`\n${BOLD}USAGE${EOS}`);
      console.log(` ${this.usageTips}`);

      this.showAllCommandUsageTips();
    }

    console.log('');
    console.log(`${BOLD}OPTIONS${EOS}`);

    for (const option of this.schema) {
      const [key, ...alias] = option.filter(isString);
      const { help } = last(option);

      console.log(
        ` ${GREEN}--${key}${alias.length ? ', -' + alias.join(', -') + `${EOS}:` : `${EOS}:`}`,
        help,
      );
    }

    console.log('');
  }

  /**
   * @private
   */
  showCommandUsageTips(cmd) {
    console.log(cmd.help);
    console.log();

    console.log(`${BOLD}USAGE${EOS}`);
    console.log(' $', cmd.usage);

    console.log();
  }

  /**
   * @private
   */
  showAllCommandUsageTips() {
    const cmdTips = this.commands.map(({ name }) => {
      return ' $ ' + (`${this.packageInfo.name} ${name} --help`);
    }).join('\n');

    cmdTips && console.log(cmdTips);
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
