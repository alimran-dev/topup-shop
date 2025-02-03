const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_DOMAIN}/user/google/callback`,
    },
    (accessToken, refreshToken, profile, cb) => {
      const user = {
        name: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value,
      };
      // console.log(user);
      return cb(null, user);
    }
  )
);
