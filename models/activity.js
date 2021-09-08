const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const Activity = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  hasImage: { type: Boolean, required: true, default: false },
  image_url: { type: String, default: '' },
  isDone: { type: Boolean, required: true, default: false },
});

Activity.set('toJSON', {
  versionKey: false,
  transform: function (doc, ret) {
    return {
      id: ret._id,
      title: ret.title,
      description: ret.description,
      hasImage: ret.hasImage,
      image_url: ret.image_url,
      isDone: ret.isDone,
    };
  },
});

Activity.post('findOneAndDelete', function (docs) {
  User.findById(docs.author, (err, user) => {
    if (err) {
      console.log(err);
    }
    user.activities.pull(docs._id);
    user.save((err) => {
      if (err) {
        console.log(err);
      }
    });
  });
});

module.exports = mongoose.model('Activity', Activity);
