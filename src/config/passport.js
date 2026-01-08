const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');
const config = require('./env');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.clientId,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackUrl,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // User exists, return user
                    return done(null, user);
                }

                // Check if user exists with same email (link accounts)
                const email = profile.emails[0].value;
                user = await User.findOne({ email: email.toLowerCase() });

                if (user) {
                    // Link Google account to existing user
                    user.googleId = profile.id;
                    user.authProvider = 'google';
                    user.profilePicture = profile.photos[0]?.value || null;
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: email.toLowerCase(),
                    authProvider: 'google',
                    profilePicture: profile.photos[0]?.value || null,
                    isActive: true,
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

module.exports = passport;
