const _ = require('lodash')

module.exports = (schema, clazz, prefix, length, min) => {
  schema.pre('save', function (next) {
    const doc = this
    if (doc.no) {
      next()
    } else {
      const Model = require(`../${clazz}`)
      Model.findOne({}).sort({ no: -1 }).exec(function (err, model) {
        let no = 1
        if (model && model.no) {
          no = parseInt(model.no.substring(prefix.length)) + 1
        }
        if (min) {
          no = Math.max(no, min)
        }
        doc.no = `${prefix}${_pad(no, length)}`
        next()
      })
    }
  })
}

const _pad = function (n, width, z) {
  z = z || '0'
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}
