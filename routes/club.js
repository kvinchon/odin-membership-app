const express = require('express');
const router = express.Router();

const clubController = require('../controllers/club');
const adminController = require('../controllers/admin');

// GET request for home page
router.get('/', clubController.index);

// GET request for join page
router.get('/join', clubController.join_get);

// POST request for join page
router.post('/join', clubController.join_post);

// GET request for creating a new post
router.get('/post/create', clubController.post_create_get);

// POST request for creating a new post
router.post('/post/create', clubController.post_create_post);

// GET request for post delete
router.get('/post/:id/delete', adminController.post_delete_get);

// POST request for post delete
router.post('/post/:id/delete', adminController.post_delete_post);

// GET request for a single post details
router.get('/post/:id', clubController.post_details);

// GET request for user update form
router.get('/user/:id/update', adminController.user_update_get);

// POST request for user update
router.post('/user/:id/update', adminController.user_update_post);

// GET request for user delete
router.get('/user/:id/delete', adminController.user_delete_get);

// POST request for user delete
router.post('/user/:id/delete', adminController.user_delete_post);

// GET request for a single user details
router.get('/user/:id', clubController.user_details);

// GET request for admin dashboard
router.get('/admin', adminController.index);

module.exports = router;
