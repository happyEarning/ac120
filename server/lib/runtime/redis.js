var redis = require("redis");
var bluebird = require('bluebird')
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

module.exports.init = (next) => {
  var client = redis.createClient();
  module.exports.client = client
  client.on("error", function (err) {
    console.log("Error " + err);
  });
  client.on("connect", function (err) {
    console.log("redix 链接成功");
    next()
  });
}