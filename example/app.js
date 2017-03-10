import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { createCommentContainer } from 'graphql-comment/src/react-native';
import { ApolloClient, ApolloProvider, createNetworkInterface } from 'react-apollo';

const client = new ApolloClient({
  networkInterface: createNetworkInterface({ uri: 'http://localhost:8080' }),
});

const Comment = createCommentContainer();

export default () => (
  <ApolloProvider client={client}>
    <Comment discussionRef="AAAAA"/>
  </ApolloProvider>
);
