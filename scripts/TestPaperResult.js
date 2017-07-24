//返回结果处理
window.rspWeb = function (data) {
    data = JSON.parse(data);
    rspId = data.rspId;
    switch (data.action) {
        case 'getNetworkType':
            var networkType = data.param.networkType;
            $('.nextstep').data('networkType', networkType);
            if (networkType == "0") {
                alertInfo("网络连接失败,请重新连接网络！");
            } else {
               gotoNextstep("Testpaper");
            }
            break;
    }
};

/*获取风险测评结果*/
function getRiskResult() {
    $.ajax({
        type: 'get',
        data: {},
        url: qsInterface + "getRiskResult",
        dataType: 'json',
        async: false,
        timeout: 15000,
        success: function (data) {
            if (data.error_no == "0") {
                $('.score span').html(data.paper_score);
                $('#riskGrade span').html(data.risk_level_name);
                $('#timeHorizon').html(data.investment_term);
                $('#typeInvest').html(data.investment_products);
            } else {
                alertInfo(data.error_info);
            }
        },
        error: function () {
            removeLoadingDiv();
            alertInfo("获取风险测评结果失败");
        }
    });
}


//退出开户函数
function exitKaihu() {
    var data = '{"action":"exitKaihu", "reqId":"exitKaihu","param":{}}';
    window.thskaihu.reqApp(data);
}

var qsId = localStorage.getItem("qsId");
var qsInterface = localStorage.getItem("qsInterface");
var flag = true;
var qsBackground = localStorage.getItem("qsBackground");

$(function () {
    getRiskResult();

    //退出开户
    $('#backTo').on('click', function () {
        isExit();
    });

    //点击我已阅读事件
    $(".certificate input[type='checkbox']").click(function () {
        if ($(".certificate input[type='checkbox']").is(':checked')) {
            $(".nextstep").css("background-color", "#3a83d7");
            $('.certificate label').css({
                'background': "url(../images/openThirdPartyAccount/agree_icon_check.png) no-repeat left center",
                'backgroundSize': '0.4rem 0.4rem'
            });
            flag = true;
        } else {
            $('.nextstep').css("background-color", "#DBDBDB");
            $('.certificate label').css({
                'background': "url(../images/openThirdPartyAccount/agree_icon_nocheck.png) no-repeat left center",
                'backgroundSize': '0.4rem 0.4rem'
            });
            flag = false;
        }
    });

    //获取告知函内容
    $('.certificate a').click(function () {
        var gzid = JSON.parse(localStorage.getItem('riskData')).protocal[0].econtract_id;
        getAgreementDetail(gzid);
        $('.mask2').show();
        $('.DigitalAgreement').show();
    });

    //协议右上角取消按钮
    $('.DigitalAgreement .title span').click(function () {
        $('.mask2').hide();
        $('.DigitalAgreement').hide();
    });

    //点击下一步逻辑处理
    $('.nextstep').on('click', function () {
        (flag) ? hasNetwork() : alertInfo('请同意告知函内容！');
    });

});

/*获取告知函内容*/
function getAgreementDetail(econtract_id) {//flag = 0表示弹窗信息
    $.ajax({
        type: 'get',
        data: {"econtract_id": econtract_id, qsid: qsId},
        url: qsInterface + "AgreementDetail",
        dataType: 'json',
        async: false,
        timeout: 15000,
        success: function (data) {
            if (data.error_no == "0") {
                    $('.DigitalAgreement .content').html(data.econtract_content);
            } else {
                alertInfo(data.error_info);
            }
        },
        error: function () {
            alertInfo("获取告知函内容失败");
            return false;
        }
    });
}

