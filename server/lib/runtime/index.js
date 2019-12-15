// Init runtime: db connetion, logger, wechat api
const async = require('async')

const db = require('./db')
const redis = require('./redis')

module.exports.init = (next) => {
  async.parallel([
    db.init,
    redis.init
  ], next)
}
