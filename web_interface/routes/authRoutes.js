const express = require('express');
const router = express.Router();

// Import auth controller
const authController = require('../controllers/authController');

// Define auth routes
router.get('/login', authController.login);
router.get('/callback', authController.callback);

module.exports = router;
