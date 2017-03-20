const { GraphQLNonNull } = require('graphql');
const { Resolver, InputTypeComposer } = require('graphql-compose');
const { GraphQLMongoID } = require('graphql-compose-mongoose');
const moment = require('moment');
const _ = require('lodash');

function normallizeContentAndMentions(content, mentions) {
  let newMentions = mentions.sort((m1, m2) => m2.startAt - m1.startAt)
  let newContent = content;
  newMentions.forEach(mention => {
    newContent = newContent.slice(0, mention.startAt) + '@' + newContent.slice(mention.startAt + mention.text.length);
  });
  let replacedLength = 0;
  return {
    content: newContent,
    mentions: newMentions.map(mention => {
      const position = mention.startAt - replacedLength;
      replacedLength += mention.text.length - 1;
      return {
        position,
        text: mention.text,
        userRef: mention.userRef,
      };
    }),
  };
}

function createResolver({
  model,
  typeComposer,
}) {
  const mentionITC = InputTypeComposer.create('MentionInputType');
  mentionITC.addFields({
    startAt: 'Int!',
    text: 'String!',
    userRef: 'String!',
  });
  const resolver = new Resolver({
    name: 'reply',
    type: new GraphQLNonNull(typeComposer.getType()),
    args: {
      discussionRef: 'String',
      commentId: GraphQLMongoID,
      content: 'JSON!',
      mentions: {
        type: [mentionITC.getType()],
        defaultValue: [],
      },
    },
    resolve: async ({ source, args, context }) => {
      let slugConcat = '';
      let fullSlugConcat = '';
      const authorRef = await context.getMyRef();
      if (args.commentId) {
        if (!!args.discussionRef) {
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

      const { content, mentions } = normallizeContentAndMentions(args.content, args.mentions);

      const comment = await model.create({
        discussionRef: args.discussionRef,
        slug: null,
        fullSlug: null,
        content,
        mentions,
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
