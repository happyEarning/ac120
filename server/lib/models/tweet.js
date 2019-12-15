
var mongoose = require('mongoose'),
  Schema = mongoose.Schema

const schema = Schema({
  title: String, //标题
  link: String, //链接
  creatorRef: { type: Schema.Types.ObjectId, ref: 'user' },
  status: String,
  order: Number, //权重  数字越大 优先级越高
  limit: { type: Number, default: 0 }, // 上限
  views: { type: Number, default: 0 }, // 浏览次数
  limit2: { type: Number, default: null }, // 上限
  views2: { type: Number, default: null } // 浏览次数
}, {
    timestamps: true
  });


schema.pre('save', async function (next) {
  const doc = this
  if (!doc.order) {
    let tweet = await Tweet.findOne().sort({ order: 'desc' })
    let newOrder = 0
    if (tweet) {
      newOrder = (tweet.order || 0) + 1
    }
    doc.order = newOrder
  }
  next()
  // console.log()
  // if (doc.no) {
  //   next()
  // } else {
  //   const Model = require(`../${clazz}`)
  //   Model.findOne({}).sort({ no: -1 }).exec(function (err, model) {
  //     let no = 1
  //     if (model && model.no) {
  //       no = parseInt(model.no.substring(prefix.length)) + 1
  //     }
  //     if (min) {
  //       no = Math.max(no, min)
  //     }
  //     doc.no = `${prefix}${_pad(no, length)}`
  //     next()
  //   })
  // }
})

const Tweet = mongoose.model('tweet', schema)
module.exports = Tweet
