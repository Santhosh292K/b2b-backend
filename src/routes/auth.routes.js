const express = require('express');
const router = express.Router();
const {
    register,
    login,
    logout,
    refreshToken,
    getMe,
    logoutAll,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, getMe);

module.exports = router;
