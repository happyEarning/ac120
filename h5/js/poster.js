var nativeShare = new NativeShare()
var shareData = {
    title: 'AC米兰120周年活动',
    desc: 'AC米兰120周年活动',
    // 如果是微信该link的域名必须要在微信后台配置的安全域名之内的。
    link: 'https://project.sdsinfotech.com/ACM120/index.html',
    icon: 'https://pic3.zhimg.com/v2-080267af84aa0e97c66d5f12e311c3d6_xl.jpg',
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

function shareByNavigator(command) {
    commonAjax('/api/user/share', 'POST', '', function (result) {
        if (result.success) {
        } else {
            alert(result.err);
        }
    })
    var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
    // debugger
    if (ua.match(/MicroMessenger/i) == "micromessenger") {//在微信中打开
        $('#shareWb').hide();
        return;
    } else if (ua.match(/version\/([\d.]+).*safari/)) {//在safari浏览器打开s
        if (navigator.share) {
            navigator.share({
                title: 'AC米兰120周年活动',
                url: 'https://project.sdsinfotech.com/ACM120/index.html'
            }).then(() => {
                console.log('Thanks for sharing!');
            })
                .catch(console.error);
        } else {

        }
        return;
    } else {
        try {
            nativeShare.call(command)
        } catch (err) {
            // 如果不支持，你可以在这里做降级处理
            // alert(err.message)
        }
    }
}


$(document).ready(function () {
    //判断浏览器
    shareByNavigator();
    var acResult = getQueryString('res');
    var list = ['', '../img/poster_result1.png','../img/poster_result2.png','../img/poster_result3.png','../img/poster_result4.png','../img/poster_result7.png','../img/poster_result7.png','../img/poster_result7.png']
    if (acResult == 1) {
        $('#posterResult').attr('src', list[acResult]);
    }
});

