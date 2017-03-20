import React from 'react';
import {
  View,
  Text,
  TextInput,
} from 'react-native';

function textActions(oldText, newText) {
  let longestFirstIdx = 0;
  while (longestFirstIdx < oldText.length && longestFirstIdx < newText.length) {
    if (oldText[longestFirstIdx] !== newText[longestFirstIdx]) {
      break;
    }
    longestFirstIdx += 1;
  }
  let longestLastIdx = 0;
  let remainingOldText = oldText.slice(longestFirstIdx).split('').reverse().join('');
  let remainingNewText = newText.slice(longestFirstIdx).split('').reverse().join('');
  while (longestLastIdx < remainingOldText.length && longestLastIdx < remainingNewText.length) {
    if (remainingOldText[longestLastIdx] !== remainingNewText[longestLastIdx]) {
      break;
    }
    longestLastIdx += 1;
  }
  return [
    {
      type: 'REMOVE_TEXT',
      payload: {
        at: longestFirstIdx,
        length: oldText.length - (longestFirstIdx + longestLastIdx),
      },
    },
    {
      type: 'INSERT_TEXT',
      payload: {
        at: longestFirstIdx,
        text: newText.slice(longestFirstIdx, longestLastIdx === 0 ? undefined : -longestLastIdx),
      },
    },
  ];
}

class TextInputWithAction extends React.Component {
  constructor(...args) {
    super(...args);
  
    this.onChangeText = this.onChangeText.bind(this);
  }

  onChangeText(text) {
    const actions = textActions(this.props.oldValue, text);
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
