import React from 'react';
import {
  View,
  Text,
  ListView,
  StyleSheet,
} from 'react-native';

import compose from 'recompose/compose';
import withState from 'recompose/withState';
import lifecycle from 'recompose/lifecycle';

import { min } from '../../common/utils';

const ROW_HEIGHT = 32;

const styles = {
  container: props => ({
    flex: 1,
    height: min((props.users || []).length, 3) * ROW_HEIGHT,
    backgroundColor: 'red',
  }),
  rowContainer: {
    flex: 1,
    height: ROW_HEIGHT,
    backgroundColor: 'red',
    justifyContent: 'center',
  },
};

const withUserDS = withState('userDS', 'setUserDS', (props) => {
  const dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
  });
  return dataSource.cloneWithRows(!props.users ? [] : props.users);
});

const updateUserDS = lifecycle({
  componentWillReceiveProps(nextProps) {
    if (this.props.users !== nextProps.users) {
      this.props.setUserDS(this.props.userDS.cloneWithRows(!nextProps.users ? [] : nextProps.users));
    }
  },
});

function renderUser(user) {
  return (
    <View style={styles.rowContainer}>
      <Text> User </Text>
    </View>
  );
}

function UserSearchResult(props) {
  return (
    <ListView
      enableEmptySections={true}
      style={styles.container(props)}
      dataSource={props.userDS}
      renderRow={renderUser}
    />
  );
}

export default compose(
  withUserDS,
  updateUserDS,
)(UserSearchResult);
