import React from 'react';
import {
  Dimensions,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';

import { min, max } from '../../common/utils';

import KeyboardAvoidingViewCustom from './KeyboardAvoidingViewCustom';
import MentionableTextInput from './MentionableTextInput';
import UserSearchResult from './UserSearchResult';

const { height, width } = Dimensions.get('window');

const lineHeight = 25;

function CommentBox(props) {
  const lineCount = ((props.text || '').match(/\n/g) || []).length + 1;
  const textInputHeight = (lineCount * lineHeight);
  const keyboardHeight = min(max(textInputHeight, 35), 25 * 3);

  return (
    <KeyboardAvoidingViewCustom>
      <UserSearchResult users={[{name: 'art', id: 1}, {name: 'art', id: 2}, {name: 'art', id: 3}, {name: 'art', id: 4}, {name: 'art', id: 5}]}/>
      <View style={{ flexDirection: 'row', width, padding: 5, borderTopWidth: 1, borderTopColor: '#C8C8D0', backgroundColor: '#FFFFFF' }}>
        <Image style={{ width: 30, height: 20, marginTop: 5, resizeMode: 'stretch' }} source={require('../img/icon-camera.png')} />
        <View style={{ marginLeft: 10, flexDirection: 'row', borderColor: '#CACBD2', borderWidth: 1, borderRadius: 5, height: keyboardHeight, width: width - 50 }}>
          <MentionableTextInput
            multiline={true}
            style={{ marginLeft: 10, height: keyboardHeight, flex: 1 }}
            onModelChange={props.onModelChange}
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

export default CommentBox;
