const dp = require('dot-prop')

module.exports = (src, pathSrc, target, pathTarget) => {
  pathTarget = pathTarget || pathSrc
  dp.set(target, pathTarget, dp.get(src, pathSrc))
}
