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

const defaultOptimisticUserResponse = ({ownProps}) => ({
  authorRef: !ownProps.authorRef ? null : ownProps.authorRef, // can't be undefined
});

function createCommentContainer(options = {}) {
  const userOnCommentFragment = options.userOnCommentFragment || defaultUserOnComment;
  const getAuthorOnComment = options.getAuthorOnComment || defaultGetAuthorOnComment;
  const optimisticUserResponse = options.optimisticUserResponse || defaultOptimisticUserResponse;
  const query = gql`
    query Comments($discussionRef: String!){
      comments(filter: { discussionRef: $discussionRef }) {
        ...CommentListView
      }
    }
    ${userOnCommentFragment}
    ${CommentListView.fragment}
  `;

  const mutation = gql`
    mutation Reply($discussionRef: String!, $content: JSON!){
      reply(discussionRef: $discussionRef, content: $content) {
        ...CommentListView
      }
    }
    ${userOnCommentFragment}
    ${CommentListView.fragment}
  `;

  const withQuery = graphql(
    query,
    {
      props: (...args) => ({
        getAuthorOnComment: getAuthorOnComment,
        ...mapQueryToProps(...args),
      }),
      options: mapPropsToOptions,
    },
  );

  const withMutation = graphql(
    mutation,
    {
      props: ({ ownProps, mutate }) => ({
        reply: (content) => {
          return mutate({
            variables: {
              discussionRef: ownProps.discussionRef,
              content: content,
            },
            optimisticResponse: {
              __typename: 'Mutation',
              reply: {
                __typename: 'Comment',
                _id: 'unknow',
                content,
                createdAt: '2017-03-13T07:27:24.676Z',
                ...optimisticUserResponse({ ownProps, content }),
              },
            },
            updateQueries: {
              Comments: (prev, { mutationResult }) => {
                const newComment = mutationResult.data.reply;
                return {
                  ...prev,
                  comments: [...prev.comments, newComment],
                };
              },
            },
          });
        },
      }),
    },
  );
  
  return withMutation(withQuery(CommentListView));
}

export {
  createCommentContainer,
};
