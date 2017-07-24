//返回结果处理
window.rspWeb = function(data){
	data = JSON.parse(data);
	switch (data.action){
        case 'callTel':
	        var flag=data.param.errorNo;
	        if(flag=="1"){
	        	alertInfo(data.param.errorInfo);
	        }
        	break;   
    	case 'copy':
	        var flag=data.param.errorNo;
	        var errorInfo=data.param.errorInfo;
	        if(flag=="0"){
	        	alertInfo("复制成功");
	        }else{
				alertInfo(errorInfo);
	        }
    		break;
	    case 'stepSync':
	        stepSyncFlag = true;
	        var clientId=data.param.clientId;
                var step=data.param.step;
         	break;     
	}
};
var qsId = localStorage.getItem("qsId");
var qsName = localStorage.getItem("qsName");
var qsInterface = localStorage.getItem("qsInterface");
var thirdParty = localStorage.getItem("thirdParty");
var stepSyncFlag = false;
var cycle = "";
$(function(){

	//退出开户
	$('#backTo').on('click',function(){
        isExit();
	});
	
	//用于判断是否是执行了所有的开户步骤
	var flag = localStorage.getItem("success");
	if(flag == "success"){
		/*进度查询页面*/
		$('#khResultName')[0].innerHTML="进度查询";
		$('#openAccount1').addClass("hide");
		$('#statusInquiry').removeClass("hide");

		//点击调取 打电话协议
		$('.calltelephone').on('click',function(){
			getTelAgreement();
		});

		//获取开户结果请求
		openAccountResult();
		//移除本次的判断
		localStorage.removeItem("success");
		/*此处调用原因：
		   处理身份证照片驳回后,用户重新上传身份证后退出,没有调用提交接口的问题*/
		openAccountApply("true");

	}else{
		/*开户结果页面*/
		$('#khResultName')[0].innerHTML="申请提交";
		//三方存管
		if(thirdParty=="true"){	
			$('#success').removeClass("hide");
			$('#faild').addClass("hide");
		}else{
			queryStepSync();
		}
	}

});

/*轮询stepSync()方法是否已经加载*/
function queryStepSync(){

	if(getPlatform() == "iphone"){
		cycle = setTimeout("queryStepSync()",100);
		stepSync('');
		if(stepSyncFlag){

			clearTimeout(cycle);
			openAccountApply();//发送开户申请(提交审核)
		}	
	}else{
		openAccountApply();//发送开户申请（提交审核）
	}
}

//发送开户申请（提交审核）
function openAccountApply(specialHand){
	$.ajax({
		type: 'get',
		data: {},
	    url: qsInterface+"OpenAccountApply",
		dataType: 'json',
		cache: false,
		timeout : 15000,
		success: function(data) {
			
			if(specialHand == "true"){
				return false;
			}
			var tmpData = data;
			//-3：表示重复提交OpenAccountApply(一般情况复合驳回：三方存管前步骤+三方存管)
			if(tmpData.error_no=="0" || tmpData.error_no=="-3"){
				$('#success').removeClass("hide");
				$('#faild').addClass("hide");
				stepSync('OpenAccountApply');
			}else{
				$('#faild').removeClass("hide");
				$('#success').addClass("hide");
			}
		},
		error: function() {
            alertInfo("发送开户申请失败");
		}
	});
}

//获取开户结果
function openAccountResult(){
	$.ajax({
		type: 'get',
		data: {},
		url: qsInterface+"OpenAccountResult",
		dataType: 'json',
		cache: false,
		timeout : 15000,
		success: function(data) {
			var tempData=data;
			if(tempData.error_no=="0"){
				var fundAccount = tempData.fund_account;
				var bankAccount = tempData.bank_account;
				var nextAuditDate = tempData.next_audit_date;//下一个审核时间
				var thirdUrl = tempData.third_url;//三方协议链接
				var auditStatus = compareTime(nextAuditDate);
				//用户名称
				var registerInfo = JSON.parse(localStorage.getItem("registerInfo"));
				var clientName = registerInfo["client_name"];
				//银行编号
				var bankNo=tempData.bank_account[0].bank_no;
				$('#nameTr')[0].innerHTML = clientName;
				var auditPass=false;
				//资金账户状态
				if(fundAccount.fund_account){

					$('#copyFund').removeClass("hide");
					$('#moneyTr')[0].innerHTML=fundAccount.fund_account;
					$('.titleAudit span')[0].innerHTML="审核通过";
					$('.titleSecond span')[0].innerHTML="您的开户申请已通过。";

				}else{
					$('#copyFund').addClass("hide");
					if(fundAccount.open_status == 1){
						$('#moneyTr')[0].innerHTML="已受理";
					}else{
						$('#moneyTr')[0].innerHTML="受理中";
					}
				}

				//三方存管状态
				if(bankAccount.length == 0){
					$('#bankTr')[0].innerHTML="受理中";
				}else if(!tempData.bank_account[0].bank_account){//银行卡号不存在
					$('#bankTr')[0].innerHTML="受理中";
				}else{
					var bankItem = getBankItem(bankNo);
					var bankName = bankItem["bank_name"]; 
					if(bankName){
						$('#bankTr')[0].innerHTML=bankName;
					}else{
						var openStatus = bankAccount[0].open_status;
						if(openStatus == "0"){
							$('#bankTr')[0].innerHTML="受理中";
						}else if(openStatus == "1"){
							$('#bankTr')[0].innerHTML="已受理";
						}else if(openStatus == "2"){
							$('#bankTr')[0].innerHTML="受理失败";
						}else if(openStatus == "3"){
							$('#bankTr')[0].innerHTML="数据异常";
						}
					}
				}

				//营业部显示与否
				if(tempData.branch_name!=""){
					$('branchName').removeClass("hide");
					$('#saleTr')[0].innerHTML=tempData.branch_name;
				}else{
					if(!$('branchName').hasClass("hide")){
						$('branchName').addClass("hide");
					}
				}

				var auditPass=false;
				if(fundAccount.open_status == '1' && bankAccount[0].open_status== '1'){
					auditPass = true;
					addBtnEvent();
				}
				//判断是否超时
				if(!auditPass){
					if(auditStatus){
						$('.titleAudit span')[0].innerHTML="正在审核中";
						$('.titleSecond span')[0].innerHTML="您的开户申请正在审核中。";
					}else{
						$('.titleAudit span')[0].innerHTML="审核超时";
						$('.titleSecond span')[0].innerHTML="审核已超时，请拨打客服热线  您的开户资料审核已超过最长审核时间3个交易日，请致证券公司客服。";
					}
				}
			}else{
				alertInfo(tempData.error_info);
			}
		},
		error: function() {
			alertInfo("获取开户结果失败");
		}
	});
}

//预计审核时间与当前时间比较
function compareTime(nextAuditDate){
	var  nextAuditTime = new Date(nextAuditDate).getTime();
	//当前时间
	var myDate = new Date().getTime();
	if(myDate < nextAuditTime){
		return true;
	}else{
		return false;
	}
}


//获取电话协议的方法
function getTelAgreement(){

	var qsDetail = JSON.parse(localStorage.getItem("qsDetail")).qsData;
	var telNo = qsDetail["qs_hotline"];
	var data = '{"action":"callTel", "reqId":"callTel","param":{"telNo":"'+telNo+'"}}';
    window.thskaihu.reqApp(data);
}

//替换开户成功后的按钮
function addBtnEvent(){
	if(qsName == 'taipingyang') {
		$('#statusInquiry').append('<div class="downloadTPY"><span>登录太平洋交易软件</span></div>');
		$('.downloadTPY').on('click',function(){
			if(getPlatform() == 'iphone'){
				window.location.href = 'itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=303191318';
			}else{
				window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.hexin.plat.android';
			}
		});
	}
	$('.calltelephone span').text('登录同花顺股票软件');
	$('.calltelephone').off('click').css({'margin-bottom':'0'}).click(function(){
		if(getPlatform() == 'iphone'){
			window.location.href = 'itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=303191318';
		}else{
			window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.hexin.plat.android';
		}
	});
}

//根据bank_no获取对应的银行对象
function getBankItem(bankNo){
	//获取缓存银行数据
	var bankListLocal = JSON.parse(localStorage.getItem("bankList"));
  	var bankList = bankListLocal.bankData;
	for(var i=0;i<bankList.length;i++){
		var bankItem=bankList[i];
		if(bankNo==bankItem.bank_no) return bankItem;
	}
}

//复制资金账号内容
function copyInfo(){
	//发协议
	var content=$('#moneyTr')[0].innerHTML;
	var data = '{"action":"copy", "reqId":"copy","param":{"content":"'+content+'"}}';
    window.thskaihu.reqApp(data);
}
 

