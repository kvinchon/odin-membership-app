const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');

exports.signup_get = (req, res, next) => {
  res.render('signup_form', { title: 'Sign up' });
};

exports.signup_post = [
  body('first_name', 'First name must not be empty')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body('last_name', 'Last name must not be empty')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body('username', 'Username must not be empty')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ username: value }).exec();

      if (user) {
        throw new Error('Username already used');
      }
    }),
  body('password', 'Password must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('confirm_password')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Confirm password must not be empty')
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('Passwords must be identical'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: req.body.password,
    });

    if (!errors.isEmpty()) {
      res.render('signup_form', {
        title: 'Sign up',
        user: user,
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        } else {
          user.password = hashedPassword;
          await user.save();
          res.redirect('/auth/login');
        }
      });
    }
  }),
];

exports.login_get = (req, res, next) => {
  res.render('login_form', { title: 'Log in' });
};

exports.login_post = [
  body('username', 'Username must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('password', 'Password must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    if (!errors.isEmpty()) {
      res.render('login_form', {
        title: 'Log in',
        user: user,
        errors: errors.array(),
      });
    }

    next();
  },

  passport.authenticate('local', {
    successRedirect: '/club',
    failureRedirect: '/auth/login',
  }),
];

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    res.redirect('/club');
  });
};
