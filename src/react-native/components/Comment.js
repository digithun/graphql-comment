import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Image,
  TouchableHighlight,
  Button,
  Modal,
} from 'react-native';
import moment from 'moment';
import clone from 'lodash/clone';

const style = StyleSheet.create({
  container: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DFE0E3',
    backgroundColor: '#FFFFFF',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorThumbnail: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  authorName: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
  commentText: {
    marginLeft: 40,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F4F5F6',
  },
  likedIcon: {
    marginLeft: 40,
    height: 13,
    width: 14,
    resizeMode: 'stretch',
  },
  likedNumber: {
    marginLeft: 10,
    color: '#ADAEAF',
  },
  timeText: {
    position: 'absolute',
    right: 0,
    color: '#ADAEAF',
  },
  buttonEditContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
});

class CommentEditor extends React.Component {
  render() {
    return (
      <View style={{ position: 'absolute', marginLeft: 40, marginTop: 10, zIndex: 100, borderWidth: 1, backgroundColor: '#FFFFFF', borderColor: '#000000' }}>
        <TouchableOpacity style={style.buttonEditContainer} onPress={this.props.onDelete}>
          <Text>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.buttonEditContainer} onPress={this.props.onCancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showEdit: false,
    };
  }

  onDelete = () => {
    if (this.props.onDelete) {
      this.props.onDelete(this.props.id);
    }
  }

  onCancel = () => {
    this.setState({
      showEdit: false,
    });
  }

  onEditComment = () => {
    if (this.props.isOwner) {
      this.setState({
        showEdit: true,
      });
    }
  }

  onToggleLikePress = () => {
    if (this.props.isLiked && this.props.onUnlike) {
      this.props.onUnlike(this.props.id);
    }
    if (!this.props.isLiked && this.props.onLike) {
      this.props.onLike(this.props.id);
    }
  }

  onReply = () => {
    if (this.props.onReply) {
      this.props.onReply(this.props.comment);
    }
  }

  renderTextWithMentions() {
    let text = this.props.text;
    let mentions = clone(this.props.mentions);
    mentions.sort((m1, m2) => m2.position - m1.position);
    const splited = mentions.reduce((acc, mention, i) => {
      const idx = mention.position;
      return [acc[0].slice(0, idx),  <Text key={i} onPress={null} style={{color: 'blue'}}>{mention.text}</Text>, acc[0].slice(idx + 1), ...acc.slice(1)];
    }, [text]);
    return splited;
  }

  render() {
    const { posted, author, text, isLiked, likeCount } = this.props;
    const relativePostedTime = moment(new Date(posted)).fromNow();

    return (
      <TouchableHighlight underlayColor="#D9D9D9" onLongPress={this.onEditComment}>
        <View style={style.container}>
          <View style={style.authorContainer}>
            <Image style={style.authorThumbnail} source={author.profilePicture ? { uri: author.profilePicture } : null} />
            <Text style={style.authorName}>{author.name}</Text>
          </View>
          {this.state.showEdit ? <CommentEditor onDelete={this.onDelete} onCancel={this.onCancel}/> : null}
          <View>
            <Text style={style.commentText}>{this.renderTextWithMentions()}</Text>
          </View>
          <View style={style.footerContainer}>
            <TouchableOpacity onPress={this.onToggleLikePress}>
              <Image style={style.likedIcon} source={!isLiked ? require('../img/icon-liked0.png') : require('../img/icon-like.png')} />
            </TouchableOpacity>
            <Text style={style.likedNumber}>{likeCount}</Text>
            <TouchableOpacity onPress={this.onReply} style={{paddingLeft: 10}}>
              <Text>Reply</Text>
            </TouchableOpacity>
            <Text style={style.timeText}>{relativePostedTime}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

export default Comment;
