# cli-aid

> Lightweight CLI-App Factory based on process-yargs-parser 🚀.

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

## Use

[github demo/tinify-client-cli.js](https://github.com/legend80s/cli-aid/blob/main/demo/tinify-client-cli.js).

```javascript
const { CLI } = require('../src');

const pkg = {
  name: 'tinify-client',
  version: '4.3.0',
  description: 'A CLI to compress your images not only intelligently but also to the EXTREME!',
};

new CLI()
  .package(pkg)
  .option('dry-run', { default: false, help: 'Does everything compress would do except actually compressing. Reports the details of what would have been compressed.' })
  .option('max-count', 'm', 'c', { default: 15, help: 'The max compressing turns. Default 15.' })
  .command('base64', {
    usage: 'npx tinify-client base64 IMG_URL_OR_LOCAL_IMG_PATH',
    help: 'Output base64-encoded string of the input image.',
  }, (options) => {
    console.log('output base64 with options:', options);

    process.exit(0);
  })
  .parse(process.argv.slice(2));

```

`node demo/tinify-client-cli.js --h`

```sh
tinify-client/4.3.0

A CLI to compress your images not only intelligently but also to the EXTREME!

Usage
  tinify-client [OPTIONS]
  npx tinify-client base64 IMG_URL_OR_LOCAL_IMG_PATH

Options
  --help, -h, -docs, -帮助    Show this help information.
  --version, -v               Show the version information.
  --dry-run                   Does everything compress would do except actually compressing. Reports the details of what would have been compressed.
  --max-count, -m, -c         The max compressing turns. Default 15.

```

`node demo/tinify-client-cli.js --v`

```sh
tinify-client-cli/2.0.0 darwin-x64 node-v12.8.1
```

READ more options in [CLI.test.js](https://github.com/legend80s/cli-aid/blob/main/test/CLI.test.js) and command in [demo/tinify-client-cli.js](https://github.com/legend80s/cli-aid/blob/main/demo/tinify-client-cli.js).

## TODO

- [ ] cmd options
- [ ] cmd help msg
