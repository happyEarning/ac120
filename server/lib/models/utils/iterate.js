const async = require('async')

const COMPLETE = 'complete'

module.exports = (Model, criteria, iterator, next) => {
  let skip = 0

  async.forever(next => {
    _findOne(skip, Model, criteria, iterator, err => {
      skip++
      next(err)
    })
  }, function (err) {
    if (err === COMPLETE) {
      next()
    } else {
      next(err)
    }
    // console.log(Model.collection.name + ' skip ' + (skip - 1) + ' err ' + err)
  })
}

const _findOne = function (skip, Model, criteria, iterator, next) {
  Model.findOne(criteria).skip(skip).exec(function (err, model) {
    if (model) {
      // console.log(Model.collection.name + ' skip ' + skip + ' ' + model.id);
      iterator(model, next)
    } else {
      next(err || COMPLETE)
    }
  })
}
