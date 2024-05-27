const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  last_name: { type: String, required: true, maxLength: 100 },
  username: { type: String, required: true, maxLength: 100 },
  password: { type: String, required: true },
  admin: { type: Boolean },
  status: {
    type: String,
    required: true,
    enum: ['guest', 'member', 'vip', 'moderator'],
    default: 'guest',
  },
});

UserSchema.virtual('name').get(function () {
  return `${this.first_name} ${this.last_name}`;
});

UserSchema.virtual('url').get(function () {
  return `/user/${this._id}`;
});

module.exports = mongoose.model('User', UserSchema);
