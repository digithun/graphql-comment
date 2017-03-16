// import CommentListView from './components/CommentListView';

// export default CommentListView;

import CommentListView from './containers/CommentListView';
export * from './containers/CommentListView';

export const createReducerOnReply = (discussionRef, updateQuery) => (previousResult, action, variables) => {
  if (action.type === 'APOLLO_MUTATION_RESULT' && action.operationName === 'Reply' && action.variables && action.variables.discussionRef === discussionRef) {
    const reply = action.result.data.reply;
    return updateQuery(previousResult, reply);
  }
  return previousResult;
}

export const createReducerOnDelete = (discussionRef, updateQuery) => (previousResult, action, variables) => {
  if (action.type === 'APOLLO_MUTATION_RESULT' && action.operationName === 'deleteComment' && action.variables && action.variables.discussionRef === discussionRef) {
    const deletedComment = action.result.data.deleteComment;
    return updateQuery(previousResult, deletedComment);
  }
  return previousResult;
}
