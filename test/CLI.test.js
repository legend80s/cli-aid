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
      .option('key', { to: CLI.toString, help: 'The Tinify key. Accessible at https://tinypng.com/developers.' })
      .option('src', { to: CLI.toString, help: 'Image url or local image path to compress.' })
      .option('output', 'o', { to: CLI.toString, help: 'The compressed image file path.' })
      .option('max-count', 'm', { to: CLI.toNumber, defaultVal: 15, help: 'The max compressing turns. Default 15.' })
      .option('verbose', { to: CLI.toBoolean, defaultVal: false, help: 'Show more information about each compressing turn.' })
      .option('no-base64', { to: CLI.toBoolean, defaultVal: false, help: 'Not output the base64 of the compressed image. base64 encoded by default.' })

      .option('debug', { to: CLI.toBoolean, help: 'Show the parsed CLI params.' })

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
      ['key', { to: CLI.toString, help: 'The Tinify key. Accessible at https://tinypng.com/developers.' }],
      ['src', { to: CLI.toString, help: 'Image url or local image path to compress.' }],
      ['output', 'o', { to: CLI.toString, help: 'The compressed image file path.' }],
      ['max-count', 'm', { to: CLI.toNumber, defaultVal: 15, help: 'The max compressing turns. Default 15.' }],
      ['verbose', { to: CLI.toBoolean, defaultVal: false, help: 'Show more information about each compressing turn.' }],

      ['no-base64', { to: CLI.toBoolean, defaultVal: false, help: 'Not output the base64 of the compressed image. base64 encoded by default.' }],
      ['debug', { to: CLI.toBoolean, help: 'Show the parsed CLI params.' }],
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

  test('should show version tips as expected', () => {
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
});
