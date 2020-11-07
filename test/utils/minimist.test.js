const { minimist } = require('../../src/utils/minimist');

describe('minimist', () => {
  it('Should parse as substack/minimist when use `=` as separator', () => {
    const argv = '-x=2 -x=3 https://s.gravatar.com/avatar/438e8984d73c7da54916acb86fb5fb7c?size=100&default=retro -y=4 -n=5 -abc --beep=boop foo bar baz'.split(' ');

    const expected = {
      x: 3,
      y: 4,
      n: 5,
      abc: true,
      beep: 'boop',

      _: [
        'foo',
        'bar',
        'baz',
        'https://s.gravatar.com/avatar/438e8984d73c7da54916acb86fb5fb7c?size=100&default=retro',
      ]
    };

    const actual = minimist(argv);

    const { _: restExpected, ...othersExpected } = expected;
    const { _: restActual, ...othersActual } = actual;

    expect(restActual.sort()).toEqual(restExpected.sort());
    expect(othersActual).toEqual(othersExpected);
  });

  it('Should parse as yargs-parser when use `space` as separator', () => {
    const input = ['-x=1', '-y', 2, '--foo=3', '----foo=4', '-uvw=31', '--bar', 4, 'p=5', '--q=-x', '-----k=-x', '-z', '--two', '--baz====1'];
    const actual = minimist(input, { duplicateArgumentsArray: true });
    const expected = {
      x: 1,
      y: 2,
      foo: [3, 4],
      '--foo': 4,
      uvw: 31,
      bar: 4,
      q: '-x',

      '---k': '-x',
      k: '-x',
      z: true,
      two: true,
      baz: '===1',

      _: ['p=5'],
    };

    // console.log('actual:', actual);

    expect(actual).toEqual(expected);
  });

  it('Should arguments after `--` be collected into positional args', () => {
    const argv = 'hello -x 1 -x 2 world -- --for --bar=baz -a'.split(' ');

    const expected = {
      x: 2,
      _: [
        'hello',
        'world',

        '--for',
        '--bar=baz',
        '-a',
      ],
    };

    const actual = minimist(argv);

    // console.log('actual:', actual);

    const { _: restActual, ...othersActual } = actual;
    const { _: restExpected, ...othersExpected } = expected;

    expect(othersActual).toEqual(othersExpected);
    expect(restActual.sort()).toEqual(restExpected.sort());

    expect(actual).toEqual(expected);
  });

  it('Should arguments be coerced into an array when duplicated', () => {
    const argv = '-x=1 -x=2'.split(' ');

    const expected = {
      x: [1, 2],
      _: [],
    };

    const actual = minimist(argv, { duplicateArgumentsArray: true });

    expect(actual).toEqual(expected);
  });

  it('Should group the duplicate key with redundant hyphens', () => {
    const input = ['--foo=3', '--foo=3', '---foo=4', '---foo=4', '----foo=5', '----foo=5', '-----foo=6'];
    const actual = minimist(input, { duplicateArgumentsArray: true });
    const expected = {
      foo: [3, 3, 4, 4, 5, 5, 6],
      '-foo': [4, 4],
      '--foo': [5, 5],
      '---foo': 6,

      _: [],
    };

    // console.log('actual:', actual);

    expect(actual).toEqual(expected);
  });

  it('Should parse multiple beginning hyphens into two entry', () => {
    const input = ['-----k=-x'];
    const actual = minimist(input, { duplicateArgumentsArray: true });
    const expected = {
      '---k': '-x',
      k: '-x',

      _: [],
    };

    // console.log('actual:', actual);

    expect(actual).toEqual(expected);
  });

  it('Should parse the ending flag as boolean', () => {
    const input = ['--debug'];
    const actual = minimist(input, { duplicateArgumentsArray: true });
    const expected = {
      debug: true,

      _: [],
    };

    // console.log('actual:', actual);

    expect(actual).toEqual(expected);
  });
});
