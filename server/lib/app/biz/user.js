const _ = require('lodash')
const fs = require('fs')
const moment = require('moment')

const User = require('../../models/user'),
  validateLogin = require('../validators/validateLogin')

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
            res.$locals.writeData({ user:newUser })
            req.$session.setUser(newUser)
            next()
          })
        }
      })
    },
  ]
}

// 1 谢谢参与
// 2 问答卡1
// 3 问答卡2
// 4 问答卡3
// 5 吉祥物主场球衣
// 6 吉祥物客场球衣
// 7 礼包奖品

// 抽奖接口：
module.exports.lottery = {
  method: 'get',
  middlewares: [
    validateLogin,
    // 1 判断抽奖次数
    (req, res, next) => {
      let curUser = req.$injection.user
      if(curUser.times>0){
        next()
      }else{
        next(new Error('您的抽奖次数已经用完'))
      }
    },
     // 2 执行抽奖
    (req, res, next) => {
      // 先判断用户是否有过实物奖励

      // 在判断奖品是否还有
      // [5,6,7]
      // 生成一个1-4的随机数
      console.log(2)
      next()
    },
      // 3 减去次数 & 记录抽奖
    (req, res, next) => {
      console.log(3)
      next()
    },
  ]
}

// 抽奖历史接口：
// get /api/user/history

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