$(document).ready(function() {
    $('#registerCheck').click(function(){
        $('#agreementWrapper').show();
    })

    $('#closeBtn').click(function(){
        $('#agreementWrapper').hide();
    })
    
    $('#agreeBtn').click(function(){
        $('#agreementWrapper').hide();
        $('#registerCheck').attr('checked','checked');
    })

    $('#playGame').click(function(){
        window.location.href = 'game.html';
    });
});