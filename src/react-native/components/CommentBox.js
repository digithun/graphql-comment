import React from 'react';
import {
  Dimensions,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';

import { min, max } from '../../common/utils';
import { cleanText } from '../../common/mention';

import KeyboardAvoidingViewCustom from './KeyboardAvoidingViewCustom';
import MentionableTextInput from './MentionableTextInput';
import UserSearchable from './UserSearchable';

import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import withProps from 'recompose/withProps';
import lifecycle from 'recompose/lifecycle';
import compose from 'recompose/compose';

import debounce from 'lodash/debounce';

const { height, width } = Dimensions.get('window');

const lineHeight = 25;

const withUserSearch = compose(
  withState('searchingName', 'setSearchingName', null),
  withHandlers({
    onCursorChange: props => debounce(cursor => {
      const cleaned = cleanText(props.text);
      let name = '';
      let i;
      for (i = cursor - 1; i >= 0; i--) {
        if (cleaned[i] === undefined) {
          return;
        }
        if (cleaned[i] === '@') {
          break;
        }
        name = cleaned[i] + name;
      }
      if (i >= 0) {
        props.setSearchingName(name);
      }
      else {
        props.setSearchingName(null);
      }
    }, 100),
  }),
  withState('cursor', 'setCursor', 0),
  withProps(props => ({
    onSelectionChange: event => {
      props.setCursor(event.nativeEvent.selection.start);
      props.onCursorChange(event.nativeEvent.selection.start);
    },
  })),
  lifecycle({
    componentWillReceiveProps(nextProps) {
      if (this.props.text !== nextProps.text) {
        nextProps.onCursorChange(nextProps.cursor)
      }
    }
  }),
);

function CommentBox(props) {
  const lineCount = ((props.text || '').match(/\n/g) || []).length + 1;
  const textInputHeight = (lineCount * lineHeight);
  const keyboardHeight = min(max(textInputHeight, 35), 25 * 3);

  return (
    <KeyboardAvoidingViewCustom>
      <UserSearchable
        searchingName={props.searchingName}
        searcher={props.searcher}
      />
      <View style={{ flexDirection: 'row', width, padding: 5, borderTopWidth: 1, borderTopColor: '#C8C8D0', backgroundColor: '#FFFFFF' }}>
        <Image style={{ width: 30, height: 20, marginTop: 5, resizeMode: 'stretch' }} source={require('../img/icon-camera.png')} />
        <View style={{ marginLeft: 10, flexDirection: 'row', borderColor: '#CACBD2', borderWidth: 1, borderRadius: 5, height: keyboardHeight, width: width - 50 }}>
          <MentionableTextInput
            multiline={true}
            style={{ marginLeft: 10, height: keyboardHeight, flex: 1 }}
            onModelChange={props.onModelChange}
            onSelectionChange={props.onSelectionChange}
            model={props.text}
            placeholder="Write a comment..."
          />
          {
            props.text.length > 0 ?
              <TouchableOpacity style={{width: 30, paddingTop: 5}} onPress={props.onSendMessage}>
                <Image style={{ width: 20, height: 20, resizeMode: 'stretch' }} source={require('../img/icon-message.png')} />
              </TouchableOpacity> : null
          }
        </View>
      </View>
    </KeyboardAvoidingViewCustom>
  );
}

export default withUserSearch(CommentBox);
