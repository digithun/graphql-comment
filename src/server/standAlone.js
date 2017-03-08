const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const { GQC } = require('graphql-compose');

const createTypeComposer = require('./createTypeComposer');

function buildSchema() {
  const commentTC = createTypeComposer();

  GQC.rootQuery().addFields({
    getComments: commentTC.get('$findMany'),
  });

  GQC.rootMutation().addFields({
    reply: commentTC.get('$reply'),
  });

  return GQC.buildSchema();
}

function run(options = {
  port: 8080,
  databaseUri: 'mongodb://localhost:27017/comment-standalone-dev',
  graphiql: true,
}) {
  const app = express();
  mongoose.connect(options.databaseUri);

  app.use('/', graphqlHTTP({
    schema: buildSchema(),
    graphiql: options.graphiql,
  }));

  return app.listen(options.port, () => console.log(`comment server is running on 0.0.0.0:${options.port}`));
}

module.exports = {
  run,
  buildSchema,
};
