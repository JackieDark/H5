/*jyFlag:交易密码、确认密码是否明码显示标志
  zjFlag:资金密码、确认密码是否明码显示标志
  true: 表示加密显示*/
var jyFlag = "false";
var zjFlag = "false";
var qsInterface = localStorage.getItem("qsInterface");
var pHeight = $(window).height();
$(function(){

	//退出开户
	$('#backTo').on('click',function(){
        isExit();
	});
	/*交易密码、确认密码、资金密码、确认密码*/
	var inputArr = ["transactionpsw","transactionsure","fundspsw","fundspswsure"];
	$.each(inputArr,function(index,val){

		$("#"+val).mousedown(function(event){
			return false;
        });
        $("."+val).on('click',function(){
        	switch(val){
        		case'transactionpsw':
        		    showGB("jyPsw");
        		    $(".qrPswGB,.zjPswGB,.qr2PswGB").hide();
        		break;
        		case'transactionsure':
        		    showGB("qrPsw");
        		    $(".jyPswGB,.zjPswGB,.qr2PswGB").hide();
        		break;
        		case'fundspsw':
        		    showGB("zjPsw");
					$(".jyPswGB,.qrPswGB,.qr2PswGB").hide();
        		break;
        		case'fundspswsure':
        		    showGB("qr2Psw");
					$(".jyPswGB,.qrPswGB,.zjPswGB").hide();
        		break;
        	}
			getKeyboard('keyboard'+(index+1));
	    });

	});

	//按钮控制:是否明码显示交易密码、确认密码
	$('#showPsw').on('click',function(){		
		if($(this).hasClass("unview")){
			$(this).removeClass("unview");
			this.children[0].src="../images/setPassword/view.png";
			isShowPlaincode("jyPsw","qrPsw","true");
			jyFlag = "true";
		}else{
			$(this).addClass("unview");
			this.children[0].src="../images/setPassword/unview.png";
			isShowPlaincode("jyPsw","qrPsw","false");
			jyFlag = "false";
		}
	});

	//按钮控制：是否明码显示资金密码、确认密码
	$('#showFundsPsw').on('click',function(){
		if($(this).hasClass("unview")){
			$(this).removeClass("unview");
			this.children[0].src="../images/setPassword/view.png";
			isShowPlaincode("zjPsw","qr2Psw","true");
			zjFlag = "true";
		}else{
			$(this).addClass("unview");
			this.children[0].src="../images/setPassword/unview.png";
			isShowPlaincode("zjPsw","qr2Psw","false");
			zjFlag = "false";
			
		}
	});

	//按钮控制：资金密码同交易密码
	$('#showFunds').on('click',function(){
		if($('#showFunds').hasClass("btnopen")){
			//交易密码同资金密码
			$('#showFunds')[0].children[0].src="../images/setPassword/btnclose.png";
			$('.funds').removeClass("hide");
			$('#showFunds').removeClass("btnopen");
			clearZj();
		}else{
			$('.funds').addClass("hide");
			$('#showFunds').addClass("btnopen");
			$('#showFunds')[0].children[0].src="../images/setPassword/btnopen.png";
		}
	});
	
	//确定按钮：密码设置弹窗
	$('.dialogbtn').on('click',function(){
		$('.ruledialog').addClass("hide");
	    $('.mask').addClass("hide");
	});

	//完成所有信息，点击下一步
	$('.nextstep').on('click',function(){
		hideNumKeyboard();//隐藏数字键盘
		hasNetwork();
	});
});

/*是否明码显示处理*/
function isShowPlaincode(param1,param2,flag){

	if(flag == "true"){
		$("#"+param1).children().eq(1).hide();
		$("#"+param1).children().eq(2).show();
		$("#"+param2).children().eq(1).hide();
		$("#"+param2).children().eq(2).show();
	}else{
		$("#"+param1).children().eq(1).show();
		$("#"+param1).children().eq(2).hide();
		$("#"+param2).children().eq(1).show();
		$("#"+param2).children().eq(2).hide();
	}	
}


/*显示光标
  spanId：光标所在span标签的id*/
function showGB(spanId){
    
    var len = $(".moni_span").length;//len：所有光标所在span的个数
    //遍历所有光标所在的span,如果span内p标签的值为空,显示span的第一个子元素
    for(var i=0; i<len; i++){
    	var spanChilds = $($(".moni_span")[i]).children();
    	if(spanChilds.eq(2).html().length < 1)
    		spanChilds.eq(0).show();
    }
	$("#"+spanId).children().eq(0).hide();
	$("#"+spanId).find("img").show();
	importFont(spanId);
}

/*取消按钮(图片)处理
  spanId：光标所在span标签的id*/
function importFont(spanId){

    $(".imgsize").parent().addClass("hide");
    var dom=$("#"+spanId).parent();
    var img=$("#"+spanId+"CloseImg").parent();
	if($("#"+spanId).children().eq(1).html().length > 0){
    	$(img).removeClass("hide");
		$(dom).append(img);
    }
	//给取消按钮图片绑定点击事件
	$(img).on('click',function(){
	  if($("#"+spanId).children().eq(1).html().length < 1)
	  	return false;
	  $(".imgsize").parent().addClass("hide");
	  $("#"+spanId).children().eq(0).hide();
	  $("#"+spanId).children().eq(1).html("");
	  $("#"+spanId).children().eq(2).html("");
	  showGB(spanId);//重新定位光标位置
	});
}

/*调起客户端数字键盘
  reqId：数字键盘序号*/
function getKeyboard(reqId){
	var data = '{"action":"keyboard", "reqId":"'+reqId+'","param":{"type":"number","direction":"show"}}';
	window.thskaihu.reqApp(data);
	/*处理屏幕高度小于600的手机(iphone4/5),资金密码输入框被键盘遮挡的问题*/
	if(pHeight < 600 && (reqId == "keyboard3" || reqId == "keyboard4")){
		$(".nullModel").show();
		$(".wrap").scrollTop(200);
	}
}

//隐藏数字键盘的协议
function hideNumKeyboard(){
	var data = '{"action":"keyboard", "reqId":"nokeyboardnum","param":{"type":"number","direction":"hide"}}';
    window.thskaihu.reqApp(data);
}

window.rspWeb = function(data){
	data = JSON.parse(data);
	var rspId = {
		"keyboard1":["jyPsw","jy"],
		"keyboard2":["qrPsw","jyPsw"],
		"keyboard3":["zjPsw","zj"],
		"keyboard4":["qr2Psw","zjPsw"]
	};
	$.each(rspId,function(key,val){
		if(data.rspId == key){
			var pvalObj = RealmLeft(data,val[0]);
	        if(pvalObj.html().length==6)
	          (val[0] == "jyPsw" || val[0] == "zjPsw") ? checkPsw(pvalObj.html(),val[1]) : checkSame(pvalObj.html(),val[1]);
	        importFont(val[0]); 
		} 
	});
	switch (data.action){
		case 'getNetworkType':
            //下一步封装	
   			pickNextStep(data,uploadPsw);
            break;
	}
}

/*校验交易密码、资金密码和确认密码是否一致
  psw：确认密码的值
  sign: 交易密码、资金密码区别标志
  */
function checkSame(psw,sign){

	var pswVal=$("#"+sign).children().eq(2).html();
	if(psw == pswVal){
		$("#"+sign+'TipMsg').addClass("hide");
		return true;
	}else{
		removeLoadingDiv();
		$("#"+sign+'TipMsg').removeClass("hide");
		var tip = (sign == "jyPsw") ? "交易" : "资金";
		$("#"+sign+'TipMsg').find("span").html( tip + "密码不一致");
		return false;
	}
}


/*光标位置处理
  data：调用客户端键盘协议后返回值
  spanId：光标所在span标签的id*/
function RealmLeft(data,spanId){

    var pStrObj = $("#"+spanId).children().eq(1);	
	var pStrval = pStrObj.html();
	var pvalObj = $("#"+spanId).children().eq(2);
	var pval = pvalObj.html();
   	var numKey = data.param.key;
   	//判断键盘内容
   	var flag = numkeyboard(numKey,pval);
   	if(flag=="num"){
   		if(pval == null){
   			pStrval = ""; pval = ""; 
   		} 
   	 	if(pval.length<6){
	            pStrObj.html(pStrval + "●");
	            pvalObj.html(pval + numKey);
		    if(spanId == "jyPsw" || spanId == "qrPsw")
		       isShowPlaincode("jyPsw","qrPsw",jyFlag);
		    else
		       isShowPlaincode("zjPsw","qr2Psw",zjFlag);
   		}
   	}else if(flag=="-3"){//-3:完成

   		$(".imgsize").parent().addClass("hide");//完成后清楚取消按钮
   		/*处理屏幕高度小于600的手机(iphone4/5),资金密码输入框被键盘遮挡的问题*/
    	if(pHeight < 600){
    		$(".nullModel").hide();
    		$(".wrap").scrollTop(0);
    	}
   	}else{
   		pStrObj.html(pStrval.substring(0,pStrval.length-1));
   		pvalObj.html(flag);
		if(spanId == "jyPsw" || spanId == "qrPsw")
			isShowPlaincode("jyPsw","qrPsw",jyFlag);
		else
			isShowPlaincode("zjPsw","qr2Psw",zjFlag);
   	}

   	return pvalObj;
}


/*对于数字键盘按键处理*/
function numkeyboard(key,str){
	var valueStr=str;
	//完成
	if(key=="-3"){
		return "-3";
	}
	//移除
	if(key=="-5"){
		if(valueStr.length>0){
			valueStr=valueStr.substring(0,valueStr.length-1);
		}
		return valueStr;
	}else{
		//其他数字
		return "num";
	}
}

/*校验交易密码和资金密码是否合规
  psw：交易密码、资金密码的值
  str：交易密码、资金密码区分标志
  */
function checkPsw(psw,str){

	if(psw.trim()){
		if(psw.trim().length != 6){
			alertInfo("密码必须为6位数字");
			removeLoadingDiv();
			return false;
		}
		/*oneTwoThrNum():连续的数字不能超过3个
		  repeatNum():同一数字不能出现3次
		  isBirthTelIdcard():不能是生日、手机号、身份中号码中的一段*/
		if(oneTwoThrNum(psw,str) && repeatNum(psw,str) && isBirthTelIdcard(psw,str) ){
			return true;
		}else{
			removeLoadingDiv();
			return false;
		}
	}else{
		removeLoadingDiv();
		alertInfo("密码不能为空");
		return false;
	}
}

//校验是否有三个连续数字
function oneTwoThrNum(psw,str){
	var numArr=[];	
	for(var i=0;i<10;i++){		
		var firstNum=i;
		if(firstNum<=6){
			var newStr="";
			var secondNum=firstNum+1;
			var thirdNum=secondNum+1;
			var fourthNum=thirdNum+1;
			newStr=newStr+firstNum+secondNum+thirdNum+fourthNum;
			if(psw.indexOf(newStr)>-1){
				if(str=="jy"){
					$('#jyPswTipMsg').removeClass("hide");
					$('#jyPswTipMsg span')[0].innerHTML="连续的数字不能超过3个,请重新输入";
				}else{
					$('#zjPswTipMsg').removeClass("hide");
					$('#zjPswTipMsg span')[0].innerHTML="连续的数字不能超过3个,请重新输入";
				}
				return false;
			}
			numArr.push(newStr);
		}

		if(firstNum>=3){
			var newStr="";
			var secondNum=firstNum-1;
			var thirdNum=secondNum-1;
			var fourthNum=thirdNum-1;
			newStr=	newStr+firstNum+secondNum+thirdNum+fourthNum;
			if(psw.indexOf(newStr)>-1){
				if(str=="jy"){
					$('#jyPswTipMsg').removeClass("hide");
					$('#jyPswTipMsg span')[0].innerHTML="连续的数字不能超过3个,请重新输入";
				}else{
					$('#zjPswTipMsg').removeClass("hide");
					$('#zjPswTipMsg span')[0].innerHTML="连续的数字不能超过3个,请重新输入";
				}				
				return false;
			}
			numArr.push(newStr);
		}	
	}
	if(str=="jy"){
			if(!$('#jyPswTipMsg').hasClass("hide")){
				$('#jyPswTipMsg').addClass("hide");
			}
	}else{
		if(!$('#zjPswTipMsg').hasClass("hide")){
			$('#zjPswTipMsg').addClass("hide");
		}
	}
	return true;
}

//校验是否有3个重复的数字
//num :代表要验证的数字长度
function repeatNum(psw,str){
	var length=psw.length;
	for(var j=0;j<(length-2);j++){
		var count=0;
		var first=psw.charAt(j);
	    for(var i=0;i<length;i++){	
			var second=psw.charAt(i);
			if(first==second){
				count++;
			}
		}
		if(count>=3){
		if(str=="jy"){
			$('#jyPswTipMsg').removeClass("hide");
			$('#jyPswTipMsg span')[0].innerHTML="同一数字不能出现3次,请重新输入";
		}else{
			$('#zjPswTipMsg').removeClass("hide");
			$('#zjPswTipMsg span')[0].innerHTML="同一数字不能出现3次,请重新输入";	
		}
			return false;
		}
	}	
	if(str=="jy"){
			if(!$('#jyPswTipMsg').hasClass("hide")){
				$('#jyPswTipMsg').addClass("hide");
			}
		}else{
			if(!$('#zjPswTipMsg').hasClass("hide")){
				$('#zjPswTipMsg').addClass("hide");
			}
		}
	return true;
}

//校验是否是生日、手机号、身份中号码中的一段,比如身份证号码是:330719196804253671,密码不能是:680425。
function isBirthTelIdcard(psw,str){
	var telKey = localStorage.getItem("telKey") || '';
	var data = JSON.parse(localStorage.getItem("clientInfomation"+telKey));
	if(!data || !data['id_no'])
		data = JSON.parse(localStorage.getItem("registerInfo"));
	var idCard = data["id_no"];
	var mobileTel = getcookie("mobile_tel");
	if(mobileTel.indexOf(psw)>-1 || idCard.indexOf(psw)>-1){
		if(str=="jy"){
			$('#jyPswTipMsg').removeClass("hide");
			$('#jyPswTipMsg span')[0].innerHTML="不能是生日、手机号、身份中号码中的一段,请重新输入";
		}else{
			$('#zjPswTipMsg').removeClass("hide");
			$('#zjPswTipMsg span')[0].innerHTML="不能是生日、手机号、身份中号码中的一段,请重新输入";
		}
		return false;
	}else{
		if(str=="jy"){
			if(!$('#jyPswTipMsg').hasClass("hide")){
				$('#jyPswTipMsg').addClass("hide");
			}
		}else{
			if(!$('#zjPswTipMsg').hasClass("hide")){
				$('#zjPswTipMsg').addClass("hide");
			}
		}
		return true;
	}
}


///交易密码和资金密码相同时清空资金密码的值
function clearZj () {

	$("#zjPsw span").html("");
	$("#qr2Psw span").html("");
}

//显示密码规则
function showPswRule(){
	hideNumKeyboard();
	$('.ruledialog').removeClass("hide");
	$('.mask').removeClass("hide");
}

/*点击下一步前的校验*/
function uploadPsw(){

	var jyPswval=$("#jyPsw").children().eq(2).html();
	var jySure=$("#qrPsw").children().eq(2).html();
	var jyPswFlag=checkPsw(jyPswval,"jy");//交易密码
	var jySureFlag=checkSame(jySure,"jyPsw");//交易确认密码
	if(jyPswFlag && jySureFlag){
		//判断交易密码同资金密码是否一致
		if($('#showFunds').hasClass("btnopen")){
			$("#zjPsw").children().eq(2).html(jyPswval);
			setPassword();//设置密码
		}else{
			var zjPsw=$("#zjPsw").children().eq(2).html();
			var zjSure=$("#qr2Psw").children().eq(2).html();
			var zjPswFlag=checkPsw(zjPsw,"zj");//资金密码
			var zjSureFlag=checkSame(zjSure,'zjPsw');//资金确认密码
			if(zjPswFlag && zjSureFlag)
				setPassword();//设置密码
		}
	}
	
}

//设置密码
function setPassword(){
	var jyPswval=$("#jyPsw").children().eq(2).html();//交易密码的值
	var capitalPassword=$("#zjPsw").children().eq(2).html();//资金密码的值
	var obj={
		encode_type:"0",
		capital_password:capitalPassword,
		transaction_password:jyPswval,
		connect_password:capitalPassword
	};

	$.ajax({
		type: 'get',
		data: obj,
		url: qsInterface+"setPassword",
		dataType: 'json',
		cache: false,
		timeout : 15000,
		success: function(data) {
			if(data.error_no=="0"){
				stepSync('setPassword');//步骤同步统计
				gotoNextstep("setPassword");//跳转到下一步骤
			}else{
				removeLoadingDiv();
				alertInfo(data.error_info);
			}		 
		},
		error: function() {
			removeLoadingDiv();
			alertInfo("设置密码失败！");
		}
	});
}






