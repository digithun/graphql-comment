const fetch = require('node-fetch');

function createNotifier(options) {
  return {
    notify: (payload) => {
      return fetch(options.url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };
}

const nopeNotifier = {
  notify: () => {},
};

module.exports = {
  createNotifier,
  nopeNotifier,
};
