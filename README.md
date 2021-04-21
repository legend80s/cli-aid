# cli-aid

> A Beautiful 💅 and Lightweight 🚀 CLI-App Factory.

<p>
  <a href="https://www.npmjs.com/package/cli-aid">
    <img src="https://img.shields.io/npm/v/cli-aid.svg" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/cli-aid">
    <img src="https://img.shields.io/npm/dm/cli-aid.svg" alt="npm downloads" />
  </a>
  <a href="https://packagephobia.now.sh/result?p=cli-aid" rel="nofollow">
    <img src="https://packagephobia.now.sh/badge?p=cli-aid" alt="Install Size">
  </a>
  <a href="https://github.com/legend80s/cli-aid/blob/main/test/CLI.test.js">
    <img src="https://badgen.net/badge/passed/jest/green" alt="jest" />
  </a>
</p>
- [x] ℹ️ show default help and version information
- [x] 🚀 option alias
- [x] 🗣 cmd inclusive options, can be optional or required

## Use

```js
const { CLI } = require('cli-aid');

new CLI()
  .package(pkg)
  .option('dry-run', {
    default: false,
    help: 'Does everything compress would do except actually compressing. Reports the details of what would have been compressed.',
  })
  .option('max-count', 'm', 'c', {
    default: 15,
    help: 'The max compressing turns. Default 15.',
  })
  .parse(process.argv.slice(2));
```

## Examples

cmd inclusive options

```js
.command('version', {
  usage: `${pkg.name} version`,
  help: `Print ${pkg.name} version.`,

  options: [
    ['verbose', 'v', { help: 'Show detailed information.' }],
  ],
})
```

### More Detailed Examples

```javascript
const { CLI } = require('cli-aid');

const pkg = {
  name: 'example-cli',
  version: '7.0.0',
  description: 'A example cli to show you the power of cli-aid.',
};

new CLI()
  .package(pkg)
  .option('dry-run', {
    default: false,
    help: 'Does everything compress would do except actually compressing. Reports the details of what would have been compressed.',
  })
  .option('max-count', 'm', 'c', {
    default: 15,
    help: 'The max compressing turns. Default 15.',
  })

  // with one field required and a verbose option
  .command('base64', {
    usage: 'tinify base64 <text>',
    help: 'Output base64-encoded string of the input text.',

    options: [
      ['verbose', 'v', { help: 'Show detailed information.' }],
    ],
  }, (options) => {
    const text = options.text;

    console.log('output base64 for text', `"${text}"`);
    console.log(Buffer.from(text).toString('base64'));

    if (options.verbose) {
      console.log();
      console.log('options:', options);
    }

    process.exit(0);
  })

  // with two fields required
  .command('set-key', {
    usage: 'tinify set-key <key> <mode>',
    help: 'Set the tinify key.',
  }, (options) => {
    console.log('set-key to', `"${options.key}"`, 'with mode', `"${options.mode}"`);
    console.log();
    console.log('options:', options);

    process.exit(0);
  })

  // customize your version
  .command('version', {
    usage: `${pkg.name} version`,
    help: `Print ${pkg.name} version.`,

    options: [
      ['verbose', 'v', { help: 'Show detailed information.' }],
    ],
  }, (options) => {
    let versionTips = `${pkg.name}@${pkg.version}`;

    if (options.verbose) {
      versionTips = `${pkg.name}@${pkg.version} ${process.platform}-${process.arch} node-${process.version}`
    }

    console.log(versionTips);

    process.exit(0);
  })

  .parse(process.argv.slice(2));
```

### Show help

```sh
node demo/example-cli.js help
```

```sh
example-cli/7.0.0

A example cli to show you the power of cli-aid.

Usage
  tinify <IMG_URL_OR_LOCAL_IMG_PATH...> [OPTIONS]
  example-cli help [commands]
  example-cli version
  tinify base64 <text>
  tinify set-key <key> <mode>

Commands
  help       Show this help information.
  version    Print example-cli version.
  base64     Output base64-encoded string of the input text.
  set-key    Set the tinify key.

Use "example-cli help <command>" for more information about a command.

Options
  --help, -h, -docs, -帮助    Show this help information.
  --version, -v               Show the version information.
  --dry-run                   Does everything compress would do except actually compressing. Reports the details of what would have been compressed.
  --max-count, -m, -c         The max compressing turns. Default 15.
  --verbose                   Show detailed information about the process of compressing.
```

### Required cmd options

```sh
node demo/example-cli.js help base64
```

```sh
Output base64-encoded string of the input text.

Usage
  tinify base64 <text>

Options
  --verbose, -v    Show detailed information.
```

```sh
node demo/example-cli.js base64
```

option in `<option>` is required

```sh
`text` required. Usage: tinify base64 <text>
```

READ more options in [CLI.test.js](https://github.com/legend80s/cli-aid/blob/main/test/CLI.test.js) and command in [demo/example-cli.js](https://github.com/legend80s/cli-aid/blob/main/demo/example-cli.js).

## TODO

- [x] cmd options
- [x] cmd help msg
