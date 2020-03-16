const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Leaders = require('../model/leaders');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

// handle /leaders
leaderRouter.route('/')
.get((req, res, next) => {
  Leaders.find({})
  .then((leaders) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(leaders);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.post((req, res, next) => {
  Leaders.create(req.body)
  .then((leader) => {
    console.log('leader created ', leader);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(leader);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.put((req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /Leaders.');
})
.delete((req, res, next) => {
  // remove() is deprecated
  Leaders.deleteMany({})
  .then((rsp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(rsp);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
});

// handle /leaders/:leaderId
leaderRouter.route('/:leaderId')
.get((req, res, next) => {
  Leaders.findById(req.params.leaderId)
  .then((leader) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(leader);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.post((req, res, next) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /promotions/:${req.params.leaderId}`);
})
// { new: true } will return the updated item
.put((req, res, next) => {
  Leaders.findByIdAndUpdate(req.params.leaderId, {
    $set: req.body
  }, { new: true })
  .then((leader) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(leader);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.delete((req, res, next) => {
  Leaders.findByIdAndRemove(req.params.leaderId)
  .then((rsp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(rsp);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
});
module.exports = leaderRouter;