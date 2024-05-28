const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

PostSchema.virtual('url').get(function () {
  return `/club/post/${this._id}`;
});

PostSchema.virtual('created_at_formatted').get(function () {
  return DateTime.fromJSDate(this.created_at).toLocaleString(
    DateTime.DATETIME_MED
  );
});

module.exports = mongoose.model('Post', PostSchema);
