const { GraphQLNonNull } = require('graphql');
const { Resolver, InputTypeComposer } = require('graphql-compose');
const { GraphQLMongoID } = require('graphql-compose-mongoose');
const moment = require('moment');

function createResolver({
  model,
  typeComposer,
  notifier,
}) {
  const resolver = new Resolver({
    name: 'delete',
    type: new GraphQLNonNull(typeComposer.getType()),
    args: {
      commentId: GraphQLMongoID,
    },
    resolve: async ({ source, args, context }) => {
      if (!args.commentId) {
        throw new Error(`commentId is not defined`);
      }
      if (!context.getMyRef) {
        throw new Error('context.getMyRef not exists');
      }
      const ref = await context.getMyRef();
      const comment = await model.findOne({_id: args.commentId});
      if (!comment) {
        throw new Error(`comment not exists`);
      }
      if (ref !== comment.authorRef) {
        throw new Error(`is not owner comment`);
      }
      await comment.delete();
      return comment.save();
    }
  });
  return resolver;
}

module.exports = createResolver;
