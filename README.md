# cli-aid

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
  <a href="https://github.com/legend80s/cli-aid/blob/main/src/CLI.test.js">
    <img src="https://badgen.net/badge/passed/jest/green" alt="jest" />
  </a>
</p>

> Lightweight CLI-App maker with 0 dependencies 🚀.

## Use

[github demo](https://github.com/legend80s/cli-aid-demo).

```javascript
// index.js
const { CLI } = require('cli-aid');

new CLI({ name: 'tinify-client', version: '2.0.0' })
  .option('max-count', 'm', { to: CLI.toNumber, defaultVal: 15, help: 'The max compressing turns. Default 15.' })
  .parse();
```

`node index.js -h`

```
USAGE
 $ tinify-client

OPTIONS
 - help [h|docs|文档]: Show this help information.
 - version [v]: Show the version information.
 - max-count [m]: The max compressing turns. Default 15.
```

`node index.js -v`

```sh
tinify-client/2.0.0 darwin-x64 node-v12.8.1
```

READ more options in [CLI.test.js](https://github.com/legend80s/cli-aid/blob/main/test/CLI.test.js).
