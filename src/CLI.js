const { GREEN, EOS, BOLD } = require('./constants/colors')
const { last, isString, isFunction, isRemoteFile } = require('./utils/lite-lodash')
const { minimist } = require('./utils/minimist')

exports.CLI = class CLI {
  static toString = String
  static toBoolean = target => target === true || target === 'true' || target === ''
  static toNumber = Number

  static defaultTransformer = String

  /**
   * @type {Array<[...string[], { default: any; help: string; }]>}
   */
  static defaultSchema = [
    ['help', 'h', 'docs', '文档', { default: false, help: 'Show this help information.' }],
    ['version', 'v', { default: false, help: 'Show the version information.' }],
  ]

  /**
   * @param {{ name: string; version: string; schema: [...string[], { default: any; }]; }} options
   */
  constructor({ name, version, schema = [] } = {}) {
    /** @type {Array<[...string[], { default: any; help: string; }]>} */
    this.schema = [...CLI.defaultSchema, ...schema];

    /**
     * @type {{ _: string[]; help: boolean; version: boolean; }}
     */
    this.parsed = Object.create(null);

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
   * @param {[...string[], { default?: unknown; help?: string; }]} schemaEntry
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
   * @param {(options: Record<string, any>) => void} execute
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
   * @param {{ duplicateArgumentsArray: boolean; }} config Should arguments be coerced into an array when duplicated:
   * @returns {Record<string, any>}
   */
  parse(argv = [], config) {
    const parsed = minimist(argv, config);
    const argEntries = this.parseAgainstSchema(parsed);

    // console.log('argEntries:', argEntries);

    this.parsed = {
      ...argEntries,
      _: parsed._,
    };

    this.after(this.parsed);

    return this.parsed;
  }

  /**
   * @private
   * @param {Record<string, string | boolean | number | any[]>} parsedEntries
   */
  parseAgainstSchema(parsedEntries) {
    return this.schema.reduce((acc, option) => {
      const key = Object.keys(parsedEntries).find(key => option.includes(key));
      const val = parsedEntries[key];

      const { default: defaultVal } = last(option);
      const [ normalizedKey ] = option;

      return {
        ...acc,

        [normalizedKey]: typeof val === 'undefined' ?
          defaultVal :
          ( typeof defaultVal === 'boolean' ? CLI.toBoolean(val) : val ),
      };
    }, Object.create(null));
  }

  /**
   * @private
   * @param {{ help: boolean; version: boolean; }} parsed
   */
  after(parsed) {
    if (parsed.help) {
      this.showHelp();

      process.exit(0);
    }

    if (parsed.version) {
      this.showVersion();

      process.exit(0);
    }

    const cmd = this.commands.find(cmd => this.hasCmd(cmd))

    cmd && cmd.execute(parsed);

    return this;
  }

  /**
   * if have cmd in argv
   * @private
   */
  hasCmd(cmd) {
    return this.parsed._.includes(cmd.name);
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
    const cmd = this.commands.find(cmd =>
      this.hasCmd(cmd)
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
}
