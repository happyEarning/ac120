### 首屏接口：

get /api/user/get
* 返回如果包含user 首页动画效果结束后直接进入抽奖页面
* 如果user为null,进入填写信息页面
```javascript
{
  "success":true,
  "user":{
    "name":"张三",
    "telephone":15888888888,
    "times":5, // 剩余抽奖次数
  }
}

```

### 用户注册接口

post /api/user/register

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

### 抽奖接口

get /api/lottery

response:
```javascript
{
   "success":true,
    result:5, // 1 
}

```
