//返回结果处理
window.rspWeb = function(data){
	data = JSON.parse(data);
	switch (data.action){
		case 'getNetworkType':
            var flag = isDefaultAnswer();
			if(flag){
				var answer = spliceAnswer();//拼接问题答案
				//下一步封装	
				pickNextStep(data,uploadRevisitpaper,answer);
			}
            break;
        case 'stepSync':
            var clientId=data.param.clientId;
            var step=data.param.step;
            break;   
	}
}
var qsId = localStorage.getItem("qsId");
var qsInterface = localStorage.getItem("qsInterface");
$(function(){

	//获取问卷回访内容
	getRevisitpaper();

	/*返回事件绑定*/
	$('#backTo').on('click',function(){
        isExit();
	});
	
	/*点击下一步事件绑定*/
	$('.nextstep').on('click',function(){
		hasNetwork();
	});

});

//判断是否都是默认答案,并给出相应提示信息
function isDefaultAnswer(){
	
	var flag = true;
	var allcontentChilds = $("#allcontent").find(".twochoice");
	var title = "";
	for(var i=0; i<allcontentChilds.length; i++){
		var itemChecked = allcontentChilds[i];
		var item = $(itemChecked).find(".defaultanswer");
		if(item.length != "1"){
			alertInfo("请将问卷答案填写完整");
			return flag=false;
		}
		if($(item).attr('data-title')){
			title += " "+$(item).attr('data-title')+" ";
			flag=false;
		}	
	}
	if(!flag){
		if(qsId == "322"){
			var tip = "第"+title+"条信息有异常，请确认您选择的选项，如有疑问，可拨打我司客服电话4000099886";
		}else{
			var tip = "您选择的第"+title+"题答案不符合证监会规定开户要求，请您选择正确答案";
		}
		alertInfo(tip);
	}
	  
	return flag;
}

/*获取问卷回访内容*/
function getRevisitpaper(){

	$.ajax({
		type: 'get',
		data: {},
	    url: qsInterface+"Revisitpaper",
		dataType: 'json',
		cache: false,
		timeout : 15000,
		success: function(data) {
			var tmpData = data;
			if(tmpData.error_no=="0"){
				createRevisitpaper(tmpData);//创建问卷
			}else{
				alertInfo(data.error_info);
				createReloadDiv("获取问卷回访内容失败,请重新加载。","",getRevisitpaper,'openThirdPartyAccount');
			}				
		},
		error: function() {
			createReloadDiv("获取问卷回访内容失败,请重新加载。","",getRevisitpaper,'openThirdPartyAccount');
		}
	});
}

/*创建问卷
obj: div id  data：resultList[i]  
i: 题目号  length：问题总数*/
function createRevisitpaper(data){ 

	var resultList = data.resultList;
	var length = resultList.length;
	for(var i=0;i<resultList.length;i++){
		var item=resultList[i];
		createQuestionDom("allcontent",item,i+1,length);
	}
	//处理问题底部样式，有一定间隔
//  $("#allcontent").append("<div style='height:40px;'></div>");
}

/*创建问题*/
function createQuestionDom(obj,data,i,length){
	var parent=document.getElementById(obj);
	var div=document.createElement("div");//创建问题div
	$(div).addClass("question");
	//创建span元素
	var span1=document.createElement("span");
	$(span1)[0].innerHTML=i+".";
	var span2=document.createElement("span");
	span2.innerHTML=data.question_content;
	$(span1).append($(span2));
	
	div.appendChild(span1);
	parent.appendChild(div);

	var div1 = createAnswerDom(obj,data,i,length);
	$(div1)[0].value = i;

	parent.appendChild(div1);
}

/*创建问题选项*/
function createAnswerDom(obj,data,i,length){
	var div=document.createElement("div");
    $(div).addClass("twochoice");
    div.setAttribute("id",data.question_no);
    var questionKind = data.question_kind;//单选还是多选字段
    var answerContent = data.answer_content;//试题内容
    var defaultAnswer = data.default_answer;//默认答案
    var ul =document.createElement("ul");
    /*遍历试题内容*/
    var j = 0;
	for(p in answerContent){
		j++;
		if(typeof(answerContent[p])=="function"){
			answerContent[p]();
		}else{
			var div1=document.createElement("div");
			$(div1)[0].value = p;
			$(div1)[0].defaultanswer = defaultAnswer;
	
			if(j == 1){
				$(div1).addClass("answeryes");
			}else{
				$(div1).addClass("answerno");
			}
		    //设置默认选中
			if(data.auto_check && defaultAnswer == p)
			    $(div1).addClass("defaultanswer");
				
			var li1 = document.createElement("li");
			var span1 = document.createElement("span");
			span1.innerHTML = answerContent[p];
			div1.appendChild(span1);
			li1.appendChild(div1);
			ul.appendChild(li1);
			//为当前点击选项添加选中样式
			$(div1).on('click',function(){
				var $this = $(this);
				isSingleProblem(questionKind,$this);
				isRight($this,i);//判断选择是否正确
			});
		}
		div.appendChild(ul);
	}
	return div;
}

/*为当前点击选项添加选中样式
  questionKind: 试题类型  param：单个问题选项div1对象 */
function isSingleProblem(questionKind,param){
	
	if(questionKind=="0"){//单选题
		var childNodes = param.parents('.twochoice')[0].childNodes;
		for(var i=0;i<childNodes.length;i++){
			var div=$(childNodes[i]).find('div');
			$(div).removeClass("defaultanswer");
		}
		param.addClass("defaultanswer");
	}
}

/*判断选择是否正确
param:当前点击选项 i: 题目号 */
function isRight(param,i){	

	if($(param)[0].value != $(param)[0].defaultanswer){
		$(param).attr("data-title",i);
	}else{
		$(param).removeAttr("data-title");
	}
}

//拼接问题答案
function spliceAnswer(){
	var allcontentChilds=$("#allcontent").find(".twochoice");
	var spliceStr="";
	var answerNum="";
	for(var i=0;i<allcontentChilds.length;i++){
		answerNum="";
		var itemChecked = allcontentChilds[i];
		var questionNo = itemChecked.id;
		var item = $(itemChecked).find(".defaultanswer");
		answerNum = answerNum+$(item)[0].value;
		spliceStr = spliceStr+questionNo+"&"+answerNum+"|";
	}
	return spliceStr;
}

//提交问卷回访答案
function uploadRevisitpaper(answer){
	var obj={paper_answer:answer};
	$.ajax({
			type: 'get',
			data: obj,
			url: qsInterface+"uploadRevisitpaper",
			dataType: 'json',
			cache: false,
			timeout : 15000,
			success: function(data) {
				var tmpData = data;
				if(tmpData.error_no=="0"){
					 stepSync('uploadRevisitpaper');//步骤同步统计
					 window.location.href="OpenAccountResult.html";
				}else{
					removeLoadingDiv();
					alertInfo(data.error_info);
				}
			},
			error: function() {
				removeLoadingDiv();
				alertInfo("提交问卷回访答案失败！");
			}
	});
}

