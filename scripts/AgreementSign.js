//协议回传结果
window.rspWeb = function (data) {
    data = JSON.parse(data);
    rspId = data.rspId;
    /*certSign 和协议相对应*/
    if (rspId.indexOf("signCert") > -1) {
        id = rspId.substr(8);
        var flag = data.param.flag;
        if (flag == "0") {
            var certSign = data.param.certSign;//签名后的数据
            agreement.agreementSign(agreementLists[id], id, certSign,
                function () {
                    stepSync('AgreementSign');
                    gotoNextstep("AgreementSign");
                });//要签署协议
        } else {
            removeLoadingDiv();
        }
    }
    switch (rspId) {
        case 'isCertInstall':
            var flag = data.param.flag;
            if (flag == '0') {
                removeLoadingDiv();
                pickNextStep(data, forEachAgreement);
            } else {
                //重新安装
                createLoadingDiv();
                cert.zhongDengCertApplyState();
            }
            break;
        case 'createPKCS102':
            pkcs10 = data.param.pkcs10;
            if (pkcs10) {
                processArr[1] = true;//标志量：生成pkcs10是否成功
                cert.zhongDengCert(pkcs10);
            }
            break;
        case 'certInstall':
            var flag = data.param.flag;
            //检查重新安装是否成功
            if (flag == '0') {
                removeLoadingDiv();
                pickNextStep(data, forEachAgreement);
            }
            break;
    }
    switch (data.action) {
        case 'getNetworkType':
            isCertInstall();
            break;
        case 'stepSync':
            var clientId = data.param.clientId;
            var step = data.param.step;
            break;
    }
};

var cert = new Cert();
var agreement = new Agreement();
var qsId = localStorage.getItem("qsId");
var qsInterface = localStorage.getItem("qsInterface");
var qsDetail = JSON.parse(localStorage.getItem("qsDetail")).qsData;
var qsBackground = localStorage.getItem("qsBackground"),
    pkcs10 = "",
    p7cert = "",
    processArr = [false, false, false];
//是否签署协议 0表示否，1表示是
var isSignAgreement = qsDetail.qs_is_sign_agreement;
//判断协议是否签署成功
var isAgreementSuccessArr = new Array();
var econtract_id = "";
$(function () {
    getRiskResult();
    getResultDetail(econtract_id);
    //退出开户
    $('#backTo').on('click', function () {
        isExit();
    });

    $(".nextstep").on("click", function () {
        hasNetwork();
    });

});

//获取风险测评结果
function getRiskResult() {
    $.ajax({
        type: 'get',
        data: {},
        url: qsInterface + 'getRiskResult',
        dataType: 'json',
        async: false,
        timeout: 15000,
        success: function (data) {
            //确认书id
            econtract_id = data.protocal[0].econtract_id;
            getAgreementList();//电子协议列表获取
        }
    });
}

/*获取确认书内容*/
function getResultDetail(econtract_id) {//flag = 0表示弹窗信息
    $.ajax({
        type: 'get',
        data: {"econtract_id": econtract_id, qsid: qsId},
        url: qsInterface + "AgreementDetail",
        dataType: 'json',
        async: false,
        timeout: 15000,
        success: function (data) {
            if (data.error_no == "0") {
                //显示确认书信息
                getResultInfo(data.econtract_content);
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

//获取确认书信息
function getResultInfo(content) {
    $.ajax({
        type: 'get',
        data: {},
        url: qsInterface + "getRiskResult",
        dataType: 'json',
        async: false,
        timeout: 15000,
        success: function (data) {
            if (data.error_no == '0') {
                switch (data.levels) {
                    case '1' : {
                        resultInfo({
                            levels: data.levels,
                            header: data.protocal[0].econtract_name,
                            content: content,
                            btn1: '放弃',
                            btn2: '重新测评'
                        });
                        $('#resultInfo .infoBtnLeft').on('click', function () {
                            //放弃，退出开户
                            $('#resultInfo').hide();
                            $('.mask').hide();
                            exitKaihu();
                        });
                        $('#resultInfo .infoBtnRight').on('click', function () {
                            //跳转至风险测评页面
                            createLoadingDiv();
                            window.location.href = './Testpaper.html';
                        });
                    }
                        break;
                    case '2' : {
                        resultInfo({
                            levels: data.levels,
                            header: data.protocal[0].econtract_name,
                            content: content,
                            btn1: '放弃',
                            btn2: '继续开通'
                        });
                        $('#resultInfo .infoBtnLeft').on('click', function () {
                            //放弃，退出开户
                            $('#resultInfo').hide();
                            $('.mask').hide();
                            exitKaihu();
                        });
                        $('#resultInfo .infoBtnRight').on('click', function () {
                            $('#resultInfo').hide();
                            $('.mask').hide();
                        });
                    }
                        break;
                    case '0' : {
                        resultInfo({
                            levels: data.levels,
                            header: data.protocal[0].econtract_name,
                            content: content,
                            btn1: '确认'
                        });
                        $('#resultInfo .infoBtnRight').on('click', function () {
                            $('#resultInfo').hide();
                            $('.mask').hide();
                        });
                    }
                        break;
                }
            } else {
                alertInfo(data.error_info)
            }
        }
    })
}

function createResultInfo(key, infoHeader, infoContent, btn1, btn2) {
    if (key == 1 || key == 2) {
        var resultInfo = '<div id="resultInfo">' +
            '<div class="infoHeader">' + infoHeader + '</div>' +
            '<div class="infoContent">' + infoContent + '</div>' +
            '<div class="infoBtn"> ' +
            '<div class="infoBtnLeft">' + btn1 + '</div> <div class="infoBtnRight">' + btn2 + '</div>' +
            ' </div> </div> ' +
            '<div class="mask"></div>';
        $('body').append(resultInfo);
        $('#resultInfo .infoBtnRight').css({
            'width': '50%',
            'borderLeft': '1px #ccc solid'
        });
    }
    if (key == 0) {
        var resultInfo = '<div id="resultInfo">' +
            '<div class="infoHeader">' + infoHeader + '</div>' +
            '<div class="infoContent">' + infoContent + '</div>' +
            '<div class="infoBtn"> ' +
            '<div class="infoBtnRight">' + btn1 + '</div>' +
            ' </div> </div> ' +
            '<div class="mask"></div>';
        $('body').append(resultInfo);
        $('#resultInfo .infoBtnRight').css({
            'width': '100%',
            'borderLeft': 'none'
        });
    }
}

function resultInfo(param) {
    if (param.levels) {
        switch (param.levels) {
            case '1' : {
                createResultInfo(1, param.header, param.content, param.btn1, param.btn2);
            }
                break;
            case '2' : {
                createResultInfo(2, param.header, param.content, param.btn1, param.btn2);
            }
                break;
            case '0' : {
                createResultInfo(0, param.header, param.content, param.btn1);
            }
                break;
        }
    }
}

//获取电子协议列表
function getAgreementList() {
    var obj = {qsid: qsId};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "AgreementList",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == "0") {
                if (isSignAgreement == "0") {
                    isAgreementSuccessArr[0] = false;
                } else {
                    for (var i = 0; i < tmpData.resultList.length; i++) {
                        isAgreementSuccessArr[i] = false;
                    }
                }
                //动态创建列表元素
                createListdata(tmpData);
            } else {
                alertInfo(data.error_info);
                createReloadDiv("获取电子协议列表失败,请重新加载。", "", getAgreementList, isExit);
            }
        },
        error: function () {
            createReloadDiv("获取电子协议列表失败,请重新加载。", "", getAgreementList, isExit);
        }
    });
}

//动态创建列表数据
function createListdata(data) {
    var dataList = data.resultList;
    //保存数据数组
    localStorage.setItem("agreementList", JSON.stringify(dataList));
    var parent = document.getElementById("allconsultation");
    for (var i = 0; i < dataList.length; i++) {
        var item = dataList[i];
        var div1 = createConsultate(item);
        //给每个div注册点击事件
        $(div1).on('click', function () {
            var $this = $(this);
            var econtractId = $this[0].id;
            var obj = {
                econtract_id: econtractId,//电子合同ID
                qsid: qsId,
                type: "" 				//bank (存管银行)  其他为空
            };
            //发请求返回内容(详情页面)
            getAgreementDetail(obj);
        });
        parent.appendChild(div1);
    }
}

//查询本地是否有证书
function isCertInstall() {
    var userId = createUserId();
    var data = '{"action":"isCertInstall", "reqId":"isCertInstall","param":{"userId":"' + userId + '"}}';
    window.thskaihu.reqApp(data);
}

//创建元素
function createConsultate(data) {
    var div = document.createElement("div");
    var input = document.createElement("input");
    var span = document.createElement("span");
    //econtract_md5的值
    input.setAttribute("name", data.econtract_md5);
    //协议名称
    input.setAttribute("value", data.econtract_name);
    input.setAttribute("readonly", "readonly");
    $(span).addClass("rightArrow");
    //协议id
    div.setAttribute("id", data.econtract_id);
    div.appendChild(input);
    div.appendChild(span);
    $(div).addClass("consultation");
    return div;
}

//获取协议详情页面
function getAgreementDetail(obj) {
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "AgreementDetail",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == "0") {
                //展示详情信息
                $('.mask').removeClass("hide");
                $('#showDetail').removeClass("hide");
                var econtractContent = data.econtract_content;
                $('#econtractContent')[0].innerHTML = replaceAll(econtractContent);
                $('#econtractContent').scrollTop(0);//定位到内容顶部
            } else {
                alertInfo(data.error_info);
            }
        },
        error: function () {
            console.log("error");
        }
    });
}

function closeDetail() {
    $('.mask').addClass("hide");
    $('#showDetail').addClass("hide");
}

//去除返回的“\”
function replaceAll(str) {
    while (str != null && str.indexOf("\\") > -1) {
        str = str.replace("\\", "");
    }
    return str;
}

//在html页面中绑定了点击事件
var agreementLists = "";
function forEachAgreement() {

    agreementLists = JSON.parse(localStorage.getItem("agreementList"));//获取agreementList的值
    if (isSignAgreement == "0") {
        /*无需签署协议*/
        stepSync('AgreementSign');
        gotoNextstep("AgreementSign");
    } else {
        //中登证书查询：获取证书序列号，用于协议签署
        cert.zhongDengCertQuery("0", "", function () {
            removeLoadingDiv();
            alertInfo("证书无效");
            return;
        }, function (tmpData) {
            removeLoadingDiv();
            return;
        }, function () {
            removeLoadingDiv();
            alertInfo("查询中登证书失败！");
            return;
        });
        for (var i = 0; i < agreementLists.length; i++) {
            var agreementList = agreementLists[i];
            agreement.getSignCert(agreementList, i);//获取证书签名
        }
    }

}


