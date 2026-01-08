const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { googleCallback, oauthFailure } = require('../controllers/oauth.controller');

/**
 * @route   GET /api/oauth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

/**
 * @route   GET /api/oauth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/api/oauth/failure',
        session: false, // We're using JWT, not sessions
    }),
    googleCallback
);

/**
 * @route   GET /api/oauth/failure
 * @desc    OAuth failure redirect
 * @access  Public
 */
router.get('/failure', oauthFailure);

module.exports = router;
