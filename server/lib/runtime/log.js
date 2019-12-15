const _ = require('lodash'),
  winston = require('winston'),
  Transport = winston.Transport,
  MongoDB = require('winston-mongodb').MongoDB,
  path = require('path'),
  moment = require('moment'),
  dp = require('dot-prop')

const config = require('../config'),
  db = config.log.db

const _baseOptions = {
  db: `mongodb://${db.user}:${db.password}@${db.url}:${db.port}/${db.schema}`,
  options: {
    poolSize: db.poolSize,
    autoReconnect: true
  }
}

module.exports.init = function (next) {
  // Default logger
  winston.add(MongoDB, _baseOptions)

  // Exception logger
  new winston.Logger({ // eslint-disable-line no-new
    exceptionHandlers: [
      new MongoDB(_.extend(_baseOptions, {
        collection: 'uncaught-exceptions'
      })),
      new winston.transports.Console({
        prettyPrint: true,
        collection: 'uncaught-exceptions'
      }),
      new SmsTransport()
    ],
    exitOnError: false
  })

  next()
}

module.exports.byJs = function (js) {
  let category = path.relative(config.root, js)
  category = category.replace(/\\/g, '/')
  return byCategory(category)
}

const byCategory = module.exports.byCategory = function (category) {
  category = category.replace(/\//g, '-')
  if (!winston.loggers.has(category)) {
    let transports = [
      new MongoDB(_.extend(_baseOptions, {
        collection: category
      }))
    ]
    if (!config.aliyun) {
      transports.push(
        new winston.transports.Console({
          timestamp: () => { return moment().format('YYYY-MM-DD HH:mm:ss.SSS') },
          humanReadableUnhandledException: true,
          prettyPrint: true,
          collection: category
        }))
    }
    winston.loggers.add(category, {
      transports
    })
  }

  let logger = winston.loggers.get(category)
  return logger
}

class SmsTransport extends Transport {
  log (level, message, info, callback) {
    if (config.prod && config.aliyun) {
      let at = dp.get(info, 'stack.1') || ''
      at = at.replace(/\\/g, '/')
      const YunpianDecorator = require('../decorators/YunpianDecorator')
      // 代码异常提醒：{1}发生在了{2}。
      YunpianDecorator.send(config.yuntongxun.itAdmins, '385649', [
        message,
        at
      ], callback)
    } else {
      callback()
    }
  }
}

process.on('unhandledRejection', error => {
  // Convert unhandledRejection to uncaughtException
  throw error
})
