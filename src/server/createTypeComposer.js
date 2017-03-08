const mongoose = require('mongoose');
const { composeWithMongoose } = require('graphql-compose-mongoose');
const resolvers = require('./resolvers');

const commentSchema = require('./schemas/comment');

function createTypeComposer(options = {}) {
  let model = options.model || mongoose.model('Comment', commentSchema);
  const typeComposer = composeWithMongoose(model);

  const extendedResolver = typeComposer
    .getResolver('findMany')
    .addFilterArg({
      name: 'atSlug',
      type: 'String',
      query: (query, value, resolveParams) => {
        query.slug = new RegExp(`^((${value})((?!/).*))$`, 'i');
      },
    });
  
  extendedResolver.name = 'findMany';
  typeComposer.addResolver(extendedResolver);

  Object.keys(resolvers).forEach(key => {
    const createResolver = resolvers[key];
    typeComposer.addResolver(createResolver({ model, typeComposer }));
  });

  return typeComposer;
}

module.exports = createTypeComposer;
