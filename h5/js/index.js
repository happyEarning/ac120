var rewardResult;
var rewardTexts = {
    '2': '荣耀时刻线上限量纪念卡牌A',
    '3': '荣耀时刻线上限量纪念卡牌B',
    '4': '荣耀时刻线上限量纪念卡牌C',
    '5': '官方限量珍藏吉祥物玩偶主场款',
    '6': '官方限量珍藏吉祥物玩偶客场款',
    '7': '官方稀有珍藏吉祥物玩偶一对'
}
// 首屏获取数据
function getData () {

    commonAjax('/api/user/get', 'GET', '', function (result) {
        // debugger
        if (result.success) {
            if (result.user) {
                $('#page-main').show().siblings('div').hide()
                setCookie('acUserInfo', JSON.stringify(result.user));
                setCookie('lotteryTimes', result.user.times);
                var lotteryTimes = result.user.times ? result.user.times : 0;
                $('#lotteryTimes').text(lotteryTimes);
                getHistory();
                $('.bg2').hide();
                $('#indPage').show();
            } else {
                $('#page-register').show().siblings('div').hide()
            }
        }
    })
}
//渲染抽奖图片
function renderCardList () {
    var html = '';
    for (var i = 0; i < 9; i++) {
        html += '<li><img src="img/card_back.png" alt=""></li>';
    }
    $('#cardList').append(html);
}
// 获取历史奖项
function getHistory () {
    var html = '';
    commonAjax('/api/user/history', 'GET', '', function (result) {
        if (result.success) {
            var html = '';
            var reward = result.data;
            if (reward.length > 0) {
                $('#gameHistory').html('');
                $('#gameHistoryBox').show();
                reward.forEach(function (item) {
                    html += '<dd>' + item.name + '</dd>';
                })
                $('#gameHistory').html(html);
            } else {
                $('#gameHistoryBox').hide();
            }
        } else {
            alert(result.err.message);
        }
    })
}
//获取奖品1 谢谢参与 2 问答卡 3 问答卡2 4 问答卡3 5 吉祥物主场球衣 6 吉祥物客场球衣 7 礼包奖品
function getLottery (result) {
    if (result == 1) {
        $('.ans_content').hide().eq(0).show();
    } else if (result > 1 && result < 5) {
        $('.ans_content').hide().eq(1).show();
        $('.record_text2').text(rewardTexts[result.toString()])
    } else {
        var acUserInfo = getCookie('acUserInfo');
        if (acUserInfo) {
            acUserInfo = JSON.parse(acUserInfo);
            $('#acUserName').val(acUserInfo.name);
            $('#acUserPhone').val(acUserInfo.telephone);
        }
        $('.record_text').text(rewardTexts[result.toString()])
        $('.ans_content').hide().eq(2).show();
    }
    setCookie('acResult', result);
    var list = ['', '/result1.png', '/result2.png', '/result3.png', '/result4.png', '/result7.png', '/result7.png', '/result7.png']
    setTimeout(function () {
        $('#mask').show();
        $('.card_box').addClass('reback');
        $('.card_result_box').attr('src', 'img' + list[result]);
        setTimeout(function () {
            $('.card1').addClass('add');
            $('.card2').addClass('add');
            setTimeout(function () {
                $('.close_btn').show();
                $('.light_bright').show();
                $('#ansBox').show();
                // 停止音效，播放背景音乐
                $('.card-music')[0].pause()
                $('.card-music')[0].currentTime = 0
                $('.bg-music')[0].play()
            }, 700)
        }, 700)
    }, 700);
}

function renAnimation () {
    $('#bgBox1').addClass('fadeIn');
    $('#bg1').addClass('ac');
    setTimeout(function () {
        $('#bgBox1').addClass('fadeOut').removeClass('fadeIn');
    }, 2000)
    setTimeout(function () {
        $('#bgBox2').addClass('fadeIn');
        $('#bg2').addClass('ac');
    }, 3000);
    setTimeout(function () {
        $('#bgBox2').addClass('fadeOut').removeClass('fadeIn');
    }, 5000)
    setTimeout(function () {
        getData()
    }, 6000)
}

document.addEventListener('DOMContentLoaded', function () {
    var audio_ = document.getElementById('bg-music')
    function audioAutoPlay () {
        var audio_ = document.getElementById('bg-music')
        document.addEventListener("WeixinJSBridgeReady", function () {
            audio_.play()
        }, false)
    }
    $('body').one('touchstart', function (params) {
        setTimeout(() => {
            var audio_ = document.getElementById('bg-music')
            audio_.play()
        }, 200);
    })
    audioAutoPlay()
})

function initMainPage () {
    $(document).on('click', '#cardList li', function () {
        var _this = $(this);
        try {
            var acUserInfo = getCookie('acUserInfo');
            acUserInfo = JSON.parse(acUserInfo);
            if (acUserInfo.times === 0 && acUserInfo.todayTimes >= 10) {
                alert('今日10次机会已用完，请明日继续参与活动')
                return
            }
            if (acUserInfo.times === 0) {
                showPosterPage()
                return
            }
            $('.bg-music')[0].pause()
            $('.card-music')[0].currentTime = 0
            $('.card-music')[0].play()
        } catch (e) {
            alert(JSON.stringify(e))
            return
        }

        // _this.removeClass('ac').siblings().addClass('ac');
        commonAjax('/api/user/lottery', 'GET', '', function (result) {
            if (result.success) {
                _this.removeClass('ac').siblings().addClass('ac');
                $('#recordId').val(result.recordId);
                rewardResult = result.result;
                setCookie('rewardResult', result.result);
                getLottery(result.result);
            } else {
                alert(result.err.message);
            }
        })
       
    })

     //分享按钮
     $('.share_btn').click(function () {
        showPosterPage()
    });

    // 提交
    $('#submitBtn').click(function () {
        var acUserName = $('#acUserName').val().trim();
        var acUserAddress = $('#acUserAddress').val().trim();
        var recordId = $('#recordId').val();
        if (!acUserName) {
            alert('请输入姓名');
            return;
        } else if (!acUserAddress) {
            alert('请输入收获地址');
            return;
        } else {
            var params = {
                name: acUserName,
                address: acUserAddress,
                recordId: recordId
            };
            $('#submitBtn').attr('disabled', true);
            commonAjax('/api/user/record', 'POST', params, function (result) {
                if (result.success) {
                    showPosterPage()
                } else {
                    alert(result.err.message)
                }
                $('#submitBtn').removeAttr('disabled')
            })
        }
    });

    $('#page-main #closeBtn').click(function () {
        mainClose()
        getData()
    })
}

function mainClose (params) {
    $('#mask').hide()
    $('#cardList li').removeClass('ac')
    $('#card_box').removeClass('reback')
    $('.card_item').removeClass('add')
    $('#ansBox').hide()
    $('.light_bright').hide()
}

function showPosterPage () {
    mainClose()
    initPosterPage()
    $('#page-poster').show().siblings('div').hide()
}

$(document).ready(function () {
    // 初始化
    renderCardList()
    renAnimation()
    initMainPage()
})
