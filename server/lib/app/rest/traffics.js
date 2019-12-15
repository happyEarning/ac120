module.exports = () => {
  return {
    preCreate: (req, res, next) => {
      req.body.ip = req.header('X-Real-IP') || req.connection.remoteAddress
      req.body.client = req.header('charmdeer-client') || ''
      next()
    },
    preUpdate: (req, res, next) => {
      next(new Error('不允许修改访问记录'))
    }
  }
}
