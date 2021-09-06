const Activity = require('../models/activity');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

exports.activity_create = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title CANNOT be empty'),
exports.activity_list = (req, res, next) => {
  res.send('GET');
};
exports.activity_edit = (req, res, next) => {
  res.send('PUT');
};
exports.activity_delete = (req, res, next) => {
  res.send('DELETE');
};
exports.activity_add_photo = (req, res, next) => {};
