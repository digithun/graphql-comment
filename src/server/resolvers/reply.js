const { GraphQLNonNull } = require('graphql');
const { Resolver } = require('graphql-compose');
const { GraphQLMongoID } = require('graphql-compose-mongoose');
const moment = require('moment');
const { getUserRefFromContext } = require('../helpers');

function createResolver({
  model,
  typeComposer,
}) {
  const resolver = new Resolver({
    name: 'reply',
    type: new GraphQLNonNull(typeComposer.getType()),
    args: {
      discussionRef: 'String',
      commentId: GraphQLMongoID,
      content: 'JSON!',
    },
    resolve: async ({ args, context }) => {
      let slugConcat = '';
      let fullSlugConcat = '';
      const authorRef = await getUserRefFromContext(context);
      if (args.commentId) {
        if (args.discussionRef) {
          throw new Error(`if commentId exists discussionRef should not exists`);
        }
        const comment = await model.findOne({_id: args.commentId});
        if (!comment) {
          throw new Error(`comment not exists`);
        }
        args.discussionRef = comment.discussionRef;
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
      return comment.save();
    }
  });
  return resolver;
}

module.exports = createResolver;
