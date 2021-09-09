const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.user_create = [
  // Validate and sanitize fields.
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name must be specified')
    .isAlpha()
    .withMessage('First name has non-alphabetical characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name must be specified')
    .isAlpha()
    .withMessage('Last name has non-alphabetical characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email invalid')
    .toLowerCase()
    .custom(async (email) => {
      const user = await User.isEmailExist(email);
      if (user) {
        return Promise.reject('Email already in use');
      }
    }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be more than 8 character length'),

  (req, res, next) => {
    // Check validation result
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
  (req, res) => {
    // Create refresh token
    const refreshToken = jwt.sign(
      { id: req.user.id, isAdmin: req.user.isAdmin },
      process.env.REFRESH_TOKEN_SECRET,
    );

    // Create access token
    const accessToken = jwt.sign(
      { id: req.user.id, isAdmin: req.user.isAdmin },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' },
    );

    // send response
    return res.status(200).json({
      id: req.user.id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      isAdmin: req.user.isAdmin,
      refresh_token: refreshToken,
      access_token: accessToken,
    });
  },
];

exports.send_reset_password_email = [
  async (req, res, next) => {
    // Get User by email
    const user = await User.isEmailExist(req.body.email);

    // Check if email not found
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Put user to request.
    req.user = user;
    return next();
  },
  (req, res, next) => {
    const resetToken = jwt.sign(
      { id: req.user.id },
      process.env.FORGET_PASSWORD_SECRET,
      { expiresIn: '15m' },
    );

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'glintsipe1@gmail.com', // generated ethereal user
        pass: process.env.GMAIL_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    transporter.sendMail(
      {
        from: '"ToDoList App Glints-IPE1" <glintsipe1@gmail.com>', // sender address
        to: req.user.email, // list of receivers
        subject: 'Password Reset', // Subject line
        html: `<p>Hey ${req.user.first_name}!</p>
        <p>
          Looks like you forgot your password. We cannot simply send you your old
          password. A unique link to reset your password has been generated for you. To
          reset your password, click the following link and follow the instructions.
          <a href="https://multiform-tears.000webhostapp.com/recover?token=${resetToken}">Click here to reset your password</a> This link will expire in 15 minutes.
        </p>
        <p></p>
        <p>ToDoList App - Glints IPE 1</p>
        `, // html body
      },
      (err, info) => {
        // Check errors
        if (err) {
          return next(err);
        }

        // Send response
        return res.sendStatus(200);
      },
    );
  },
];

exports.reset_password = [
  (req, res, next) => {
    // Check reset token
    jwt.verify(
      req.params.resetToken,
      process.env.FORGET_PASSWORD_SECRET,
      (err, user) => {
        // Check errors
        if (err) {
          return res.status(403).json({ message: err.message });
        }
        // Add user to request object
        req.user = user;
        next();
      },
    );
  },
  // Validate password form
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be more than 8 character length'),
  (req, res, next) => {
    // Check validation result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Password must be more than 8 character length' });
    }

    // Convert plain password to hash
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      // Check if hashing failed
      if (err) {
        return res.status(500).send('Password hashing failed');
      }

      // Change password on database
      User.changePasswordById(req.user.id, hashedPassword, (err, user) => {
        // Check errors
        if (err) {
          return next(err);
        }

        // send response
        return res
          .status(200)
          .json({ message: 'Password updated successfully' });
      });
    });
  },
];
