const async = require('async')

const validateLogin = require('../validators/validateLogin')

const _mergeOptions = (...optionsArr) => {
  const merged = {}
  optionsArr.forEach(options => {
    for (let key in options) {
      let value = options[key]
      if (key.indexOf('pre') === 0 || key.indexOf('post') === 0) {
        merged[key] = merged[key] || []
        merged[key].push(value)
      } else {
        merged[key] = value
      }
    }
  })
  for (let key in merged) {
    let value = merged[key]
    if (key.indexOf('pre') === 0 || key.indexOf('post') === 0) {
      (() => {
        merged[key] = (req, res, next) => {
          async.series(value.map(middleware => {
            return next => {
              middleware(req, res, next)
            }
          }), next)
        }
      })(value)
    }
  }
  return merged
}

/**
 * @module rest
 */

// _ermQueryOptions
let defs = {
  users: {
    model: require('../../models/user'),
    options: {
      preCreate: validateLogin,
      preUpdate: validateLogin,
      preDelete: validateLogin,
      preRead:validateLogin
    }
  },
  tweets: {
    model: require('../../models/tweet'),
    options: {
      preCreate: validateLogin,
      preUpdate: validateLogin,
      preDelete: validateLogin,
      preRead:validateLogin
    }
  },
  tweetReviews:{
    model: require('../../models/tweetreview'),
    options: {
      preCreate: validateLogin,
      preUpdate: validateLogin,
      preDelete: validateLogin,
      preRead:validateLogin
    }
  }
}
for (let key in defs) {
  let def = defs[key]
  def.options = def.options || {}
  def.options = _mergeOptions(def.options)
}


module.exports = defs
