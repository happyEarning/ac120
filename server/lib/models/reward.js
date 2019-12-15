
var mongoose = require('mongoose'),
  Schema = mongoose.Schema

const schema = Schema({
  userRef:{ type: Schema.Types.ObjectId, ref: 'user' },
  reward:String,
  name: String, // 姓名
  telephone: Number, //手机号
  address: Date, // 上次刷新日期，每次登录/用户注册的时候判断，如果refreshDate不是今天，那么改成今天 & times设置成1
}, {
  timestamps: true
});
const Reward = mongoose.model('reward', schema)
module.exports = Reward
