const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Activity = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  hasImage: { type: Boolean, required: true, default: false },
  isDone: { type: Boolean, required: true, default: false },
});

Activity.virtual('image_url').get(function () {
  return '/' + this._id;
});

module.exports = mongoose.model('Activity', Activity);
