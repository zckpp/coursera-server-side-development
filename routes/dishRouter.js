const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Dishes = require('../model/dishes');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

// handle /dishes
dishRouter.route('/')
.get((req, res, next) => {
  Dishes.find({})
  .populate('comments.author')
  .then((dishes) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dishes);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Dishes.create(req.body)
  .then((dish) => {
    console.log('Dish created ', dish);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /dishes.');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  // remove() is deprecated
  Dishes.deleteMany({})
  .then((rsp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(rsp);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
});

// handle /dishes/:dishId
dishRouter.route('/:dishId')
.get((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .populate('comments.author')
  .then((dish) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /dishes/:${req.params.dishId}`);
})
// { new: true } will return the updated item
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Dishes.findByIdAndUpdate(req.params.dishId, {
    $set: req.body
  }, { new: true })
  .then((dish) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Dishes.findByIdAndRemove(req.params.dishId)
  .then((rsp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(rsp);
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
});

// handle /dishes/:dishId/comments
dishRouter.route('/:dishId/comments')
.get((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .populate('comments.author')
  .then((dish) => {
    if (dish != null) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish.comments);
    } else {
      err = new Error('Dish ' + req.params.dishId + 'not found');
      err.status = 404;
      // return err to error handler in app.js
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.post(authenticate.verifyUser, (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if (dish != null) {
      // save user _id as a reference to user
      req.body.author = req.user._id;
      dish.comments.push(req.body);
      dish.save()
      .then((dish) => {
        Dishes.findById(dish._id)
        // get user info with saved user _id
        .populate('comments.author')
        .then((dish) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish);
        })
      }, (err) => next(err))
    } else {
      err = new Error('Dish ' + req.params.dishId + 'not found');
      err.status = 404;
      // return err to error handler in app.js
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if (dish != null) {
      for (var i = (dish.comments.length -1); i >= 0; i--) {
        dish.comments.id(dish.comments[i]._id).remove();
      }
      dish.save()
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err));
    }
    else {
      err = new Error('Dish ' + req.params.dishId + ' not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
});

// handle /dishes/:dishId/comments/:commentId
dishRouter.route('/:dishId/comments/:commentId')
.get((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .populate('comments.author')
  .then((dish) => {
    if (dish != null && dish.comments.id(req.params.commentId) != null) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish.comments.id(req.params.commentId));
    } else if (dish == null) {
      err = new Error('Dish ' + req.params.dishId + 'not found');
      err.status = 404;
      // return err to error handler in app.js
      return next(err);
    } else {
      err = new Error('Comment ' + req.params.commentId + 'not found');
      err.status = 404;
      // return err to error handler in app.js
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.post(authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /dishes/:${req.params.dishId}/comments/:${req.params.commentId}`);
})
// { new: true } will return the updated item
.put(authenticate.verifyUser, (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if (dish != null && dish.comments.id(req.params.commentId) != null
        && dish.comments.id(req.params.commentId).author.equals(req.user._id)) {
        if (req.body.rating) {
            dish.comments.id(req.params.commentId).rating = req.body.rating;
        }
        if (req.body.comment) {
            dish.comments.id(req.params.commentId).comment = req.body.comment;
        }
        dish.save()
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err));
    }
    else if (dish == null) {
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.status = 404;
        return next(err);
    }
    else if (dish.comments.id(req.params.commentId) == null) {
        err = new Error('Comment ' + req.params.commentId + ' not found');
        err.status = 404;
        return next(err);
    }
    else {
        err = new Error('you are not authorized to update this comment!');
        err.status = 403;
        return next(err);
    }
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
})
.delete(authenticate.verifyUser, (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if (dish != null && dish.comments.id(req.params.commentId) != null
        && dish.comments.id(req.params.commentId).author.equals(req.user._id)) {
        dish.comments.id(req.params.commentId).remove();
        dish.save()
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err));
    }
    else if (dish == null) {
        err = new Error('Dish ' + req.params.dishId + ' not found');
        err.status = 404;
        return next(err);
    }
    else if (dish.comments.id(req.params.commentId) == null) {
        err = new Error('Comment ' + req.params.commentId + ' not found');
        err.status = 404;
        return next(err);
    }
    else {
        err = new Error('you are not authorized to delete this comment!');
        err.status = 403;
        return next(err);
    }
  }, (err) => next(err))
  .catch((err) => {
    next(err);
  });
});

module.exports = dishRouter;
