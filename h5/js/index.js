var rewardResult;
// 首屏获取数据
function getData() {
    // debugger
    if (document.referrer.indexOf('register.html') === -1) {
        renAnimation();
    } else {
        $('#indPage').show();
    }
    setTimeout(function () {
        commonAjax('/api/user/get', 'GET', '', function (result) {
            // debugger
            if (result.success) {
                if (result.user) {
                    setCookie('acUserInfo', JSON.stringify(result.user));
                    setCookie('lotteryTimes', result.user.times);
                    var lotteryTimes = result.user.times ? result.user.times : 0;
                    $('#lotteryTimes').text(lotteryTimes);
                    getHistory();
                } else {
                    window.location.href = 'register.html';
                }
            }
        })
    }, 0)
    

}
//渲染抽奖图片
function renderCardList() {
    var html = '';
    for (var i = 0; i < 9; i++) {
        html += '<li><img src="img/card_back.png" alt=""></li>';
    }
    $('#cardList').append(html);
}
// 获取历史奖项
function getHistory() {
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
function getLottery(result) {
    if (result == 1) {
        $('.ans_content').hide().eq(0).show();
    } else if (result > 1 && result < 5) {
        $('.ans_content').hide().eq(1).show();
    } else {
        var acUserInfo = getCookie('acUserInfo');
        if (acUserInfo) {
            acUserInfo = JSON.parse(acUserInfo);
            $('#acUserName').val(acUserInfo.name);
            $('#acUserPhone').val(acUserInfo.telephone);
        }
        $('.ans_content').hide().eq(2).show();
    }
    setCookie('acResult', result);
    var list = ['', '/result1.png', '/result2.png', '/result3.png', '/result4.png', '/result7.png', '/result7.png', '/result7.png']
    setTimeout(function () {
        $('#mask').show();
        $('.card_box').addClass('reback');
        $('.card_result_box').addClass('card_result' + list[result]);
        setTimeout(function () {
            $('.card1').addClass('add');
            $('.card2').addClass('add');
            setTimeout(function () {
                $('.close_btn').show();
                $('.light_bright').show();
                $('#ansBox').show();
            }, 700)
        }, 700)
    }, 700);
}

function renAnimation() {
    $('#bgBox1').addClass('fadeIn');
    $('#bg1').addClass('ac');
    setTimeout(function () {
        $('#bgBox1').addClass('fadeOut').removeClass('fadeIn');
        setTimeout(function () {
            $('#bgBox2').addClass('fadeIn');
            $('#bg2').addClass('ac');
            setTimeout(function () {
                $('#bgBox2').addClass('fadeOut').removeClass('fadeIn');
                setTimeout(function () {
                    $('.bg2').hide();
                    $('#indPage').show();
                }, 1000)
            }, 2000)
        }, 1000);
    }, 2000)
}

$(document).ready(function () {
    // 初始化
    renderCardList();
    getData();


    $(document).on('click', '#cardList li', function () {
        var _this = $(this);
        // _this.removeClass('ac').siblings().addClass('ac');
        // getLottery(3);
        commonAjax('/api/user/lottery', 'GET', '', function (result) {
            if (result.success) {
                _this.removeClass('ac').siblings().addClass('ac');
                $('#recordId').val(result.recordId);
                rewardResult = result.result;
                getLottery(result.result);
            } else {
                alert(result.err.message);
            }
        })
        //分享按钮
        $('.share_btn').click(function () {
            window.location.href = 'poster.html?res=' + rewardResult;
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
                        window.location.href = 'poster.html';
                    } else {
                        alert(result.err.message);
                    }
                    $('#submitBtn').attr('disabled', false);
                })
            }
        });

        $('#closeBtn').click(function () {
            $('#mask').hide();
            $('#cardList li').removeClass('ac');
            $('#card_box').removeClass('reback');
            $('.card_item').removeClass('add');
            $('#ansBox').hide();
            $('.light_bright').hide();
            getData();
        });
        // 保存图片
        $('#saveCard').click(function () {
            $('#showSaveBtn').show();
        });
    })

})


