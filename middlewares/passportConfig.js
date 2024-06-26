const passport = require("passport");
const passportJWT = require("passport-jwt");
const User = require("../services/schemas/UserSchema");

require("dotenv").config();

const secret = process.env.SECRET;

const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;

const params = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(params, function (payload, done) {
    User.find({ _id: payload.id })
      .then(([user]) => {
        if (!user || !user.token) {
          return done(new Error("Userul nu exista!"));
        }
        return done(null, user);
      })
      .catch((err) => done(err));
  })
);
