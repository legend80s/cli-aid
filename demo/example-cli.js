const { CLI } = require('../src');

const pkg = {
  name: 'example-cli',
  version: '7.0.0',
  description: 'A example cli to show you the power of cli-aid.',
};

// console.log('process.argv.slice(2):', process.argv.slice(2));

const argv = new CLI()
  .settings({ unknownCommandAllowed: true })
  .package(pkg)
  .usage('tinify <IMG_URL_OR_LOCAL_IMG_PATH...> [OPTIONS]')
  .option('dry-run', {
    default: false,
    help: 'Does everything compress would do except actually compressing. Reports the details of what would have been compressed.',
  })
  .option('max-count', 'm', 'c', {
    default: 15,
    help: 'The max compressing turns. Default 15.',
  })
  .option('verbose', {
    default: false,
    help: 'Show detailed information about the process of compressing.',
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

    options: [
      [
        'verbose',
      ],
    ],
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

main(argv);

function main(argv) {
  console.log(
    'start compressing', argv._,
    'with max-count:', argv['max-count'],
    'and dry-run flag set to', argv['dry-run'],
    'and verbose flag set to', argv.verbose,
  );

  argv.verbose && console.log('\nargv:', argv);
}
