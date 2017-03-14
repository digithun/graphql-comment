import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ListView,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import KeyboardAvoidingViewCustom from './KeyboardAvoidingViewCustom';
import Comment from './Comment';

const { height, width } = Dimensions.get('window');
const style = StyleSheet.create({
  scrollView: {
    paddingTop: 10,
    backgroundColor: '#F9FAFB',
  },
});

function cloneWithData(dataSource, data) {
  if (!data) {
    return dataSource.cloneWithRows([]);
  }
  return dataSource.cloneWithRows(data);
}

class CommentList extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      keyboardVisible: false,
      scrollViewHeight: height - 20 - 40 - 46, // marginTop: 20, header: 40, TextInput: 46
      contentHeight: 0,
      dataSource: cloneWithData(dataSource, this.props.data),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.setState({
        dataSource: cloneWithData(this.state.dataSource, nextProps.data),
      });
    }
    const oldLength = this.props.data.length;
    const newLength = nextProps.data.length;
  }

  componentWillMount() {
    // Add keyboard change listener
    if (Platform.OS === 'ios') {
      this.subscriptions = [
        Keyboard.addListener('keyboardWillChangeFrame', this.onKeyboardChange),
        Keyboard.addListener('keyboardDidHide', this.onKeyboardHide),
        Keyboard.addListener('keyboardDidShow', this.onKeyboardShow),
      ];
    } else {
      this.subscriptions = [
        Keyboard.addListener('keyboardDidHide', this.onKeyboardChange),
        Keyboard.addListener('keyboardDidShow', this.onKeyboardChange),
      ];
    }
  }

  componentWillUnmount() {
    // Remove keyboard change listener
    this.subscriptions.forEach(sub => sub.remove());
  }

  onKeyboardHide = () => {
    this.setState({
      keyboardVisible: false,
    });
  }

  onKeyboardShow = () => {
    this.setState({
      keyboardVisible: true,
    });
  }

  onKeyboardChange = (e) => {
    const { startCoordinates, endCoordinates } = e;
    const keyboardHeight = startCoordinates.screenY - endCoordinates.screenY;
    const scrollViewHeight = this.state.scrollViewHeight - keyboardHeight;
    this.setState({
      scrollViewHeight,
    });

    if (this.props.isPosting) {
      this.scrollView.scrollTo({ x: 0, y: this.contentHeight - scrollViewHeight + 10, animate: true });
      this.props.onPostSuccess();
    }
  }

  onContentSizeChange = (contentHeight) => {
    this.contentHeight = contentHeight;
    if (this.props.isPosting && !this.state.keyboardVisible) {
      this.scrollView.scrollToEnd();
      this.props.onPostSuccess();
    }
  }

  render() {
    const { data } = this.props;

    return (
      <View>
        <ListView
          ref={(scrollView) => { this.scrollView = scrollView; }}
          style={[style.scrollView, { height: this.state.scrollViewHeight }]}
          onContentSizeChange={(contentWidth, contentHeight) => this.onContentSizeChange(contentHeight)}
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={(comment) => 
            <Comment
              id={comment._id}
              author={this.props.getAuthorOnComment(comment)}
              text={comment.content}
              posted={(new Date(comment.createdAt)).getTime()}
              isLiked={comment.isLiked}
              likeCount={comment.likeCount}
              onLike={this.props.onLike}
              onUnlike={this.props.onUnlike}
            />
          }
        />
      </View>
    );
  }
}

export default CommentList;
