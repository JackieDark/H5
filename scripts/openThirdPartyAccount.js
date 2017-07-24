window.rspWeb = function (data) {
    data = JSON.parse(data);
    rspId = data.rspId;
    if(rspId.indexOf("signCert")>-1){
        id = rspId.substr(8);
        var flag = data.param.flag;
        if (flag == "0") {
            var certSign = data.param.certSign;//签名后的数据
            agreement.agreementSign(agreementLists[id],id,certSign,function(){openThirdPartyAccount();//存管银行绑定
            });//要签署协议
        } else {
            removeLoadingDiv();
        }
    }
    switch (rspId) {
        case 'keyboardnum':
            var pStrObj = $("#psword").children().eq(1);
            var pStrval = pStrObj.html();
            var pvalObj = $("#psword").children().eq(2);
            var pval = pvalObj.html();
            var numKey = data.param.key;
            //判断键盘内容
            var flag = numkeyboard(numKey, pval);
            if (flag == "num") {
                if (pval == null) {
                    pStrval = "";
                    pval = "";
                }
                if (pval.length < 6) {
                    pStrObj.html(pStrval + "●");
                    pvalObj.html(pval + numKey);
                    if (pswFlag == "true")
                        pvalObj.show();
                    else
                        pStrObj.show();
                }
            } else if (flag == "-3") {//-3:完成
                console.log("完成");
            } else {
                pStrObj.html(pStrval.substring(0, pStrval.length - 1));
                pvalObj.html(flag);
                if (pStrObj.html().length < 1) {
                    $("#psword").find("input").show();
                    showGB();
                } else {
                    if (pswFlag == "true")
                        pvalObj.show();
                    else
                        pStrObj.show();
                }
            }

            if (pvalObj.html().length == 6) {
                pswCheck(pvalObj.html());
            }
            break;
        case 'isCertInstall':
            var flag = data.param.flag;
            (flag == '0') ? pickNextStep(data, uploadThirdPartyAccount): cert.zhongDengCertApplyState();
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
                pickNextStep(data, uploadThirdPartyAccount);
            }
            break;
    }
    switch (data.action) {
        case 'getNetworkType':
            createLoadingDiv();	
            isCertInstall();
            pickNextStep(data, openThirdPartyAccount);
            break;
        case 'stepSync':
            var clientId = data.param.clientId;
            var step = data.param.step;
            break;
    }
}
var cert = new Cert();
var agreement = new Agreement();
var qsId = localStorage.getItem("qsId");
var qsInterface = localStorage.getItem("qsInterface");
var pswFlag = "false";
var qsBackground = localStorage.getItem("qsBackground"),
    pkcs10 = "",
    p7cert = "",
    processArr = [false, false, false];
    //判断协议是否签署成功
var isAgreementSuccessArr = new Array();
var bankListLocal = JSON.parse(localStorage.getItem("bankList"));
var bankList = bankListLocal.bankData;
$(function () {

    //返回事件绑定
    $('#backTo').on('click', function () {
        isExit();
    });

    /*长城国瑞特殊处理：
     根据营业部id获取银行列表*/
    if (qsId == "322") {
        getBank();
    } else {
        showBankMsg(bankList);//展示银行对应数据信息
    }

    //选择银行事件绑定
    $('.choosebank').on('change', function () {
        searchBank($('#bankList')[0].value);
        //清空原输入框数据
        $('#bankNum')[0].value = "";//银行卡号
        $("#psword").find("p").html("");//密码

        if (qsId == "322") {
            var econtractId = searchBank($('#bankList')[0].value).econtract_id;
            /*获取协议名称*/
            getAgreementName(econtractId);
        }
        changeNextstepState();//下一步是否显示
    });

    //银行卡号输入框点击事件绑定
    $('#bankNum').on('click', function () {
        hideNumKeyboard();//隐藏数字键盘
        $(".pswordGB").hide();
        if ($("#psword").children().eq(1).html().length < 1)
            $(".psw_tip").show();
    });

    //银行卡号失去焦点事件绑定
    $('#bankNum').on('blur', function () {
        var bankNum = $('#bankNum')[0].value;
        if (bankNum)
            luhnCheck(this.value);
    });

    //密码输入框点击事件绑定
    $("#bankpsw input").mousedown(function (event) {
        return false;
    });
    $("#bankpsw").on('click', function () {
        showGB();
        $("#bankNum").blur();
        getKeyboard();
    });

    //按钮控制:是否明码显示密码
    $('#showPsw').on('click', function () {
        if ($(this).hasClass("unview")) {
            $(this).removeClass("unview");
            this.children[0].src = "../images/setPassword/view.png";
            $("#psword").children().eq(1).hide();
            $("#psword").children().eq(2).show();
            pswFlag = "true";
        } else {
            $(this).addClass("unview");
            this.children[0].src = "../images/setPassword/unview.png";
            $("#psword").children().eq(1).show();
            $("#psword").children().eq(2).hide();
            pswFlag = "false";
        }
    });

    //显示密码按钮控制
    $('#showdialogPsw').on('click', function () {
        if ($(this).hasClass("unview")) {
            this.children[0].src = "../images/setPassword/view.png";
            $(this).prev()[0].setAttribute("type", "text");
            $(this).removeClass("unview");
        } else {
            $(this).addClass("unview");
            $(this).prev()[0].setAttribute("type", "password");
            this.children[0].src = "../images/setPassword/unview.png";
        }
    });

    //查看协议
    $('.agreement').on('click', function () {

        //协议: 电子合同ID
        var econtractId = $(this).data('type');
        hideNumKeyboard();
        if (econtractId) {
            agreementDetail(econtractId);
        } else {
            //econtractId: 银行电子合同ID(仅限只有一个协议的)
            var econtractId = searchBank($('#bankList')[0].value).econtract_id;
            agreementDetail(econtractId);
        }
    });

    //复选框事件绑定
    $(".certificate input[type='checkbox']").click(function () {
        changeNextstepState();//下一步是否显示
    });

    //银行弹窗中：返回修改 确定
    $('#turnback').on('click', function () {
        //弹窗隐藏，遮罩隐藏
        $('.bankTipMsg').addClass("hide");
        $('.mask').addClass("hide");
    });

    /*点击【确定按钮】*/
    $('#suretoNext').on('click', function () {
        hasNetwork();
    });
});

function getBank() {
    var yybid = sessionStorage.getItem("yybid");
    var obj = {qsid: qsId, sms: "1", yybid: yybid};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "getBank",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            if (data.error_no == "0") {
                bankList = data["resultList"];
                showBankMsg(bankList);//展示银行对应数据信息
            } else {
                alertInfo(data.error_info);
                createReloadDiv("券商支持银行列表加载失败,请重新加载。", "", getBank, isExit);
            }
        },
        error: function () {
            createReloadDiv("券商支持银行列表加载失败,请重新加载。", "", getBank, isExit);
        }
    });
}

//展示银行列表
function showBankMsg(bankList) {
    $('#bankList').empty();//清空list
    for (var i = 0; i < bankList.length; i++) {
        var bankItem = bankList[i];
        createOption("bankList", bankItem, i);
    }
}

//动态创建option元素
function createOption(obj, data, i) {
    var parent = document.getElementById(obj);
    //创建option元素
    if (i == 0) {
        var option1 = document.createElement("option");
        option1.setAttribute("value", "请点击选择开户银行");
        option1.setAttribute("id", "selectBank");
        option1.innerHTML = "请点击选择开户银行";
        parent.appendChild(option1);
    }
    var option = document.createElement("option");
    option.setAttribute("value", data.bank_name);
    option.setAttribute("id", data.econtract_id);
    option.innerHTML = data.bank_name;
    parent.appendChild(option);
}

/*匹配：根据银行名称bankName
 返回：选择银行的对象*/
function searchBank(bankName) {

    //获取缓存银行数据
    var bankListLocal = JSON.parse(localStorage.getItem("bankList"));
    var bankList = bankListLocal.bankData;
    for (var i = 0; i < bankList.length; i++) {
        var bankItem = bankList[i];
        if (bankName == bankItem.bank_name) {
            chooseBank(bankItem);
            return bankItem;
        } else {
            $('.banknum').addClass("hide");//银行卡号
            $('.bankpsw').addClass("hide");//银行密码
            $('.warnmsg #isSupportMutiQs')[0].innerHTML = "";
            $('.warnmsg #boundway')[0].innerHTML = "";
        }
    }
}

/*选择银行
 bankItem: 某个银行具体信息*/
function chooseBank(bankItem) {
    //is_support_multi_qs: 银行卡是否支持多个券商绑定
    if (bankItem.is_support_multi_qs == "0") {
        $('#isSupportMutiQs')[0].innerHTML = "如果您已在其他券商绑定过" + bankItem.bank_name + "，请您用另外一张" + bankItem.bank_name + "卡或选择其他银行绑定";
        $('#isSupportMutiQs').append("<br/>");
    } else {
        $('#isSupportMutiQs')[0].innerHTML = "";
    }


    if (qsId == "322") {
	//提示信息：eg.签约成功后，您的第一笔转账需从银行端发起
        var depositoryMemo = bankItem.depository_memo;
        if (depositoryMemo) {
            $('#boundway')[0].innerHTML = depositoryMemo;
        } else {
            $('#boundway')[0].innerHTML = "";
        }
    } else {
        //boundWay: 绑定方式
        if (bankItem.boundWay == "1") {
            $('#boundway')[0].innerHTML = "开户成功后，首笔资金转入证券账户，需登录网上银行从银行端发起";
        } else if (bankItem.boundWay == "2") {
            $('#boundway')[0].innerHTML = "开户成功后，请登录网上银行完成三方存管签约";
        } else if (bankItem.boundWay == "3") {
            $('#boundway')[0].innerHTML = "先开通网银，完成三方存管签约，再登录网银完成三方存管签约手续";
        } else {
            $('#boundway')[0].innerHTML = "";
        }
    }

    /*类型  11：账号+密码  12：账号 21：账号  22：账号密码都不需要
     另：民生银行需要银行查询密码，中国银行需要电话银行密码*/
    if (bankItem.bank_flag == "11") {
        $('.banknum').removeClass("hide");
        $('.bankpsw').removeClass("hide");
        if (bankItem.pinyin == "zhongguo") {
            $('.bankpsw label')[0].innerHTML = "查询密码";
            $('.psw_tip span').html("电话银行密码");
        } else if (bankItem.pinyin == "minsheng") {
            $('.bankpsw label')[0].innerHTML = "查询密码";
            $('.psw_tip span').html("银行查询密码");
        } else {
            $('.bankpsw label')[0].innerHTML = "密码";
            $('.psw_tip span').html("银行卡密码");
        }
    } else if (bankItem.bank_flag == "12" || bankItem.bank_flag == "21") {
        $('.banknum').removeClass("hide");
        if (!$('.bankpsw').hasClass("hide")) {
            $('.bankpsw').addClass("hide");
        }
    } else if (bankItem.bank_flag == "22") {
        if (!$('.banknum').hasClass("hide")) {
            $('.banknum').addClass("hide");
        }
        if (!$('.bankpsw').hasClass("hide")) {
            $('.bankpsw').addClass("hide");
        }
    }
    //是否支持多协议:  支持 1
    if (bankItem.multi_econtract == "1") {
        sessionStorage.setItem("multiEcontract", "1");
        //获取协议配置列表
        getaGreementList();
    }
}

/*获取协议名称*/
function getAgreementName(econtractId) {

    var obj = {econtract_id: econtractId, type: "bank"};
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
                var econtractName = tmpData.econtract_name;
                $("#agreementName").html("《" + econtractName + "》");
            } else {
                alertInfo(tmpData.error_info);
            }
        },
        error: function () {
            alertInfo("获取协议名称失败");
        }
    });
}

//获取协议配置列表
function getaGreementList() {
    //econtractId: 银行电子合同ID(只有multi_econtract == "1"时存在)
    var econtractId = searchBank($('#bankList')[0].value).econtract_id;
    var obj = {econtract_id: econtractId, type: "bank"};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "AgreementList",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            //返回成功
            if (tmpData.error_no == "0") {

                var resultList = tmpData.resultList;
                localStorage.setItem("agreementList", JSON.stringify(resultList));
                for (var i = 0; i < resultList.length; i++) {
                    isAgreementSuccessArr[i] = false;
                    var divObj = "<div datatype='" + resultList[i].econtract_id + " class='std_box'><span>" + resultList[i].econtract_name + "</span><span class='rightArrow'></span></div>";
                    $(".agreementList").append(divObj);
                }
                $(".agreement").hide();
                $(".agreementList").show();
                $(".certificate").show();
            } else {
                alertInfo(tmpData.error_info);
            }
        },
        error: function () {
            alertInfo("获取协议配置列表失败");
        }
    });
}

//改变下一步状态
function changeNextstepState() {
    var flag = $(".certificate input[type='checkbox']").is(':checked');
    if (flag) {
        $('.certificate label').css({
            'background': "url(../images/openThirdPartyAccount/agree_icon_check.png) no-repeat left center",
            'backgroundSize': '0.4rem 0.4rem'
        });
    }
    else {
        $('.certificate label').css({
            'background': "url(../images/openThirdPartyAccount/agree_icon_nocheck.png) no-repeat left center",
            'backgroundSize': '0.4rem 0.4rem'
        });
    }
    if ($('#bankList')[0].value == "请点击选择开户银行" || (!flag)) {
        $('.nextstep').css({'border': "1px solid #d7d7d7", 'color': "#999", 'background-color': "#fff"});
    } else {
        $('.nextstep').css({'border': "none", 'color': "#fff", 'background-color': "#3a83d7"});
    }
}

/*银行卡号校验
 Description:  银行卡号Luhn校验
 Luhn校验规则：16位银行卡号（19位通用）:
 1.将未带校验位的 15（或18）位卡号从右依次编号 1 到 15（18），位于奇数位号上的数字乘以 2。
 2.将奇位乘积的个十位全部相加，再加上所有偶数位上的数字。
 3.将加法和加上校验位能被 10 整除。
 bankno为银行卡号 banknoInfo为显示提示信息的DIV或其他控件*/
function luhnCheck(bankno) {
    var lastNum = bankno.substr(bankno.length - 1, 1);//取出最后一位（与luhn进行比较）
    var first15Num = bankno.substr(0, bankno.length - 1);//前15或18位
    var newArr = new Array();
    for (var i = first15Num.length - 1; i > -1; i--) {    //前15或18位倒序存进数组
        newArr.push(first15Num.substr(i, 1));
    }
    var arrJiShu = new Array();  //奇数位*2的积 <9
    var arrJiShu2 = new Array(); //奇数位*2的积 >9

    var arrOuShu = new Array();  //偶数位数组
    for (var j = 0; j < newArr.length; j++) {
        if ((j + 1) % 2 == 1) {//奇数位
            if (parseInt(newArr[j]) * 2 < 9)
                arrJiShu.push(parseInt(newArr[j]) * 2);
            else
                arrJiShu2.push(parseInt(newArr[j]) * 2);
        }
        else //偶数位
            arrOuShu.push(newArr[j]);
    }

    var jishu_child1 = new Array();//奇数位*2 >9 的分割之后的数组个位数
    var jishu_child2 = new Array();//奇数位*2 >9 的分割之后的数组十位数
    for (var h = 0; h < arrJiShu2.length; h++) {
        jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
        jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
    }

    var sumJiShu = 0; //奇数位*2 < 9 的数组之和
    var sumOuShu = 0; //偶数位数组之和
    var sumJiShuChild1 = 0; //奇数位*2 >9 的分割之后的数组个位数之和
    var sumJiShuChild2 = 0; //奇数位*2 >9 的分割之后的数组十位数之和
    var sumTotal = 0;
    for (var m = 0; m < arrJiShu.length; m++) {
        sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
    }

    for (var n = 0; n < arrOuShu.length; n++) {
        sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
    }

    for (var p = 0; p < jishu_child1.length; p++) {
        sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
        sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
    }
    //计算总和
    sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu) + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2);

    //计算Luhn值
    var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
    var luhn = 10 - k;
    if (lastNum == luhn && lastNum.length != 0) {
        return true;
    }
    else{
     alertInfo("银行卡号有误，请重新输入");
     return false;
    }        
}

//密码的验证
function pswCheck(psw) {
    var reg = /^\d{6}$/;
    if (!psw.match(reg)) {
        alertInfo("请输入正确的密码格式");
    }
}

var pWidth = $(window).width();
function showGB() {

    $(".psw_tip").hide();
    $("#psword").find("img").show();
}

//获取数字键盘(调客户端协议)
function getKeyboard() {
    var data = '{"action":"keyboard", "reqId":"keyboardnum","param":{"type":"number","direction":"show"}}';
    window.thskaihu.reqApp(data);
}

//隐藏数字键盘的协议
function hideNumKeyboard() {
    var data = '{"action":"keyboard", "reqId":"nokeyboardnum","param":{"type":"number","direction":"hide"}}';
    window.thskaihu.reqApp(data);
}

//对于数字键盘按键处理
function numkeyboard(key, str) {
    var valueStr = str;
    //完成
    if (key == "-3") {
        return "-3";
    }
    //移除
    if (key == "-5") {
        if (valueStr.length > 0) {
            valueStr = valueStr.substring(0, valueStr.length - 1);
        }
        return valueStr;
    } else {
        //其他数字
        return "num";
    }

}

//去除返回的“\”
function replaceAll(str) {
    while (str != null && str.indexOf("\\") > -1) {
        str = str.replace("\\", "");
    }
    return str;
}

/*查看协议详情*/
function agreementDetail(econtractId) {

    var obj = {econtract_id: econtractId, type: "bank"};
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
                $('.mask').removeClass("hide");
                $('#showDetail').removeClass("hide");
                $('#econtractContent').scrollTop(0);
                var econtractContent = tmpData.econtract_content;
                $('#econtractContent')[0].innerHTML = replaceAll(econtractContent);
            } else {
                alertInfo(tmpData.error_info);
            }
        },
        error: function () {
            alertInfo("查看协议请求失败！");
        }
    });
}

function uploadThirdPartyAccount() {

    var qsDetail = JSON.parse(localStorage.getItem("qsDetail")).qsData;//获取券商详情数据
    var isSignAgreement = qsDetail.qs_is_sign_agreement;
    /*平安证券：59 东莞证券：340特殊处理*/
    if (qsId != "59" && qsId != "340" && isSignAgreement == "1")
        isAgreementSign();//协议签署
}

//获取单个协议内容
function getAgreement(econtractId) {
    var agreementObj = "";
    var obj = {econtract_id: econtractId, type: "bank"};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "AgreementDetail",
        dataType: 'json',
        async: false,
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            //返回成功
            if (tmpData.error_no == "0") {
                agreementObj = tmpData;
            } else {
                alertInfo(tmpData.error_info);
            }
        },
        error: function () {
            createReloadDiv("获取单个协议内容失败,请重新加载。", "", getBank, isExit);
        }
    });

    return agreementObj;
}

//关闭详情页面
function closeDetail() {
    $('.mask').addClass("hide");
    $('#showDetail').addClass("hide");
}

//是否进入下一步
function isGotoNextstep() {
    hideNumKeyboard();
    var flag = "";
    if ($('#bankList')[0].value == "请点击选择开户银行") {
        flag = flag + "0";
	alertInfo("请点击选择开户银行");
    } else {
        flag = flag;
    }
    if ($('.banknum').hasClass("hide")) {
        flag = flag;
    } else {

        if (!$('#bankNum')[0].value){
            alertInfo("银行卡号不能为空");
            flag = flag + "1";
            return;
        }   
        var bankNumFlag = luhnCheck($('#bankNum')[0].value);
        if (bankNumFlag) {
            flag = flag;
        } else {
            flag = flag + "1";
            return;
        }
    }

    if ($('.bankpsw').hasClass("hide")) {
        flag = flag;
    } else {
        var pswObj = $("#psword").children().eq(2).html();
        if (pswObj) {
            flag = flag;
            if (pswObj.length != 6) {
                alertInfo("密码必须为6位数字");
                flag = flag + "2";
            }
        } else {
            flag = flag + "2";
            alertInfo("密码不能为空");
        }
    }
    if ($(".certificate input[type='checkbox']").is(':checked')) {
        flag = flag;
    } else {
        flag = flag + "3";
        alertInfo("请同意签署协议");
    }
    if (!flag) {
        //给出银行提示框
        isUpdateDiolog();
    }
}

//存管银行绑定
function openThirdPartyAccount() {

    var bankItem = searchBank($('#bankList')[0].value);
    var bankNo = bankItem.bank_no;
    var bankAccount = $('#bankNum')[0].value || "";
    var bkPassword = $("#psword").children().eq(2).html() || "";
    var funFlag = bankItem.fun_flag;
    var pinyin = bankItem.pinyin;
    var obj = {
        bank_no: bankNo,
        bank_account: bankAccount,
        bk_password: bkPassword,
        encode_type: "0",
        fun_flag: funFlag
    };

    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "openThirdPartyAccount",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == "0") {
                stepSync('openThirdPartyAccount',pinyin);//步骤同步统计
                gotoNextstep("openThirdPartyAccount");//跳转到下一步骤
            } else {
                removeLoadingDiv();
                alertInfo(data.error_info);
            }
        },
        error: function () {
            removeLoadingDiv();
            alertInfo("存管银行绑定失败");
        }
    });
}

//给出是否要修改的提示框
function isUpdateDiolog() {
    //银行名称
    var bankName = $('#bankList')[0].value;
    var bankNameList = $('.bankNamehtml');
    for (var i = 0; i < bankNameList.length; i++) {
        $('.bankNamehtml')[i].innerHTML = bankName;
    }
    var bankListItem = searchBank(bankName);
    //银行卡图标
    $('#dialogImg')[0].src = bankListItem["bank_logo_large"];

    //银行账号
    if (!$('#bankNum').hasClass("hide")) {
        var bankNo = $('#bankNum')[0].value;
        $('.bankNo').removeClass("hide");
        $('.bankNo')[0].innerHTML = bankNo;
    } else {
        if (!$('.bankNo').hasClass("hide")) {
            $('.bankNo').removeClass("hide");
        }
    }

    //客服电话
    $('#serviceTel')[0].innerHTML = bankListItem["bank_tel"];

    if (!$('.bankpsw').hasClass("hide")) {
        $('#dialogbankPsw').hide();
        //中国银行、民生银行特殊处理
        if (bankListItem["pinyin"] == "zhongguo") {
            $('#dialogbankPsw span')[0].innerHTML = bankName + "需输入电话银行密码,不是ATM机取款密码。如果不知道密码，您可以:";
            $('#dialogbankPsw').show();
        } else if (bankListItem["pinyin"] == "minsheng") {
            $('#dialogbankPsw span')[0].innerHTML = bankName + "需输入银行查询密码,不是ATM机取款密码。如果不知道密码，您可以:";
            $('#dialogbankPsw').show();
        }
        var bankpsw = $("#psword").children().eq(2).html();//银行密码
        $('.bankPsw').removeClass("hide");
        $('#dialogpsw')[0].value = bankpsw;
        $('.bankTip').removeClass("hide");

    } else {
        $('.bankPsw').addClass("hide");
        $('.bankTip').addClass("hide");
    }

    //显示弹窗，出现遮罩层
    $('.bankTipMsg').removeClass("hide");
    $('.mask').removeClass("hide");
}

//查询本地是否有证书
function isCertInstall() {
    var userId = createUserId();
    var data = '{"action":"isCertInstall", "reqId":"isCertInstall","param":{"userId":"' + userId + '"}}';
    window.thskaihu.reqApp(data);
}

var agreementLists = new Array();
function isAgreementSign() {
    
    //查询中登证书
    cert.zhongDengCertQuery(0,'',function (){alertInfo("证书无效");});

    //券商支持的银行getBank: multi_econtract是否支持多协议 1支持
    var multiEcontract = sessionStorage.getItem("multiEcontract");
    if (multiEcontract == "1") {
        //获取agreementLists的值
        agreementLists = JSON.parse(localStorage.getItem("agreementList"));
    } else {
        //econtractId: 银行电子合同ID(仅限只有一个协议的)
        var econtractId = searchBank($('#bankList')[0].value).econtract_id;
        agreementLists[0] = getAgreement(econtractId);
    }

    for (var i = 0; i < agreementLists.length; i++) {
        var agreementList = agreementLists[i];
        agreement.getSignCert(agreementList,i);
    }
    return true;
}

