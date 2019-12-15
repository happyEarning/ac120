const async = require('async')

module.exports = (req, res, next) => {
  if (req.$injection.user || req.$injection.staff) {
    next()
  } else {
    next(new Error('未登录'))
  }
}
