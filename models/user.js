const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    first_name: { type: String, required: true, maxlength: 50 },
    last_name: { type: String, required: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      maxlength: 100,
      unique: true,
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

UserSchema.statics.findOneByEmail = function (email, callback) {
  return this.findOne({ email: email }, (err, user) => {
    callback(err, user);
  });
};

UserSchema.statics.isEmailExist = function (email) {
  return this.findOne({ email: email });
};

UserSchema.statics.changePasswordById = function (
  id,
  hashedPassword,
  callback,
) {
  this.findByIdAndUpdate(id, { password: hashedPassword }, (err, user) => {
    callback(err, user);
  });
};

module.exports = mongoose.model('User', UserSchema);
