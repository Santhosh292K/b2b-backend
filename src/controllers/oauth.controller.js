const { generateTokenPair } = require('../utils/jwt.utils');
const config = require('../config/env');

/**
 * Cookie options for tokens
 */
const getAccessCookieOptions = () => ({
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
});

const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
});

/**
 * Set authentication cookies
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, getAccessCookieOptions());
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
};

/**
 * @desc    Initiate Google OAuth
 * @route   GET /api/oauth/google
 * @access  Public
 */
const googleAuth = (req, res, next) => {
    // Passport will handle the redirect to Google
    // This is just a placeholder, actual logic is in routes
};

/**
 * @desc    Google OAuth callback
 * @route   GET /api/oauth/google/callback
 * @access  Public
 */
const googleCallback = async (req, res, next) => {
    try {
        // User is attached to req by Passport
        const user = req.user;

        if (!user) {
            return res.redirect(`${config.frontendUrl}/login?error=oauth_failed`);
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokenPair(user);

        // Store refresh token in database
        await user.addRefreshToken(refreshToken);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Set cookies
        setAuthCookies(res, accessToken, refreshToken);

        // Redirect to frontend dashboard
        res.redirect(`${config.frontendUrl}/dashboard`);
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect(`${config.frontendUrl}/login?error=oauth_failed`);
    }
};

/**
 * @desc    OAuth failure handler
 * @route   GET /api/oauth/failure
 * @access  Public
 */
const oauthFailure = (req, res) => {
    res.redirect(`${config.frontendUrl}/login?error=oauth_failed`);
};

module.exports = {
    googleAuth,
    googleCallback,
    oauthFailure,
};
