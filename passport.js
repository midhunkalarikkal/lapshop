const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User'); // Adjust the path as needed

// Passport serialize user (for sessions)
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Passport deserialize user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// Google OAuth Strategy configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        } else {
            user = new User({
                username: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
            });
            await user.save();
            return done(null, user);
        }
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport; // Make sure to export passport
