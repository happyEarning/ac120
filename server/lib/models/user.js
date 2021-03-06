
var mongoose = require('mongoose'),
  Schema = mongoose.Schema

const schema = Schema({
  name: String, // 姓名
  telephone:String, //手机号
  times:Number, //数字
  todayTimes:Number, //今日已获取次数 最高为10 每日处世设置为1
  refreshDate:Date, // 上次刷新日期，每次登录/用户注册的时候判断，如果refreshDate不是今天，那么改成今天 & times设置成1
  hasReward:false // 是否有实物奖品 默认false
}, {
  timestamps: true
});
const User = mongoose.model('user', schema)
module.exports = User
