import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { normallizeContentAndMentions } from '../../common/utils';

import Forum from '../components/Forum';

const defaultUserOnComment = gql`
  fragment UserOnComment on Comment {
    authorRef
  }
`;

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
    query Comments($discussionRef: String!, $after: ConnectionCursor){
      commentConnection(first: 20, filter: { discussionRef: $discussionRef }, after: $after, sort: CREATEDAT_DESC) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ...Forum
          }
        }
      }
    }
    ${userOnCommentFragment}
    ${Forum.fragment}
  `;

  const replyMutation = gql`
    mutation Reply($discussionRef: String!, $content: JSON!){
      reply(discussionRef: $discussionRef, content: $content) {
        ...Forum
      }
    }
    ${userOnCommentFragment}
    ${Forum.fragment}
  `;

  const likeMutation = gql`
    mutation LikeComment($commentId: MongoID!){
      likeComment(commentId: $commentId) {
        _id
        isLiked
        likeCount
      }
    }
  `;

  const unlikeMutation = gql`
    mutation UnlikeComment($commentId: MongoID!){
      unlikeComment(commentId: $commentId) {
        _id
        isLiked
        likeCount
      }
    }
  `;

  const deleteMutation = gql`
    mutation deleteComment($commentId: MongoID!){
      deleteComment(commentId: $commentId) {
        _id
        discussionRef
      }
    }
  `;

  const mapQueryToProps = ({ ownProps, data }) => {
    if (data.error) {
      console.error(data.error)
    }
    return {
      comments: !data.commentConnection ? [] : data.commentConnection.edges.map(edge => edge.node),
      loading: data.loading,
      hasMoreComment: !data.commentConnection ? false : data.commentConnection.pageInfo.hasNextPage,
      loadMore: () => {
        if (!data.commentConnection) {
          return Promise.reject();
        }
        return data.fetchMore({
          variables: {
            discussionRef: ownProps.discussionRef,
            after: data.commentConnection.pageInfo.endCursor,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            if (!fetchMoreResult.data) {
              return previousResult;
            }
            return {
              ...previousResult,
              commentConnection: {
                ...previousResult.commentConnection,
                pageInfo: fetchMoreResult.data.commentConnection.pageInfo,
                edges: [...previousResult.commentConnection.edges, ...fetchMoreResult.data.commentConnection.edges],
              },
            };
          },
        });
      },
    };
  };

  const mapPropsToOptions = ({ discussionRef }) => ({
    variables: {
      discussionRef,
    },
  });


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

  const withReply = graphql(
    replyMutation,
    {
      props: ({ ownProps, mutate }) => ({
        reply: (content) => {
          return mutate({
            variables: {
              discussionRef: ownProps.discussionRef,
              content,
            },
            optimisticResponse: {
              __typename: 'Mutation',
              reply: {
                __typename: 'Comment',
                _id: 'unknow',
                content: content,
                isLiked: false,
                likeCount: 0,
                createdAt: (new Date()).toString(),
                ...optimisticUserResponse({ ownProps, content }),
              },
            },
            updateQueries: {
              Comments: (previousResult, { mutationResult }) => {
                const newComment = mutationResult.data.reply;
                if (!mutationResult.data) {
                  return previousResult;
                }
                return {
                  ...previousResult,
                  commentConnection: {
                    ...previousResult.commentConnection,
                    edges: [{
                      node: newComment,
                      __typename: 'CommentEdge',
                    }, ...previousResult.commentConnection.edges],
                  },
                };
              },
            },
          });
        },
      }),
    },
  );

  const withLike = graphql(
    likeMutation,
    {
      props: ({ ownProps, mutate }) => ({
        likeComment: (id) => {
          const comment = ownProps.comments.filter(comment => comment._id === id);
          return mutate({
            variables: {
              commentId: id,
            },
            optimisticResponse: {
              __typename: 'Mutation',
              likeComment: {
                __typename: 'Comment',
                _id: id,
                isLiked: true,
                likeCount: comment[0] ? comment[0].likeCount + 1 : undefined,
              },
            },
            updateQueries: {
              Comments: (prev, { mutationResult }) => {
                const changedComment = mutationResult.data.likeComment;
                return {
                  ...prev,
                  commentConnection: {
                    ...prev.commentConnection,
                    edges: prev.commentConnection.edges.map(edge => {
                      const comment = edge.node;
                      if (comment._id === changedComment._id) {
                        return {
                          ...edge,
                          node: {
                            ...comment,
                            ...changedComment,
                          },
                        };
                      }
                      return edge;
                    }),
                  },
                };
              },
            },
          });
        },
      }),
    },
  );

  const withUnlike = graphql(
    unlikeMutation,
    {
      props: ({ ownProps, mutate }) => ({
        unlikeComment: (id) => {
          const comment = ownProps.comments.filter(comment => comment._id === id);
          return mutate({
            variables: {
              commentId: id,
            },
            optimisticResponse: {
              __typename: 'Mutation',
              unlikeComment: {
                __typename: 'Comment',
                _id: id,
                isLiked: false,
                likeCount: comment[0] ? comment[0].likeCount - 1 : undefined,
              },
            },
            updateQueries: {
              Comments: (prev, { mutationResult }) => {
                const changedComment = mutationResult.data.unlikeComment;
                return {
                  ...prev,
                  commentConnection: {
                    ...prev.commentConnection,
                    edges: prev.commentConnection.edges.map(edge => {
                      const comment = edge.node;
                      if (comment._id === changedComment._id) {
                        return {
                          ...edge,
                          node: {
                            ...comment,
                            ...changedComment,
                          },
                        };
                      }
                      return edge;
                    }),
                  },
                };
              },
            },
          });
        },
      }),
    },
  );

  const withDelete = graphql(
    deleteMutation,
    {
      props: ({ ownProps, mutate }) => ({
        deleteComment: (id) => {
          const comment = ownProps.comments.filter(comment => comment._id === id);
          return mutate({
            variables: {
              commentId: id,
            },
            optimisticResponse: {
              __typename: 'Mutation',
              deleteComment: {
                __typename: 'Comment',
                _id: id,
                discussionRef: comment.discussionRef,
              },
            },
            updateQueries: {
              Comments: (prev, { mutationResult }) => {
                const changedComment = mutationResult.data.deleteComment;
                return {
                  ...prev,
                  commentConnection: {
                    ...prev.commentConnection,
                    edges: prev.commentConnection.edges.filter(edge => {
                      return edge.node._id !== changedComment._id;
                    }),
                  },
                };
              },
            },
          });
        },
      }),
    },
  );
  
  return withQuery(withDelete(withUnlike(withLike(withReply(Forum)))));
}

export {
  createCommentContainer,
};