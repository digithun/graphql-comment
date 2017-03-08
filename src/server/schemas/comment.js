const Schema = require('mongoose').Schema;

const CommentSchema = Schema({
  discussionRef: { type: String, required: true },
  slug: String,
  fullSlug: String,
  content: {},
  authorRef: String,
}, {
  timestamps: true,
});

module.exports = CommentSchema;
