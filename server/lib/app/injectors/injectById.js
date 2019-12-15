const async = require('async'),
  // Staff = require('../../models/staff'),
  User = require('../../models/user')

module.exports = (Model, key, keyAs, populate) => {
  keyAs = keyAs || key
  return (req, res, next) => {
    const ref = req.body[key] || req.query[key]
    let query = Model.findById(ref)
    if (populate) {
      query = query.populate(populate)
    }
    query.exec((err, model) => {
      req.$injection[keyAs] = model
      next()
    })
  }
}
