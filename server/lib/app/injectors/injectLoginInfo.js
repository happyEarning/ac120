const async = require('async'),
  // Staff = require('../../models/staff'),
  User = require('../../models/user')

module.exports = (req, res, next) => {
  async.parallel([
    // next => {
    //   const ref = req.$session.getStaffRef()
    //   if (ref) {
    //     Staff.findById(ref, (err, staff) => {
    //       req.$injection.staff = staff
    //       next()
    //     })
    //   } else {
    //     next()
    //   }
    // },
    next => {
      const ref = req.$session.getUserRef()
      if (ref) {
        User.findById(ref, (err, user) => {
          req.$injection.user = user
          next()
        })
      } else {
        next()
      }
    }
  ], next)
}
