const { CLI } = require('../src/CLI');

describe('CLI', () => {
  test('should parse as expected on minimal settings', () => {
    const actual = new CLI()
      .parse();

    const expected = new Map([
      ['help', false],
      ['version', false],
      ['rest', []],
    ]);

    expect(actual).toEqual(expected)
  });

  test('should parse as expected when fill schema with option method', () => {
    const actual = new CLI({ name: 'tinify-client', version: '2.0.0' })
      .option('key', { help: 'The Tinify key. Accessible at https://tinypng.com/developers.' })
      .option('src', { help: 'Image url or local image path to compress.' })
      .option('output', 'o', { help: 'The compressed image file path.' })
      .option('max-count', 'm', { defaultVal: 15, help: 'The max compressing turns. Default 15.' })
      .option('verbose', { defaultVal: false, help: 'Show more information about each compressing turn.' })
      .option('no-base64', { defaultVal: false, help: 'Not output the base64 of the compressed image. base64 encoded by default.' })

      .option('debug', { help: 'Show the parsed CLI params.' })

      .parse([
        'https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ',
        '--output=./alipay-logo-2.png',
        '--debug',
      ]);

    const expected = new Map([
      ['key', undefined],
      ['src', undefined],
      ['output', './alipay-logo-2.png'],
      ['max-count', 15],
      ['verbose', false],
      ['no-base64', false],
      ['debug', true],

      ['help', false],
      ['version', false],

      ['rest', ['https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ']],
    ]);

    expect(actual).toEqual(expected)
  });

  test('should parse as expected when fill schema directly in constructor', () => {
    const schema = [
      ['key', { help: 'The Tinify key. Accessible at https://tinypng.com/developers.' }],
      ['src', { help: 'Image url or local image path to compress.' }],
      ['output', 'o', { help: 'The compressed image file path.' }],
      ['max-count', 'm', { defaultVal: 15, help: 'The max compressing turns. Default 15.' }],
      ['verbose', { defaultVal: false, help: 'Show more information about each compressing turn.' }],
      ['no-base64', { defaultVal: false, help: 'Not output the base64 of the compressed image. base64 encoded by default.' }],
      ['debug', { help: 'Show the parsed CLI params.' }],
    ];

    const actual = new CLI({ name: 'cli-aid', version: '2.0.0', schema })
      .parse([
        'https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ',
        '--output=./alipay-logo-2.png',
        '--debug',
      ]);

    const expected = new Map([
      ['key', undefined],
      ['src', undefined],
      ['output', './alipay-logo-2.png'],
      ['max-count', 15],
      ['verbose', false],
      ['no-base64', false],
      ['debug', true],

      ['help', false],
      ['version', false],

      ['rest', ['https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ']],
    ]);

    expect(actual).toEqual(expected)
  });

  test('should show version tips as expected when name and version passed', () => {
    const cli = new CLI({ name: 'cli-aid', version: '2.0.0' })
    const actual = cli.parse();

    const expected = new Map([
      ['help', false],
      ['version', false],
      ['rest', []],
    ]);

    expect(actual).toEqual(expected)
    expect(cli.versionTips).toEqual(`cli-aid/2.0.0 ${process.platform}-${process.arch} node-${process.version}`)
  });

  test('should show version tips as expected when package.json passed', () => {
    const cli = new CLI()
      .package({ name: 'cli-aid', version: '2.0.0' });

    const actual = cli.parse();

    const expected = new Map([
      ['help', false],
      ['version', false],
      ['rest', []],
    ]);

    expect(actual).toEqual(expected)
    expect(cli.versionTips).toEqual(`cli-aid/2.0.0 ${process.platform}-${process.arch} node-${process.version}`)
  });

  test('should show version tips as expected when name and version not passed', () => {
    const cli = new CLI();
    const actual = cli.parse();

    const expected = new Map([
      ['help', false],
      ['version', false],
      ['rest', []],
    ]);

    expect(actual).toEqual(expected)
    expect(cli.versionTips).toEqual(`${process.platform}-${process.arch} node-${process.version}`)
  });

  test('should parse as expected on command set', () => {
    let actualOptions;

    const cli = new CLI()
      .command('base64', {
        usage: 'tinify-client-cli base64 IMG_URL_OR_LOCAL_IMG_PATH',
        help: 'output base64-encoded string of the input image',
      }, (options) => {
        // console.log('output base64 with options:', options);

        actualOptions = options;
      });

    const actual = cli.parse([ 'base64', 'https://example.com/example.png' ]);

    const expected = new Map([
      ['help', false],
      ['version', false],
      ['rest', ['base64', 'https://example.com/example.png']],
    ]);

    expect(actual).toEqual(expected);
    expect(actualOptions).toEqual(expected);
  });

  test('should not execute on unknown command passed', () => {
    let actualOptions = null;

    const cli = new CLI()
      .command('base64', {
        usage: 'tinify-client-cli base64 IMG_URL_OR_LOCAL_IMG_PATH',
        help: 'output base64-encoded string of the input image',
      }, (options) => {
        // console.log('output base64 with options:', options);

        actualOptions = options;
      });

    const actual = cli.parse([
      'base64xyz',
      'https://s.gravatar.com/avatar/438e8984d73c7da54916acb86fb5fb7c?size=100&default=retro',
    ]);

    // console.log('info:', actual);

    const expected = new Map([
      ['help', false],
      ['version', false],
      ['rest', [
        'base64xyz',
        'https://s.gravatar.com/avatar/438e8984d73c7da54916acb86fb5fb7c?size=100&default=retro',
      ]],
    ]);

    expect(actual).toEqual(expected);
    expect(actualOptions).toEqual(null);
  });
});
