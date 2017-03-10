import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import CommentListView from '../components/CommentListView';

const defaultUserOnComment = gql`
  fragment UserOnComment on Comment {
    authorRef
  }
`;

const mapQueryToProps = ({ data }) => {
  if (data.error) {
    console.error(data.error)
  }
  return {
    comments: data.comments || [],
  };
};

const mapPropsToOptions = ({ discussionRef }) => ({
  discussionRef,
});

const defaultGetAuthorOnComment = comment => ({
  id: comment.authorRef,
  name: "Anonymous",
});

function createCommentContainer(options = {}) {
  options.userOnCommentFragment = options.userOnCommentFragment || defaultUserOnComment;
  options.getAuthorOnComment = options.getAuthorOnComment || defaultGetAuthorOnComment;
  const query = gql`
    query Comments($discussionRef: String!){
      comments(filter: { discussionRef: $discussionRef }) {
        ...CommentListView
      }
    }
    ${options.userOnCommentFragment}
    ${CommentListView.fragment}
  `;
  
  return graphql(
    query,
    {
      props: (...args) => ({
        getAuthorOnComment: options.getAuthorOnComment,
        ...mapQueryToProps(...args),
      }),
      options: mapPropsToOptions,
    },
  )(CommentListView);
}

export {
  createCommentContainer,
};
