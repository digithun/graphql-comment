const { GraphQLNonNull } = require('graphql');
const { Resolver } = require('graphql-compose');
const { GraphQLMongoID } = require('graphql-compose-mongoose');

function createResolver({
  model,
  typeComposer,
  notifier,
}) {
  const resolver = new Resolver({
    name: 'unlike',
    type: new GraphQLNonNull(typeComposer.getType()),
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
      comment.likeRefs = comment.likeRefs.filter(likeRef => likeRef !== ref);
      notifier.notify({
        action: 'unlike',
        commendId: comment._id,
        userRef: ref,
        authorRef: comment.authorRef,
      });
      return comment.save();
    }
  });
  return resolver;
}

module.exports = createResolver;