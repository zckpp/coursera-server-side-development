const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./model/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const config = require('./config');

// default User-authenticate method from passport-local-mongoose
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, {expiresIn: 3600});
}

const opts = {};
// include token in the header
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  console.log('JWT payload: ' + jwt_payload);
  User.findOne({_id: jwt_payload._id}, (err, user) => {
    if (err) return done(err, false);
    else if (user) return done(null, user);
    else return done(null, false);
  });
}));

// verify if user has token
exports.verifyUser = passport.authenticate('jwt', {session: false});