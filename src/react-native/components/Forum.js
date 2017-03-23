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
import CommentList from './CommentList';
import CommentBox from './CommentBox';
import MentionableTextInput from './MentionableTextInput';
import UserSearchResult from './UserSearchResult';
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

class Forum extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      isPosting: false,
    };
  }
  
  onSendMessage = () => {
    const msg = this.state.text;
    this.props.reply(msg);
    this.setState({
      text: '',
    });
    Keyboard.dismiss();
  }

  onPostSuccess = () => {
    if (this.state.isPosting) {
      this.setState({
        isPosting: false,
      });
    }
  }

  onReply = (comment) => {
    const author = this.props.getAuthorOnComment(comment);
    this.setState({
      text: `@{${author.name}}(${author.id}) `,
    });
  }

  render() {
    return (
      <View style={{ flex: 1, marginTop: 20 }}>
        <CommentHeader onBackPress={this.props.onBackPress} />
        <CommentList
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
        <CommentBox
          searcher={this.props.createUserSearcher(this.props)}
          onSendMessage={this.onSendMessage}
          onModelChange={text => this.setState({
            text,
          })}
          text={this.state.text}
        />
      </View>
    );
  }
}

Forum.fragment = gql`
  fragment Forum on Comment {
    _id
    content
    createdAt
    likeCount
    isLiked
    isOwner
    ...UserOnComment
  }
`;

export default Forum;
