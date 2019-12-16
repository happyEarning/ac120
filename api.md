### 首屏接口：

🚢 get /api/user/get
* 返回如果包含user 首页动画效果结束后直接进入抽奖页面
* 如果user为null,进入填写信息页面
```javascript
{
  "success":true,
  "user":{
    "_id":12345678,
    "name":"张三",
    "telephone":15888888888,
    "times":5, // 剩余抽奖次数
  }
}

```

### 用户注册接口

🚢 post /api/user/register

* 后端考虑重新注册的情况，如果已存在用户，则当作登录处理

body:
```javascript
{
  "name":"张三",
   "telephone":15888888888,
}
```

response:
```javascript
{
   "success":true,
    "times":5, // 剩余抽奖次数
}

```

### 抽奖历史接口：

🚢 get /api/user/history

```javascript
{
  "success":true,
  data:[
    {
     name:'AC米兰120周年礼物A',
    },
    {
     name:'AC米兰120周年礼物B',
    }
  ]
}

```

### 抽奖接口

🚢 get /api/user/lottery

奖品编号：
* 1 谢谢参与
* 2 问答卡1
* 3 问答卡2
* 4 问答卡3
* 5 吉祥物主场球衣
* 6 吉祥物客场球衣
* 7 礼包奖品

response:
```javascript
{
   "success":true,
   recordId:1222,//记录id
    result:5, // 奖品编号
}

or 

{
   "success":false,
   err:{
      message:"您抽奖的机会用完了"
   }
}
```

### 记录用户抽奖信息

🚢 post /api/user/record

body:
```javascript
{
  name:"张三",
  address:"上海市浦东新城区",
  recordId;1222
}
```

response:
```javascript
{
  success:true
}
```

### 用户点击分享

🚢post /api/user/share

response:
```javascript
{
  success:true，
  times:2 //剩余次数
}
```
