import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import CommentListView from '../components/CommentListView';

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
      commentConnection(first: 2, filter: { discussionRef: $discussionRef }, after: $after, sort: CREATEDAT_DESC) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ...CommentListView
          }
        }
      }
    }
    ${userOnCommentFragment}
    ${CommentListView.fragment}
  `;

  const replyMutation = gql`
    mutation Reply($discussionRef: String!, $content: JSON!){
      reply(discussionRef: $discussionRef, content: $content) {
        ...CommentListView
      }
    }
    ${userOnCommentFragment}
    ${CommentListView.fragment}
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
              content: content,
            },
            optimisticResponse: {
              __typename: 'Mutation',
              reply: {
                __typename: 'Comment',
                _id: 'unknow',
                content,
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
                console.log({
                  ...previousResult,
                  commentConnection: {
                    ...previousResult.commentConnection,
                    edges: [...previousResult.commentConnection.edges, {
                      node: newComment,
                    }],
                  },
                })
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
  
  return withQuery(withUnlike(withLike(withReply(CommentListView))));
}

export {
  createCommentContainer,
};
