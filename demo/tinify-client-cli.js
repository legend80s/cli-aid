const { CLI } = require('../src');

// console.log('process.argv.slice(2):', process.argv.slice(2));

new CLI({ name: 'tinify-client-cli', version: '2.0.0' })
  .option('max-count', 'm', { default: 15, help: 'The max compressing turns. Default 15.' })
  .option('in-place', 'i', { default: false, help: 'Overwrite the original image. Default false.' })
  .command('base64', {
    usage: 'tinify-client-cli base64 IMG_URL_OR_LOCAL_IMG_PATH',
    help: 'output base64-encoded string of the input image',
  }, (options) => {
    console.log('output base64 with options:', options);
  })
  .parse(process.argv.slice(2));
