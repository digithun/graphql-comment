import React from 'react';
import {
  View,
  Text,
  TextInput,
} from 'react-native';

const mentionRegex = /^@/;

class MentionableTextInput extends React.Component {
  constructor(...args) {
    super(...args);
    
    this.state = {
      mentions: [],
      mentionCache: [],
      text: '',
    };

    this.onChangeText = this.onChangeText.bind(this);
  }

  onChangeText(text) {
    const actions = this.oneTextActions(this.state.text, text);
    let newMention = this.state.mentions;
    actions.forEach(action => {
      if (action.type === 'insert') {
        const { at } = action.payload;
        newMention = newMention.filter(mention => {
          return !this.isInMention(mention, at);
        });
      }
      if (action.type === 'remove') {
        const { at, length } = action.payload;
        if (length != 0) {
          newMention = newMention.filter(mention => {
            let s1 = mention.startPos;
            let e1 = mention.endPos;
            let s2 = at;
            let e2 = at + length - 1;
            let is = s1 > s2 ? s1 : s2;
            let ie = e1 > e2 ? e2 : e1;
            return is > ie;
          });
        }
      }
    });
    this.setState({
      text,
      mentions: newMention,
    });
    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  }

  clear() {
    // force set
    this.state.text = '';
    this.state.mentions = [];
    this.setState({
      text: '',
      mentions: [],
    });
  }

  addMention({ name, at, ref }) {
    const addText = `@${name}`;
    this.setState({
      mentions: [...this.state.mentions, {
        ref,
        startPos: this.state.text.length,
        endPos: this.state.text.length + addText.length - 1,
      }],
      text: this.state.text.slice(0, at) + addText + this.state.text.slice(at),
    });
  }

  replyMention({ name, ref }) {
    const addText = `@${name} `;
    this.setState({
      mentions: [{
        ref,
        startPos: 0,
        endPos: addText.length - 2,
      }],
      text: addText,
    });
  }

  isInMention(mention, pos) {
    return mention.startPos <= pos && pos <= mention.endPos;
  }

  oneTextActions(oldText, newText) {
    let longestFirstIdx = 0;
    while (longestFirstIdx < oldText.length && longestFirstIdx < newText.length) {
      if (oldText[longestFirstIdx] !== newText[longestFirstIdx]) {
        break;
      }
      longestFirstIdx += 1;
    }
    let longestLastIdx = 0;
    let remainingOldText = oldText.slice(longestFirstIdx).split('').reverse().join();
    let remainingNewText = newText.slice(longestFirstIdx).split('').reverse().join();
    while (longestLastIdx < remainingOldText.length && longestLastIdx < remainingNewText.length) {
      if (remainingOldText[longestLastIdx] !== remainingNewText[longestLastIdx]) {
        break;
      }
      longestLastIdx += 1;
    }
    return [
      {
        type: 'remove',
        payload: {
          at: longestFirstIdx,
          length: oldText.length - (longestFirstIdx + longestLastIdx),
        },
      },
      {
        type: 'insert',
        payload: {
          at: longestFirstIdx,
          text: newText.slice(longestFirstIdx, longestLastIdx === 0 ? undefined : -longestLastIdx),
        },
      },
    ];
  }

  renderStyledMentions() {
    // const text = this.state.text;
    // let idx = 0;
    // let styled = text.split(' ').map(word => {
    //   if (mentionRegex.test(word)) {
    //     const styled = <Text key={idx} style={{color: 'blue'}}>{word}</Text>;
    //     const mention = this.state.mentions.find(mention => mention.idx === idx);
    //     idx = idx + 1;
    //     if (!!mention) {
    //       return styled;
    //     }
    //     return word;
    //   }
    //   else {
    //     return word;
    //   }
    // });
    // let joined = [];
    // for (let i = 0; i < styled.length; i++) {
    //   joined.push(styled[i]);
    //   if (i + 1 !== styled.length) {
    //     joined.push(' ');
    //   }
    // }
    // return joined;
    // console.log(this.state.textObjects)
    // return this.state.textObjects.map(obj => {
    //   if (obj.type === 'text') {
    //     return obj.text;
    //   }
    //   return null;
    // });
    return this.state.text.split('').map((t, idx) => {
      const isMention = this.state.mentions.reduce((acc, mention) => {
        return this.isInMention(mention, idx) || acc;
      }, false);
      if (isMention) {
        return <Text key={idx} style={{color: 'blue'}}>{t}</Text>;
      }
      return t;
    });
  }

  render() {
    
    return (
      <TextInput
        {...this.props}
        ref={node => this.textInput = node}
        multiline={true}
        onChangeText={this.onChangeText}
      >
        {this.renderStyledMentions()}
      </TextInput>
    );
  }
}

export default MentionableTextInput;
