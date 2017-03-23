import React from 'react';
import {
  View,
  Text,
  TextInput,
} from 'react-native';

const Diff = require('text-diff');
const diff = new Diff();

function textActions(oldText, newText) {
  const diffs = diff.main(oldText, newText);
  diff.cleanupSemantic(diffs);
  let curLength = 0;
  return diffs.reduce((acc, diff) => {
    if (diff[0] === 0) {
      curLength += diff[1].length;
      return acc;
    }
    if (diff[0] === -1) {
      return [...acc, {
        type: 'REMOVE_TEXT',
        payload: {
          at: curLength,
          length: diff[1].length,
          changedText: newText,
        },
      }];
    }
    if (diff[0] === 1) {
      curLength += diff[1].length;
      return [...acc, {
        type: 'INSERT_TEXT',
        payload: {
          at: curLength - diff[1].length,
          text: diff[1],
          changedText: newText,
        },
      }];
    }
    return acc;
  }, []);
}

class TextInputWithAction extends React.Component {
  constructor(...args) {
    super(...args);
  
    this.onChangeText = this.onChangeText.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // need to remove autocomplete if set value to ''
    if (nextProps._value === '') {
      setTimeout(() => {
        this.clear();
      });
    }
  }
  

  onChangeText(text) {
    const actions = textActions(this.props._value, text);
    if (this.props.onActions) {
      this.props.onActions(actions);
    }
    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  }

  clear() {
    this.textInput.clear();
  }

  render() {
    return (
      <TextInput
        {...this.props}
        ref={node => this.textInput = node}
        onChangeText={this.onChangeText}
      />
    );
  }
}

export default TextInputWithAction;
