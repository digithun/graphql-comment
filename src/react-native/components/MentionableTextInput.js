import React from 'react';
import {
  View,
  Text,
  TextInput,
} from 'react-native';

import withReducer from 'recompose/withReducer';
import flatten from 'lodash/flatten';

import { denormalize, normalize, cleanText } from '../../common/mention';
import { min, max } from '../../common/utils';

import TextInputWithAction from './TextInputWithAction';

export function mentionReducer(text, action) {
  let objArray = denormalize(text);
  if (action.type === 'INSERT_MENTION') {
    const { at, user } = action.payload;
    const mention = {
      type: 'mention',
      text: user.name,
      id: user.id,
      length: user.name.length,
    };
    let accLength = 0;
    let isInserted = false;
    objArray = flatten(objArray.map(obj => {
      const curPos = accLength;
      accLength += obj.length; 
      if (curPos < at && at < curPos + obj.length) {
        const objText = obj.text ? obj.text : obj;
        isInserted = true;
        return [objText.slice(0, at - curPos), mention, objText.slice(at - curPos)];
      }
      if (curPos === at) {
        isInserted = true;
        return [mention, obj];
      }
      return obj;
    }));
    if (!isInserted) {
      objArray.push(mention);
    }
    return normalize(objArray);
  }
  if (action.type === 'INSERT_TEXT') {
    const { at, text } = action.payload;
    let accLength = 0;
    let isInserted = false;
    objArray = flatten(objArray.map(obj => {
      const curPos = accLength;
      accLength += obj.length; 
      if (curPos < at && at < curPos + obj.length) {
        const objText = obj.text ? obj.text : obj;
        isInserted = true;
        return objText.slice(0, at - curPos) + text + objText.slice(at - curPos);
      }
      if (curPos === at) {
        isInserted = true;
        return [text, obj];
      }
      return obj;
    }));
    if (!isInserted) {
      objArray.push(text);
    }
    return normalize(objArray);
  }
  if (action.type === 'REMOVE_TEXT') {
    const { at, length } = action.payload;
    let accLength = 0;
    objArray = objArray.map(obj => {
      const curPos = accLength;
      accLength += obj.length; 
      let start = max(curPos, at);
      let end = min(curPos + obj.length - 1, at + length - 1);
      if (start <= end) {
        if (obj.type === 'mention') {
          return '';
        }
        return obj.slice(0, start - curPos) + obj.slice(end - curPos + 1);
      }
      return obj;
    });
    return normalize(objArray);
  }
  if (action.type === 'CLEAR') {
    return '';
  }
  return text;
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
    const newState = _actions.reduce((state, action) => {
      return mentionReducer(state, action);
    }, this.props.model);
    if (this.props.onModelChange) {
      this.props.onModelChange(newState);
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
    const result = denormalize(this.props.model).map((obj, idx) => {
      if (typeof obj === 'string') {
        return obj;
      }
      return <Text key={idx} style={{color: 'blue'}}>{obj.text}</Text>;
    });
    if (result.length) {
      return result;
    }
    return '';
  }

  render() {
    return (
      <TextInputWithAction
        {...this.props}
        ref={node => this.textInput = node}
        onActions={this.activeMentionAction}
        multiline={true}
        value={undefined}
        _value={cleanText(this.props.model)}
        onChangeText={null}
      >
        {this.renderStyledMentions()}
      </TextInputWithAction>
    );
  }
}

export default MentionableTextInput;
