const createTypeComposer = require('./createTypeComposer');
const commentSchema = require('./schemas/comment');
const { run, buildSchema } = require('./standAlone');

module.exports = {
  createTypeComposer,
  commentSchema,
  run,
  buildSchema
};
