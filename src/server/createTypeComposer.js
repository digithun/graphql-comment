const mongoose = require('mongoose');
const { composeWithMongoose } = require('graphql-compose-mongoose');
const resolvers = require('./resolvers');

const commentSchema = require('./schemas/comment');

function createTypeComposer(options = {}) {
  let model = options.model || mongoose.model('Comment', commentSchema);
  const typeComposer = composeWithMongoose(model);

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

  const extendedFindManyResolver = typeComposer
    .getResolver('findMany')
    .addFilterArg(atSlugFilter);
  
  extendedFindManyResolver.name = 'findMany';
  typeComposer.addResolver(extendedFindManyResolver);

  const extendedConnectionResolver = typeComposer
    .getResolver('connection')
    .addFilterArg(atSlugFilter);
  
  extendedConnectionResolver.name = 'connection';
  typeComposer.addResolver(extendedConnectionResolver);

  const extendedCountResolver = typeComposer
    .getResolver('count')
    .addFilterArg(atSlugFilter);
  
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
    typeComposer.addResolver(createResolver({ model, typeComposer }));
  });

  return typeComposer;
}

module.exports = createTypeComposer;
