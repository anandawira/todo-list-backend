const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

exports.user_create = [
  // Validate and sanitize fields.
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    .isAlpha()
    .withMessage('First name has non-alphabetical characters'),

  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Last name must be specified')
    .isAlpha()
    .withMessage('Last name has non-alphabetical characters'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Email invalid')
    .toLowerCase()
    .custom(async (email) => {
      const user = await User.findOneByEmail(email);
      if (user) {
        return Promise.reject('Email already in use');
      }
    }),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be more than 8 character length'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    // Hash user's password using bcrypt
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      // Check if hashing failed
      if (err) {
        return res.status(500).send('Password hashing failed');
      }

      // Create new User object from request body and hashed password
      const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: hashedPassword,
      });

      user.save((err) => {
        // Check if database query failed and put error message to response
        if (err) {
          return next(err);
        }
        // Send response 'Created' on success
        return res.sendStatus(201);
      });
    });
  },
];
