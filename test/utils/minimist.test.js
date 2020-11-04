const { minimist } = require('../../src/utils/minimist');

describe('minimist', () => {
  it('Should parse the same as substack/minimist when use = as separator', () => {
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

  it('Should arguments be coerced into an array when duplicated', () => {
    const argv = '-x=1 -x=2'.split(' ');

    const expected = {
      x: [1, 2],
      _: [],
    };

    const actual = minimist(argv, { duplicateArgumentsArray: true });

    expect(actual).toEqual(expected);
  });
});
