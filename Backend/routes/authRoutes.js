const express = require('express');
const router = express.Router();
const { registerUser, registerNgo, login } = require('../controllers/authController');

router.post('/register/user', registerUser);
router.post('/register/ngo', registerNgo);
router.post('/login', login);

module.exports = router;
