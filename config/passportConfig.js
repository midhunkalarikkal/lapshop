const passport = require('passport')
const User = require('../models/userModel')

const GoogleStrategy = require('passport-google-oauth2').Strategy;


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8001/google/callback",
  passReqToCallback: true
},
  async function (request, accessToken, refreshToken, profile, done) {
    try {

      let user = await User.findOneAndUpdate(
        { email: profile.emails[0].value },
        {
          $set: {
            fullname: profile.displayName,
          }
        },
        { upsert: true, new: true }
      );
      return done(null, user);
    } catch (err) {
      console.error("Error updating/inserting user:", err);
      return done(err);
    }
  }

));

passport.serializeUser(function (user, done) {
  done(null, user);
})
passport.deserializeUser(function (user, done) {
  done(null, user);
})