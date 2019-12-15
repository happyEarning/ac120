
var mongoose = require('mongoose'),
  Schema = mongoose.Schema

const schema = Schema({
  reciverRef:{ type: Schema.Types.ObjectId, ref: 'user' },
  tweetRef:{ type: Schema.Types.ObjectId, ref: 'tweet' },
  status: { type: Number, default:0 },
  count: { type: Number, default:0 },
}, {
  timestamps: true
});
const TweetReview = mongoose.model('tweetreview', schema)

module.exports = TweetReview
