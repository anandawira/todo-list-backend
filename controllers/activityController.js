const Activity = require('../models/activity');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Multer = require('multer');
const path = require('path');
const multerGoogleStorage = require('multer-google-storage');

exports.activity_create = [
  // Validate title form
  body('title')
    .exists()
    .withMessage("'title' not found in form data")
    .isLength({ min: 1 })
    .withMessage('Title CANNOT be empty'),
  // Validate description form
  body('description')
    .exists()
    .withMessage("'description' not found in form data"),
  body('image_url').isURL().optional(),
  (req, res, next) => {
    // Check validation result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create activity object based on request body
    const activity = new Activity({
      _id: new mongoose.Types.ObjectId(),
      author: req.user.id,
      title: req.body.title,
      description: req.body.description,
      hasImage: req.body.image_url === undefined ? false : true,
      image_url: req.body.image_url === undefined ? '' : req.body.image_url,
    });

    console.log(activity);

    // Save activity
    activity.save((err) => {
      if (err) {
        return next(err);
      }

      // Add activity id to user object's activities array
      User.findByIdAndUpdate(
        req.user.id,
        {
          $addToSet: { activities: activity._id },
        },
        (err) => {
          // Check errors
          if (err) {
            return next(err);
          }

          // Send response
          return res
            .status(201)
            .json({ message: 'Activity created successfully' });
        },
      );
    });
  },
];

exports.activity_list = (req, res, next) => {
  // Get activities from database
  User.findById(req.user.id, 'activities')
    .populate('activities', 'title description hasImage image_url isDone')
    .exec((err, result) => {
      // Check errors
      if (err) {
        return next(err);
      }

      // Check if user not found
      if (!result) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send response
      return res.json(result.activities);
    });
};
exports.activity_edit = [
  // Validate title form
  body('title')
    .exists()
    .withMessage("'title' not found in form data")
    .isLength({ min: 1 })
    .withMessage('Title CANNOT be empty'),

  // Validate description form
  body('description')
    .exists()
    .withMessage("'description' not found in form data"),

  // Validate isDone form
  body('isDone')
    .exists()
    .withMessage("'isDone' not found in form data")
    .isBoolean()
    .withMessage('Value must be boolean')
    .toBoolean(),
  body('image_url').isURL().optional(),
  (req, res, next) => {
    // Check if validations passed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if activity id is valid
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid object Id' });
    }

    // Get activity object from database
    Activity.findById(req.params.id, (err, activity) => {
      // Check if error
      if (err) {
        return next(err);
      }

      // Check if activity not found
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
      activity.hasImage =
        req.body.image_url === undefined ? activity.hasImage : true;
      activity.image_url =
        req.body.image_url === undefined
          ? activity.image_url
          : req.body.image_url;

      // Save activity to the database
      activity.save((err) => {
        // Check errors
        if (err) {
          return next(err);
        }

        // Send response
        return res.status(200).json({ message: 'Activity updated' });
      });
    });
  },
];
exports.activity_delete = async (req, res, next) => {
  // Check if activity id valid
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid object Id' });
  }

  // Check if this activity's owner is current user
  Activity.findById(req.params.id, (err, activity) => {
    // Check errors
    if (err) {
      return next(err);
    }

    // Check if activity exist
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if this activity's owner is current user
    if (req.user.id !== activity.author.toString()) {
      return res
        .status(403)
        .json({ message: "User don't have access to this activity" });
    }

    // Delete activity document
    Activity.findByIdAndDelete(activity.id, (err) => {
      // Check errors
      if (err) {
        return next(err);
      }

      // Send response
      return res.status(200).json({ message: 'Activity deleted successfully' });
    });
  });
};

const uploadHandler = Multer({
  storage: multerGoogleStorage.storageEngine(),
});

exports.activity_add_photo = (req, res) => {
  const upload = uploadHandler.single('image');

  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (req.file === undefined) {
      return res.status(400).json({ message: 'image field undefined' });
    }

    return res.status(200).json({
      image_url:
        'https://storage.googleapis.com/glints-ipe1/' + req.file.filename,
    });
  });
};
