const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

// GET request for signup form
router.get('/signup', authController.signup_get);

// POST request for signup form
router.post('/signup', authController.signup_post);

// GET request for login form
router.get('/login', authController.login_get);

// POST request for login form
router.post('/login', authController.login_post);

// GET request for logout
router.get('/logout', authController.logout);

module.exports = router;
