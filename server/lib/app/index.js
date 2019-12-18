const express = require('express'),
  _ = require('lodash')
  // UAParser = require('ua-parser-js'),
  // parseurl = require('parseurl')

const config = require('../config'),
  db = require('../runtime/db')
  // log = require('../runtime/log'),
  // logger = log.byCategory('api-trace')

const SERVICE_ROOT = '/api'

module.exports.bootstrap = (next) => {
  const app = express()

  _vendorMiddlewares(app)
  _appMiddlewares(app)
  _biz(app)
  _errHandler(app)
  // Listen
  app.listen(config.app.port)

  next()
}

const _vendorMiddlewares = app => {
  const cors = require('cors'),
    connect = require('connect'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    // sessionMongoose = require('session-mongoose'),
    bodyParser = require('body-parser'),
    responseTime = require('response-time'),
    methodOverride = require('method-override')

  // Log response time
  app.use(responseTime())
  // Cross domain
  // if (!config.prod) {
  //   app.use(cors({
  //     origin: true,
  //     credentials: true
  //   }))
  // } else {
  //   const whitelist = [
  //     'http://admin.charmdeer.com',
  //     'http://m-admin.charmdeer.com',
  //     'http://v-admin.charmdeer.com',
  //     'http://m-app.charmdeer.com'
  //   ]
  //   app.use(cors({
  //     origin: (origin, next) => {
  //       let allow = !origin || whitelist.indexOf(origin) !== -1
  //       if (allow) {
  //         next(null, true)
  //       } else {
  //         next(null, true)
  //         // next(new Error('Not allowed by CORS'))
  //       }
  //     },
  //     credentials: true
  //   }))
  // }

  // Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
  app.use(methodOverride())
  // Cookie parser
  app.use(cookieParser(config.app.cookieSecret))
  // Session
  app.use(session({
    secret: config.app.sessionSecret,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000
    },
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      url: db.url,
      ttl: 1 * 24 * 60 * 60 // = 1 days
    })
  }))
  // Body parser
  app.use((req, res, next) => {
      req.headers['content-type'] = 'application/json'
    next()
  })
  app.use(bodyParser.json({
    limit: '50mb'
  }))
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  }))
  // Disable cache by default
  app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    next()
  })
}

const _appMiddlewares = app => {
  // inject accessors
  const SessionAccessor = require('./accessors/SessionAccessor'),
    LocalsAccessor = require('./accessors/LocalsAccessor')

  app.use((req, res, next) => {
    // Prepare output
    req.$injection = {}
    req.session = req.session || {}
    req.$session = new SessionAccessor(req)
    res.locals = {}
    res.$locals = new LocalsAccessor(res.locals)
    next()
  })
  // injectLoginInfo
  app.use(require('./injectors/injectLoginInfo'))
}

const _biz = app => {
  const router = express.Router()
  const biz = require('./biz')

  const output = (req, res) => {
    res.json(res.$locals.getData())
  }
  for (let categoryName in biz) {
    const category = biz[categoryName]
    for (let apiName in category) {
      const api = category[apiName]
      router[api.method](`/${categoryName}/${apiName}${api.wildcard ? '/*' : ''}`, api.middlewares, api.output || output)
    }
  };

  app.use(`${SERVICE_ROOT}`, router)
}

const _errHandler = (app) => {
 
  app.use((err, req, res, next) => {
    const json = { message: err.message }
    if (err instanceof Error) {
      json.message = err.message
      // if (!config.prod) {
      //   json.stacks = err.stack.split('\n')
      // }
    } else {
      json.message = err
    }
 
    res.json({ err: json })
  })
}
