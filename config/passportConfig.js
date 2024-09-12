const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

module.exports = function () {
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
        try {
            console.log("profile : ",profile)
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                console.log("user already exist")
                return done(null, user);
            } else {
                const newUser = new User({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    fullname: profile.displayName
                });
                await newUser.save();
                console.log("new user saving : ",newUser)
                return done(null, newUser);
            }
        } catch (err) {
            console.log("Catch error : ",err)
            return done(err, false);
        }
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function(id, done) {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, false);
        }
    });
};
