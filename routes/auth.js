const express = require('express');
const router = express.Router();

// Import the controller functions for login, register, renderLogin, and renderRegister
const { login, register } = require('../controllers/auth');



// POST route for submitting login form
router.post('/login', login);


// POST route for submitting register form
router.post('/register', register);

module.exports = router;