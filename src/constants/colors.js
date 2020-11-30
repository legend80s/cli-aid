const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const CYAN_BRIGHT = '\x1b[0;96m';

const BOLD = '\x1b[1m';

const EOS = '\x1b[0m';

module.exports = {
  chalk: {
    yellow: (...args) => {
      return `${YELLOW}${args.join(' ')}${EOS}`
    },

    red: (...args) => {
      return `${RED}${args.join(' ')}${EOS}`
    },
  },

  RED,
  GREEN,
  YELLOW,
  CYAN_BRIGHT,
  BOLD,

  EOS,
};
