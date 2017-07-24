//返回结果处理
window.rspWeb = function(data){
	data = JSON.parse(data);
	switch (data.action){
        case 'getNetworkType':
            //判断是否有一个勾选了，没有了则给出提示至少选中一个
			if($('#shanghaiA').val()==0 && $('#shenzhenA').val()==0){
				alertInfo("请至少选择一项");
			}else{
				//下一步封装	
				pickNextStep(data,openStockAccount);
			}
            break;   
	}
}
var qsId = localStorage.getItem("qsId");
var qsInterface = localStorage.getItem("qsInterface");
$(function(){
	//退出开户
	$('#backTo').on('click',function(){
        isExit();
	});
	//上海A股的开通控制
	$('#shanghaiAbtn').on('click',function(){
		if($(this).hasClass("open")){
			$('#shanghaiA')[0].setAttribute("value",0);
			this.children[0].src="../images/openStockAccount/btnclose.png";    
			$(this).removeClass("open");	
		}else{
			$('#shanghaiA')[0].setAttribute("value",1);  
			$(this).addClass("open");
			this.children[0].src="../images/openStockAccount/btnopen.png"; 	
		}
	});

	//深圳A股的开通控制
	$('#shenzhenAbtn').on('click',function(){
		if($(this).hasClass("open")){
			$('#shenzhenA')[0].setAttribute("value",0);
			this.children[0].src="../images/openStockAccount/btnclose.png";    
			$(this).removeClass("open");			
		}else{
			$(this).addClass("open");
			this.children[0].src="../images/openStockAccount/btnopen.png";  
			$('#shenzhenA')[0].setAttribute("value",2); 
		}
	});

	//点击下一步
	$('.nextstep').on('click',function(){	
		hasNetwork();
	});
});

//开立账户
function openStockAccount(){
	var exchangeKind="";
	if($('#shanghaiA').val()!=0 && $('#shenzhenA').val()!=0){
		exchangeKind=$('#shanghaiA').val()+"||"+$('#shenzhenA').val();	
	}else{
		if($('#shanghaiA').val()!=0){
			exchangeKind=$('#shanghaiA').val();
		}else{
			exchangeKind=$('#shenzhenA').val();
		}
	}
	var obj={qsid:qsId,	exchange_kind:exchangeKind,fund_company:""};
	sendAjax(obj);
}

//开立账户请求请求
function sendAjax(obj){
	$.ajax({
		type: 'get',
		data: obj,
		url: qsInterface+"openStockAccount",
		dataType: 'json',
		cache: false,
		timeout : 15000,
		success: function(data) {
			var tmpData = data;
			if(tmpData.error_no=="0"){
				//跳转到下一步骤
		        gotoNextstep("openStockAccount");
			}else{
				removeLoadingDiv();
				alertInfo(data.error_info);
			}	
		},
		error: function() {
			removeLoadingDiv();
			alertInfo("开立账户失败！");
		}
	});
}




