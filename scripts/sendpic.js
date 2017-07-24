var clientId=getcookie("client_id");
var qsInterface = localStorage.getItem("qsInterface");
var qsBackground = localStorage.getItem("qsBackground");
var qsDetail = JSON.parse(localStorage.getItem("qsDetail"));
//是否显示开户头像 0表示否，1表示是
var isShowKhHeadpic = qsDetail.qs_show_kh_headpic;
$(function(){
    //长城国瑞不需要
    if(isShowKhHeadpic == "0"){
        $(".facePic").hide();
    }
    //返回事件(返回上一页)
    backToBeforeStep("messageCheck");

    //正面、反面、头像图片点击事件
    $('.uploadDiv').click(function(){
        var type = $(this).data('type');
        if(type) showCover(type);
    });

    //隐藏遮罩事件
    $('.mask').click(function(){
        $(this).addClass("hide");
        $('.nextstep').removeClass("hide");
        $('.takephoto').addClass("hide");
        $('.Photogallery').addClass("hide");
        $('.cancel').addClass("hide");
    });

    //拍照点击事件
    $('.takephoto').click(function(){
        var type = $(this).data('type');
        if(!type)return;
        var data = '{"action":"takePhoto", "reqId":"takePhoto'+type+'","param":{"imgType":'+type+'}}';
        window.thskaihu.reqApp(data);
    });

    //从相册中选择
    $('.Photogallery').click(function(){
        var type = $(this).data('type');
        if(!type)return;
        var data = '{"action":"pickAlbum", "reqId":"pickAlbum'+type+'","param":{"imgType":'+type+'}}';
        window.thskaihu.reqApp(data);
    });

    //取消事件
    $('.cancel').on('click',function(){
        $('.mask').addClass("hide");
        $('.nextstep').removeClass("hide");
        $('.takephoto').addClass("hide");
        $('.Photogallery').addClass("hide");
        $('.cancel').addClass("hide");
    });

    $('.nextstep').click(function(){
        hasNetwork();
    });

});

//显示遮罩层，拍照、从相册中选择、取消按钮
function showCover(type) {
    $('.takephoto').data('type', type);
    $('.Photogallery').data('type', type);
    $('.mask').removeClass("hide");
    $('.takephoto').removeClass("hide");
    $('.Photogallery').removeClass('hide');
    $('.cancel').removeClass("hide");
    // flag = false;
}

/*timer_positiveidcard: 正面照标志
 timer_backofidcard：反面照标志
 timer_facePic：大头照标志*/
var timer_positiveidcard, timer_backofidcard, timer_facePic;
window.rspWeb = function (data) {
    data = JSON.parse(data);
    var imgDataBase64 = data.param.imgData;
    var pHeight = $(window).height();
    switch (data.rspId) {
        case 'takePhoto1':
        case 'pickAlbum1'://身份证正面照从相册中选择
            if(!imgDataBase64) return false;
            $('.positiveidcard .cardPicImgDiv').empty("");
            $('.positiveidcard .cardPicImgDiv').html('<img class="positiveidcardImg"src="data:image/jpg;base64,'+imgDataBase64+'"/>');
            showUploadLine(timer_positiveidcard,'positiveidcard');
            getPositiveIdcard('6A',imgDataBase64,$('.positiveidcard'),timer_positiveidcard);
            break;
        case 'takePhoto2':
        case 'pickAlbum2':
            if(!imgDataBase64) return false;
            $('.backofidcard .cardPicImgDiv').empty("");
            $('.backofidcard .cardPicImgDiv').html('<img class="backofidcardImg"src="data:image/jpg;base64,'+imgDataBase64+'"/>');
            showUploadLine(timer_backofidcard,'backofidcard');
            getPositiveIdcard('6B',imgDataBase64,$('.backofidcard'),timer_backofidcard);
            break;
        case 'takePhoto3':
        case 'pickAlbum3':
            if(!imgDataBase64) return false;
            $('.facePic .cardPicImgDiv').empty("");
            $('.facePic .cardPicImgDiv').html('<img class="facePicImg"src="data:image/jpg;base64,'+imgDataBase64+'"/>');
            showUploadLine(timer_facePic,'facePic');
            getPositiveIdcard('80',imgDataBase64,$('.facePic'),timer_facePic);
            break;
    }
    switch (data.action){
        case 'getNetworkType':
            var networkType = data.param.networkType;
            if (networkType == "0") {
                alertInfo("网络连接失败,请重新连接网络！");
            } else {
                if (!$('.nextstep').hasClass('allowClickNextBtn')) return;
                stepSync('Sendpic');//步骤同步统计
                gotoNextstep("Sendpic");
            }
            break;
        case 'stepSync':
            var clientId = data.param.clientId;
            var step = data.param.step;
            break;
    }

    $('.mask').addClass('hide');
    $('.nextstep').removeClass("hide");
    $('.takephoto').addClass("hide").data('type','');
    $('.Photogallery').addClass("hide").data('type','');
    $('.cancel').addClass("hide");
}

/*
 * 函数：身份证上传后显示上传进度条
 * objTimer:定时器名
 * objName：对象名
 * */
function showUploadLine(objTimer, objName) {
    $('.' + objName + ' ul').hide();
    $('.' + objName + ' .cardPicImgMask').show();
    $('.' + objName + ' .cardPicImgUpload').show();
    $('.' + objName + ' .cardPicImgUpload span').show();
    $('.' + objName + ' .cardPicImgUpload font').hide();
    $('.' + objName + ' .cardPicImgUpload .cardPicImgUploadBg').show();
    $('.' + objName + ' .cardPicImgUploadBg').css('width', 0 + "%");
    $('.' + objName + ' .cardPicImgUpload span i').text(0);
    $('.' + objName + ' .cardPicImg').show();
    var prg = 0;
    progress([94, 98], [4, 6], [100, 200], objTimer, objName, prg);
}

//增量随机，时间间隔随机的进度条函数
function progress (dist, speed, delay, objTimer, objName, prg) {
  var _dist = random(dist);
  var _delay = random(delay);
  var _speed = random(speed);
  window.clearTimeout(objTimer);
  objTimer = setTimeout(function(){
    if (prg + _speed >= _dist) {
      clearTimeout(objTimer);
      prg = _dist;
    } else {
      prg += _speed;
      progress (_dist, speed, delay, objTimer, objName, prg);
    }
    //设置dom
    $('.' + objName + ' .cardPicImgUploadBg').css('width', parseInt(prg) + "%");// 留意，由于已经不是自增1，所以这里要取整
    $('.' + objName + ' .cardPicImgUpload span i').text(parseInt(prg));
  }, _delay);
}

function random (n) {
  if (typeof n === 'object') {
    var times = n[1] - n[0];
    var offset = n[0];
    return Math.random() * times + offset;
  } else {
    return n;
  }
}

//上传身份证等图片
function getPositiveIdcard(image_no, base64, obj2, objName) {
    var obj = {'image_no': image_no, 'image_type': '.jpg', 'image_data': base64};
    $.ajax({
        type: 'post',
        data: obj,
        url: qsInterface + "Sendpic",
        dataType: 'json',
        timeout: 20000,
        success: function (data) {
            var tmpData = data;
            if (tmpData != null && tmpData.error_no == 0) {

                obj2.data('uploadImg', true);
                showNextBtn();
                clearInterval(objName);
                setTimeout(function(){
                    obj2.children('.cardPicImg').children('.cardPicImgUpload').children('span').children('i').text('100');
                    setTimeout(function(){
                        obj2.children('.cardPicImg').children('.cardPicImgUpload').children('font').show();
                        obj2.children('.cardPicImg').children('.cardPicImgUpload').children('span').hide();
                        obj2.children('.cardPicImg').children('.cardPicImgUpload').children('.cardPicImgUploadBg').hide();
                        obj2.children('.cardPicImg').children('.cardPicImgUpload').css('background', 'rgba(0,0,0,0)');
                    }, 500);
                }, 800);
            } else {
                alertInfo('上传失败，请重新上传');
                obj2.children('ul').show();
                obj2.children('.cardPicImg').hide();
            }
        },
        error: function () {
            alertInfo('上传失败，请重新上传');
            obj2.children('ul').show();
            obj2.children('.cardPicImg').hide();
        }
    });
}

//是否高亮显示下一步
function showNextBtn() {
    var flag2 = true;
    $('.uploadDiv').each(function () {
        var uploadImg = $(this).data('uploadImg');
        //没有大头照的情况下,获取type值
        if (isShowKhHeadpic == "0")
            var type = $(this).data('type');
        if (!uploadImg && type != "3") {
            flag2 = false;
            $('.nextstep').removeClass('allowClickNextBtn');
        }
    });
    if (flag2) {
        if ($(".certificate input[type='checkbox']").is(':checked')) {
            $('.certificate label').css({
                'background': "url(../images/openThirdPartyAccount/agree_icon_check.png) no-repeat left center",
                'backgroundSize': '0.4rem 0.4rem'
            });
            $('.nextstep').addClass('allowClickNextBtn');

        } else {
            $('.nextstep').removeClass('allowClickNextBtn');
            $('.certificate label').css({
                'background': "url(../images/openThirdPartyAccount/agree_icon_nocheck.png) no-repeat left center",
                'backgroundSize': '0.4rem 0.4rem'
            });
        }
    }
}

$(".certificate input[type='checkbox']").click(function(){
    showNextBtn();
});

//数字证书安装使用协议 按钮点击事件
$('.certificate a').click(function(){
    var get = $('.DigitalAgreement').data('get');
    $('.mask2').show();
    $('.DigitalAgreement').show();

    if(get) return;
    getDigitalAgreement();
});

//数字证书安装使用协议
var flag_DigitalAgreement = false;
function getDigitalAgreement(){
    if(flag_DigitalAgreement)return;
    flag_DigitalAgreement = true;
    $.ajax({
        type:'get',
        url: qsInterface+"DigitalAgreement",
        dataType:'json',
        timeout:10000,
        success:function(data){
            if(data.error_no == 0){
                $('.DigitalAgreement .title p').text(data.title);
                $('.DigitalAgreement .content').html(data.content);
                $('.DigitalAgreement').data('get',true);
            }
            flag_DigitalAgreement = false;
        },
        error:function(){
            console.log('error');
            flag_DigitalAgreement = false;
        }
    });
}
//协议右上角取消按钮
$('.DigitalAgreement .title span').click(function(){
    $('.mask2').hide();
    $('.DigitalAgreement').hide();
});

//处理三星布局问题
window.onload = function () {
    if (window.navigator.userAgent.indexOf('Galaxy Nexus Build/JZO54K') > -1) {
        $('.DigitalAgreement').css('top', '1.2rem');
    }
}
