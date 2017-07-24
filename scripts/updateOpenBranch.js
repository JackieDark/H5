//返回结果处理
window.rspWeb = function (data) {
    data = JSON.parse(data);
    switch (data.action) {
        case 'getNetworkType':
            //下一步封装
            pickNextStep(data,updateOpenBranch);
            break;
        case 'stepSync':
            var clientId = data.param.clientId;
            var step = data.param.step;
            break;
    }
};
var qsId = localStorage.getItem("qsId");
var qsInterface = localStorage.getItem("qsInterface");

$(function () {

    getBranchlist("salesdepartment");//获取营业部方法

    //返回事件
    backToBeforeStep("messageCheck");

    //点击下一步事件
    $('.nextstep').on('click', function () {
        hasNetwork();
    });

    //营业部、地址联动
    $('#salesdepartment').on('change', function () {
        var optionVal = $('#salesdepartment option:selected').val();
        localStorage.setItem('optionVal', optionVal);
        var openBranchs = localStorage.getItem("openBranchs");
        var branchs = JSON.parse(openBranchs);
        for (var i = 0; i < branchs.length; i++) {
            if (branchs[i].branch_no == optionVal) {
                if (branchs[i].address) {
                    localStorage.setItem('branchAddress', branchs[i].address);
                    judgeword(branchs[i].address);
                } else {
                    $('.address').addClass("hide");
                }
            }
        }
    });

});

/*获取营业部信息*/
function getBranchlist(parentId) {
    createLoadingDiv();
    var obj = {qsid: qsId};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "Branchlist",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            removeLoadingDiv();
            var tmpData = data;
            if (tmpData.error_no == "0") {
                var resultList = tmpData.resultList;
                $('#salesdepartment').empty();//清空原营业部内容
                var address = resultList[0].address;
                //首个营业部的地址
                if (address && qsId != "73") {
                    $('.address').removeClass("hide");
                    judgeword(address);
                } else {
                    $('.address').addClass("hide");
                }
                for (var i = 0; i < resultList.length; i++) {
                    //只有一个营业部时,select无法点击
                    if(resultList.length < 2){
                        $('.rightArrow').hide();
                        $('#salesdepartment').attr("disabled","disabled");
                    }
                    createOption(parentId, resultList[i]);//动态创建option元素
                }
                /*获取已经选择的营业部信息*/
                if (localStorage.getItem('optionVal')) {
                    $("#salesdepartment").find("option[value='" + localStorage.getItem('optionVal') + "']").attr("selected", true);
                    judgeword(localStorage.getItem('branchAddress'));
                }
                localStorage.setItem("openBranchs", JSON.stringify(resultList));
            } else {
                alertInfo(tmpData.error_info);
                createReloadDiv("获取营业部信息失败,请重新加载。","",getBranchlist,'updateClientInfo',"salesdepartment");
            }
        },
        error: function () {
            removeLoadingDiv();
            createReloadDiv("获取营业部信息失败,请重新加载。","",getBranchlist,'updateClientInfo',"salesdepartment");
        }
    });
}

//判断营业部地址的长度，若大于17个字符分成两行显示
function judgeword(str) {
    $('.addr').text(str);
}
/*更新营业部*/
function updateOpenBranch() {

    var branchNo = $('#salesdepartment')[0].value;
    var obj = {qsid: qsId,branch_no: branchNo};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "updateOpenBranch",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == "0") {
                //券商：长城国瑞需缓存客户选择的营业部Id
                if(qsId == "322"){
                    var yybid = $("#salesdepartment").val();
                    sessionStorage.setItem("yybid", yybid);
                }
                stepSync('updateOpenBranch');//步骤同步统计
                gotoNextstep("updateOpenBranch");//跳转到下一步骤
            } else {
                removeLoadingDiv();
                alertInfo(data.error_info);
            }
        },
        error: function () {
            removeLoadingDiv();
            alertInfo("更新营业部失败！");
        }
    });
}

/*动态创建option元素
 obj：营业部所在div
 data: 营业部信息*/
function createOption(obj, data) {
    var parent = document.getElementById(obj);
    //创建option元素
    var option = document.createElement("option");
    option.setAttribute("value", data.branch_no);
    option.setAttribute("id", data.branch_no);
    option.innerHTML = data.branch_name;
    parent.appendChild(option);
}

