const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const XLSX = require('xlsx')
const redis = require('../../runtime/redis')
const config = require('../../config')
const User = require('../../models/user'),
  Reward = require('../../models/reward'),
  validateLogin = require('../validators/validateLogin')

const getRandomIndex = (max) => {
  return Math.floor(Math.random() * max) + 1
}

const getUserTimes = async (user) => {
  // 先判断日期 如果日期更新了 就设置成默认1
  if (!moment(user.refreshDate).isSame(moment(), 'day')) {
    await User.findByIdAndUpdate(user._id, {
      refreshDate: new Date(),
      times: 1,
      todayTimes: 1
    })
    return {
      times: 1,
      todayTimes: 1
    }
  }
  return {
    times: user.times,
    todayTimes: user.todayTimes
  }
}
// 用户登录
module.exports.get = {
  method: 'get',
  middlewares: [
    async (req, res, next) => {
      const curUser = req.$injection.user
      let times
      let todayTimes
      if (curUser) {
        let resp = await getUserTimes(curUser)
        times = resp.times
        todayTimes = resp.todayTimes
      }

      res.$locals.writeData({
        user: curUser ? {
          "name": curUser.name,
          "telephone": curUser.telephone,
          times,
          todayTimes
        } : null
      })
      next()
    }
  ]
}

// 用户注册
module.exports.register = {
  method: 'post',
  middlewares: [
    (req, res, next) => {
      if (!req.body.name || !req.body.telephone) {
        next(new Error('用户名和手机号不能为空'))
      } else {
        next()
      }
    },
    // 检查用户是否已经存在
    async (req, res, next) => {
      let name = req.body.name
      let telephone = req.body.telephone
      let findUser = await User.findOne({ telephone })
      if (findUser) {
        // todo 计算用户次数
        let resp = await getUserTimes(findUser)
        const times = resp.times
        res.$locals.writeData({
          user: {
            name: findUser.name,
            telephone: findUser.telephone,
            times
          }
        })
        req.$session.setUser(findUser)
        next()
      } else {
        const newUser = new User()
        newUser.name = name
        newUser.telephone = telephone
        newUser.times = 1
        newUser.refreshDate = new Date()
        newUser.todayTimes = 1
        newUser.save(err => {
          res.$locals.writeData({
            user: {
              name: newUser.name,
              telephone: newUser.telephone,
              times: 1
            }
          })
          req.$session.setUser(newUser)
          next()
        })
      }
    },
  ]
}

// 抽奖接口：
module.exports.lottery = {
  method: 'get',
  middlewares: [
    (req, res, next) => {
      let curUser = req.$injection.user
      next()
    },
    validateLogin,
    // 1 判断抽奖次数
    (req, res, next) => {
      let curUser = req.$injection.user
      if (curUser.times > 0) {
        next()
      } else {
        const errorMsg = curUser.todayTimes >= 10 ? '今日10次机会已用完，请明日继续参与活动' : '您的抽奖次数已经用完'
        next(new Error(errorMsg))
      }
    },
    // 2 执行抽奖
    async (req, res, next) => {
      let curUser = req.$injection.user
      let randomIndex
      // 先判断用户是否有过实物奖励
      if (!curUser.hasReward) {
        const client = redis.client
        const redisKey = moment().format('YYYY-MM-DD')
        let rewardData = await client.getAsync(redisKey)
        rewardData = rewardData ? JSON.parse(rewardData) : {}
        // 如果还有奖品 并且抽中了
        if (rewardData['5'] || rewardData['6'] || rewardData['7']) {
          let tempRandomIndex = getRandomIndex(300)
          if (tempRandomIndex == 99) {
            tempRandomIndex = 5
          } else if (tempRandomIndex == 199) {
            tempRandomIndex = 6
          } else if (tempRandomIndex == 299) {
            tempRandomIndex = 7
          }
          // 抽中奖品
          if (rewardData[tempRandomIndex]) {
            randomIndex = tempRandomIndex
            // 更新redis
            client.set(redisKey, JSON.stringify({
              ...rewardData,
              [randomIndex]: 0
            }))
          }
        }
      }
      randomIndex = randomIndex || getRandomIndex(4)
      req.randomIndex = randomIndex
      next()
    },
    // 3 减去次数 & 记录抽奖
    async (req, res, next) => {
      const rewardIndex = req.randomIndex
      let user = req.$injection.user
      let reward = new Reward()
      reward.type = rewardIndex
      reward.userRef = user._id
      await reward.save()
      // 减去次数 && 是否已经抽过实物
      const updateData = {
        times: user.times - 1
      }
      if (rewardIndex === 5 || rewardIndex === 6 || rewardIndex === 7) {
        updateData.hasReward = true
      }
      await User.findByIdAndUpdate(user._id, updateData)
      res.$locals.writeData({
        result: rewardIndex,
        recordId: reward._id
      })
      next()
    },
  ]
}

const nameMap = {
  1: 'AC米兰120周年尊享线上纪念卡',
  2: 'AC米兰120周年荣耀时刻线上限量纪念卡牌A',
  3: 'AC米兰120周年荣耀时刻线上限量纪念卡牌B',
  4: 'AC米兰120周年荣耀时刻线上限量纪念卡牌C',
  5: 'AC米兰120周年官方限量珍藏吉祥物玩偶主场款',
  6: 'AC米兰120周年官方限量珍藏吉祥物玩偶主场款',
  7: 'AC米兰120周年官方稀有珍藏吉祥物玩偶一对',
}


// 抽奖历史接口：
module.exports.history = {
  method: 'get',
  middlewares: [
    validateLogin,
    // 1 判断抽奖次数
    async (req, res, next) => {
      let curUser = req.$injection.user
      let list = await Reward.aggregate([{ $match: { userRef: curUser._id } }]).group({ _id: "$type" })
      res.$locals.writeData({
        data: list.map(item => ({
          name: nameMap[item._id]
        }))
      })
      next()
    },
  ]
}

// 记录实物卡接口：
module.exports.record = {
  method: 'post',
  middlewares: [
    validateLogin,
    async (req, res, next) => {
      if (!req.body.name || !req.body.recordId || !req.body.address) {
        next(new Error('参数不正确'))
      } else {
        next()
      }
    },
    async (req, res, next) => {
      let curUser = req.$injection.user
      const name = req.body.name
      const recordId = req.body.recordId
      const address = req.body.address

      let findRecord = await Reward.findOne({ _id: recordId, userRef: curUser._id })
      if (findRecord) {
        await Reward.findByIdAndUpdate(findRecord._id, {
          name,
          telephone: curUser.telephone, //手机号
          address
        })
        res.$locals.writeData({
          message: '记录成功',
        })
        next()
      } else {
        next(new Error('中奖记录不存在'))
      }
    },
  ]
}

// 分享接口：
module.exports.share = {
  method: 'post',
  middlewares: [
    validateLogin,
    async (req, res, next) => {
      let curUser = req.$injection.user
      let todayTimes = curUser.todayTimes || 1
      let times = curUser.times || 0
      if (todayTimes < 10) {
        await User.findByIdAndUpdate(curUser._id, {
          times: times + 1,
          todayTimes: todayTimes + 1
        })
        res.$locals.writeData({
          times: times + 1,
        })
        next()
      } else {
        res.$locals.writeData({
          times
        })
        next()
      }
    },
  ]
}

// 到处用户列表
module.exports.exportUser = {
  method: 'get',
  middlewares: [
    (req, res, next) => {
      if (req.query.key !== 'ac120AdminKey') {
        next(new Error('没有权限'))
      } else {
        next()
      }
    },
    async (req, res, next) => {
      let book = XLSX.utils.book_new()
      let data = [['姓名', '手机号', '注册时间']]
      const userList = await User.find()
      const rows = userList.map(user => ([user.name, user.telephone, moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss')]))
      var sheet = XLSX.utils.aoa_to_sheet(data.concat(rows))
      XLSX.utils.book_append_sheet(book, sheet, 'Sheet1')

      let fileName = path.join(config.download.tmpDir, `用户列表_${moment().format('YYYYMMDDHHmmss')}.xlsx`)
      XLSX.writeFile(book, fileName)
      res.download(fileName, (err) => {
        // fs.remove(fileName)
      })
    },
  ]
}

// 到处中奖列表
module.exports.exportRecord = {
  method: 'get',
  middlewares: [
    (req, res, next) => {
      if (req.query.key !== 'ac120AdminKey') {
        next(new Error('没有权限'))
      } else {
        next()
      }
    },
    async (req, res, next) => {
      let book = XLSX.utils.book_new()
      let data = [['姓名', '手机号', '收货地址', '奖品', '中奖时间']]
      let list = await Reward.find({ type: { $gt: 4 } }).populate('userRef')
      const rows = list.map(item => ([
        item.name || item.userRef.name,
        item.telephone || item.userRef.telephone,
        item.address,
        nameMap[item.type],
        moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')]))
      var sheet = XLSX.utils.aoa_to_sheet(data.concat(rows))
      XLSX.utils.book_append_sheet(book, sheet, 'Sheet1')

      let fileName = path.join(config.download.tmpDir, `中奖列表_${moment().format('YYYYMMDDHHmmss')}.xlsx`)
      XLSX.writeFile(book, fileName)
      res.download(fileName, (err) => {
        // fs.remove(fileName)
      })
    },
  ]
}

// 初始化抽奖数据 正式上线后 要删除此代码
module.exports.reset = {
  method: 'get',
  middlewares: [
    (req, res, next) => {
      if (req.query.key !== 'ac120AdminKey') {
        next(new Error('没有权限'))
      } else {
        next()
      }
    },
    async (req, res, next) => {
      let client = redis.client
      let rewards = [
        {
          key: '2019-12-20',
          data: {
            5: 1,
            6: 1,
            7: 1
          }
        }, {
          key: '2019-12-21',
          data: {
            5: 1,
            6: 0,
            7: 0
          }
        },
        {
          key: '2019-12-22',
          data: {
            5: 1,
            6: 0,
            7: 1
          }
        },
        {
          key: '2019-12-23',
          data: {
            5: 1,
            6: 0,
            7: 0
          }
        },
        {
          key: '2019-12-24',
          data: {
            5: 0,
            6: 1,
            7: 1
          }
        },
        {
          key: '2019-12-25',
          data: {
            5: 1,
            6: 0,
            7: 0
          }
        },
        {
          key: '2019-12-26',
          data: {
            5: 0,
            6: 1,
            7: 0
          }
        },
        {
          key: '2019-12-27',
          data: {
            5: 0,
            6: 0,
            7: 0
          }
        },
        {
          key: '2019-12-28',
          data: {
            5: 0,
            6: 1,
            7: 0
          }
        },
        {
          key: '2019-12-29',
          data: {
            5: 0,
            6: 0,
            7: 0
          }
        },
        {
          key: '2019-12-30',
          data: {
            5: 0,
            6: 1,
            7: 0
          }
        },
        {
          key: '2019-12-31',
          data: {
            5: 0,
            6: 0,
            7: 1
          }
        }
      ]

      rewards.forEach(item => {
        client.set(item.key, JSON.stringify(item.data))
      })
      next()
    },
  ]
}
// 无用
module.exports.login = {
  method: 'post',
  middlewares: [
    (req, res, next) => {
      if (!req.body.username || !req.body.password) {
        next(new Error('username and password is required'))
      } else {
        next()
      }
    },
    (req, res, next) => {
      let username = req.body.username
      let password = req.body.password
      User.findOne({
        username,
        password
      }).exec((err, user) => {
        if (user) {
          res.$locals.writeData({ user })
          req.$session.setUser(user)
          next()
        } else {
          next(new Error('Wrong password'))
        }
      })
    }
  ]
}
// 无用
module.exports.changePwd = {
  method: 'post',
  middlewares: [
    validateLogin,
    (req, res, next) => {
      if (!req.body.originPassword || !req.body.newPassword) {
        next(new Error('参数不对'))
      } else {
        next()
      }
    },

    async (req, res, next) => {
      let user = req.$injection.user
      let newPassword = req.body.newPassword
      let password = req.body.originPassword
      let findUser = await User.findOne({ _id: user._id, password })
      if (findUser) {
        await User.findByIdAndUpdate(user._id, { password: newPassword })
        next()
      } else {
        next(new Error('旧密码不对'))
      }
    }
  ]
}
// 无用
module.exports.logout = {
  method: 'post',
  middlewares: [
    (req, res, next) => {
      req.$session.clearUser()
      next()
    }
  ]
}