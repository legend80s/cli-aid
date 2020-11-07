const { CLI } = require('../src');
const pkg = {
  name: 'tinify-client',
  version: '4.3.0',
  description: 'A CLI to compress your images not only intelligently but also to the EXTREME!',
};

// console.log('process.argv.slice(2):', process.argv.slice(2));

new CLI()
  .package(pkg)
  .option('dry-run', { default: false, help: 'Does everything compress would do except actually compressing. Reports the details of what would have been compressed' })
  .option('max-count', 'm', 'c', { default: 15, help: 'The max compressing turns. Default 15.' })
  .command('base64', {
    usage: 'npx tinify-client base64 IMG_URL_OR_LOCAL_IMG_PATH',
    help: 'Output base64-encoded string of the input image.',
  }, (options) => {
    console.log('output base64 with options:', options);

    process.exit(0);
  })
  .parse(process.argv.slice(2));
