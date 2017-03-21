const mongoose = require('mongoose');
const { composeWithMongoose } = require('graphql-compose-mongoose');
const { composeWithConnection } = require('graphql-compose-connection');
const { compose, addResolver, addFilterArg, addResolverMiddleware, addFields } = require('graphql-compose-recompose');

const { denormalize, normalize } = require('../common/mention');

const resolvers = require('./resolvers');
const commentSchema = require('./schemas/comment');

const atSlugFilter = {
  name: 'atSlug',
  type: 'String',
  query: (query, value, resolveParams) => {
    if (!/^[\w|\/]*$/i.test(value)) {
      throw new Error('argument not valid');
    }
    query.slug = new RegExp(`^(${value})([a-zA-Z0-9]*)$`, 'g');
  },
};

const firstLevelSlugMiddleware = ({rp}, next) => {
  if (!rp.rawQuery) {
    rp.rawQuery = {};
  }
  if (!rp.rawQuery.slug) {
    rp.rawQuery.slug = new RegExp(`^([a-zA-Z0-9]*)$`, 'g');
  }
  next();
};

function createTypeComposer(options = {}) {
  let model = options.model || mongoose.model('Comment', commentSchema);
  let typeComposer = composeWithMongoose(model);

  typeComposer.removeResolver('connection');
  composeWithConnection(typeComposer,
    {
      findResolverName: 'findMany',
      countResolverName: 'count',
      sort: {
        CREATEDAT_DESC: {
          value: { createdAt: -1, _id: -1 },
          cursorFields: ['createdAt', '_id'],
          beforeCursorQuery: (rawQuery, cursorData, resolveParams) => {
            if (!rawQuery.createdAt) rawQuery.createdAt = {};
            if (!rawQuery._id) rawQuery._id = {};
            rawQuery.createdAt.$gt = new Date(cursorData.createdAt);
            rawQuery._id.$gt = cursorData._id;
          },
          afterCursorQuery: (rawQuery, cursorData, resolveParams) => {
            if (!rawQuery.createdAt) rawQuery.createdAt = {};
            if (!rawQuery._id) rawQuery._id = {};
            rawQuery.createdAt.$lt = new Date(cursorData.createdAt);
            rawQuery._id.$lt = cursorData._id;
          },
        }
      },
  });

  const withResolvers = compose(...Object.keys(resolvers).map(key => {
    const createResolver = resolvers[key];
    return addResolver(createResolver({ model, typeComposer }));
  }));

  typeComposer.removeField('content');

  typeComposer = compose(
    withResolvers,
    addFilterArg('findMany', atSlugFilter),
    addFilterArg('connection', atSlugFilter),
    addFilterArg('count', atSlugFilter),
    addResolverMiddleware('findMany', firstLevelSlugMiddleware),
    addResolverMiddleware('connection', firstLevelSlugMiddleware),
    addResolverMiddleware('count', firstLevelSlugMiddleware),
    addFields({
      content: {
        type: 'JSON!',
        resolve: async (source, args, context) => {
          if (!context.getNameFromRef) {
            return source.content;
          }
          let objArray = await Promise.all(denormalize(source.content).map(async obj => {
            if (obj.type === 'mention') {
              const name = await context.getNameFromRef(obj.id);
              return Object.assign({}, obj, {
                text: name,
              });
            }
            return obj;
          }));
          const content = normalize(objArray);
          if (content !== source.content) {
            source.content = content;
            await source.save();
          }
          return content;
        },
        projection: { content: true },
      },
      isOwner: {
        type: 'Boolean!',
        resolve: async (source, args, context) => {
          if (!context.getMyRef) {
            return false;
          }
          const ref = await context.getMyRef();
          return ref === source.authorRef;
        },
        projection: { authorRef: true },
      },
      likeCount: {
        type: 'Int!',
        resolve: source => 
          model.aggregate({ $match: { _id: source._id, likeRefs: { $ne: null } } })
          .append({ $project: { count: { $size: '$likeRefs' } } }).then(r => r[0] ? r[0].count : 0),
      },
      isLiked: {
        type: 'Boolean!',
        resolve: async (source, args, context) => {
          if (!context.getMyRef) {
            throw new Error('context.getMyRef not exists');
          }
          const ref = await context.getMyRef();
          const count = await model.count({ _id: source._id, likeRefs: { $in: [ref] } });
          return count > 0;
        },
      },
    })
  )(typeComposer);
  
  typeComposer.addRelation('comments', () => ({
    resolver: typeComposer.getResolver('findMany'),
    args: {
      filter: (source) => {
        return {
          atSlug: `${source.slug}/`,
        };
      },
    },
    projection: { slug: true },
  }));

  typeComposer.addRelation('commentCount', () => ({
    resolver: typeComposer.getResolver('count'),
    args: {
      filter: (source) => {
        return {
          atSlug: `${source.slug}/`,
        };
      },
    },
    projection: { slug: true },
  }));

  return typeComposer;
}

module.exports = createTypeComposer;
