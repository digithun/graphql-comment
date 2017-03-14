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
    paddingTop: 10,
    backgroundColor: '#F9FAFB',
  },
});

function cloneWithData(dataSource, data) {
  if (!data) {
    return dataSource.cloneWithRows([]);
  }
  return dataSource.cloneWithRows(data, data.map((row,i)=>i));
}

class CommentList extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => true,
    });
    this.state = {
      mainScrollY: 0,
      onOldScrollPosition: true,
      keyboardVisible: false,
      scrollViewHeight: height - 20 - 40 - 46, // marginTop: 20, header: 40, TextInput: 46
      contentHeight: 0,
      paddingBottomScrollView: 0,
      isSetBottomScrollView: true,
      dataSource: cloneWithData(dataSource, this.props.data),
    };
  }

  componentWillUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.setState({
        dataSource: cloneWithData(this.state.dataSource, nextProps.data),
        isSetBottomScrollView: false,
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
        Keyboard.addListener('keyboardDidHide', this.onKeyboardHide),
        Keyboard.addListener('keyboardDidShow', this.onKeyboardShow),
      ];
    }
  }

  componentWillUnmount() {
    // Remove keyboard change listener
    this.subscriptions.forEach(sub => sub.remove());
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

  onKeyboardChange = (e) => {
    const { startCoordinates, endCoordinates } = e;
    const keyboardHeight = startCoordinates.screenY - endCoordinates.screenY;
    const scrollViewHeight = this.state.scrollViewHeight - keyboardHeight;
    this.setState({
      scrollViewHeight,
    });

    if (this.props.isPosting) {
      if (this.contentHeight > scrollViewHeight) {
        this.scrollView.scrollTo({ x: 0, y: 0, animate: true });
      }
      this.props.onPostSuccess();
    }
  }

  onContentSizeChange = (contentHeight) => {
    this.contentHeight = contentHeight;
    this.setState({
      contentHeight,
    });
    if (!this.state.isSetBottomScrollView) {
      this.setState({
        paddingBottomScrollView: this.state.scrollViewHeight > contentHeight ? this.state.scrollViewHeight - contentHeight : 0,
        isSetBottomScrollView: true,
      });
    }
    if (this.props.isPosting && !this.state.keyboardVisible) {
      if (this.contentHeight > this.state.scrollViewHeight) {
        this.scrollView.scrollTo({ y: 0, x: 0, animated: true });
      }
      this.props.onPostSuccess();
    }
    if (!this.state.onOldScrollPosition) {
    }
  }

  renderLoadMore = () => {
    if (!this.props.hasMoreComment) {
      return <View style={{height: 10, alignItems: 'center', justifyContent: 'center'}}/>;
    }
    let rendered;
    if (this.props.loading) {
      rendered = <ActivityIndicator/>;
    }
    else {
      rendered = <Button onPress={this.onLoadMore} title="load more"/>;
    }
    return <View style={{height: 50, alignItems: 'center', justifyContent: 'center'}}>{rendered}</View>;
  }

  render() {
    const { data } = this.props;
    console.log(this.state.paddingBottomScrollView)

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
          style={[style.scrollView, { height: this.state.scrollViewHeight }]}
          onContentSizeChange={(contentWidth, contentHeight) => this.onContentSizeChange(contentHeight)}
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={(comment) => {
            return <Comment
              key={comment._id}
              id={comment._id}
              author={this.props.getAuthorOnComment(comment)}
              text={comment.content}
              posted={(new Date(comment.createdAt)).getTime()}
              isLiked={comment.isLiked}
              likeCount={comment.likeCount}
              onLike={this.props.onLike}
              onUnlike={this.props.onUnlike}
            />;
          }}
          renderFooter={this.renderLoadMore}
          renderHeader={() => <View style={{height: this.state.paddingBottomScrollView}}/>}
        >
        </ListView>
      </View>
    );
  }
}

export default CommentList;
