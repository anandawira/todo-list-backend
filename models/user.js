const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');

const UserSchema = new Schema({
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
});

UserSchema.statics.findOneByEmail = function (email) {
  return this.findOne({ email: email });
};

module.exports = mongoose.model('User', UserSchema);
