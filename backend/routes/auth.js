const express = require('express');
const { login } = require('../controllers/authController');
const validateInput = require('../middleware/validateInput');

const router = express.Router();

/**
 * @route   POST /auth
 * @desc    Handle Pi Authentication login
 * @access  Public (restricted by Pi SDK once integrated)
 */
router.post('/', validateInput, login);

module.exports = router; 
