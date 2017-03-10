import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import CommentListView from '../components/CommentListView';

const defaultUserOnComment = gql`
  fragment UserOnComment on Comment {
    authorRef
  }
`;

// const mapQueryToProps = ({ data }) => {
//   return {
//     comments: data.comments || [],
//   };
// };

// function createCommentContainer({
//   userOnCommentFragment = defaultUserOnComment,
// }) {
//   const query = gql`
//     query Comments($ref: String!){
//       comments(filter: { discussionRef: $ref }) {
//         ...CommentListView
//       }
//     }
//     ${userOnCommentFragment}
//     ${CommentListView.fragment}
//   `;
  
//   return graphql(
//     query,
//     {
//       props: mapQueryToProps,
//     }
//   );
// }

export default CommentListView;

// export {
//   createCommentContainer,
// };
