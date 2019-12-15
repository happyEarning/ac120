
/**
 * @since 3.0.0
 * @module runtime/tokenPool
 */

const uuidv4 = require('uuid/v4')
const NodeRSA = require('node-rsa')

let _tokens = {}

module.exports.init = function (next) {
  // Clear expired tokens
  setInterval(() => {
    let now = Date.now()
    for (let uuid in _tokens) {
      let timestamp = _tokens[uuid].timestamp
      if (now - timestamp > 5 * 60 * 1000) {
        delete _tokens[uuid]
      }
    }
  }, 60 * 1000)

  next()
}

/**
 * @memberof runtime/tokenPool
 * @method generate
 *
 */
module.exports.generate = () => {
  let raw = uuidv4()
  _tokens[raw] = { timestamp: Date.now() }
  return raw
}

module.exports.validate = (uuid) => {
  let timestamp = _tokens[uuid].timestamp
  if (timestamp) {
    delete _tokens[uuid]
    return true
  } else {
    return false
  }
}

/**
 * @memberof runtime/tokenPool
 * @method generateWithUserRef
 *
 */
module.exports.generateWithUserRef = (userRef) => {
  let raw = uuidv4()
  _tokens[raw] = { timestamp: Date.now(), userRef }
  return raw
}

/**
 * @memberof runtime/tokenPool
 * @method getUserRefByToken
 *
 */
module.exports.getUserRefByToken = (uuid) => {
  try {
    let userRef = _tokens[uuid].userRef
    delete _tokens[uuid]
    return userRef
  } catch (err) {
    return null
  }
}
