const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

// GET request for signup form
router.get('/signup', authController.signup_get);

// POST request for signup form
router.post('/signup', authController.signup_post);

module.exports = router;
