const { CLI } = require('../src');

new CLI({ name: 'tinify-client-cli', version: '2.0.0' })
  .option('max-count', 'm', { to: Number, defaultVal: 15, help: 'The max compressing turns. Default 15.' })
  .parse(process.argv.slice(2));
