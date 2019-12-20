var nativeShare = new NativeShare()
var acResult = 1;
var addable = false
var list = ['', '/poster_result1.png', '/poster_result2.png', '/poster_result3.png', '/poster_result4.png', '/poster_result7.png', '/poster_result7.png', '/poster_result7.png']
function initShare () {
    addable = true
    var shareData = {
        title: '偷偷告诉你，这是我们的小秘密',
        desc: 'AC米兰120周年惊喜大奖藏在这里！',
        // 如果是微信该link的域名必须要在微信后台配置的安全域名之内的。
        link: 'https://project.sdsinfotech.com/ACM120/index.html',
        icon: 'https://project.sdsinfotech.com/ACM120/img' + list[acResult],
        // 不要过于依赖以下两个回调，很多浏览器是不支持的
        success: function () {
            // alert('success')
        },
        fail: function () {
            // alert('fail')
        }
    }
    nativeShare.setShareData(shareData)
}

// 判断浏览器版本
var browser = {
    versions: function () {
        var u = navigator.userAgent, app = navigator.appVersion;
        return {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
}

function getShareNum () {
    commonAjax('/api/user/share', 'POST', '', function (result) {
        if (result.success) {
            addable = false
        } else {
            alert(result.err.message);
        }
    })
}
var ua = navigator.userAgent.toLowerCase();
if (ua.match(/MicroMessenger/i) == "micromessenger") {//在微信中打开
    $('.share_wb').hide()
}

function shareByNavigator (command) {
    //获取判断用的对象
    if (ua.match(/MicroMessenger/i) == "micromessenger") {//在微信中打开
        alert('请长按图片分享给好友或分享到朋友圈')
        return;
    } else if (navigator.share && command != 'weibo') {//在safari浏览器打开s
        getShareNum();
        navigator.share({
            title: 'AC米兰120周年活动',
            url: 'https://project.sdsinfotech.com/ACM120/index.html'
        });

    } else {
        getShareNum();
        nativeShareSvc(command)
    }
}

function nativeShareSvc (command) {
    try {
        nativeShare.call(command);
    } catch (err) {
        // 如果不支持，你可以在这里做降级处理
        alert('推荐使用微信，百度，UC，QQ，Safari等浏览器进行分享')
    }
}

function initPosterPage (params) {
    acResult = parseInt(getCookie('rewardResult') || 1)
    initShare()
    $("#posterResult").attr('src', 'http://q2n8bxfpk.bkt.clouddn.com/img' + list[acResult])
}

$('#page-poster .close_btn').click(function () {
    getData();
    $('#page-main').show().siblings('div').hide()
})
var timeOutEvent
$("#posterResult").on({
    touchstart: function (e) {
        if (addable) {
            timeOutEvent = setTimeout(function () {
                getShareNum()
            }, 600)
        }
    },
    touchmove: function (e) {
        clearTimeout(timeOutEvent)
        timeOutEvent = 0
    },
    touchend: function (e) {
        clearTimeout(timeOutEvent)
        return false
    }
});

var u = navigator.userAgent
// 微博浏览器 && pc浏览器更新海报长按分享提示
var isIOS =  !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) //ios终端
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1
var isWeibo = ua.match(/WeiBo/i) == "weibo"

if(!isIOS && !isAndroid){
    $('#page-poster .ans_img_tips').html('分享多得一次抽卡机会')
}
if(isAndroid && isWeibo){
    $('#page-poster .ans_img_tips').html('分享多得一次抽卡机会')
}

