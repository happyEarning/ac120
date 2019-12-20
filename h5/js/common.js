var WEBURL = '';
/**
 * 设置cookie内容
 * @param name   [必须]cookie名称
 * @param value  [必须]cookie名称值
 * @param expireDays [可选]默认1天 过期时间(天) 0.01大概25分钟 s
 */
function setCookie (name, value, expireDays) {
    window.sessionStorage.setItem(name, value)
}
/**
 * 获取cookie内容
 * @param name   [必须] cookie名称
 */
function getCookie (name) {
    let value = window.sessionStorage.getItem(name)
    if (value) {
        return value
    } else {
        return null
    }
}
/**
 * 删除cookie
 * @param name  [必须]cookie名称
 */
function delCookie (name) {
    window.sessionStorage.removeItem(name);
}

/**
 * 获取URL参数
 * @param name   [必须] 参数名称
 */
function getQueryString (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
}

/**
 * 调用AJAX
 * @param url:        [必须] URL(http://...) 
 * @param type:       [必须] GET/POST
 * @param paramter:   [可选] 参数(Json)
 * @param success:    [必须] 成功函数(function)
 * @param error:      [可选] 失败函数(function)
 * @param sync:       [可选] 同步(True/False)     {默认:false 异步}
 * @param headers:    [可选] 请求头部添加参数 默认带有token
 */
function commonAjax (url, type, paramter, success, error, sync, headers) {
    if (!url) {
        alert("URL出错");
        return;
    }
    var async = !sync;
    $.support.cors = true; //跨域

    var defaultHeader = {
        "Content-Type": "application/json; charset=utf-8"
    }
    if (headers) {
        defaultHeader = $.extend(defaultHeader, headers)
    }
    if (paramter) {
        paramter = JSON.stringify(paramter)
    }
    var xhr = $.ajax({
        url: url,
        async: async,
        cache: false,
        type: type,
        headers: defaultHeader,
        contentType: "application/json; charset=utf-8",
        data: paramter,
        dataType: "json",
        crossDomain: true,
        beforeSend: function (xhr) { },
        complete: function (xhr, ts) { },
        success: function (result) {
            success(result);
        },
        error: error
    })
}

