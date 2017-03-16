const mongoose = require('mongoose');
const { composeWithMongoose } = require('graphql-compose-mongoose');
const { composeWithConnection } = require('graphql-compose-connection');
const resolvers = require('./resolvers');
const { createNotifier, nopeNotifier } = require('./notifier');

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

const firstLevelSlug = next => rp => {
  if (!rp.rawQuery) {
    rp.rawQuery = {};
  }
  rp.rawQuery.slug = new RegExp(`^([a-zA-Z0-9]*)$`, 'g');
  return next(rp);
};

function createTypeComposer(options = {}) {
  let model = options.model || mongoose.model('Comment', commentSchema);
  const typeComposer = composeWithMongoose(model);
  let notifier = nopeNotifier;
  if (options.notifyActionInfo) {
    notifier = createNotifier(options.notifyActionInfo);
  }

  const extendedFindManyResolver = typeComposer
    .getResolver('findMany')
    .addFilterArg(atSlugFilter)
    .wrapResolve(firstLevelSlug);
  
  extendedFindManyResolver.name = 'findMany';
  typeComposer.addResolver(extendedFindManyResolver);

  const extendedConnectionResolver = typeComposer
    .getResolver('connection')
    .addFilterArg(atSlugFilter)
    .wrapResolve(firstLevelSlug);
  
  extendedConnectionResolver.name = 'connection';
  typeComposer.addResolver(extendedConnectionResolver);

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

  const extendedCountResolver = typeComposer
    .getResolver('count')
    .addFilterArg(atSlugFilter)
    .wrapResolve(firstLevelSlug);
  
  extendedCountResolver.name = 'count';
  typeComposer.addResolver(extendedCountResolver);
  
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

  Object.keys(resolvers).forEach(key => {
    const createResolver = resolvers[key];
    typeComposer.addResolver(createResolver({ model, typeComposer, notifier }));
  });

  typeComposer.setField('isOwner', {
    type: 'Boolean!',
    resolve: async (source, args, context) => {
      if (!context.getMyRef) {
        return false;
      }
      const ref = await context.getMyRef();
      return ref === source.authorRef;
    },
    projection: { authorRef: true },
  });

  typeComposer.setField('likeCount', {
    type: 'Int!',
    resolve: source => 
      model.aggregate({ $match: { _id: source._id, likeRefs: { $ne: null } } })
      .append({ $project: { count: { $size: '$likeRefs' } } }).then(r => r[0] ? r[0].count : 0),
  });

  typeComposer.setField('isLiked', {
    type: 'Boolean!',
    resolve: async (source, args, context) => {
      if (!context.getMyRef) {
        throw new Error('context.getMyRef not exists');
      }
      const ref = await context.getMyRef();
      const count = await model.count({ _id: source._id, likeRefs: { $in: [ref] } });
      return count > 0;
    },
  });

  return typeComposer;
}

module.exports = createTypeComposer;
