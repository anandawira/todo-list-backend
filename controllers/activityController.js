const Activity = require('../models/activity');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

exports.activity_create = [
  body('title')
    .exists()
    .withMessage("'title' not found in form data")
    .isLength({ min: 1 })
    .withMessage('Title CANNOT be empty'),
  body('description')
    .exists()
    .withMessage("'description' not found in form data"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const activity = new Activity({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      description: req.body.description,
    });

    activity.save((err) => {
      if (err) {
        return next(err);
      }

      User.findByIdAndUpdate(
        req.user.id,
        {
          $addToSet: { activities: activity._id },
        },
        (err) => {
          if (err) {
            return next(err);
          }

          return res
            .status(201)
            .json({ message: 'Activity created successfully' });
        },
      );
    });
  },
];
exports.activity_list = async(req, res, next) => {
  User.findById(req.user.id, 'activities')
    .populate('activities', 'title description hasImage isDone')
    .exec((err, result) => {
      if (err) {
        return next(err);
      }

      return res.json(result.activities);
    });
};
exports.activity_edit = (req, res, next) => {
  res.send('PUT');
};
exports.activity_delete = (req, res, next) => {
  res.send('DELETE');
};
exports.activity_add_photo = (req, res, next) => {};
