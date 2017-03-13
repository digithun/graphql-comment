import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
  backButtonImage: {
    width: 13,
    height: 20,
    resizeMode: 'stretch',
  },
  text: {
    color: '#F33B56',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

class CommentHeader extends React.Component {
  render() {
    return (
      <View style={style.container}>
        <TouchableOpacity style={style.backButtonContainer} onPress={this.props.onBackPress}>
          <Image style={style.backButtonImage} source={require('../img/back-button.png')} />
        </TouchableOpacity>
        <Text style={style.text}>Comment</Text>
      </View>
    );
  }
}

export default CommentHeader;
