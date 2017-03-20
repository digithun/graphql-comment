const Schema = require('mongoose').Schema;
const mongoose_delete = require('mongoose-delete');

const commentSchema = Schema({
  discussionRef: { type: String, required: true },
  slug: String,
  fullSlug: String,
  content: {},
  authorRef: String, // user reference
  likeRefs: [{ type: String }], // user reference
  mentions: [{
    startAt: Number,
    text: String,
    userRef: String,
  }],
}, {
  timestamps: true,
});

commentSchema.plugin(mongoose_delete, { overrideMethods: 'all' });

module.exports = commentSchema;
