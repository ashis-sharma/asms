$(document).ready(function(){
    $('#file2').hide()
    $('#file3').hide()
    $('#file4').hide()
    $('#file5').hide()
    $('#more2').hide()
    $('#more3').hide()
    $('#more4').hide()
    $('#marquee').hide()
    $("#ajax_mobile_otp").attr("disabled", true);
    $("#ajax_email_otp").attr("disabled", true);
    $('#more').click(function(e) {
        e.preventDefault()
        $('#more').hide()
        $('#file2').show()
        $('#more2').show()
    })
    $('#more2').click(function(e) {
        e.preventDefault()
        $('#more2').hide()
        $('#file3').show()
        $('#more3').show()
    })
    $('#more3').click(function(e) {
        e.preventDefault()
        $('#more3').hide()
        $('#file4').show()
        $('#more4').show()
    })
    $('#more4').click(function(e) {
        e.preventDefault()
        $('#more4').hide()
        $('#file5').show()
        $('#marquee').show()
    })
    $('#phone').keyup(function(){
        var value= this.value;
        if(value.length==10){
            $("#ajax_mobile_otp").attr("disabled", false);
        }
        else{
            $("#ajax_mobile_otp").attr("disabled", true);
        }
    })
    $('#email').keyup(function(){
        var email_value= this.value;
        if(/(.+)@(.+){2,}\.(.+){2,}/.test(email_value)){
            $("#ajax_email_otp").attr("disabled", false);
        }
        else{
            $("#ajax_email_otp").attr("disabled", true);
        }
    })
    $('#ajax_mobile_otp').click(function(e) {
    $('#send_mobile_otp').show();
    e.preventDefault()
    $('#ajax_mobile_otp').html('Resend OTP');
    var mobile_no = $('#phone')
    var name = $('#name')
    $.ajax({
        url:'/users/mobileotp',
        type:'POST',
        contentType: 'application/json',
        data:JSON.stringify({ 
            number: mobile_no.val(),
            reciepent_name: name.val()
        }),
        success:function(response){
            console.log(response)
        }
        })
    })
    $('#send_email_otp').hide()
    $('#send_mobile_otp').hide();
    $('#ajax_email_otp').click(function(e) {
    $('#send_email_otp').show();
    e.preventDefault()
    $('#ajax_email_otp').html('Resend OTP');
    var reciepent_id=$('#email')
    var name = $('#name')
    $.ajax({
        url:'/users/emailotp',
        type:'POST',
        contentType: 'application/json',
        data:JSON.stringify({ 
            reciepent: reciepent_id.val(),
            reciepent_name: name.val()
        })
        })

    })
    // $('#re').click(function(e){
    //     e.preventDefault()
    //     $("#captcha").load('/captcha')
    // })
    })