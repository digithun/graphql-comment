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
  ActivityIndicator,
  Button,
  LayoutAnimation,
} from 'react-native';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import KeyboardAvoidingViewCustom from './KeyboardAvoidingViewCustom';
import Comment from './Comment';

const { height, width } = Dimensions.get('window');
const style = StyleSheet.create({
  scrollView: {
    backgroundColor: '#F9FAFB',
  },
});

function cloneWithData(dataSource, data) {
  if (!data) {
    return dataSource.cloneWithRows([]);
  }
  return dataSource.cloneWithRows(data);
}

const SCROLL_VIEW_HEIGHT = height - 20 - 40 - 46; // marginTop: 20, header: 40, TextInput: 46;

class CommentList extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      mainScrollY: 0,
      onOldScrollPosition: true,
      keyboardVisible: false,
      keyboardVisibleLv2: false,
      scrollViewHeight: SCROLL_VIEW_HEIGHT,
      keyboardHeight: 0,
      contentHeight: 0,
      dataSource: cloneWithData(dataSource, this.props.data),
    };
  }

  componentWillUpdate() {
    // LayoutAnimation.easeInEaseOut();
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
        Keyboard.addListener('keyboardWillChangeFrame', this.onKeyboardToggle),
        Keyboard.addListener('keyboardDidHide', this.onKeyboardHide),
        Keyboard.addListener('keyboardDidShow', this.onKeyboardShow),
      ];
    } else {
      this.subscriptions = [
        Keyboard.addListener('keyboardWillChangeFrame', this.onKeyboardToggle),
        Keyboard.addListener('keyboardDidHide', this.onKeyboardChange),
        Keyboard.addListener('keyboardDidShow', this.onKeyboardChange),
        Keyboard.addListener('keyboardDidHide', this.onKeyboardHide),
        Keyboard.addListener('keyboardDidShow', this.onKeyboardShow),
      ];
    }
  }

  componentWillUnmount() {
    // Remove keyboard change listener
    this.subscriptions.forEach(sub => sub.remove());
  }

  onDeleteComment = (id) => {
    this.props.onDeleteComment(id);
  }

  onLoadMore = () => {
    if (this.props.onLoadMore) {
      this.setState({
        oldContentHeight: this.contentHeight,
        onOldScrollPosition: false,
      });
      this.props.onLoadMore();
    }
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

  onKeyboardToggle = () => {
    this.setState({
      keyboardVisibleLv2: !this.state.keyboardVisibleLv2,
    });
  }

  onKeyboardChange = (e) => {
    const { startCoordinates, endCoordinates } = e;
    const keyboardHeight = startCoordinates.screenY - endCoordinates.screenY;
    const scrollViewHeight = this.state.scrollViewHeight - keyboardHeight;
    this.setState({
      scrollViewHeight,
      keyboardHeight: keyboardHeight > 0 ? keyboardHeight : 0,
    });
  }

  onContentSizeChange = (contentHeight) => {
    this.contentHeight = contentHeight;
    this.setState({
      contentHeight,
    });
    if (this.props.isPosting) {
      if (this.state.mainScrollY === 0) {
        this.scrollView.scrollTo({ y: 1, x: 0, animated: true });
      }
      else {
        this.scrollView.scrollTo({ y: 0, x: 0, animated: true });
      }
      this.props.onPostSuccess();
    }
    else {
      this.scrollView.scrollTo({ x: 0, y: this.state.mainScrollY + 1, animated: true });
    }
  }

  renderLoadMore = () => {
    if (!this.props.hasMoreComment) {
      return <View style={{height: 10}}/>;
    }
    let rendered;
    if (this.props.loading) {
      rendered = <ActivityIndicator/>;
    }
    else {
      rendered = <Button onPress={this.onLoadMore} title="previous comments"/>;
    }
    return <View style={{height: 50, alignItems: 'center', justifyContent: 'center'}}>{rendered}</View>;
  }

  render() {
    const { data } = this.props;
    let paddingForKeyboard = (!this.state.keyboardVisibleLv2 ? 0 : this.state.keyboardHeight);
    let paddingBottom = SCROLL_VIEW_HEIGHT - this.state.keyboardHeight - this.state.contentHeight;
    if (paddingBottom < 0) {
      paddingBottom = 0;
    }

    return (
      <View>
        <ListView
          onScroll={(e) => {
            this.setState({
              mainScrollY: e.nativeEvent.contentOffset.y,
            });
          }}
          renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
          ref={(scrollView) => { this.scrollView = scrollView; }}
          style={[style.scrollView,
            {
              height: SCROLL_VIEW_HEIGHT,
              paddingTop: paddingBottom + paddingForKeyboard,
            }
          ]}
          onContentSizeChange={(contentWidth, contentHeight) => this.onContentSizeChange(contentHeight)}
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={(comment) => {
            return <Comment
              key={comment._id}
              id={comment._id}
              comment={comment}
              isOwner={comment.isOwner}
              author={this.props.getAuthorOnComment(comment)}
              text={comment.content}
              posted={(new Date(comment.createdAt)).getTime()}
              isLiked={comment.isLiked}
              likeCount={comment.likeCount}
              onLike={this.props.onLike}
              onUnlike={this.props.onUnlike}
              onDelete={this.onDeleteComment}
              onReply={this.props.onReply}
            />;
          }}
          renderFooter={this.renderLoadMore}
        >
        </ListView>
      </View>
    );
  }
}

export default CommentList;
