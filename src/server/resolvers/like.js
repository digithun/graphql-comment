const { GraphQLNonNull } = require('graphql');
const { Resolver } = require('graphql-compose');
const { GraphQLMongoID } = require('graphql-compose-mongoose');

function createResolver({
  model,
  typeComposer,
}) {
  const resolver = new Resolver({
    name: 'like',
    type: typeComposer.getType(),
    args: {
      commentId: GraphQLMongoID,
    },
    resolve: async ({ source, args, context }) => {
      const comment = await model.findOne({_id: args.commentId});
      if (!comment) {
        throw new Error('comment not exists');
      }
      if (!context.getMyRef) {
        throw new Error('context.getMyRef not exists');
      }
      const ref = await context.getMyRef();
      if (!comment.likeRefs) {
        comment.likeRefs = [];
      }
      if (comment.likeRefs.indexOf(ref) !== -1) {
        return comment;
      }
      comment.likeRefs.push(ref);
      return comment.save();
    }
  });
  return resolver;
}

module.exports = createResolver;