const reply = require('./reply');
const like = require('./like');
const unlike = require('./unlike');
const _delete = require('./delete');

module.exports = {
  reply,
  like,
  unlike,
  delete: _delete,
};
