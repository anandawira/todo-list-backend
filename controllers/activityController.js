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
      author: req.user.id,
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
exports.activity_list = async (req, res, next) => {
  User.findById(req.user.id, 'activities')
    .populate('activities', 'title description hasImage isDone')
    .exec((err, result) => {
      if (err) {
        return next(err);
      }

      return res.json(result.activities);
    });
};
exports.activity_edit = [
  body('title')
    .exists()
    .withMessage("'title' not found in form data")
    .isLength({ min: 1 })
    .withMessage('Title CANNOT be empty'),
  body('description')
    .exists()
    .withMessage("'description' not found in form data"),
  body('isDone')
    .exists()
    .withMessage("'isDone' not found in form data")
    .isBoolean()
    .withMessage('Value must be boolean')
    .toBoolean(),
  (req, res, next) => {
    // Check if validations passed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if activity id valid
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid object Id' });
    }

    // Get activity object from database
    Activity.findById(req.params.id, (err, activity) => {
      // Check if error
      if (err) {
        return next(err);
      }

      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
      }
      // Check if owner field match with req.params.id
      if (req.user.id !== activity.author.toString()) {
        return res
          .status(403)
          .json({ message: "User don't have access to this activity" });
      }

      // Modify activity object
      activity.title = req.body.title;
      activity.description = req.body.description;
      activity.isDone = req.body.isDone;

      // Save activity to the database
      activity.save((err) => {
        if (err) {
          return next(err);
        }

        return res.status(200).json({ message: 'Activity updated' });
      });
    });
  },
];
exports.activity_delete = (req, res, next) => {
  res.send('DELETE');
};
exports.activity_add_photo = (req, res, next) => {};
