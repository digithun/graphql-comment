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
      const comment = await model.findOne({_id: args.commentId});
      if (!comment) {
        throw new Error(`comment not exists`);
      }
      await comment.delete();
      return comment.save();
    }
  });
  return resolver;
}

module.exports = createResolver;
