const _ = require('lodash')
const fs = require('fs')
const moment = require('moment')
const redis = require('../../runtime/redis')
const User = require('../../models/user'),
  Reward = require('../../models/reward'),
  validateLogin = require('../validators/validateLogin')

const getRandomIndex = (max) => {
  return Math.floor(Math.random() * max) + 1
}

const rewardMap = {
  1: '谢谢参与',
  2: '问答卡1',
  3: '问答卡2',
  4: '问答卡3',
  5: '吉祥物主场球衣',
  6: '吉祥物客场球衣',
  7: '礼包奖品',
}

// 用户登录
module.exports.get = {
  method: 'get',
  middlewares: [
    // (req, res, next) => {
    //   User.populate(req.$injection.user, 'levelRef', next)
    // },
    // validateLogin,
    (req, res, next) => {
      // todo 计算用户次数
      res.$locals.writeData({
        user: req.$injection.user || null
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
    (req, res, next) => {
      let name = req.body.name
      let telephone = req.body.telephone
      User.findOne({
        telephone
      }).exec((err, user) => {
        if (user) {
          // todo 计算用户次数
          res.$locals.writeData({ user })
          req.$session.setUser(user)
          next()
        } else {
          const newUser = new User()
          newUser.name = name
          newUser.telephone = telephone
          newUser.times = 1
          newUser.refreshDate = new Date
          newUser.save(err => {
            res.$locals.writeData({ user: newUser })
            req.$session.setUser(newUser)
            next()
          })
        }
      })
    },
  ]
}



// 抽奖接口：
module.exports.lottery = {
  method: 'get',
  middlewares: [
    validateLogin,
    // 1 判断抽奖次数
    (req, res, next) => {
      let curUser = req.$injection.user
      if (curUser.times > 0) {
        next()
      } else {
        next(new Error('您的抽奖次数已经用完'))
      }
    },
    // 2 执行抽奖
    async (req, res, next) => {
      let curUser = req.$injection.user
      let randomIndex
      // 先判断用户是否有过实物奖励
      if (!curUser.hasReward) {
        const client = redis.client
        // const redisKey= moment().format('YYYY-MM-DD')
        const redisKey = '2019-12-20'
        let rewardData = await client.getAsync(redisKey)
        rewardData = JSON.parse(rewardData)
        // 如果还有奖品 并且抽中了
        if (rewardData['5'] || rewardData['6'] || rewardData['7']) {
          const tempRandomIndex = getRandomIndex(7)
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
      const randomIndex = req.randomIndex
      let user = req.$injection.user
      let reward = new Reward()
      reward.type = randomIndex
      reward.userRef = user._id
      await reward.save()
      // 减去次数
      await User.findByIdAndUpdate(user._id, { times: user.times - 1 })
      res.$locals.writeData({
        result: randomIndex,
        recordId: reward._id
      })
      next()
    },
  ]
}

// 抽奖历史接口：
// get /api/user/history
module.exports.history = {
  method: 'get',
  middlewares: [
    validateLogin,
    // 1 判断抽奖次数
    async (req, res, next) => {
      let curUser = req.$injection.user
      let list = await Reward.find({ userRef: curUser._id, type: { $gt: 1 } })
      res.$locals.writeData({ data: list.map(item=>({
        name:rewardMap[item.type]
      })) })
      next()
    },
  ]
}


// 初始化抽奖数据 正式上线后 要删除此代码
module.exports.reset = {
  method: 'get',
  middlewares: [
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