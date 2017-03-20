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

import KeyboardAvoidingViewCustom from './KeyboardAvoidingViewCustom';
import CommentHeader from './CommentHeader';
import CommentListA from './CommentList';
import MentionableTextInput from './MentionableTextInput';
import MockData from '../MockData';

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
      textInput: '',
      isPosting: false,
      mentions: [],
    };
  }

  componentWillMount() {
    this.width = width;
  }
  
  onSendMessage = (msg) => {
    this.props.reply({
      content: msg,
      mentions: this.state.mentions.map(mention => ({
        startAt: mention.startAt,
        text: mention.text,
        userRef: mention.userRef,
      })),
    });
    this.textInput.clear();
    this.setState({
      textInput: '',
      isPosting: true,
    });
    Keyboard.dismiss();
  }

  onPostSuccess = () => {
    if (this.state.isPosting) {
      this.setState({
        textInput: '',
        isPosting: false,
      });
    }
  }

  onReply = (comment) => {
    const mentionText = `${this.props.getAuthorOnComment(comment).name}`;
    this.setState({
      textInput: `${mentionText} `,
      mentions: [{
        startAt: 0,
        text: mentionText,
        length: mentionText.length,
        userRef: comment.authorRef,
      }],
    });
  }

  render() {
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
          <View style={{ flexDirection: 'row', alignItems: 'center', width, padding: 5, borderTopWidth: 1, borderTopColor: '#C8C8D0', backgroundColor: '#FFFFFF' }}>
            <Image style={{ width: 30, height: 20, resizeMode: 'stretch' }} source={require('../img/icon-camera.png')} />
            <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center', borderColor: '#CACBD2', borderWidth: 1, borderRadius: 5, height: 35, width: this.width - 50 }}>
              <MentionableTextInput
                multiline={true}
                ref={node => this.textInput = node}
                style={{ marginLeft: 10, height: 35, width: 280 }}
                onChangeText={text => this.setState({ textInput: text })}
                onMentionsChange={mentions => this.setState({ mentions })}
                mentions={this.state.mentions}
                value={this.state.textInput}
                placeholder="Write a comment..."
              />
              {
                this.state.textInput.length > 0 ?
                  <TouchableOpacity onPress={() => this.onSendMessage(this.state.textInput)}>
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
    mentions {
      position
      text
    }
    ...UserOnComment
  }
`;

export default CommentList;
