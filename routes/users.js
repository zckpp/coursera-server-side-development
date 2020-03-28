var express = require('express');
const bodyParser = require('body-parser');
const User = require('../model/user');
const passport = require('passport');

var usersRouter = express.Router();
usersRouter.use(bodyParser.json());

/* GET users listing. */
usersRouter.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

usersRouter.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password,
  (err, user) => {
    if (err) {
      err.status = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err:err});
    } else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          success: true,
          status: 'Registration suceed.'
        });
      });
    }
  });
});

usersRouter.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    status: 'Login suceed.'
  });
});

usersRouter.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    let err = new Error('You are not login.');
    err.status = 403;
    return next(err);
  }
});

module.exports = usersRouter;
