var nativeShare = new NativeShare()
var acResult = getCookie('rewardResult') || 1;
var list = ['', '/poster_result1.png', '/poster_result2.png', '/poster_result3.png', '/poster_result4.png', '/poster_result7.png', '/poster_result7.png', '/poster_result7.png']
var shareData = {
    title: 'AC米兰120周年活动',
    desc: 'AC米兰120周年活动',
    // 如果是微信该link的域名必须要在微信后台配置的安全域名之内的。
    link: 'https://project.sdsinfotech.com/ACM120/index.html',
    icon: 'https://project.sdsinfotech.com/ACM120/img' + list[acResult],
    // 不要过于依赖以下两个回调，很多浏览器是不支持的
    success: function () {
        alert('success')
    },
    fail: function () {
        alert('fail')
    }
}
nativeShare.setShareData(shareData)

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

function getShareNum() {
    commonAjax('/api/user/share', 'POST', '', function (result) {
        if (result.success) {
        } else {
            alert(result.err.message);
        }
    })
}

function shareByNavigator(command) {
    getShareNum();
    var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
    if (ua.match(/MicroMessenger/i) == "micromessenger") {//在微信中打开
        alert('请点击右上角分享给好友或分享到朋友圈')
        return;
    } else if (navigator.share && command != 'weibo') {//在safari浏览器打开s
        navigator.share({
            title: 'AC米兰120周年活动',
            url: 'https://project.sdsinfotech.com/ACM120/index.html'
        }).then(() => {
            console.log('Thanks for sharing!');
        })
            .catch(console.error);

    } else {
        nativeShareSvc(command)
    }
}

function nativeShareSvc(command) {
    try {
        nativeShare.call(command);
    } catch (err) {
        // 如果不支持，你可以在这里做降级处理
        alert('推荐使用微信，百度，UC，QQ，Safari等浏览器进行分享')
    }
}

$(document).ready(function () {
    //判断浏览器
    var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
    if (ua.match(/MicroMessenger/i) == "micromessenger") {//在微信中打开
        $('#shareWb').hide();
        if (!document.referrer) {
            window.location.href = 'index.html'
        }
    }
    // shareByNavigator();


    $('.close_btn').click(function () {
        location.href = 'index.html'
    })
});

