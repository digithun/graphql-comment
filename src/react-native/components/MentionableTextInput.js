import React from 'react';
import {
  View,
  Text,
  TextInput,
} from 'react-native';

import withReducer from 'recompose/withReducer';

import TextInputWithAction from './TextInputWithAction';

const mentionRegex = /^@/;

const isIntersectWithMention = (mention, start, end) => {
  const startPos = mention.startAt;
  const endPos = mention.startAt + mention.length - 1;
  let s1 = startPos;
  let e1 = endPos;
  let s2 = start;
  let e2 = end;
  let is = s1 > s2 ? s1 : s2;
  let ie = e1 > e2 ? e2 : e1;
  return is > ie;
}

function mentionReducer({
  text = '',
  mentions = [],
}, action) {
  if (action.type === 'ADD_MENTION') {
    const mention = action.payload;
    return {
      text: '',
      mentions: [...mentions, mention],
    };
  }
  if (action.type === 'INSERT_TEXT') {
    const { at } = action.payload;
    const length = action.payload.text.length;
    return {
      text: text,
      mentions: mentions
      .filter(mention => {
        const startPos = mention.startAt;
        const endPos = mention.startAt + mention.length - 1;
        return !(startPos < at && at <= endPos);
      })
      .map(mention => {
        const startPos = mention.startAt;
        if (startPos >= at) {
          return {
            ...mention,
            startAt: mention.startAt + length,
          };
        }
        return mention;
      }),
    }
  }
  if (action.type === 'REMOVE_TEXT') {
    const { at, length } = action.payload;
    if (length != 0) {
      return {
        text,
        mentions: mentions
        .filter(mention => {
          return isIntersectWithMention(mention, at, at + length - 1);
        })
        .map(mention => {
          const startPos = mention.startAt;
          if (startPos >= at) {
            return {
              ...mention,
              startAt: mention.startAt - length,
            };
          }
          return mention;
        }),
      }
    }
  }
  if (action.type === 'CLEAR') {
    return {
      text: '',
      mentions: [],
    };
  }
  return { text, mentions };
}

class MentionableTextInput extends React.Component {
  constructor(...args) {
    super(...args);

    this.activeMentionAction = this.activeMentionAction.bind(this);
  }

  activeMentionAction(actions) {
    let _actions= actions;
    if (actions.length === undefined) {
      _actions = [actions];
    }
    if (this.props.onMentionsChange) {
      const newState = _actions.reduce((state, action) => {
        return mentionReducer(state, action);
      }, { text: this.props.value, mentions: this.props.mentions });
      this.props.onMentionsChange(newState.mentions);
      // this.props.onTextChange(newState.text);
    }
  }

  clear() {
    this.textInput.clear();
    this.activeMentionAction({
      type: 'CLEAR',
    });
  }

  isInMention(mention, pos) {
    const startPos = mention.startAt;
    const endPos = mention.startAt + mention.length - 1;
    return startPos <= pos && pos <= endPos;
  }

  renderStyledMentions() {
    return this.props.value.split('').map((t, idx) => {
      const isMention = this.props.mentions.reduce((acc, mention) => {
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
      <TextInputWithAction
        {...this.props}
        ref={node => this.textInput = node}
        onActions={this.activeMentionAction}
        multiline={true}
        value={undefined}
        oldValue={this.props.value}
      >
        {this.renderStyledMentions()}
      </TextInputWithAction>
    );
  }
}

export default MentionableTextInput;
