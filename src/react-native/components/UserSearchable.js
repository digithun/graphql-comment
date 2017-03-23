import React from 'react';
import {
  View,
  Text,
  ListView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

import compose from 'recompose/compose';
import withState from 'recompose/withState';
import lifecycle from 'recompose/lifecycle';
import withHandlers from 'recompose/withHandlers';

import { min } from '../../common/utils';

const ROW_HEIGHT = 35;

const styles = {
  container: props => ({
    flex: 1,
    height: min((props.users || []).length, 3) * ROW_HEIGHT,
    backgroundColor: 'rgba(230, 230, 230, 1)',
  }),
  rowContainer: {
    flex: 1,
    height: ROW_HEIGHT,
    alignItems: 'center',
    flexDirection: 'row',
  },
  profilePicutre: {
    marginHorizontal: 10,
    width: 25,
    height: 25,
    borderRadius: 12.5,
  }
};

const withUserDS = withState('userDS', 'setUserDS', (props) => {
  const dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
  });
  return dataSource.cloneWithRows(!props.users ? [] : props.users);
});

const withSearch = compose(
  withState('curSearch', 'setCurSearch', null),
  withState('users', 'setUsers', []),
  lifecycle({
    componentWillReceiveProps(nextProps) {
      if (this.props.searchingName !== nextProps.searchingName) {
        this.props.setCurSearch(nextProps.searchingName);
        this.props.setUserDS(this.props.userDS.cloneWithRows([]));
        this.props.setUsers([]);
        if (nextProps.searchingName !== null && nextProps.searchingName.length) {
          this.props.searcher(nextProps.searchingName).then(users => {
            if (this.props.curSearch === nextProps.searchingName) {
              this.props.setUserDS(this.props.userDS.cloneWithRows(!users ? [] : users));
              this.props.setUsers(users);
            }
          });
        }
      }
    },
  }),
);


function UserSearchable(props) {
  function renderUser(user) {
    return (
      <TouchableOpacity style={styles.rowContainer} onPress={() => props.onPress && props.onPress(user)}>
        <Image style={styles.profilePicutre} source={user.profilePicture ? { uri: user.profilePicture } : null} />
        <Text>{user.name}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <ListView
      keyboardShouldPersistTaps={'always'}
      enableEmptySections={true}
      style={styles.container(props)}
      dataSource={props.userDS}
      renderRow={renderUser}
    />
  );
}

export default compose(
  withUserDS,
  withSearch,
)(UserSearchable);
