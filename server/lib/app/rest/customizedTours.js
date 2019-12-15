const async = require('async')
const Traffic = require('../../models/traffic')
const User = require('../../models/user')
const YunpianDecorator = require('../../decorators/YunpianDecorator')
const config = require('../../config')

module.exports = () => {
  return {
    postCreate: (req, res, next) => {
      next()

      let client = ''
      let customizedTour = req.erm.result
      async.series([
        next => {
          Traffic.findById(customizedTour.trafficRef).exec((err, traffic) => {
            client = traffic.client
            next()
          })
        }
      ], (err, result) => {
        const yuntongxun = config.yuntongxun
        const telephone = customizedTour.telephone || ''
        const params = [
          telephone,
          client
        ]

        async.series(yuntongxun.admins.map(admin => {
          return next => {
            YunpianDecorator.send(admin, yuntongxun.templates.customizedTourCreation, params, () => { next() })
          }
        }), () => {})
      })
    }
  }
}
