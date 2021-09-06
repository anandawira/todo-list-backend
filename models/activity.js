const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Activity = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  hasImage: { type: Boolean, required: true, default: false },
  isDone: { type: Boolean, required: true, default: false },
});

Activity.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    return {
      id: ret._id,
      title: ret.title,
      description: ret.transform,
      hasImage: ret.hasImage,
      image_url: ret.image_url,
      isDone: ret.isDone,
    };
  },
});

Activity.virtual('image_url').get(function () {
  if (this.hasImage) {
    return '/' + this._id + '.png';
  } else {
    return null;
  }
});

module.exports = mongoose.model('Activity', Activity);
