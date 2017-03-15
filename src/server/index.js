const createTypeComposer = require('./createTypeComposer');
const commentSchema = require('./schemas/comment');
const { run, buildSchema } = require('./devServer');

module.exports = {
  createTypeComposer,
  commentSchema,
  run,
  buildSchema
};
