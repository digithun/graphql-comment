import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
  Modal,
  Keyboard,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import gql from 'graphql-tag';

import { min, max } from '../../common/utils';

import KeyboardAvoidingViewCustom from './KeyboardAvoidingViewCustom';
import CommentHeader from './CommentHeader';
import CommentListA from './CommentList';
import MentionableTextInput from './MentionableTextInput';
import MockData from '../MockData';

const lineHeight = 25;
const { height, width } = Dimensions.get('window');
const stylesTest = StyleSheet.create({
  expand: {
    height: 500,
  },
  resize: {
    height: 200,
  },
});

class CommentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textInputHeight: 0,
      inputModel: '',
      isPosting: false,
    };
  }

  componentWillMount() {
    this.width = width;
  }
  
  onSendMessage = () => {
    this.props.reply(this.state.inputModel);
    this.textInput.clear();
    Keyboard.dismiss();
  }

  onModelChange = (value) => {
    this.setState({ inputModel: value });
    let lineCount = ((value || '').match(/\n/g) || []).length + 1;
    this.setState({
      textInputHeight: lineCount * lineHeight,
    });
  }

  onPostSuccess = () => {
    if (this.state.isPosting) {
      this.setState({
        isPosting: false,
      });
      this.textInput.clear();
    }
  }

  onReply = (comment) => {
    const author = this.props.getAuthorOnComment(comment);
    this.setState({
      inputModel: `@{${author.name}}(${author.id}) `,
    });
  }

  render() {
    const keyboardHeight = min(max(this.state.textInputHeight, 35), 25 * 3);
    return (
      <View style={{ flex: 1, marginTop: 20 }}>
        <CommentHeader onBackPress={this.props.onBackPress} />
        <CommentListA
          ref={(node) => this.commentList = node}
          getAuthorOnComment={this.props.getAuthorOnComment}
          data={this.props.comments}
          isPosting={this.state.isPosting}
          loading={this.props.loading}
          hasMoreComment={this.props.hasMoreComment}
          onLoadMore={this.props.loadMore}
          onPostSuccess={this.onPostSuccess}
          onLike={this.props.likeComment}
          onUnlike={this.props.unlikeComment}
          onDeleteComment={this.props.deleteComment}
          onReply={this.onReply}
        />

        <KeyboardAvoidingViewCustom>
          <View style={{ flexDirection: 'row', width, padding: 5, borderTopWidth: 1, borderTopColor: '#C8C8D0', backgroundColor: '#FFFFFF' }}>
            <Image style={{ width: 30, height: 20, marginTop: 5, resizeMode: 'stretch' }} source={require('../img/icon-camera.png')} />
            <View style={{ marginLeft: 10, flexDirection: 'row', borderColor: '#CACBD2', borderWidth: 1, borderRadius: 5, height: keyboardHeight, width: this.width - 50 }}>
              <MentionableTextInput
                multiline={true}
                ref={node => this.textInput = node}
                style={{ marginLeft: 10, height: keyboardHeight, flex: 1 }}
                onModelChange={this.onModelChange}
                mentions={this.state.mentions}
                model={this.state.inputModel}
                placeholder="Write a comment..."
              />
              {
                this.state.inputModel.length > 0 ?
                  <TouchableOpacity style={{width: 30, paddingTop: 5}} onPress={this.onSendMessage}>
                    <Image style={{ width: 20, height: 20, resizeMode: 'stretch' }} source={require('../img/icon-message.png')} />
                  </TouchableOpacity> : null
              }
            </View>
          </View>
        </KeyboardAvoidingViewCustom>
      </View>
    );
  }
}

CommentList.fragment = gql`
  fragment CommentListView on Comment {
    _id
    content
    createdAt
    likeCount
    isLiked
    isOwner
    ...UserOnComment
  }
`;

export default CommentList;
