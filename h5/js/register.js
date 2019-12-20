$(document).ready(function() {
    //点击弹出游戏说明
    $('#registerLink').click(function(){
        $('#agreementWrapper').show();
    })
    //关闭游戏说明
    $('#page-register #closeBtn').click(function(){
        $('#agreementWrapper').hide();
    })
    //同意游戏说明
    $('#agreeBtn').click(function(){
        $('#agreementWrapper').hide();
        $('#registerCheck').attr('checked','checked');
    })
    //注册登录游戏
    $('#playGame').click(function(){
        var registerName = $('#registerName').val().trim();
        var registerPhone = $('#registerPhone').val().trim();
        var registerCheck = $('#registerCheck').is(':checked');
        if (!registerName) {
            alert('请输入姓名');
            return;
        } else if (!registerPhone) {
            alert('请输入手机号');
            return;
        } else if(!/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(registerPhone)){
            alert('请输入正确的手机号');
            return;
        } else if(!registerCheck) {
            alert('请先阅读同意游戏协议');
            return;
        } else{
            var params = {
                "name": registerName,
                "telephone": registerPhone,
            }
            $('#playGame').attr('disabled', true);
            commonAjax('/api/user/register', 'POST', params, function(result) {
                $('#playGame').attr('disabled', false);
                if (result.success) {
                    setCookie('lotteryTimes', result.times);
                    getData()
                }
            })
            
        }
    });
});