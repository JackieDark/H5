window.rspWeb = function(data){
	data = JSON.parse(data);
	switch (data.action){
		case 'getPhoneNum':
		    var mobileTel = data.param.mobileTel;//客户手机号
			if(!mobileTel){
				mobileTel = '';
				$('.telephoneno input').removeAttr('readonly');
			}else{
                		$('.telephoneno').off('click');
			}
		    $('.telephoneno input')[0].value = mobileTel;
			var recognizeId = data.param.recognizeId;//手机号伪码
			localStorage.setItem('recognizeId',recognizeId);
			break;
        case 'getNetworkType':
            //下一步封装
            pickNextStep(data, register);
            hideNumKeyboard();
            break;
        case 'stepSync':
            var clientId = data.param.clientId;
            var step = data.param.step;
            break;
        case 'callTel':
            var flag=data.param.errorNo;
            if(flag=="1"){
                alertInfo(data.param.errorInfo);
            }
            break;
    }
    switch (data.rspId) {
        case 'keyboard1':
            moveGb('.tel', '.telephoneno .gbb', data, 0);
            break;
        case 'keyboard2':

            moveGb('.code', '.checkcode .gbb', data, 1);
            getCheckcode($('.code').val());
            break;
    }
};

//光标移动变化
//type 0为手机 1为验证码
function moveGb(dom1, dom2, data, type) {

    var len1 = $(dom1).val().length,
        len2 = $(dom2)[0].innerHTML.length;
    var len = (type == 0) ? 11 : 6;
    var key = data.param.key;
    switch(key){
        case -5:
        case '-5'://删除
          if (len1 > 0) {
                $(dom1)[0].value = $(dom1).val().substring(0, len1 - 1);
                $(dom2)[0].innerHTML = $(dom2)[0].innerHTML.substr(0, len2 - 1);
          }
        break;
        default:
            //防止输入超过限制位数以及排除点击完成按钮(-3)的情况
            if (len1 < len && key != -3) {
               $(dom1)[0].value += data.param.key;
               $(dom2)[0].innerHTML += data.param.key;
            }
   }
}


$(function () {
    /*获取客户手机号、手机号伪码
     调用客户端协议：getPhoneNum*/
    getPhoneNum();
    clickBtnSendcode();//验证码btn点击事件绑定
    clearCookie();//清除cookie

    //从本地缓存中获取银行卡信息，如果存在并且未过期，则不再发送getBank请求
    var bankListDeffer = $.Deferred();
    var QsDetailDeffer = $.Deferred();
    var bankList = JSON.parse(localStorage.getItem('bankList')) || "";
    var qsDetail = JSON.parse(localStorage.getItem("qsDetail")) || "";
    if(bankList.qsid == qsId){
        compareDate(bankList.nowTime, 7) ? getBank(bankListDeffer) : bankListDeffer.resolve("bankListSuccess");
    }else{
        getBank(bankListDeffer);
    }
    //获取券商详情
    if(qsDetail.qsid == qsId){
        if(compareDate(qsDetail.nowTime, 7)){
            getQsDetail(QsDetailDeffer);
        }else{
            QsDetailDeffer.resolve("qsDetailSuccess");
            $(".tipmsg2 a").html(qsDetail.qsData.qs_hotline);
        }
    }else{
        getQsDetail(QsDetailDeffer);
    }
    //检测getBank和GetDetail两个接口的返回
    detectBankAndDetail(bankListDeffer, QsDetailDeffer);

    //返回事件绑定
    $('#backTo').on('click', function () {
        exitKaihu();
    });

    //手机号
    $(".tel").mousedown(function (event) {
        return false;
    });
    $('.telephoneno').on('click', function () {

        $('.tel').removeAttr('placeholder');
        $('.telephoneno .pgb').addClass('show');
        $('.code').attr('placeholder', '请输入验证码');
        $('.checkcode .pgb').removeClass('show');
        getKeyboard('keyboard1');
    });
    //验证码
    $(".code").mousedown(function (event) {
        return false;
    });
    $('.checkcode').on('click', function () {

        $('.code').removeAttr('placeholder');
        $('.checkcode .pgb').addClass('show');
        $('.tel').attr('placeholder', '请输入手机号');
        $('.telephoneno .pgb').removeClass('show');
        getKeyboard('keyboard2');
    });

    //支持的银行卡事件绑定
    $('.supportbank').on('click', function () {
        var bankListLocal = JSON.parse(localStorage.getItem("bankList"));
        var tmpData = bankListLocal.bankData;
        var ret = [];
        var ret2 = [];
        for (var i=0,j=tmpData.length; i<j; i++) {
            if(ret.indexOf(tmpData[i].pinyin) === -1){
                ret.push(tmpData[i].pinyin);
                ret2.push(tmpData[i]);
            }
        }
        var doBankListRender = function(){
            var len = ret2.length;
            //分两份数据展示
            var halflength = len / 2;
            $('#olone,#oltwo').empty();
            for (var i = 0; i < len; i++) {
                //#olone列设置
                if (i < halflength) {
                    addElementLi("olone", ret2[i]);
                } else {
                    addElementLi("oltwo", ret2[i]);
                }
            }
            $('.bankicon').removeClass("hide");
            $('.mask').removeClass("hide");
            $(this).addClass("hide");
        };
        //判断接口是否已经成功返回
        if (tmpData && tmpData.length) {
            doBankListRender();
        }else{
            createLoadingDiv();
            var timer = setInterval(function(){
                if(tmpData && tmpData.length){
                    removeLoadingDiv();
                    clearInterval(timer);
                    doBankListRender();
                }
            }, 1000);
        }

    });

    //去掉遮罩事件
    $('.mask').click(function () {
        $(this).addClass("hide");
        $('.bankicon').addClass("hide");
        $('.supportbank').removeClass("hide");
    });
});

//验证码btn点击事件绑定
function clickBtnSendcode() {
    $('.code')[0].value = "";//清空验证码
    $('.getcheckcode').on('click', function () {
        var telephoneno = $('.tel')[0].value;
        var obj = {mobile_tel: telephoneno, qsid: qsId, open_type: 1};
        sendCheckCode(obj);//发送验证码
    });
}

/*调起客户端数字键盘
 reqId：数字键盘序号*/
function getKeyboard(reqId) {
    var data = '{"action":"keyboard", "reqId":"' + reqId + '","param":{"type":"number","direction":"show"}}';
    window.thskaihu.reqApp(data);
}

//隐藏数字键盘的协议
function hideNumKeyboard() {
    var data = '{"action":"keyboard", "reqId":"nokeyboardnum","param":{"type":"number","direction":"hide"}}';
    window.thskaihu.reqApp(data);
}

//清除cookie
function clearCookie() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
    if (cookies.length > 0) {
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            var domain = location.host.substr(location.host.indexOf('.'));
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + domain;
        }
    }
}

//券商支持的银行列表
function getBank(deferred) {

    var obj = {qsid: qsId, sms: "1"};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "getBank",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            if (data.error_no == "0") {
                var tmpData = data["resultList"];
                //本地缓存获取银行数据列表
                var bankList = {
                    qsid: qsId,
                    nowTime: formatDate(new Date()),
                    bankData: tmpData
                };
                localStorage.setItem("bankList", JSON.stringify(bankList));
                deferred.resolve("bankListSuccess");
            } else {
                alertInfo(data.error_info);
                deferred.resolve("bankListFail");
            }
        },
        error: function () {
            deferred.resolve("bankListFail");
        }
    });
}

//获取券商详情
function getQsDetail(deferred) {
    var obj = {qsid: qsId};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "getQsDetail",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            if (data.error_no == "0") {
                var tempData = data;
                //本地缓存获取银行数据列表
                var qsDetailData = {
                    qsid: qsId,
                    nowTime: formatDate(new Date()),
                    qsData: tempData
                };
                localStorage.setItem("qsDetail", JSON.stringify(qsDetailData));
                $(".tipmsg2 a").html(tempData.qs_hotline);
                deferred.resolve("qsDetailSuccess");
            } else {
                deferred.resolve("qsDetailFail");
                alertInfo(data.error_info);
            }
        },
        error: function () {
            deferred.resolve("qsDetailFail");
        }
    });
}

//检测getBank和GetDetail两个接口的返回
function detectBankAndDetail(bankListDeffer, QsDetailDeffer){
    
    $.when(bankListDeffer, QsDetailDeffer).done(function (bankres, qsres) {
        if(bankres == 'bankListSuccess' && qsres == 'qsDetailFail'){
            //这里是因为去掉了getBank和getQsDetail中的createReloadDiv，处理点击重新加载之后再次出错的情况
            var newGetQsDetail = function(){
                var qsDetailDeffer = $.Deferred();
                getQsDetail(qsDetailDeffer);
                detectSingle(qsDetailDeffer);
            }
            createReloadDiv("获取券商详情失败,请重新加载。", "", newGetQsDetail, exitKaihu);
        }
        if(qsres == 'qsDetailSuccess' && bankres == 'bankListFail'){
            var newGetBankList = function(){
                var bankListDeffer = $.Deferred();
                getBank(bankListDeffer);
                detectSingle(bankListDeffer);
            }
            createReloadDiv("券商支持银行列表加载失败。", "", newGetBankList, exitKaihu);
        }
        var getBankAndQsDetail = function(){
            var bankListDeffer = $.Deferred();
            var QsDetailDeffer = $.Deferred();
            getBank(bankListDeffer);
            getQsDetail(QsDetailDeffer);
            detectBankAndDetail(bankListDeffer, QsDetailDeffer);
        }
        if(bankres == 'bankListFail' && qsres == 'qsDetailFail'){
            createReloadDiv("获取券商详情以及其支持的银行卡失败,请重新加载。", "", getBankAndQsDetail, exitKaihu);
        }
        //调用客户端拨号协议
        if(qsres == 'qsDetailSuccess'){
            var qsDetailLocal = localStorage.getItem("qsDetail");
            var qsDetail = JSON.parse(qsDetailLocal).qsData;
            $(".tipmsg2 a").click(function(){
                var telNo = qsDetail["qs_hotline"];
                var data = '{"action":"callTel", "reqId":"callTel","param":{"telNo":"'+telNo+'"}}';
                window.thskaihu.reqApp(data);
            });
        }
    });
}

//检测单个报错
function detectSingle(defer){
    $.when(defer).done(function(deferres){
        if(deferres == "bankListFail"){
            var newGetBankList = function(){
                var bankListDeffer = $.Deferred();
                getBank(bankListDeffer);
                detectSingle(bankListDeffer);
            }
            createReloadDiv("券商支持银行列表加载失败。", "", newGetBankList, exitKaihu);
        }else if(deferres == "qsDetailFail"){
            var newGetQsDetail = function(){
                var qsDetailDeffer = $.Deferred();
                getBank(qsDetailDeffer);
                detectSingle(qsDetailDeffer);
            }
            createReloadDiv("获取券商详情失败,请重新加载。", "", newGetQsDetail, exitKaihu);
        }
    });
}
//动态创建li元素
function addElementLi(obj, data) {
    var parent = document.getElementById(obj);
    //创建li元素
    var li = document.createElement("li");
    var img = document.createElement("img");
    var span = document.createElement('span');
    img.setAttribute("src", data.bank_logo_small);
    var bankName = data.bank_name;
    //中国邮政储蓄银行
    if (bankName.length > 4)
        bankName = bankName.substr(0, 4);
    span.innerHTML = bankName;
    li.appendChild(img);
    li.appendChild(span);
    parent.appendChild(li);
}

//发送验证码
function sendCheckCode(obj) {
    var setTime = 60;
    var curTime = 0;
    var leftTime = 0;
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "Sendcode",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {

            var tmpData = data;
            if (tmpData.error_no == 0) {
            } else {
                alertInfo(data.error_info);
            }
            //显示提示信息
            $('.tipmsg').removeClass("hide");
        },
        error: function () {
            alertInfo("发送验证码失败！");
        }
    });
    countDown(setTime, curTime, leftTime);
}

//验证码监听
function getCheckcode(str){

	var reg = new RegExp("^[0-9]{4,6}$");  
	if(reg.test(str)){

		$('.nextstep').css({'background-color':'#3a83d7','color':'#fff'});
		$('.nextstep').off('click').on('click',function(){
			if($('.getcheckcode span').html() == "获取验证码"){
				alertInfo("请先获取验证码")
			    return false;
			}else{
				hasNetwork();
			}
		});
	}else{
		$('.nextstep').css({'background-color':'#fff','color':'#999','border':'1px solid #d7d7d7'});
		$('.nextstep').off('click');
	}
}

//倒计时
function countDown(setTime,curTime,leftTime) {
	var timer=0;
	if (timer) clearTimeout(timer);
	curTime++;
	leftTime = setTime - curTime;
	$('.getcheckcode span').html(leftTime+" s");
	$('.getcheckcode').css({'background-color':"#fff",	'color':'#3a83d7',	'border':'1px solid #d7d7d7'});
	if (leftTime > 0) {
		timer = setTimeout(function() {
			countDown(setTime,curTime,leftTime);
		}, 1000);
		$('.getcheckcode').off('click');
	} else {

		//重新发送
		$('.getcheckcode').css({'background-color':"#3a83d7",'color':'#fff','border':'1px solid #d7d7d7'});
		$('.getcheckcode span').html("重新获取");
		clickBtnSendcode();
	}
}
var gotoNextStepFlag;
//注册
function register(){  
	var tel = $('.tel')[0].value;
        var code = $('.code')[0].value;
	var obj={ qsid: qsId,mobile_tel:tel, mobile_code:code, open_flag:1, channel:"html5"};
	$.ajax({
		type: 'get',
		data: obj,
		url: qsInterface+"Register",
		dataType: 'json',
		cache: false,
		timeout : 15000, 
		success: function(data) {
			var tmpData = data;
			if(tmpData.error_no==0){
				var clientId=tmpData.client_id;
				localStorage.setItem("registerInfo",JSON.stringify(tmpData));//缓存注册信息
				localStorage.setItem("telKey",tel.substring(5,11));//缓存手机号码后6位
				//branch_no: 营业部编号
				if(qsId == "322"){
					var yybid = getcookie("branch_no");
					sessionStorage.setItem("yybid", yybid);
				}
				gotoNextStep();
				var nextList = JSON.parse(localStorage.getItem("nextList"));
		        //非驳回,正常开户流程
				if(gotoNextStepFlag){
					if(nextList.length==1)//设置最后一步进度查询标志
						localStorage.setItem("success","success");
					afterBackToOpenAccountStep();
				}
			}else{
				removeLoadingDiv();
				alertInfo(tmpData.error_info);
			}
		},
		error: function() {
			removeLoadingDiv();
			alertInfo("手机验证失败");
		}
	});
}

/*
 *获取进度之后需执行代码
 *如果是驳回状态，则在点击弹窗确定之后再执行
 *如果是正常流程，则直接执行
 */
function afterBackToOpenAccountStep() {
    //跳转下一个页面
    var nextPage = JSON.parse(localStorage.getItem("nextList"));
    window.location.href = nextPage[0] + ".html";
}

//获取用户进度
var nextList = "";
function gotoNextStep() {
    $.ajax({
        type: 'get',
        data: {},
        url: qsInterface + "OpenAccountState",
        dataType: 'json',
        async: false,
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == "0") {
                nextList = tmpData.nextList;//未完成的操作集合
                if (nextList.length < 1) {
                    alertInfo("无法获取开户步骤，请稍后再试");
                    return false;
                }
                localStorage.setItem("nextList", JSON.stringify(nextList));
                localStorage.setItem("allList", JSON.stringify(tmpData.allList));
                isRejected(tmpData);//判断是否为驳回并给出对应的提示
                stepSync('Register');//步骤同步统计
            } else {
                removeLoadingDiv();
                alertInfo(tmpData.error_info);
                gotoNextStepFlag = false;
            }
        },
        error: function () {
            removeLoadingDiv();
            alertInfo("获取用户进度失败!");
            gotoNextStepFlag = false;
        }
    });
}

var nextPage = "";
function isRejected(data){

	nextList = data.nextList;
	/*驳回判断：nextList是否包含问卷回访
      单步驳回：
          一般执行完单步驳回,会直接跳转到开户结果页
      组合驳回：
     	  在驳回的步骤间逐步跳转,最后跳转到开户结果页
      三方存管的特殊处理：
         1、如果驳回中不包含三方存管,调OpenAccountResult接口(处理三方存管跑批失败问题)
         2、如果下一步是三方存管,设置三方存管标志为true(开户结果页不再调用OpenAccountApply接口)
	*/
	var thirdParty = 'false';//是否是三方存管的标志
	localStorage.setItem("thirdParty",thirdParty);
	var nextListStr = nextList.toString();
	nextPage = nextList[0];
	//判断开户流程是否走过
	if(!(nextListStr.indexOf("Revisitpaper")>-1)){
		//开户流程已经走过,判断nextList是否包含三方存管
		if(!(nextListStr.indexOf("openThirdPartyAccount")>-1)){
			openAccountResult(nextList);
		}
		if(nextPage =="openThirdPartyAccount"){
			thirdParty = 'true';
			localStorage.setItem("thirdParty",thirdParty);
		}
		//排除正常走完流程的情况
		if(nextPage!= "OpenAccountResult"){
			//是否是步骤驳回标志：处理驳回时用户无法返回上一步骤
			sessionStorage.setItem("rejectedSign","true");
			backToOpenAccountInfo(nextPage);
			gotoNextStepFlag = false;
			return;
		}
	}
	gotoNextStepFlag = true;

}

//获取开户结果
function openAccountResult(nextList) {
    $.ajax({
        type: 'get',
        data: {},
        url: qsInterface + "OpenAccountResult",
        dataType: 'json',
        async: false,
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tempData = data;
            if (tempData.error_no == "0") {
                //bank_account  银行账号
                var bankAccountObj = tempData.bank_account[0];
                var openStatus = bankAccountObj.open_status;
                //openStatus: 审核状态  0 未处理  1 处理成功 2 处理失败 3数据异常
                if (openStatus == "2" || openStatus == "3") {
                    nextList[1] = "OpenAccountResult";
                    nextList[0] = "openThirdPartyAccount";
                    localStorage.setItem("nextList", JSON.stringify(nextList));
                    nextPage = "openThirdPartyAccount";
                }
            } else {
                removeLoadingDiv();
                alertInfo(tempData.error_info);
            }
        },
        error: function () {
            removeLoadingDiv();
            alertInfo("获取开户结果失败");
        }
    });
}

//匹配对应的步骤给出对应的驳回信息
function backToOpenAccountInfo(nextPage) {
    removeLoadingDiv();
    var data = {
        "Sendpic": "由于您的照片审核不通过,请重新上传照片",
        "updateClientInfo": "由于您的资料审核不通过,请修改为真实的个人信息",
        "updateOpenBranch": "由于您选择的营业部审核不通过,请重新选择",
        "reqVideo": "由于您视频见证审核不通过,请重新进行视频见证",
        "certinstall": "由于您证书安装审核不通过,请重新申请安装证书",
        "Testpaper": "由于风险测评结果审核不通过,请重新测评",
        "AgreementSign": "由于您协议签署审核不通过,请重新签署协议",
        "openStockAccount": "由于您开立账户审核不通过,请重新开立账户",
        "setPassword": "由于您密码设置审核不通过,请重新设置密码",
        "openThirdPartyAccount": "由于您三方存管绑定审核不通过,请重新绑定三方存管"
    };
    $.each(data,function(key){
        if(nextPage == key){
            alertInfo(data[key], '', '', afterBackToOpenAccountStep);
            return false;
        }
    });
}

//退出开户函数
function exitKaihu() {
    var data = '{"action":"exitKaihu", "reqId":"exitKaihu","param":{}}';
    window.thskaihu.reqApp(data);
}
