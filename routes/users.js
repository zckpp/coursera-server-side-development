var express = require('express');
const bodyParser = require('body-parser');
const User = require('../model/user');
const passport = require('passport');
const authenticate = require('../authenticate');

var usersRouter = express.Router();
usersRouter.use(bodyParser.json());

/* GET users listing. */
usersRouter.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
  .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});

usersRouter.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password,
  (err, user) => {
    if (err) {
      err.status = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err:err});
    } else {
      if (req.body.firstname) {
        user.firstname = req.body.firstname;
      }
      if (req.body.lastname) {
        user.lastname = req.body.lastname;
      }
      user.save((err, user) => {
        if (err) {
          err.status = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err:err});
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({
            success: true,
            status: 'Registration suceed.'
          });
        });
      });
    }
  });
});

usersRouter.post('/login', passport.authenticate('local'), (req, res) => {
  let token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    token: token,
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
