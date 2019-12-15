
const User = require('../models/user'),
Tweet = require('../models/tweet')

const redis = require('../runtime/redis')

// 将数据同步到redis中
// redis 保存users 和 tweets
module.exports.init = async ()=>{
  let client = redis.client
  // user 使用username做hash
  let allUsers = await User.find()
  allUsers.forEach(user=>{
    client.set(user.username,JSON.stringify(user))
  })
  // tweet 使用_id做hash
  let allTweets = await Tweet.find()
  allTweets.forEach(tweet=>{
    client.get(tweet._id.toString(),(err,reply)=>{
      if(reply){
        let redisTweet = JSON.parse(reply)
        if(redisTweet.views>tweet.views){
          Tweet.findByIdAndUpdate(redisTweet._id, { views: redisTweet.views }).exec()
          tweet.views = redisTweet.views
        }
      }
      client.set(tweet._id.toString(),JSON.stringify(tweet))
    })
  })
}