const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('./model/user');
// default user authenticate method from passport-local-mongoose
exports.local = passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
