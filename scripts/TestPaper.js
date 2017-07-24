//返回结果处理
window.rspWeb = function (data) {
    data = JSON.parse(data);
    switch (data.action) {
        case 'getNetworkType':
            //下一步封装	
            pickNextStep(data, upTestPaper);
            break;
    }
};
var qsId = localStorage.getItem("qsId");
var qsInterface = localStorage.getItem("qsInterface");
var itemLens = "";//题目数量
$(function () {
    //获取风险测评题目
    getTestPaper();
    //退出开户
    $('#backTo').on('click', function () {
        isExit();
    });

    $('.nextstep').on('click', function () {
        var allchooseDivs = $('.contentQA').find('.allchoose');
        var title = "";
        var count = 0;
        var jump = "";
        $.each(allchooseDivs, function (key, val) {
            if (!$(allchooseDivs[key]).hasClass('isCheck')) {
                title += " " + $(allchooseDivs[key]).attr('data-title') + " ";
                if (count < 1) {
                    //offsetTop需使用原生,offset().top获取值为负数
                    jump = allchooseDivs[key].offsetTop - $(".title").height() - 10;
                    count++;
                }
            }
        });
        if (title) {
            var tip = "您第" + title + "题还未答完，请答完后再提交问卷！";
            alertInfo(tip, '', '', function () {
                $(".wrap").scrollTop(jump);
            });
        } else {
            hasNetwork();
        }
    });

});

//获取风险测评的内容
function getTestPaper() {
    var userAnswerCache = sessionStorage.getItem('answerStr') ? sessionStorage.getItem('answerStr').split('|') : '';
    $.ajax({
        type: 'get',
        data: {},
        url: qsInterface + "Testpaper",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tempData = data;
            if (tempData.error_no == "0") {
                var resultList = tempData.resultList;
                itemLens = resultList.length;
                for (var i = 0; i < itemLens; i++) {
                    var item = resultList[i];
                    if (userAnswerCache && userAnswerCache[i]) {
                        createQuestionDom("contentQA", item, i + 1, itemLens, sessionStorage.getItem('answerStr').split('|')[i].split('&')[1]);
                    } else {
                        createQuestionDom("contentQA", item, i + 1, itemLens, '');
                    }
                }
                gotoNextstep(itemLens);//判断题目是否都已选择
            } else {
                alertInfo(tempData.error_info);
                createReloadDiv("获取风险测评内容失败,请重新加载。", "", getTestPaper, isExit);
            }
        },
        error: function () {
            createReloadDiv("获取风险测评内容失败,请重新加载。", "", getTestPaper, isExit);
        }
    });
}

/*创建问题
 obj：问卷div id
 data: 一个问题
 i: 问题序号
 length: 问题总和 */
function createQuestionDom(obj, data, i, length, userAnswer) {
    var parent = document.getElementById(obj);
    var div = document.createElement("div");//创建问题div
    $(div).addClass("question");
    var span1 = document.createElement("span");//创建span
    $(span1)[0].innerHTML = i + ".";
    var span2 = document.createElement("span");
    span2.innerHTML = data.question_content;
    $(span1).append($(span2));

    div.appendChild(span1);
    parent.appendChild(div);

    var div1 = createAnswerDom(obj, data, length, userAnswer);
    $(div1).attr('data-title', i);
    parent.appendChild(div1);
}

/*创建问题选项
 obj：问卷div id
 data: 一个问题
 length: 问题总和*/
function createAnswerDom(obj, data, length, userAnswer) {
    var div = document.createElement("div");
    div.setAttribute("id", data.question_no);
    $(div).addClass("allchoose");
    var questionKind = data.question_kind;//单选还是多选字段
    var answerContent = data.answer_content;//回答的选项
    var defaultAnswer = data.default_answer;//默认答案
    //遍历所有属性
    for (p in answerContent) {
        if (typeof(answerContent[p]) == "function") {
            answerContent[p]();
        } else {
            var div1 = document.createElement("div");
            div1.value = p;
            $(div1).addClass("manychoose");
            var ul = document.createElement("ul");
            var li2 = document.createElement("li");
            li2.innerHTML = answerContent[p];
//			ul.appendChild(li1);
            ul.appendChild(li2);
            div1.appendChild(ul);
            div.appendChild(div1);
            if (userAnswer == p) {
                $(div1).find('li').css({
                    'background': 'url(../images/TestPaper/radiochecked.png) no-repeat left center',
                    'background-size': '0.3rem 0.3rem'
                });
                $(div1).css({'border': "1px solid #3a83d7"});
                $(div1).addClass("sigleChecked");
                $(div1).parent('div').addClass("isCheck");
            } else if (defaultAnswer == p) {
//				$(div1).find('img').attr('src','../images/TestPaper/radiochecked.png');
                $(div1).find('li').css({
                    'background': 'url(../images/TestPaper/radiochecked.png) no-repeat left center',
                    'background-size': '0.3rem 0.3rem'
                });
                $(div1).css({'border': "1px solid #3a83d7"});
                $(div1).addClass("sigleChecked");
                $(div1).parent('div').addClass("isCheck");
            }

            $(div1).on('click', function () {
                //点击的时候选中当前的行
                var $this = $(this);
                //多选和单选的逻辑判断
                isSingleProblem(questionKind, $this, length);
            });
        }
    }
    return div;
}

/*判断是多选的还是单选的题目
 questionKind：问题类型 0单选 1多选
 param：当前点击选项 div
 length: 问题总和*/
function isSingleProblem(questionKind, param, length) {

    var childNodes = param.parent('div')[0].childNodes;
    //单选
    if (questionKind == "0") {

        for (var i = 0; i < childNodes.length; i++) {
            $(childNodes[i]).find('li').css({
                'background': 'url(../images/TestPaper/radiouncheck.png) no-repeat left center',
                'background-size': '0.3rem 0.3rem'
            });
            ;
            $(childNodes[i]).css({
                'border': "none",
                'border-bottom': "1px solid #d7d7d7"
            });
            $(childNodes[i]).removeClass("sigleChecked");
        }
        param.parent('div').removeClass("isCheck");
        param.find('li').css({
            'background': 'url(../images/TestPaper/radiochecked.png) no-repeat left center',
            'background-size': '0.3rem 0.3rem'
        });
        ;
        param.css({
            'border': "1px solid #3a83d7"
        });
        param.addClass("sigleChecked");
        param.parent('div').addClass("isCheck");
        //判断是否都选择了
        gotoNextstep(length);
        //多选
    } else {
        //sigleChecked: 选中标志
        if (param.hasClass("sigleChecked")) {
            param.find('li').css({
                'background': 'url(../images/TestPaper/radiouncheck.png) no-repeat left center',
                'background-size': '0.3rem 0.3rem'
            });
            ;
            param.css({
                'border': "none",
                'border-bottom': "1px solid #d7d7d7"
            });
            param.removeClass("sigleChecked");
            /*遍历当前问题所有答案
             flag: 多选题是否有选项被选中标志*/
            var flag = false;
            for (var i = 0; i < childNodes.length; i++) {

                if ($(childNodes[i]).hasClass("sigleChecked"))
                    flag = true;
            }
            if (!flag)
                param.parent('div').removeClass("isCheck");

        } else {
            param.find('li').css({
                'background': 'url(../images/TestPaper/radiochecked.png) no-repeat left center',
                'background-size': '0.3rem 0.3rem'
            });
            ;
            param.css({
                'border': "1px solid #3a83d7"
            });
            param.addClass("sigleChecked");
            param.parent('div').addClass("isCheck");
        }
        //判断是否都选择了
        gotoNextstep(length);
    }
}

//下一步的控制 num:题目的数量
var paperAnswer = "";
function gotoNextstep(num) {
    //获取返回的结果值
    var allchooseDiv = $('.contentQA').find('.isCheck');
    var length = allchooseDiv.length;

    if (num == length) {
        paperAnswer = spliceAnswer();
        $('.nextstep').removeClass("nextstepchange");
    } else {
        $('.nextstep').addClass("nextstepchange");
    }
}

/*提交风险测评内容*/
function upTestPaper() {
    var paperAnswer = spliceAnswer();
    if (!paperAnswer) {
        alertInfo("您的风险测评有误，请重新测评！", '', '', function () {
            window.location.reload();
        });
        removeLoadingDiv();
        return false;
    }
    var obj = {qsid: qsId, paper_answer: paperAnswer};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "uploadTestpaper",
        dataType: 'json',
        async: false,
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == "0") {
                stepSync('uploadTestpaper');//步骤同步统计
                localStorage.setItem("riskData", JSON.stringify(tmpData));
                window.location.href = "TestPaperResult.html";
            } else {
                removeLoadingDiv();
                alertInfo(data.error_info);
            }
        },
        error: function () {
            removeLoadingDiv();
            alertInfo("提交风险测评内容失败!");
        }
    });
}


//拼接问题答案
function spliceAnswer() {
    var contentQAChilds = $("#contentQA").find(".isCheck");
    var spliceStr = "";
    var answerNum = "";
    for (var i = 0; i < contentQAChilds.length; i++) {
        answerNum = "";
        var itemChecked = contentQAChilds[i];
        var questionNo = itemChecked.id;
        var length = $(itemChecked).find(".sigleChecked").length;
        var item = $(itemChecked).find(".sigleChecked");
        for (var j = 0; j < item.length; j++) {
            if (j == item.length - 1) {

                answerNum = answerNum + item[j].value;
            } else {
                answerNum = answerNum + item[j].value + "^";
            }
        }
        spliceStr = spliceStr + questionNo + "&" + answerNum + "|";
    }
    //缓存用户答案，测评结果页返回使用
    sessionStorage.setItem('answerStr', spliceStr);
    return spliceStr;
}
