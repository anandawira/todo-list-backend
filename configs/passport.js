const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

module.exports = function (app) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      (username, password, done) => {
        User.findOneByEmail(username, (err, user) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, { message: 'Incorrect email' });
          }

          bcrypt.compare(password, user.password, (err, res) => {
            if (err) {
              return done(err);
            }
            console.log('hahaha');
            if (res) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Incorrect password' });
            }
          });
        });
      },
    ),
  );
};
