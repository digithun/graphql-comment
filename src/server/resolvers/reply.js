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
    name: 'reply',
    type: new GraphQLNonNull(typeComposer.getType()),
    args: {
      discussionRef: 'String!',
      commentId: GraphQLMongoID,
      content: 'JSON!',
    },
    resolve: async ({ source, args, context }) => {
      let slugConcat = '';
      let fullSlugConcat = '';
      const authorRef = await context.getMyRef();
      if (args.commentId) {
        const comment = await model.findOne({_id: args.commentId});
        if (!comment) {
          throw new Error(`comment not exists`);
        }
        slugConcat = comment.slug + '/';
        fullSlugConcat = comment.fullSlug + '/';
      }
      const comment = await model.create({
        discussionRef: args.discussionRef,
        slug: null,
        fullSlug: null,
        content: args.content,
        authorRef,
      });

      let slug = comment._id.toString();
      let timeStamp = moment().format('YYYY.MM.DD:hh:mm:ss');
      let fullSlug = `${timeStamp}:${slug}`;
      comment.slug = slugConcat + slug;
      comment.fullSlug = fullSlugConcat + fullSlug;
      notifier.notify({
        action: 'reply',
        discussionRef: args.discussionRef,
        commendId: comment._id.toString(),
        authorRef,
        content: args.content,
      });
      return comment.save();
    }
  });
  return resolver;
}

module.exports = createResolver;
