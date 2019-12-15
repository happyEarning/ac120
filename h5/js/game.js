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
    var reward = [{ name: '奖品123' },{ name: '奖品456' },{ name: '奖品789' }]
    for (var i = 0; i < reward.length; i++) {
        html += '<dd>' + reward[i].name + '</dd>';
    }
    $('#gameHistory').append(html);
}


$(document).ready(function () {
    renderCardList();
    getHistory();

    $(document).on('click', '#cardList li', function () {
        $(this).removeClass('ac').siblings().addClass('ac');
        setTimeout(function () {
            $('#mask').show();
            $('.card_box').addClass('reback');
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

        $('.share_btn').click(function(){
            window.location.href = 'poster.html';
        })
        
    })

})


