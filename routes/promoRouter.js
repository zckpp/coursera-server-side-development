const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Promotions = require('../model/promotions');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

// handle /promotions
promoRouter.route('/')
.get((req, res, next) => {
  Promotions.find({})
  .then((promotions) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotions);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.post((req, res, next) => {
  Promotions.create(req.body)
  .then((promotion) => {
    console.log('promotion created ', promotion);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotion);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.put((req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /Promotions.');
})
.delete((req, res, next) => {
  // remove() is deprecated
  Promotions.deleteMany({})
  .then((rsp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(rsp);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
});

// handle /promotions/:promoId
promoRouter.route('/:promoId')
.get((req, res, next) => {
  Promotions.findById(req.params.promoId)
  .then((promotion) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotion);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.post((req, res, next) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /promotions/:${req.params.promoId}`);
})
// { new: true } will return the updated item
.put((req, res, next) => {
  Promotions.findByIdAndUpdate(req.params.promoId, {
    $set: req.body
  }, { new: true })
  .then((promotion) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(promotion);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.delete((req, res, next) => {
  promotions.findByIdAndRemove(req.params.promoId)
  .then((rsp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(rsp);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
});

module.exports = promoRouter;
