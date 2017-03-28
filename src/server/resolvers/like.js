const { Resolver } = require('graphql-compose');
const { GraphQLMongoID } = require('graphql-compose-mongoose');
const { getUserRefFromContext } = require('../helpers');

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
    resolve: async ({ args, context }) => {
      const comment = await model.findOne({_id: args.commentId});
      if (!comment) {
        throw new Error('comment not exists');
      }
      const ref = await getUserRefFromContext(context);
      if (!comment.likeRefs) {
        comment.likeRefs = [];
      }
      if (!ref) {
        return comment;
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