const { CLI } = require('../src/CLI');

const defaults = {
  help: false,
  version: false,
  _: [],
}

describe('CLI', () => {
  test('should parse as expected on minimal settings', () => {
    const actual = new CLI()
      .parse();

    const expected = defaults;

    expect(actual).toEqual(expected)
  });

  test('should parse as expected when fill schema with option method', () => {
    const actual = new CLI({ name: 'tinify-client', version: '2.0.0' })
      .option('key', { help: 'The Tinify key. Accessible at https://tinypng.com/developers.' })
      .option('src', { help: 'Image url or local image path to compress.' })
      .option('output', 'o', { help: 'The compressed image file path.' })
      .option('max-count', 'm', { default: 15, help: 'The max compressing turns. Default 15.' })
      .option('verbose', { default: false, help: 'Show more information about each compressing turn.' })
      .option('no-base64', { default: false, help: 'Not output the base64 of the compressed image. base64 encoded by default.' })

      .option('debug', { help: 'Show the parsed CLI params.' })

      .parse([
        'https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ',
        '--output=./alipay-logo-2.png',
        '--debug',
      ]);

    const expected = mapToObject(new Map([
      ['key', undefined],
      ['src', undefined],
      ['output', './alipay-logo-2.png'],
      ['max-count', 15],
      ['verbose', false],
      ['no-base64', false],
      ['debug', true],

      ['help', false],
      ['version', false],

      ['_', ['https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ']],
    ]));

    expect(actual).toEqual(expected)
  });

  test('should parse boolean val as expected', () => {
    const actual = new CLI({ name: 'tinify-client', version: '2.0.0' })
      .option('in-place', 'i', { default: false, help: 'Overwrite the original image. Default false' })

      .parse([
        'https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ',
        '--in-place=true'
      ]);

    const expected = mapToObject(new Map([
      ['in-place', true],

      ['help', false],
      ['version', false],

      ['_', ['https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ']],
    ]));

    expect(actual).toEqual(expected)
  });
  test('should parse val as string by default', () => {
    const actual = new CLI({ name: 'tinify-client', version: '2.0.0' })
      .option('in-place', 'i', { help: 'Overwrite the original image. Default false' })

      .parse([
        'https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ',
        '--in-place=true'
      ]);

    const expected = mapToObject(new Map([
      ['in-place', 'true'],

      ['help', false],
      ['version', false],

      ['_', ['https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ']],
    ]));

    expect(actual).toEqual(expected)
  });
  test('should parse "true" as boolean', () => {
    const actual = new CLI({ name: 'tinify-client', version: '2.0.0' })
      .option('in-place', 'i', { default: false, help: 'Overwrite the original image. Default false' })

      .parse([
        'https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ',
        '--in-place=true'
      ]);

    const expected = mapToObject(new Map([
      ['in-place', true],

      ['help', false],
      ['version', false],

      ['_', ['https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ']],
    ]));

    expect(actual).toEqual(expected)
  });
  test('should parse "false" as false', () => {
    const actual = new CLI({ name: 'tinify-client', version: '2.0.0' })
      .option('in-place', 'i', { default: false, help: 'Overwrite the original image. Default false' })

      .parse([
        'https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ',
        '--in-place=false'
      ]);

    const expected = mapToObject(new Map([
      ['in-place', false],

      ['help', false],
      ['version', false],

      ['_', ['https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ']],
    ]));

    expect(actual).toEqual(expected)
  });
  test('should parse values not "true" as false', () => {
    const actual = new CLI({ name: 'tinify-client', version: '2.0.0' })
      .option('in-place', 'i', { default: false, help: 'Overwrite the original image. Default false' })

      .parse([
        'https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ',
        '--in-place=hello'
      ]);

    const expected = mapToObject(new Map([
      ['in-place', false],

      ['help', false],
      ['version', false],

      ['_', ['https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ']],
    ]));

    expect(actual).toEqual(expected)
  });

  test('should parse as expected when fill schema directly in constructor', () => {
    const schema = [
      ['key', { help: 'The Tinify key. Accessible at https://tinypng.com/developers.' }],
      ['src', { help: 'Image url or local image path to compress.' }],
      ['output', 'o', { help: 'The compressed image file path.' }],
      ['max-count', 'm', { default: 15, help: 'The max compressing turns. Default 15.' }],
      ['verbose', { default: false, help: 'Show more information about each compressing turn.' }],
      ['no-base64', { default: false, help: 'Not output the base64 of the compressed image. base64 encoded by default.' }],
      ['debug', { help: 'Show the parsed CLI params.' }],
    ];

    const actual = new CLI({ name: 'cli-aid', version: '2.0.0', schema })
      .parse([
        'https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ',
        '--output=./alipay-logo-2.png',
        '--debug',
      ]);

    const expected = mapToObject(new Map([
      ['key', undefined],
      ['src', undefined],
      ['output', './alipay-logo-2.png'],
      ['max-count', 15],
      ['verbose', false],
      ['no-base64', false],
      ['debug', true],

      ['help', false],
      ['version', false],

      ['_', ['https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ']],
    ]));

    expect(actual).toEqual(expected)
  });

  test('should show version tips as expected when name and version passed', () => {
    const cli = new CLI({ name: 'cli-aid', version: '2.0.0' })
    const actual = cli.parse();

    const expected = defaults;

    expect(actual).toEqual(expected)
    expect(cli.versionTips).toEqual(`cli-aid/2.0.0 ${process.platform}-${process.arch} node-${process.version}`)
  });

  test('should show version tips as expected when package.json passed', () => {
    const cli = new CLI()
      .package({ name: 'cli-aid', version: '2.0.0' });

    const actual = cli.parse();

    const expected = defaults;

    expect(actual).toEqual(expected)
    expect(cli.versionTips).toEqual(`cli-aid/2.0.0 ${process.platform}-${process.arch} node-${process.version}`)
  });

  test('should show version tips as expected when name and version not passed', () => {
    const cli = new CLI();
    const actual = cli.parse();

    const expected = defaults;

    expect(actual).toEqual(expected)
    expect(cli.versionTips).toEqual(`${process.platform}-${process.arch} node-${process.version}`)
  });

  test('should parse as expected on command set', () => {
    let actualCommandOptions;

    const cli = new CLI()
      .option('verbose')
      .command('base64', {
        usage: 'example-cli base64 IMG_URL_OR_LOCAL_IMG_PATH',
        help: 'output base64-encoded string of the input image',
      }, (options) => {
        // console.log('output base64 with options:', options);

        actualCommandOptions = options;
      });

    const actual = cli.parse([ 'base64', 'https://example.com/example.png' ]);

    const expected = {
      help: false,
      version: false,
      verbose: undefined,

      _: ['base64', 'https://example.com/example.png'],
    };

    expect(actual).toEqual(expected);

    expect(actualCommandOptions).toEqual({
      _: ['base64', 'https://example.com/example.png'],
    });
  });

  test('should not execute on unknown command passed', () => {
    let actualOptions = null;

    const cli = new CLI()
      .command('base64', {
        usage: 'example-cli base64 IMG_URL_OR_LOCAL_IMG_PATH',
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

    const expected = mapToObject(new Map([
      ['help', false],
      ['version', false],
      ['_', [
        'base64xyz',
        'https://s.gravatar.com/avatar/438e8984d73c7da54916acb86fb5fb7c?size=100&default=retro',
      ]],
    ]));

    expect(actual).toEqual(expected);
    expect(actualOptions).toEqual(null);
  });

  // ts config for minimist
  test('the value with same key should be joined into array', () => {
    const actual = new CLI({ name: 'tinify-client', version: '2.0.0' })
      .option('in-place', 'i', { default: false, help: 'Overwrite the original image. Default false' })
      .option('x', { help: 'Overwrite the original image. Default false' })

      .parse([
        'https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ',
        '--in-place=hello',
        '-x=1',
        '-x=2',
      ], { "duplicate-arguments-array": true });

    // console.log('actual:', actual);

    const expected = {
      'in-place': false,
      help: false,
      version: false,
      _: ['https://gw.alipayobjects.com/mdn/member_frontWeb/afts/img/A*h7o9Q4g2KiUAAAAAAAAAAABkARQnAQ'],

      x: [1, 2],
    };

    expect(actual).toEqual(expected)
  });
});

/**
 *
 * @param {Map<string, any>} map
 */
function mapToObject(map) {
  return [...map.entries()].reduce((acc, [k, v]) => ({
    ...acc,
    [k]: v,
  }), {});
}
