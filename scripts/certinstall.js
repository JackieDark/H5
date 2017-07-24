window.rspWeb = function (data) {
    data = JSON.parse(data);
    switch (data.action) {
        case 'getNetworkType':
            var networkType = data.param.networkType;
            if (networkType == "0") {
                alertInfo("网络连接失败,请重新连接网络！");
            } else {
                stepSync('certinstall');//步骤同步统计
                gotoNextstep("certinstall");//跳转到下一步
            }
            break;
        case 'stepSync':
            var clientId = data.param.clientId;
            var step = data.param.step;
            break;
    }
    switch (data.rspId) {
        case 'createPKCS102':
            pkcs10 = data.param.pkcs10;
            if (pkcs10) {
                processArr[1] = true;//标志量：生成pkcs10是否成功
                cert.zhongDengCert(pkcs10,fail,offlineDeal);
            }
            break;
        case 'certInstall':
            var flag = data.param.flag;
            //查询中登证书
            cert.zhongDengCertQuery(flag, function (tmpData) {

                //隐藏 正在安装内容...
                $('.installing').addClass("hide");
                //隐藏失败页面
                $('.failbtn').addClass("hide");
                //展示成功的页面
                $('.successbtn').removeClass("hide");
                $('.cowPic').removeClass("hide");
            }, function () {
                fail();
                $('.cowPic').addClass("hide");
            }, function (tmpData) {
 
                //展示失败页面
                $('.failbtn').removeClass("hide");
                //隐藏 正在安装内容...
                $('.installing').addClass("hide");
                $('.cowPic').addClass("hide");
            }, offlineDeal);
            break;
    }
}
var cert = new Cert();
var qsId = localStorage.getItem("qsId"),
    qsInterface = localStorage.getItem("qsInterface"),
    qsBackground = localStorage.getItem("qsBackground"),
    pkcs10 = "",
    p7cert = "",
    processArr = [false, false, false];
$(function () {

    cert.zhongDengCertApplyState(fail, offlineDeal);//中登证书颁发状态

    //退出开户
    $('#backTo').on('click', function () {
        isExit();
    });

    //点击重新安装
    $('#reInstall').on('click', function () {

        $('.failbtn').addClass("hide");//隐藏【数字证书安装失败div】
        $('#successCow').removeClass("hide");//显示【安装成功图片div】
        $('.installing').removeClass("hide");//显示【正在安装数字证书.....div】

        if (processArr[2] == true) {
            cert.installCert(p7cert);
        } else if (processArr[1] == true) {
            cert.zhongDengCert(pkcs10,fail,offlineDeal);
        } else if (processArr[0] == true) {
            cert.createPkcs10();
        } else {
            cert.zhongDengCertApplyState(fail, offlineDeal);//中登证书颁发状态
        }
    });

    //点击联系客服
    $('#linkService').on(function () {
        //获取本地缓存券商详情列表
        var qsDetail = JSON.parse(localStorage.getItem("qsDetail")).qsData;
        var telNo = qsDetail.qs_hotline;
        var data = '{"action":"callTel", "reqId":"callTel","param":{"telNo":"' + telNo + '"}}';
        window.thskaihu.reqApp(data);
    });

    //点击下一步
    $('.nextstep').on('click', function () {
        hasNetwork();
    });
});

/*断网处理(15s之后提示)*/
function offlineDeal() {
    alertInfo("网络异常,请重新检查您的网络！");
    fail();
}

//失败处理
function fail() {

    //隐藏 【安装成功图片div】
    $('#successCow').addClass("hide");
    //隐藏 【正在安装数字证书.....div】
    $('.installing').addClass("hide");
    //显示【数字证书安装失败div】
    $('.failbtn').removeClass("hide");
}


