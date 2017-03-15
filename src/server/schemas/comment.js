const Schema = require('mongoose').Schema;

const commentSchema = Schema({
  discussionRef: { type: String, required: true },
  slug: String,
  fullSlug: String,
  content: {},
  authorRef: String, // user reference
  likeRefs: [{ type: String }], // user reference
}, {
  timestamps: true,
});

module.exports = commentSchema;
