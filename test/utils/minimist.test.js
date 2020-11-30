const { parseUsage } = require('../../src/utils/minimist');

describe('minimist', () => {
  describe('parseUsage', () => {
    it('should extract one required field', () => {
      const input = 'tinify set-key <key>';
      const actual = parseUsage(input, ['set-key']);

      /** @type {typeof actual} */
      const expected = {
        requiredFields: ['key'],
        requiredValues: { key: undefined },
        missingFields: ['key']
      };

      expect(actual).toEqual(expected);
    });

    it('should extract one required field which is normalized', () => {
      const input = 'tinify <filename> [mode] <imgs...>';
      const actual = parseUsage(input, []);

      /** @type {typeof actual} */
      const expected = {
        requiredFields: ['filename', 'imgs'],
        requiredValues: { filename: undefined, imgs: [] },
        missingFields: [ 'filename', 'imgs' ]
      };

      expect(actual).toEqual(expected);
    });

    it('should extract one required rest field which is normalized', () => {
      const input = 'tinify <imgs...>';
      const actual = parseUsage(input, ['1.png', '2.png']);

      /** @type {typeof actual} */
      const expected = {
        requiredFields: ['imgs'],
        requiredValues: { imgs: ['1.png', '2.png'] },
        missingFields: []
      };

      expect(actual).toEqual(expected);
    });

    it('should extract one required rest field and other normal field', () => {
      const input = 'tinify <filename> <imgs...>';
      const actual = parseUsage(input, ['a.txt', '1.png', '2.png']);

      /** @type {typeof actual} */
      const expected = {
        requiredFields: ['filename', 'imgs'],
        requiredValues: { filename: 'a.txt', imgs: ['1.png', '2.png'] },
        missingFields: []
      };

      expect(actual).toEqual(expected);
    });

    it('should extract multiple required fields', () => {
      const input = 'tinify set-key <key> <mode> <location>';
      const actual = parseUsage(input, ['set-key']);

      /** @type {typeof actual} */
      const expected = {
        requiredFields: ['key', 'mode', 'location'],
        requiredValues: { key: undefined, mode: undefined, location: undefined },
        missingFields: ['key', 'mode', 'location']
      };

      expect(actual).toEqual(expected);
    });

    it('should extract multiple required fields with values', () => {
      const input = 'tinify set-key <key> <mode> <location>';
      const actual = parseUsage(input, [ 'set-key', 'secret_key', 'TEMP', '~/.zshrc' ]);

      /** @type {typeof actual} */
      const expected = {
        requiredFields: ['key', 'mode', 'location'],
        requiredValues: { key: 'secret_key', mode: 'TEMP', location: '~/.zshrc' },
        missingFields: []
      };

      expect(actual).toEqual(expected);
    });

    it('should extract multiple required fields with a field missing', () => {
      const input = 'tinify set-key <key> <mode> <location>';
      const actual = parseUsage(input, [ 'set-key', 'secret_key', 'TEMP' ]);

      /** @type {typeof actual} */
      const expected = {
        requiredFields: ['key', 'mode', 'location'],
        requiredValues: { key: 'secret_key', mode: 'TEMP', location: undefined },
        missingFields: ['location']
      };

      expect(actual).toEqual(expected);
    });

    it('should extract zero required field', () => {
      const input = 'jest <specs...>';
      const actual = parseUsage(input, []);

      /** @type {typeof actual} */
      const expected = {
        requiredFields: ['specs'],
        requiredValues: { specs: [] },
        missingFields: ['specs']
      };

      expect(actual).toEqual(expected);
    });
  });
});
