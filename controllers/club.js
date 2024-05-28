const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Post = require('../models/post');
require('dotenv').config();

exports.index = asyncHandler(async (req, res, next) => {
  const posts = await Post.find()
    .sort({ created_at: 1 })
    .populate('author')
    .exec();

  res.render('index', { title: 'Clubhouse Home', posts: posts });
});

exports.join_get = (req, res, next) => {
  res.render('join_form', { title: 'Join the club' });
};

exports.join_post = [
  body('passcode')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Passcode must not be empty')
    .custom((value) => {
      return value === process.env.CLUB_SECRET;
    })
    .withMessage('Invalid passcode'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const user = await User.findById(req.user.id).exec();

    if (user === null) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    if (!errors.isEmpty()) {
      res.render('join_form', {
        title: 'Join the club',
        errors: errors.array(),
      });
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        status: 'member',
      });
      res.redirect('/club');
    }
  }),
];

exports.post_create_get = (req, res, next) => {
  res.render('post_form', { title: 'Create new post' });
};

exports.post_create_post = [
  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('content', 'Content must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (!errors.isEmpty()) {
      res.render('post_form', {
        title: 'Create new post',
        post: post,
        errors: errors.array(),
      });
    } else {
      await post.save();
      res.redirect('/club');
    }
  }),
];

exports.post_details = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('author').exec();

  if (post === null) {
    const err = new Error('Post not found');
    err.status = 404;
    return next(err);
  }

  res.render('post_details', { title: 'Post Details', post: post });
});

exports.user_details = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();

  if (user === null) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }

  res.render('user_details', { title: 'User Details', user: user });
});
