//判断验证是否通过
var allCheckPassFlag = false;
//协议回传结果
window.rspWeb = function (data) {
    data = JSON.parse(data);
    switch (data.rspId) {
        case 'showDatePickStart':
            //起始时间
            var startTime = data.param.outDate;
            $('#startDate')[0].value = startTime;
            break;
        case 'showDatePickEnd':
            //结束时间
            var endTime = data.param.outDate;
            $('#endDate')[0].value = endTime;
            break;
    }
    switch (data.action) {
        case 'getNetworkType':
            allCheckPass();
            if (allCheckPassFlag) {
                //下一步封装
                pickNextStep(data, clickNextstep);
            }
            break;
        case 'stepSync':
            var clientId = data.param.clientId;
            var step = data.param.step;
            break;
    }
};
var qsId = localStorage.getItem("qsId");
var qsInterface = localStorage.getItem("qsInterface");
var rejectedSign = sessionStorage.getItem("rejectedSign");//驳回标志
var creditRecord = "";//诚信记录
$(function () {

    if (qsId == "322" || qsId == "80") {
        $("#contactAddress").parent().show();
        $("#address").parent().css("border-bottom", "1px solid #d7d7d7");
    }

    //查询用户资料
    clientInfoQuery();

    //返回事件绑定
    backToBeforeStep("updateClientInfo");

    $('#beneficiaryPerson').change(function () {
        var tip = '为保障您的权益，账户实际受益人必须是您本人，否则不允许开户，请确认修改！';
        ($('#beneficiaryPerson').val() == "1") ? alertInfo(tip, "", "", function () {
            $("#beneficiaryPerson").val('0');
        }, true) : "";
    });

    $('#controlNaturePerson').change(function () {
        var tip = '为保障您的权益，账户实际控制人必须是您本人，否则不允许开户，请确认修改！';
        ($('#controlNaturePerson').val() == "1") ? alertInfo(tip, "", "", function () {
            $("#controlNaturePerson").val('0');
        }, true) : "";
    });

    $('#taxResidents').change(function () {
        var tip = '如您确认为非中国税收居民身份，请前往我司就近营业部临柜办理开户。';
        ($('#taxResidents').val() != "1") ? alertInfo(tip, "", "", function () {
            $("#taxResidents").val('1');
        }, true) : "";
    });

    $('.nextstep').on('click', function () {
        hasNetwork();
    });

    $('#integrity').click(function () {
        $('#integrityDiv,.mask').show();
    });

   $('.mask').click(function () {
        var lis = $('#integrityDiv ul').find('li');
        var liTxt = "";
        var count = 1;
        creditRecord = "";
        for (var i = 0; i < lis.length; i++) {
            if ($(lis[i]).hasClass("sigleChecked")) {
                var num = count + '.';
                ($(lis[i]).text() == "无") ? (creditFlg = "1") : "";
                liTxt += num + $(lis[i]).text() + " ";
                creditRecord += lis[i].id + ',';
                count++;
            }
        }
        creditRecord = creditRecord.substr(0, creditRecord.length - 1);
        (liTxt) ? $('#integrity input').val(liTxt) : $('#integrity input').val("无");
        $('#integrityDiv,.mask').hide();
    });

});

//查询用户资料
function clientInfoQuery() {
    //0 -1是驳回，不做任何处理，财人汇取数据，0是正常走或者重新传，置空，1是回退，取cookie
    var jump_id = sessionStorage.getItem('jump_id') || '0';
    jump_id = (sessionStorage.getItem('rejectedSign')) ? '-1' : jump_id;
    $.ajax({
        type: 'get',
        data: {'jump_id': jump_id},
        url: qsInterface + "ClientInfoQuery",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == "0") {
                fillInfomation(tmpData);
                //获取学历的方法(resultList[0]:学历 resultList[1]：职业 resultList[2]：行业)
                //获取数据前需要先确认clientInfoQuery()接口是否已经存在学历等数据
                getIndustryEducational();
            } else {
                alertInfo(tmpData.error_info);
                createReloadDiv("查询用户资料失败,请重新加载。", "", clientInfoQuery, 'Sendpic', rejectedSign);
            }
        },
        error: function () {
            createReloadDiv("查询用户资料失败,请重新加载。", "", clientInfoQuery, 'Sendpic', rejectedSign);
        }
    });
}

//自动填充资料
function fillInfomation(data) {

    $('#name')[0].setAttribute("value", data["client_name"]);
    $('#idcard')[0].setAttribute("value", data["id_no"]);
    var idBegindate = data["id_begindate"].substring(0, 8);
    var idEnddate = data["id_enddate"].substring(0, 8) || "30000101";
    $('#startDate')[0].setAttribute("value", idBegindate);
    $('#endDate')[0].setAttribute("value", idEnddate);
    $('#IssuingAuthority')[0].setAttribute("value", data["issued_depart"]);
    $('#address')[0].setAttribute("value", data["id_address"]);
    $('#contactAddress')[0].setAttribute("value", data["address"] || data["id_address"]);
    $('#workUnit')[0].setAttribute("value", data["workUnit"]);
    creditRecord = data.creditRecord;
    /*调用updateClientInfo接口后会保存下来
     degree_code: 学历代码
     industry_code：行业代码
     profession_code：职业代码
     duty: 职务代码
     */
    if (data["degree_code"])
        localStorage.setItem("educational", data["degree_code"]);
    else//防止一个手机多个号码同时开户
        localStorage.removeItem("educational");
    if (data["profession_code"])
        localStorage.setItem("professional", data["profession_code"]);
    else
        localStorage.removeItem("professional");
    if (data["industry_code"])
        localStorage.setItem("industry", data["industry_code"]);
    else
        localStorage.removeItem("industry");
    if (data["duty"])
        localStorage.setItem("duty", data["duty"]);
    else
        localStorage.removeItem("duty");
}

/*获取学历、职业、行业
 resultList[0]:学历
 resultList[1]：职业
 resultList[2]：行业
 resultList[3]：不良诚信信息
 resultList[4]：职务*/
function getIndustryEducational() {
    var obj = {qsid: qsId};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface + "Select",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            tmpData = JSON.parse('{"error_no":"0","error_info":"","resultList":[[{"id":"1","name":"博士"},{"id":"2","name":"硕士"},{"id":"3","name":"学士"},{"id":"4","name":"大专"},{"id":"5","name":"中专"},{"id":"6","name":"高中"},{"id":"7","name":"初中及其以下"},{"id":"8","name":"其他"}],[{"id":"01","name":"文教科卫专业人员"},{"id":"02","name":"党政 ( 在职，离退休 ) 机关干部"},{"id":"03","name":"企事业单位干部"},{"id":"04","name":"行政企事业单位工人"},{"id":"05","name":"农民"},{"id":"06","name":"个体"},{"id":"07","name":"无业"},{"id":"08","name":"军人"},{"id":"09","name":"学生"},{"id":"10","name":"证券从业人员"}],[{"id":"1","name":"零售/娱乐/酒店/饮食业"},{"id":"2","name":"房地产/汽车/游艇交易"},{"id":"3","name":"古玩珠宝/艺术品/贵金属交易"},{"id":"4","name":"进出口贸易"},{"id":"5","name":"典当/拍卖/担保/中介"},{"id":"6","name":"废旧回收"},{"id":"7","name":"投资咨询"},{"id":"99","name":"其他"}],[{"id":"8","name":"其他"},{"id":"6","name":"投资者在证券经营机构从事投资活动时产生的违约等失信行为记录"},{"id":"5","name":"监管机构、自律组织"},{"id":"4","name":"税务管理机构"},{"id":"3","name":"工商行政管理机构"},{"id":"2","name":"最高人民法院失信被执行人名单"},{"id":"1","name":"中国人民银行征信中心"},{"id":"7","name":"恶意维权等不当行为信息"}],[{"id":"Z","name":"其他"},{"id":"2","name":"业务人员,从事各项专业性工作"},{"id":"1","name":"一般职员,从事一般事务性工作"},{"id":"0","name":"高层管理人员"}]]}');
            //返回成功
            if (tmpData.error_no == "0") {
                var resultList = tmpData.resultList;
                //缓存学历、职业、行业信息
                localStorage.setItem("IndustryEducational", JSON.stringify(resultList));
                educationalList();//生成学历select
                industryList();//生成行业select               
                professionalList();//生成职业select
                integrity();//生成不良诚信信息
                dutyList();//生成职务select
            } else {
                alertInfo(tmpData.error_info);
                createReloadDiv("获取学历、职业、行业失败,请重新加载。", "", getIndustryEducational, 'Sendpic', "", rejectedSign);
            }
        },
        error: function () {
            createReloadDiv("获取学历、职业、行业失败,请重新加载。", "", getIndustryEducational, 'Sendpic', "", rejectedSign);
        }
    });
}

//生成职务select
function dutyList() {
    //获取学历的方法
    var duty = JSON.parse(localStorage.getItem("IndustryEducational"))[4];
    for (var i = 0; i < duty.length; i++) {
        //动态创建option元素
        createOption("duty", duty[i]);
    }
    var duty = localStorage.getItem("duty");
    if (duty)
        $("#duty option[value='" + duty + "']").attr("selected", true);
}

//生成不良诚信信息
function integrity() {
    //获取不良诚信
    var integrity = JSON.parse(localStorage.getItem("IndustryEducational"))[3];
    for (var i = 0; i < integrity.length; i++) {

        var li = document.createElement("li");
        li.setAttribute("id", integrity[i].id);
        li.innerHTML = integrity[i].name;
        $('#integrityDiv ul').append(li);
        $(li).click(function () {
            integritySelect($(this));
        });
    }
    if (creditRecord) {
        var lis = $('#integrityDiv ul').find('li');
        var liTxt = "";
        var count = 1;
        for (var i = 0; i < lis.length; i++) {
            if (creditRecord.indexOf($(lis[i]).attr('id')) > -1 && $(lis[i]).attr('id')) {
                var num = count + '.';
                $(lis[i]).css({
                    'background': 'url(../images/TestPaper/radiochecked.png) no-repeat left center',
                    'background-size': '0.3rem 0.3rem'
                });
                ;
                $(lis[i]).addClass("sigleChecked");
                liTxt += num + $(lis[i]).text() + " ";
                creditRecord += lis[i].id + ',';
                count++;
            }
        }
        creditRecord = creditRecord.substr(0, creditRecord.length - 1);
        $('#integrity input').val(liTxt)
    }
}

function integritySelect(param) {
    var lis = $('#integrityDiv ul').find('li');
    if ($(param).hasClass("sigleChecked")) {
        $(param).css({
            'background': 'url(../images/TestPaper/radiouncheck.png) no-repeat left center',
            'background-size': '0.3rem 0.3rem'
        });
        ;
        $(param).removeClass("sigleChecked");
    } else {
        if ($(param).text() == "无") {
            for (var i = 0; i < lis.length; i++) {
                if ($(lis[i]).hasClass("sigleChecked")) {
                    alertInfo('第一选项和其他选项互斥');
                    return false;
                }
            }
        } else {
            for (var i = 0; i < lis.length; i++) {
                if (($(lis[i]).text() == "无") && $(lis[i]).hasClass("sigleChecked")) {
                    alertInfo('第一选项和其他选项互斥');
                    return false;
                }
            }
        }
        $(param).css({
            'background': 'url(../images/TestPaper/radiochecked.png) no-repeat left center',
            'background-size': '0.3rem 0.3rem'
        });
        ;
        $(param).addClass("sigleChecked");
    }
}

//生成学历select
function educationalList() {
    //获取学历的方法
    var educational = JSON.parse(localStorage.getItem("IndustryEducational"))[0];
    for (var i = 0; i < educational.length; i++) {
        //动态创建option元素
        createOption("educational", educational[i]);
    }
    var educationalCache = localStorage.getItem("educational");
    if (educationalCache)
        $("#educational option[value='" + educationalCache + "']").attr("selected", true);
}

//生成职业select
function professionalList() {
    //获取职业的方法
    var professional = JSON.parse(localStorage.getItem("IndustryEducational"))[1];
    for (var i = 0; i < professional.length; i++) {
        //动态创建option元素
        createOption("professional", professional[i]);
    }
    var professionalCache = localStorage.getItem("professional");
    if (professionalCache)
        $("#professional option[value='" + professionalCache + "']").attr("selected", true);
}

//生成行业select
function industryList() {
    //获取行业的方法
    var industry = JSON.parse(localStorage.getItem("IndustryEducational"))[2];
    for (var i = 0; i < industry.length; i++) {
        //动态创建option元素
        createOption("industry", industry[i]);
    }
    var industryCache = localStorage.getItem("industry");
    if (industryCache)
        $("#industry option[value='" + industryCache + "']").attr("selected", true);
}

//动态创建option元素
function createOption(obj, data) {
    var parent = document.getElementById(obj);
    //创建option元素
    var option = document.createElement("option");
    option.setAttribute("value", data.id);
    option.innerHTML = data.name;
    parent.appendChild(option);
}

//判断是否验证都通过了
function allCheckPass() {
    var startDate = $('#startDate').val();
    var endDate = $('#endDate').val();
    var educational = $('#educational').val();//学历
    var professional = $('#professional').val();//职业
    var industry = $('#industry').val();//行业
    var duty = $('#duty').val();//职务

    /*学历*/
    if (educational == "" || educational == "请选择") {
        alertInfo("请选择您的学历");
        return false;
    }

    /*行业*/
    if (industry == "" || industry == "请选择") {
        alertInfo("请选择您的行业");
        return false;
    }

    /*职业*/
    if (professional == "" || professional == "请选择") {
        alertInfo("请选择您的职业");
        return false;
    }

    /*职务*/
    if (duty == "" || duty == "请选择") {
        alertInfo("请选择您的职务");
        return false;
    }

    if (qsId == "322" || qsId == "80") {
        allCheckPassFlag = checkMsg($('#contactAddress')[0].value, 2);
        if (!allCheckPassFlag)
            return false;
    }


    if (!checkMsg($('#name')[0].value, 0) || !checkMsg($('#IssuingAuthority')[0].value, 1) || !checkMsg($('#address')[0].value, 2) || !checkMsg($('#workUnit')[0].value, 3) || !checkIdcard($('#idcard')[0].value) || !compareTime(startDate, endDate)) {
        allCheckPassFlag = false;
        return false;
    } else {
        allCheckPassFlag = true;
    }
}


/*姓名校验、发证机关、证件地址校验代码合并 ,flag 0 姓名 1 发证机关 2 地址 3工作单位*/
function checkMsg(value, flag) {
    var reg = /[^\x00-\xff]/g;
    var Len = value.replace(reg, '__').length;
    if (flag == 0) {
        if (Len == 0) {
            alertInfo("您还没有填写姓名哦！");
            return false;
        }
        if (Len > 16) {
            alertInfo("中文字符不大于8位,英文字符不大于16位");
            return false;
        }
    } else if (flag == 1) {
        if (Len == 0) {
            alertInfo("您还没有填写身份证发证机关哦！")
            return false;
        }
        if (Len < 8) {
            alertInfo("签发机关长度不能少于4个汉字");
            return false;
        }
    } else if (flag == 2) {
        if (Len < 16) {
            alertInfo("证件地址至少输入8位汉字");
            return false;
        }
    } else if (flag == 3) {
        if (Len == 0) {
            alertInfo("您还没有填写工作单位哦！");
            return false;
        }
    }
    return true;
}

/*身份证号合法性验证 
 支持15位和18位身份证号
 支持地址编码、出生日期、校验位验证
 */
function checkIdcard(str) {

    var city = {
        11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ",
        31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南",
        42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州",
        53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾",
        81: "香港", 82: "澳门", 91: "国外 "
    };
    var tip = "";
    var date = new Date();
    var year = date.getFullYear();
    var idCardYear = parseInt(str.substr(6, 4));
    var age = year - idCardYear;
    if (!str) {
        tip = "您还没有填写身份证哦！";
    } else if (!/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(str)) {
        tip = "身份证号格式错误";
    } else if (!city[str.substr(0, 2)]) {
        tip = "身份证前2位有误";
    } else if (age < 18 || age >= 70) {
        if (age < 18) {
            tip = '您的年龄未满18岁';
        } else {
            tip = '您的年龄已满70岁';
        }
    } else {
        //18位身份证需要验证最后一位校验位
        if (str.length == 18) {
            str = str.split('');
            //∑(ai×Wi)(mod 11) 加权因子
            var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            //校验位
            var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
            var sum = 0;
            var ai = 0;
            var wi = 0;
            for (var i = 0; i < 17; i++) {
                ai = str[i];
                wi = factor[i];
                sum += ai * wi;
            }
            var last = parity[sum % 11];
            if (last != str[17]) {
                tip = "身份证最后一位有误，请核实";
            }
        }
    }

    if (tip.length > 0) {
        alertInfo(tip);
        return false;
    }

    return true;
}

//调协议获取到时间控件
function getShowDatePick(param) {
    var isEndDate = false;
    if (param == "showDatePickStart") {
        isEndDate = false;
    }
    if (param == "showDatePickEnd") {
        isEndDate = true;
    }
    var data = '{"action":"showDatePick", "reqId":"' + param + '","param":{"isEndDate":"' + isEndDate + '","initDate":""}}';
    window.thskaihu.reqApp(data);
}

//起始时间的验证
function startTime(str) {
    return timeRegExp(str);
}

//结束时间的验证
function endTime(str) {
    return timeRegExp(str);
}

function timeRegExp(str) {
    //下面的正则式不仅仅匹配了日期格式，而且对日期的逻辑做了严格要求，判断了大月31天，小月30天，2月28，闰年情况2月29天
    var reg = /((^((1[8-9]\d{2})|([2-9]\d{3}))(10|12|0?[13578])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(11|0?[469])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))(0?2)(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)(0?2)(29)$)|(^([3579][26]00)(0?2)(29)$)|(^([1][89][0][48])(0?2)(29)$)|(^([2-9][0-9][0][48])(0?2)(29)$)|(^([1][89][2468][048])(0?2)(29)$)|(^([2-9][0-9][2468][048])(0?2)(29)$)|(^([1][89][13579][26])(0?2)(29)$)|(^([2-9][0-9][13579][26])(0?2)(29)$))/ig;
    if (!reg.test(str)) {
        alertInfo("请输入正确的日期格式如20150101");
        return false;
    }
    return true;
}

//比较日期大小
function compareTime(start, end) {
    var startFlag = startTime(start);
    var endFlag = endTime(end);
    if (startFlag && endFlag) {
        var start = start.substring(0, 4) + "/" + start.substring(4, 6) + "/" + start.substring(6, 8);
        var end = end.substring(0, 4) + "/" + end.substring(4, 6) + "/" + end.substring(6, 8);
        var d1 = new Date(start);
        var d2 = new Date(end);
        var d3 = new Date();
        if (d1 > d3) {
            alertInfo("起始时间不能大于当前时间");
            return false;
        }
        if (d2 < d3) {
            alertInfo("身份证已过期");
            return false;
        }
        if (d1 > d2) {
            alertInfo("起始时间不能大于结束时间");
            return false;
        }
    } else {
        return false;
    }
    return true;
}


//输入暗号处理
function isShowImg(v) {
    var dom = $("#signal").parent();
    if (v != '') {
        var img = $("#signalCloseImg");
        $(img).removeClass("hide");
        $(dom).append(img);
        $(img).on('click', function () {
            $("#signal")[0].value = "";
            $(img).addClass("hide");
        });
    }
}

//聚焦处理
function importFont(id) {
    hideBtn();
    switch (id) {
        case "name":
            importFocus(id, '#nameCloseImg');
            break;
        case "idcard":
            importFocus(id, '#idCardCloseImg');
            break;
        case "IssuingAuthority":
            importFocus(id, '#issuingCloseImg');
            break;
        case "address":
            importFocus(id, '#addressCloseImg');
            break;
        case "contactAddress":
            importFocus(id, '#contactAddressCloseImg');
            break;
        case "workUnit":
            importFocus(id, '#workUnitImg');
            break;
        case "signal":
            importFocus(id, '#signalCloseImg');
            break;
    }
}

function importFocus(id, closeImgId) {
    var dom = $("#" + id).parent();
    var img = $(closeImgId);
    $(img).removeClass("hide");
    $(dom).append(img);
    $(img).on('click', function () {
        $("#" + id)[0].value = "";
        $(img).addClass("hide");
    });
}

//隐藏按钮
function hideBtn() {
    if (!$('#nameCloseImg').hasClass("hide")) {
        $('#nameCloseImg').addClass("hide");
    }
    if (!$('#idCardCloseImg').hasClass("hide")) {
        $('#idCardCloseImg').addClass("hide");
    }
    if (!$('#issuingCloseImg').hasClass("hide")) {
        $('#issuingCloseImg').addClass("hide");
    }
    if (!$('#addressCloseImg').hasClass("hide")) {
        $('#addressCloseImg').addClass("hide");
    }
    if (!$('#signalCloseImg').hasClass("hide")) {
        $('#signalCloseImg').addClass("hide");
    }
}

//执行下一步
function clickNextstep() {

    //用户资料录入信息上传
    var clientName = $('#name')[0].value;
    var idNo = $('#idcard')[0].value;
    var idBegindate = $('#startDate')[0].value;
    var idEnddate = $('#endDate')[0].value;
    var issuedDepart = $('#IssuingAuthority')[0].value;
    var idAddress = $('#address')[0].value;
    var address = $('#contactAddress')[0].value;
    var degreeCode = $('#educational')[0].value;
    var professionCode = $('#professional')[0].value;
    var industryCode = $('#industry')[0].value;
    var beneficiaryPerson = $('#beneficiaryPerson').val();
    var controlNaturePerson = $('#controlNaturePerson').val();
    var workUnit = $('#workUnit')[0].value;
    var duty = $('#duty').val();
    var taxResidents = $('#taxResidents').val();

    var obj = {
        client_name: clientName,//客户名称
        id_no: idNo,// 身份证号码
        id_begindate: idBegindate,//证件有效期开始时间
        id_enddate: idEnddate,//证件有效期结束时间
        issued_depart: issuedDepart,//签发机关
        id_address: idAddress,//住址
        address: address,//联系地址
        degree_code: degreeCode,//学历代码
        profession_code: professionCode,// 职业代码
        industry_code: industryCode,//行业代码
        is_actual_controller: beneficiaryPerson,// 实际收益人
        is_actual_beneficiary: controlNaturePerson,// 实际控制人
        workUnit: workUnit,//工作单位
        creditRecord: creditRecord,//不良诚信记录
        duty: duty,//职务（字典）
        taxResidents: taxResidents //（税收居民身份）
    };

    // telClientInfomation: 处理同一个手机使用2个手机号开户问题
    var telClientInfomation = "clientInfomation" + localStorage.getItem("telKey");
    localStorage.setItem(telClientInfomation, JSON.stringify(obj));
    $.ajax({
        type: 'post',
        data: obj,
        url: qsInterface + "updateClientInfo",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == 0) {
                stepSync('updateClientInfo');//步骤同步统计
                gotoNextstep("updateClientInfo");//跳转到下一步骤
            } else {
                removeLoadingDiv();
                alertInfo(tmpData.error_info);
            }
        },
        error: function () {
            removeLoadingDiv();
            alertInfo("用户资料录入失败");
        }
    });

}