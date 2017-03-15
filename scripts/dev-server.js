const { run } = require('../src/server');

run({
  notifyActionInfo: {
    url: process.env.NOTI_URL || 'http://localhost:8888',
  },
});
