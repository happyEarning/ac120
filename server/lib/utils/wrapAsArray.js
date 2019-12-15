const _ = require('lodash')

module.exports = input => {
  if (input !== undefined) {
    if (_.isArray(input)) {
      return input
    } else {
      return [input]
    }
  }
  return []
}
