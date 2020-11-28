const stringWidth = require('string-width');

const { GREEN, EOS, BOLD, CYAN_BRIGHT } = require('./constants/colors')
const { last, isString, isFunction } = require('./utils/lite-lodash')
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
    ['help', 'h', 'docs', '帮助', { default: false, help: 'Show this help information.' }],
    ['version', 'v', { default: false, help: 'Show the version information.' }],
  ]

  /**
   * @param {{ name: string; version: string; schema: [...string[], { default: any; }]; }} options
   */
  constructor({ name, version, schema = [] } = {}) {
    /**
     * @private
     * @type {Array<[...string[], { default: any; help: string; }]>}
     */
    this.schema = [...CLI.defaultSchema, ...schema];

    /**
     * @private
     * @type {{ _: string[]; help: boolean; version: boolean; }}
     */
    this.parsed = Object.create(null);

    /**
     * @private
     * @type {Array<{ name: string; help: string; usage: string; execute: (options: IParsedOptions) => any }>}
     */
    this.commands = [];

    const packageInfo = { name, version };

    /**
     * @private
     */
    this.pkg = packageInfo;

    /**
     * @private
     */
    this.pkgInfo = '';

    /**
     * @private
     */
    this.versionTips = '';

    /**
     * @private
     */
    this.usageTips = '';

    this
      .setUsageTips(packageInfo)
      .setVersion(packageInfo);
  }

  /**
   * set package.json
   *
   * @public
   *
   * @param {{ name: string; version: string }} packageInfo
   * @returns {CLI}
   */
  package(packageInfo) {
    const pkg = { ...this.pkg, ...packageInfo }

    this.pkg = pkg;
    this.setVersion(pkg);
    this.setUsageTips(pkg)

    return this;
  }

  /**
   * @private
   *
   * @param {{ name: string }}
   * @returns {CLI}
   */
  setUsageTips({ name }) {
    this.usageTips = name ? `${name} [OPTIONS]` : '';

    return this;
  }

  /**
   * @private
   *
   * @param {{ name: string; version: string; description: string; }}
   * @returns {CLI}
   */
  setVersion({ name, version, description }) {
    const pkgVersion = name ? `${name}/${version || ''} ` : '';

    this.pkgInfo = pkgVersion + (description ? '\n\n' + `${CYAN_BRIGHT}${description}${EOS}` : '');
    this.versionTips = `${pkgVersion}${process.platform}-${process.arch} node-${process.version}`

    return this;
  }

  /**
   * set usage tips
   *
   * @public
   *
   * @param {string} tips
   * @returns {CLI}
   */
  usage(tips) {
    this.usageTips = tips;

    return this;
  }

  /**
   * @public
   *
   * @param {[...string[], { default?: unknown; help?: string; }]} schemaEntry
   * @returns {CLI}
   */
  option(...schemaEntry) {
    this.schema.push([...schemaEntry])

    return this;
  }

  /**
   * Add command.
   *
   * @public
   *
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
   * @public
   *
   * @param {string[]} argv
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
   *
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
   *
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
  showPkgInfo() {
    this.pkgInfo && console.log(this.pkgInfo)
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

    this.showPkgInfo();

    if (this.commands.length || this.usageTips) {
      console.log(`\n${BOLD}Usage${EOS}`);
      console.log(`  ${this.usageTips}`);

      this.showAllCommandUsageTips();
    }

    console.log('');
    this.printCommands();

    console.log('');
    this.printOptions();
    console.log('');
  }

  /**
   * @private
   */
  printCommands() {
    console.log(`${BOLD}Commands${EOS}`);

    printArrayNeatly(this.commands, ({ name, help, usage }) => ({
      key: name,
      value: help || usage,
    }));
  }

  /**
   * @private
   */
  printOptions() {
    console.log(`${BOLD}Options${EOS}`);

    printArrayNeatly(this.schema, (option) => {
      const [key, ...alias] = option.filter(isString);
      const { help } = last(option);

      const mergedOption = `--${key}${alias.length ? ', -' + alias.join(', -') : ''}`;

      return { key: mergedOption, value: help };
    });
  }

  /**
   * @private
   */
  showCommandUsageTips(cmd) {
    console.log(cmd.help);
    console.log();

    console.log(`${BOLD}Usage${EOS}`);
    console.log(' ', cmd.usage);

    console.log();
  }

  /**
   * @private
   */
  showAllCommandUsageTips() {
    const cmdTips = this.commands.map(({ name, usage }) => {
      return '  ' + (usage || `${this.pkg.name} ${name} [OPTIONS]`);
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

/**
 *
 * @param {string} str
 * @param {number} maxLength
 */
function padStr(str, maxLength) {
  return str.padEnd(maxLength, ' ')
}

/**
 * @param {Array<{ key: string; value: string }>} arr
 * @param {(obj: object) => { key: string; value: string; }} format
 * @returns {void}
 */
function printArrayNeatly(arr, format) {
  const formatted = typeof format === 'function' ? arr.map(format) : arr;

  padArray(formatted).forEach(({ key, value }) => {
    console.log(
      `  ${GREEN}${key}${EOS}    ${value}`,
    );
  })
}

/**
 * @param {Array<{ key: string; value: string }>} arr
 * @returns {Array<{ key: string; value: string }>} key padded arr
 */
function padArray(arr) {
  /**
   * @type {typeof arr}
   */
  let itemsWithOffset = [];
  let maxKey = '';
  let maxLength = 0;

  for (const { key, value } of arr) {
    const length = key.length;

    if (length > maxLength) {
      maxKey = key;
      maxLength = length;
    }

    itemsWithOffset.push({ key, value, offset: stringWidth(key) - length });
  }

  const maxOffset = stringWidth(maxKey) - maxKey.length;

  const padded = itemsWithOffset.map(({ value, key, offset }) => {
    // 防止 key 出现中文则右侧的提示无法对齐
    const paddingLength = maxOffset - offset;

    return {
      key: padStr(key, maxLength + paddingLength),

      value,
    }
  });

  return padded;
}
