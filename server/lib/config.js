const fs = require('fs'),
  path = require('path')

const _ = require('lodash')
const moment = require('moment')
moment.locale('zh-cn')

const _mkdir = path => {
  try {
    fs.mkdirSync(path)
  } catch (err) {
  }
  return path
}


module.exports = (function (prod) {
  let dbServer = 'localhost'
  if (prod) {
    // dbServer = aliyun ? '172.19.99.222' : 'prod.charmdeer.com'
  }
  var config = {
    prod: prod,
    root: __dirname,
    // db
    db: {
      url: dbServer,
      port: 27017,
      schema: 'ac120',
      // user: 'tuiwenu',
      // password: 'tuiwen',
      poolSize:25
    },
    // Express server
    app: {
      port: 30001,
      cookieSecret: 'cookieSecret',
      sessionSecret: 'sessionSecret'
    },
    download: {
      tmpDir: _mkdir(path.join(__dirname, '../tmp/')),
    },
  }


  return config
})(
  process.argv.indexOf('prod') !== -1,
)
