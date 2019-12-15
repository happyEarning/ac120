const runtime = require('./runtime'),
  app = require('./app')
  // schedulers = require('./schedulers')

runtime.init(() => {
  app.bootstrap(() => {
    console.log('app bootstrap complete')
  })
  // schedulers.bootstrap(() => {
  //   console.log('schedulers bootstrap complete')
  // })
})
