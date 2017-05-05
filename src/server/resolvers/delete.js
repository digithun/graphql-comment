const { GraphQLNonNull } = require('graphql');
const { Resolver } = require('graphql-compose');
const { GraphQLMongoID } = require('graphql-compose-mongoose');
const { getUserRefFromContext } = require('../helpers');

function createResolver({
  model,
  typeComposer,
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
      const ref = await getUserRefFromContext(context);
      if (!ref) {
        throw new Error('ref is null');
      }
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
