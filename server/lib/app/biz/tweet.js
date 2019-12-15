const _ = require('lodash')
const fs = require('fs')
const moment = require('moment')
const dotProp = require('dot-prop')

const redis = require('../../runtime/redis')

module.exports.getByUserName = {
  method: 'get',
  middlewares: [
    async (req, res, next) => {
      let client = redis.client

      let username = req.query.customer
      let userRes = await client.getAsync(username)
      if(userRes){
        let user = JSON.parse(userRes)
        let userTweets = user.tweets || []
        
        let availableTweetsStr = await  Promise.all(userTweets.map(tw=>client.getAsync(tw.tweetRef)))
        let availableTweets = availableTweetsStr.map(tw=>JSON.parse(tw)) 
        let newtweets = availableTweets.filter(item=>{
          return item && item.views <= item.limit
        })
        newtweets.sort((a,b)=>{
          return b.order - a.order
        })
        let firstTweet = dotProp.get(newtweets, '0')
        if (firstTweet) {
          firstTweet.views = firstTweet.views+1
          client.set(firstTweet._id,JSON.stringify(firstTweet))
          let link = firstTweet.link
          res.send(`<script>location.href="${link}"</script>`);
        }else{
          res.send('');
        }
      }else{
        res.send('');
      }

    }
  ]
}
