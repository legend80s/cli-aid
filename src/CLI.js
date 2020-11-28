const stringWidth = require('string-width');

const { GREEN, EOS, BOLD, CYAN_BRIGHT, YELLOW, chalk } = require('./constants/colors')
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
  static DEFAULT_SCHEMA = [
    ['help', 'h', 'docs', '帮助', { default: false, help: 'Show this help information.' }],
    ['version', 'v', { default: false, help: 'Show the version information.' }],
  ]

  /**
   * @type {Array<{ name: string; help: string; usage: string; execute: (options: IParsedOptions) => any }>}
   */
  static DEFAULT_COMMANDS = [
    { name: 'help', help: 'Show this help information.' },
    { name: 'version', help: 'Print version.' },
  ]

  /**
   * @param {{ name: string; version: string; schema: [...string[], { default: any; }]; }} options
   */
  constructor({ name, version, schema = [] } = {}) {
    /**
     * @private
     * @type {Array<[...string[], { default: any; help: string; }]>}
     */
    this.schema = [...CLI.DEFAULT_SCHEMA, ...schema];

    /**
     * parsed options. cache for command options.
     * @private
     */
    this._minimist = {};

    /**
     * @private
     * @type {{ _: string[]; help: boolean; version: boolean; }}
     */
    this.parsed = Object.create(null);

    /**
     * @private
     */
    this.commands = [...CLI.DEFAULT_COMMANDS];

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
    this.schema.push([...schemaEntry]);

    return this;
  }

  /**
   * Add command.
   *
   * @public
   *
   * @param {string} cmd
   * @param {{ help: string; usage: string; options: Array<[...string[], { default?: unknown; help?: string; }]> }} settings
   * @param {(options: Record<string, any>) => void} execute
   */
  command(cmd = '', settings, execute) {
    // console.log({ cmd, options, execute });

    if (!isString(cmd)) {
      console.warn(chalk.yellow(
        'Register command failed: the first param must be a string as it is a command name,',
        'but', typeof cmd, 'passed.',
        'command ignored',
      ));

      return this;
    }

    if (isFunction(settings)) {
      execute = settings;
    }

    const command = {
      name: cmd,
      execute,
    };

    if (!isFunction(command.execute)) {
      console.warn(chalk.yellow(
        `Register command \`${command.name}\` failed: the last param must be a function,`,
        'but', typeof command.execute, 'passed.',
        'command',
        `\`${command.name}\``,
        'ignored.',
      ));

      return this;
    }

    if (typeof settings === 'object' && settings) {
      const { help = '', usage = '', options = [] } = settings;

      command.help = help;
      command.usage = usage;
      command.schema = options;
    }

    const idx = this.commands.findIndex(({ name }) => name === command.name);

    // console.log('register command:', command, 'idx', idx);

    if (idx !== -1) {
      this.commands.splice(idx, 1, command)
    } else {
      this.commands.push(command);
    }

    // console.log('this.commands:', this.commands);

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
    const argEntries = this.parseAgainstSchema(parsed, this.schema);

    // console.log('argEntries:', argEntries);

    this._minimist = parsed;

    this.parsed = Object.create(null);

    Object.assign(this.parsed, {
      ...argEntries,
      _: parsed._,
    });

    this.after(this.parsed);

    return this.parsed;
  }

  /**
   * @private
   * @param {typeof this.schema} schema
   * @param {Record<string, string | boolean | number | any[]>} parsedEntries
   */
  parseAgainstSchema(parsedEntries, schema) {
    return schema.reduce((acc, option) => {
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
   * @param {{ help: boolean; version: boolean;, _: string[] }} parsed
   */
  after(parsed) {
    // console.log('parsed:', parsed, '\nthis._minimist', this._minimist);

    const cmdName = parsed._[0];
    const cmd = this.commands.find(({ name }) => name === cmdName);

    if (cmd && cmd.execute) {
      const argEntries = this.parseAgainstSchema(this._minimist, cmd.schema);

      const commandParsedOptions = {
        ...argEntries,
        _: this._minimist._,
      };

      cmd.execute(commandParsedOptions)

      return this;
    }

    if (parsed.help || parsed._[0] === 'help') {
      this.showHelp();

      process.exit(0);
    }

    if (parsed.version || parsed._[0] === 'version') {
      this.showVersion();

      process.exit(0);
    }

    if (parsed._.length) {
      console.warn(chalk.yellow(
        `${this.pkg.name} ${cmdName}: unknown command`,
        `\nRun '${this.pkg.name} help' for usage.`,
      ));

      return this;
    }

    const notConfiguredFlag = Object.keys(this._minimist).find(key => !Object.keys(this.parsed).includes(key));

    console.warn(chalk.yellow(`flag provided but not defined: -${notConfiguredFlag}`));

    return this;
  }

  /**
   * if have cmd in argv
   * @private
   */
  hasCmd = (cmd) => {
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
    const commands = this.commands.filter(this.hasCmd);

    // case: cli-name help base64
    if (commands.length > 1) {
      // commands[0] is help
      // commands[1] is the target command
      this.showCommandHelp(commands[1] || cmd)

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
    this.printOptions(this.schema);
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

    console.log();

    console.log(`Use "${this.pkg.name} help <command>" for more information about a command.`);
  }

  /**
   * @private
   */
  printOptions(schema) {
    console.log(`${BOLD}Options${EOS}`);

    printArrayNeatly(schema, (option) => {
      const [key, ...alias] = option.filter(isString);
      const { help } = last(option);

      const mergedOption = `--${key}${alias.length ? ', -' + alias.join(', -') : ''}`;

      return { key: mergedOption, value: help };
    });
  }

  /**
   * @private
   */
  showCommandHelp(cmd) {
    console.log(cmd.help);
    console.log();
    console.log(`${BOLD}Usage${EOS}`);
    console.log(' ', cmd.usage);

    if (cmd.schema.length) {
      console.log('');
      this.printOptions(cmd.schema);
      console.log('');
    }
  }

  /**
   * @private
   */
  showAllCommandUsageTips() {
    const resolveOptions = (name) => {
      if (name === 'help') {
        return '<commands>';
      }

      if (name === 'version') {
        return '';
      }

      return '[OPTIONS]';
    };

    const cmdTips = this.commands.map(({ name, usage }) => {
      return '  ' + (usage || `${this.pkg.name} ${name} ` + resolveOptions(name) );
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
