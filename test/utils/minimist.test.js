const { minimist } = require('../../src/utils/minimist');

describe('minimist', () => {
  it('parse the same as substack/minimist when use = as separator', () => {
    const argv = '-x=3 https://s.gravatar.com/avatar/438e8984d73c7da54916acb86fb5fb7c?size=100&default=retro -y=4 -n=5 -abc --beep=boop foo bar baz'.split(' ');

    const expected = [
      ['x', 3],
      ['y', 4],
      ['n', 5],
      ['abc', true],
      ['beep', 'boop' ],
    ];

    expected.rest = [
      'foo',
      'bar',
      'baz',
      'https://s.gravatar.com/avatar/438e8984d73c7da54916acb86fb5fb7c?size=100&default=retro',
    ];

    const actual = minimist(argv);

    expect(new Map(actual)).toEqual(new Map(expected));
  });
});
