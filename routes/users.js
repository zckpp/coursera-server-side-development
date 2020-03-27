var express = require('express');
const bodyParser = require('body-parser');
const User = require('../model/user');
var usersRouter = express.Router();
usersRouter.use(bodyParser.json());

/* GET users listing. */
usersRouter.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

usersRouter.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then(user => {
    if (user != null) {
      let err = new Error('User ' + req.body.username + ' already exists.');
      err.status = 403;
      next(err);
    } else {
      return User.create({
        username: req.body.username,
        password: req.body.password
      })
    }
  })
  .then(user => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      status: 'Registration suceed.',
      user: user
    });
  }, err => next(err))
  .catch(err => {
    next(err);
  });
});

usersRouter.post('/login', (req, res, next) => {
  if (!req.session.user) {
    let authHeader = req.headers.authorization;
    if (!authHeader) {
      let err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    let auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    let username = auth[0];
    let password = auth[1];

    User.findOne({username: username})
    .then(user => {
      if (user === null) {
        let err = new Error('User ' + username + ' not found.');
        err.status = 403;
        return next(err);
      } else if (user.password != password) {
        let err = new Error('Password incorrect.');
        err.status = 403;
        return next(err);
      } else {
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated.');
      }
    })
    .catch(err => {
      next(err);
    });
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already login.');
  }
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
