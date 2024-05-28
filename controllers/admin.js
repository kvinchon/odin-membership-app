const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Post = require('../models/post');

exports.index = asyncHandler(async (req, res, next) => {
  const users = await User.find().sort({ username: 1 }).exec();

  if (!req.user || !req.user.admin) {
    const err = new Error('Unauthorized');
    err.status = 403;
    return next(err);
  }

  res.render('admin_dashboard', { title: 'Admin Dashboard', users: users });
});

exports.post_delete_get = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('author').exec();

  if (post === null) {
    const err = new Error('Post not found');
    err.status = 404;
    return next(err);
  }

  res.render('post_delete', { title: 'Delete Post', post: post });
});

exports.post_delete_post = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.admin) {
    const err = new Error('Unauthorized');
    err.status = 403;
    return next(err);
  }

  const post = await Post.findById(req.params.id).exec();

  if (post === null) {
    const err = new Error('Post not found');
    err.status = 404;
    return next(err);
  }

  await Post.findByIdAndDelete(req.body.postid);
  res.redirect('/club');
});

exports.user_update_get = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.admin) {
    const err = new Error('Unauthorized');
    err.status = 403;
    return next(err);
  }

  const user = await User.findById(req.params.id).exec();

  if (user === null) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  res.render('user_form', {
    title: 'Update User',
    user: user,
    statuses: ['guest', 'member', 'vip', 'moderator'],
  });
});

exports.user_update_post = [
  body('first_name', 'First name must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('last_name', 'Last name must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('username', 'Username must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('password').optional({ values: 'falsy' }).trim().escape(),
  body('confirm_password')
    .trim()
    .escape()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('Passwords must be identical'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!req.user || !req.user.admin) {
      const err = new Error('Unauthorized');
      err.status = 403;
      return next(err);
    }

    if (!errors.isEmpty()) {
      const user = await User.findById(req.params.id).exec();

      if (user === null) {
        const err = new Error('User not found');
        err.status = 404;
        return next(err);
      }

      res.render('user_form', {
        title: 'Update User',
        user: user,
        statuses: ['guest', 'member', 'vip', 'moderator'],
        errors: errors.array(),
      });
    } else {
      const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        admin: req.body.admin ? true : false,
        status: req.body.status,
        _id: req.params.id,
      });

      if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(req.params.id, user);
      res.redirect('/club');
    }
  }),
];

exports.user_delete_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();

  if (user === null) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  res.render('user_delete', { title: 'Delete User', user: user });
});

exports.user_delete_post = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.admin) {
    const err = new Error('Unauthorized');
    err.status = 403;
    return next(err);
  }

  const user = await User.findById(req.params.id).exec();

  if (user === null) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  // delete user and associated posts
  await Post.deleteMany({ author: req.body.userid });
  await User.findByIdAndDelete(req.body.userid);
  res.redirect('/club');
});
