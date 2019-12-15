module.exports = (staffFilter, nonStaffFilter, allowDeletion) => {
  return {
    contextFilter: function (model, req, done) {
      if (req.$session.getStaffRef()) {
        if (staffFilter) {
          model = staffFilter(model, req)
        }
        return done(model)
      } else {
        if (nonStaffFilter) {
          model = nonStaffFilter(model, req)
        }
        return done(model.find({
          userRef: req.$session.getUserRef()
        }))
      }
    },
    preDelete: function (req, res, next) {
      if (allowDeletion) {
        next()
      } else {
        next(new Error('业务数据不允许删除'))
      }
    }
  }
}
