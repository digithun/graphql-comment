const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const { GQC } = require('graphql-compose');

const createTypeComposer = require('./createTypeComposer');

function buildSchema(options) {
  const commentTC = createTypeComposer(options);

  GQC.rootQuery().addFields({
    comments: commentTC.getResolver('findMany'),
    commentConnection: commentTC.getResolver('connection'),
    count: commentTC.getResolver('count'),
  });

  GQC.rootMutation().addFields({
    reply: commentTC.getResolver('reply'),
    likeComment: commentTC.getResolver('like'),
    unlikeComment: commentTC.getResolver('unlike'),
  });

  return GQC.buildSchema();
}

const defaultOptions = {
  port: 8080,
  databaseUri: 'mongodb://localhost:27017/comment-standalone-dev',
  graphiql: true,
  notifyActionInfo: {
    url: 'http://localhost:8888',
  },
};

function run(options = {}) {
  options = Object.assign(defaultOptions, options);
  const app = express();
  mongoose.connect(options.databaseUri);

  app.use('/', graphqlHTTP({
    schema: buildSchema(options),
    graphiql: options.graphiql,
    context: {
      getMyRef: () => Promise.resolve('whoami'),
    },
  }));

  return app.listen(options.port, () => console.log(`comment server is running on 0.0.0.0:${options.port}`));
}

module.exports = {
  run,
  buildSchema,
};
