//返回结果处理
window.rspWeb = function (data) {
    data = JSON.parse(data);
    switch (data.action) {
        case 'getNetworkType':
            var networkType = data.param.networkType;
            $('.nextstep').data('networkType', networkType);
            break;
        case 'videoWitness':
            var anychatRsp = data.param.anychatRsp;
            var videoResult = data.param.videoResult;
            if(anychatRsp == 'SYS:10000' || videoResult == 1){//通过
                stepSync('videoResult');//步骤同步统计
                //跳转到下一步骤
                gotoNextstep("reqVideo");
            }else{
                getOpenStatus();
            }
            break;
	}
}

function getOpenStatus(){
    $.ajax({
        type: 'get',
        data: {},
        url: qsInterface + "OpenAccountState",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            if (data.error_no == "0") {
                var openStatus = data.open_status;
                var statusArr = openStatus.substr(0,2).split("");
                if(statusArr[0] !== "1"){
                    var gotoSendPic = function(){
                        window.location.href = "Sendpic.html";
                    };
                    alertInfo("身份证上传有误，请重新上传",'','',gotoSendPic,true);
                }else if(statusArr[1] !== "1"){
                    var gotoClientInfo = function(){
                        window.location.href = "updateClientInfo.html";
                    };
                    alertInfo("基本资料有误，请重新核对",'','',gotoClientInfo,true);
                }else{
                    alertInfo("视频见证失败",'','',hideLoadPage);
                }
            }else{
                alertInfo(data.error_info);
            }
        },
        error: function () {
            alertInfo("获取用户进度失败!");
        }
    });
}
 
var qsId = localStorage.getItem("qsId");
var qsInterface = localStorage.getItem("qsInterface");
var qsBackground = localStorage.getItem("qsBackground");
$(function () {
    
    //获取网络类型
    if (getPlatform() == "iphone") {
        setTimeout(function () {
            var getNetworkTypeData = '{"action":"getNetworkType", "reqId":"getNetworkType","param":{}}';
            window.thskaihu.reqApp(getNetworkTypeData);
        }, 300);
    } else {
        var getNetworkTypeData = '{"action":"getNetworkType", "reqId":"getNetworkType","param":{}}';
        window.thskaihu.reqApp(getNetworkTypeData);
    }

    hideLoadPage();

    //返回事件绑定
    backToBeforeStep("reqVideo");

    //点击 我准备好了 btn
    $('.nextstep').on('click', function () {
        //双向视频
        var networkType = $(this).data('networkType');
        if (networkType == "0") {
            alertInfo('您的网络不给力，请使用4G网络或wifi');
            return;
        }
        /*券商服务后台： sd: 思迪  crh: 财人汇*/
        if (qsBackground == "crh") {
            getVideoUrl();
        } else {
            loginQueue();
        }
        showLoadPage();//隐藏原来准备页面，展示等候页面
    });

});

//显示视频准备div,隐藏正在等待div
function hideLoadPage() {

    var qsDetail = JSON.parse(localStorage.getItem("qsDetail")).qsData;
    var kaihuTime = qsDetail["qs_kaihu_time"];
    if (kaihuTime.indexOf("周一至周日") > -1) {
        kaihuTime = "周一至周日" + "<br/>" + kaihuTime.substr(5);
    }
    $("#kaihuTime span").html(kaihuTime);
    $('#preparePage').removeClass("hide");
    $('.loadingReq').addClass("hide");
}

/************************crh: 财人汇视频见证******************************/
var reqVideo_url = '';
var videoResource_url = '';
//获取视频请求地址
function getVideoUrl(){
    var obj={qsid:qsId};
    $.ajax({
        type: 'get',
        data: obj,
        url: qsInterface+"reqVideo",
        dataType: 'json',
        timeout : 15000,
        success: function(data) {
            reqVideo_url = data.reqVideo_url ? data.reqVideo_url : '';
            videoResource_url = data.videoResource_url ? data.videoResource_url : '';
            reqVideoUrl(reqVideo_url,videoResource_url);
        },
        error: function() {
            alertInfo("获取视频请求地址失败！");
        }
    });
}

//发起视频见证请求
function reqVideoUrl(url,url2){
    $.ajax({
        type: 'get',
        data:{'url':url},
        url: qsInterface+"requestagent",
        dataType: 'json',
        timeout : 15000,
        success: function(data) {

            stepSync('reqVideo');//步骤同步统计
            if(data.error_no == 0){
                getLineUp(url2);
            }
        },
        error: function() {
            alertInfo("发起视频见证请求失败！");
        }
    });
}

//获取视频见证资源
var shuff = "";
function getLineUp(url){
    $.ajax({
        type: 'get',
        data:{'url':url},
        url: qsInterface+"requestagent",
        dataType: 'json',
        timeout : 10000,
        success: function(data) {
            if(data.error_no == 0){
                /*waitPositionInSelfOrg:当前在自己营业部中的位置
                  waitPosition:当前在总队列中的位置
                  waitNum:所有排队总人数*/
                if(data.waitPositionInSelfOrg){
                    var waitNum = data.waitPositionInSelfOrg;
                }else if(data.waitPosition){
                    var waitNum = data.waitPosition;
                }else{
                    var waitNum  = data.waitNum;
                }
                $('.loadingReq span').text("您前面还有"+waitNum+"人排队等候，请稍候...");
                if(data.status == 1){
                    var videodata = '{"action":"videoWitness", "reqId":"videoWitness","param":{"showTips":"0","loginName":"'+data.userName+'","loginPwd":"'+data.loginPwd+'", "roomId":"'+data.roomId+'", "roomPwd":"'+data.roomPwd+'", "anychatIp":"'+data.anyChatStreamIpOut+'","anychatPort":"'+data.anyChatStreamPort+'"}}';
                    window.thskaihu.reqApp(videodata);
                    hideLoadPage();
                }else{
                   shuff = setTimeout(function(){getLineUp(url);},3000); 
                }
            }else{
                alertInfo(data.error_info);
                hideLoadPage();
            }
        },
        error: function() {
            alertInfo("获取视频见证资源失败！");
        }
    });
}


/************************sd: 思迪视频见证******************************/
//登录视频队列(发起视频见证请求)
function loginQueue(){
    $.ajax({
        type: 'get',
        data:{},
        url: qsInterface+"loginQueue",
        dataType: 'json',
        timeout : 10000,
        success: function(data) {
            stepSync('reqVideo');//步骤同步统计
            if(data.error_no == 0){
                queryQueue();
            }else{
                alertInfo(data.error_info);
            }
        },
        error: function() {
            alertInfo("登录视频队列失败！");
        }
    });
}

//查询视频队列(获取视频见证资源)
var queryTime = 1;
var lunxun = "";
function queryQueue(){
    $.ajax({
        type: 'get',
        data:{},
        url: qsInterface+"queryQueue",
        dataType: 'json',
        timeout : 10000,
        success: function(data) {
            var waitMsec = data.waitMsec;
            if(data.error_no == 0){
                if(data.status == 1){
                    //loginName: 用户名  anychatIp：视频Ip anychatPort: 视频端口号
                    var videodata = '{"action":"videoWitness", "reqId":"videoWitness","param":{"loginName":"'+data.userName+'","roomName":"'+data.roomName+'","roomPwd":"","anychatIp":"'+data.anyChatStreamIpOut+'","anychatPort":"'+data.anyChatStreamPort+'"}}';
                    window.thskaihu.reqApp(videodata);
                    clearTimeout(lunxun);
                } else {
                    lunxun = setTimeout("queryQueue()", parseInt(waitMsec));
                    var waitPosition = data.waitPosition;
                    $('.loadingReq span').text("您前面还有" + waitPosition + "人排队等候，请稍候...");
                }
            }else{
                alertInfo(data.error_info);
                hideLoadPage();
            }
        },
        error: function() {
            alertInfo("查询视频队列失败！");
        }
    });
}

//离开视频队列
function cancelQueue(){
    $.ajax({
        type: 'get',
        data:{},
        url: qsInterface+"cancelQueue",
        dataType: 'json',
        timeout : 10000,
        success: function(data) {
            if(data.error_no == 0){

            }else{
                alertInfo(data.error_info);
            }
        },
        error: function() {
            alertInfo("离开视频队列失败！");
        }
    });
}


//展示等候页面
function showLoadPage(){
    $('#preparePage').addClass("hide");
    $('.loadingReq').removeClass("hide");
}

