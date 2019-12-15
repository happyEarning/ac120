
var schedule = require('node-schedule');
 
var dbsync = require('./dbsync')

module.exports.bootstrap = (next)=>{
  dbsync.init()
  // 设置每5分钟更新一次
  var j = schedule.scheduleJob('*/5 * * * *', function(){
    dbsync.init()
  });
  next()
}