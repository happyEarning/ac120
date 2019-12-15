const mongoose = require('mongoose')

mongoose.Promise = Promise

const config = require('../config')

module.exports.init = function (next) {
  const db = config.db,
    url = `mongodb://${db.url}:${db.port}/${db.schema}`
  module.exports.url = url
  mongoose.connect(url, {
    useNewUrlParser: true,
    server: {
      poolSize: db.poolSize,
      socketOptions: {
        keepAlive: 256
      }
    }
  }, async (err) => {
    if(err){
      console.error('数据库链接错误',err)
    }else{
      next()
    }
  })
}
