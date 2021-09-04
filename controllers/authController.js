const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');

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
      const user = await User.isEmailTaken(email);
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
      return res.status(400).json({ errors: errors.array() });
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

exports.user_login = [
  passport.authenticate('local', { session: false }),
  (req, res, next) => {
    const refreshToken = jwt.sign(
      { id: req.user.id },
      process.env.REFRESH_TOKEN_SECRET,
    );

    const accessToken = jwt.sign(
      { id: req.user.id, isAdmin: req.user.isAdmin },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' },
    );

    return res.status(200).json({
      id: req.user.id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      refresh_token: refreshToken,
      access_token: accessToken,
    });
  },
];

exports.user_refresh_token = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const refreshToken = authHeader && authHeader.split(' ')[1];

  if (refreshToken === undefined) return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: err.message });
    User.findById(user.id, 'id isAdmin', (err, userData) => {
      if (err) {
        return next();
      }
      res.json({ id: userData.id, isAdmin: userData.isAdmin });
    });
  });
};
