module.exports = {
  User: require('./user'),
  Tweet: require('./tweet'),
  TweetReview: require('./tweetreview'),
}

// printer
// const path = require('path')
// const fs = require('fs')

// const basename = path.basename(__filename)
// fs.readdirSync(__dirname).forEach(js => {
//   if (js === basename) { return }
//   if (fs.lstatSync(path.join(__dirname, js)).isDirectory()) { return }

//   let name = js.split('.')[0]
//   let module = name.split('_').map(part => {
//     return part.substr(0, 1).toUpperCase() + part.substr(1)
//   }).join('')

//   console.log(`${module}: require('./${name}'),`)
// })
