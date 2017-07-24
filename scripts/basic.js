function http_build_query(a, b) {
    var c = "";
    if ("object" == typeof a) {
        var d = "";
        for (var e in a)d = b ? b + "[" + e + "]" : e, c += http_build_query(a[e], d);
        return b ? c : c.substr(0, c.length - 1)
    }
    return "number" == typeof a || "string" == typeof a ? b ? encodeURIComponent(b) + "=" + encodeURIComponent(a) + "&" : encodeURIComponent(a) : ""
}
function getParam(a) {
    var b = window.location.search;
    if ("undefined" == typeof a)return parse_str(b.substr(1));
    var c, d = a + "=", e = d.length, f = b.indexOf(d), g = "";
    return -1 == f ? "" : (g = b.substr(f + e, b.length), c = g.indexOf("&"), -1 != c && (g = g.substr(0, c)), decodeURIComponent(g))
}
function urlPost(a, b) {
    var c = document.createElement("form");
    c.method = "post", c.action = a;
    for (var d in b) {
        var e = document.createElement("input");
        e.setAttribute("name", d), e.setAttribute("value", b[d]), c.appendChild(e)
    }
    document.body.appendChild(c), c.submit(), document.body.removeChild(c)
}
function urlGet(a, b) {
    var c = document.createElement("form");
    c.method = "get", c.action = a;
    for (var d in b) {
        var e = document.createElement("input");
        e.setAttribute("name", d), e.setAttribute("value", b[d]), c.appendChild(e)
    }
    document.body.appendChild(c), c.submit(), document.body.removeChild(c)
}
function parse_str(a) {
    if (-1 == a.indexOf("="))return {};
    for (var b = {}, c = a.split("&"), d = 0; d < c.length; d++) {
        var e = c[d].split("=");
        b[decodeURIComponent(e[0])] = decodeURIComponent(e[1])
    }
    return b
}
function floor(a, b) {
    return a = parseFloat(a), isFinite(a) ? (b = b > 0 ? b : 0, a.toFixed(b)) : ""
}
function getPlatform() {
    var a = {
        versions: function () {
            var a = navigator.userAgent;
            return navigator.appVersion, {
                iPhone: a.indexOf("iPhone") > -1 || a.indexOf("Mac") > -1,
                iPad: a.indexOf("iPad") > -1
            }
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    };
    if (a.versions.iPhone || a.versions.iPad)
        var b = "iphone"; else var b = "gphone";
    return b
}
function getParaByName(a) {
    var b = window.location.search;
    if ("undefined" == typeof a)return parse_str(b.substr(1));
    var c, d = a + "=", e = d.length, f = b.indexOf(d), g = "";
    return -1 == f ? "" : (g = b.substr(f + e, b.length), c = g.indexOf("&"), -1 != c && (g = g.substr(0, c)), g)
}
function getIsRoot() {
    var a = navigator.userAgent, b = a.indexOf("hexinbroker");
    return b > -1 ? !0 : !1
}
function getCssStyle() {
    var a = navigator.userAgent, b = "white", c = a.indexOf("hxtheme");
    if (c > -1) {
        var d = a.substr(c + 8, 1);
        0 == d ? b = "white" : 1 == d && (b = "black")
    }
    return b
}
function notifyClient(a, b) {
    var c = "";
    c = "gphone" == getPlatform() ? "client://client.html?action=" + a + "^" + b : "client.html?action=" + a + "^" + b;
    var d = new Image;
    d.src = c
}
function getAppVersion() {
    var a = navigator.userAgent, b = a.indexOf("Hexin_Gphone"), c = a.indexOf("IHexin");
    if (b > -1)var d = a.substr(b + 13); else {
        if (!(c > -1))return !1;
        var d = a.substr(c + 7)
    }
    var e = d.split(" ");
    return e[0]
}
function getInnerVersion() {
    var a = navigator.userAgent, b = a.indexOf("innerversion");
    if (!(b > -1))return !1;
    var c = a.substr(b + 13), c = c.split(" ");
    return c[0]
}
function pullUpEvent(a) {
    for (var b = new Array, c = 1; c < arguments.length; c++)b.push(arguments[c]);
    var d = 0, e = 0;
    $(window).bind("touchstart", function () {
        d = event.targetTouches[0].pageY
    }), $(window).bind("touchend", function () {
        e = event.changedTouches[0].pageY, $(window).height() + $(window).scrollTop() >= document.body.scrollHeight && d - e > 10 && a.apply(this, b)
    })
}
function pullDownEvent(a) {
    for (var b = new Array, c = 1; c < arguments.length; c++)b.push(arguments[c]);
    var d = 0, e = 0;
    $(window).bind("touchstart", function () {
        d = event.targetTouches[0].pageY
    }), $(window).bind("touchend", function () {
        e = event.changedTouches[0].pageY, 0 == $(window).scrollTop() && e - d > 10 && a.apply(this, b)
    })
}
function getIsPro() {
    var a = navigator.userAgent, b = a.indexOf("iPhoneTargetType/hexinPro");
    return b > -1 ? !0 : !1
}
function callNativeHandler(a, b, c) {
    window.WebViewJavascriptBridge ? "undefined" != typeof c ? window.WebViewJavascriptBridge.callHandler(a, b, c) : window.WebViewJavascriptBridge.callHandler(a, b) : document.addEventListener("WebViewJavascriptBridgeReady", function () {
            "undefined" != typeof c ? window.WebViewJavascriptBridge.callHandler(a, b, c) : window.WebViewJavascriptBridge.callHandler(a, b)
        }, !1)
}
function registerWebHandler(a, b) {
    window.WebViewJavascriptBridge ? window.WebViewJavascriptBridge.registerHandler(a, b) : document.addEventListener("WebViewJavascriptBridgeReady", function () {
            window.WebViewJavascriptBridge.registerHandler(a, b)
        }, !1)
}
function connectWebViewJavascriptBridge() {
    window.WebViewJavascriptBridge ? window.WebViewJavascriptBridge.init(initWebViewJavascriptBridge) : document.addEventListener("WebViewJavascriptBridgeReady", function () {
            window.WebViewJavascriptBridge.init(initWebViewJavascriptBridge)
        }, !1)
}
function initWebViewJavascriptBridge(a, b) {
}
function setcookie(a, b, c, d, e, f) {
    if (c)var g = new Date(1e3 * c);
    var h = a + "=" + escape(b) + (c ? "; expires=" + g.toGMTString() : "") + (d ? "; path=" + d : "") + (e ? "; domain=" + e : "") + (f ? "; secure" : "");
    document.cookie = h
}
function getcookie(a) {
    var b = a + "=", c = document.cookie.indexOf(b);
    if (-1 == c)return null;
    var d = document.cookie.indexOf(";", c + b.length);
    return -1 == d && (d = document.cookie.length),
        unescape(document.cookie.substring(c + b.length, d))
}

function deletecookie(a, b, c) {
    getcookie(a) && (document.cookie = a + "=" + (b ? "; path=" + b : "") + (c ? "; domain=" + c : "") + "; expires=Thu, 01-Jan-70 00:00:01 GMT")
}
function hasNetwork() {
    if ("iphone" == getPlatform()) setTimeout(function () {
        var a = '{"action":"getNetworkType", "reqId":"getNetworkType","param":{}}';
        window.thskaihu.reqApp(a)
    }, 300); else {
        var a = '{"action":"getNetworkType", "reqId":"getNetworkType","param":{}}';
        window.thskaihu.reqApp(a)
    }
}

function stepSync(a, name) {
    var b = getcookie("client_id"),
        c = localStorage.getItem("recognizeId") || "",
        e = (name) ? ('","extraInfo":"bank=' + name) : "",
        d = '{"action":"stepSync", "reqId":"stepSync","param":{"clientId":"' + b + '","step":"' + a + '","recognizeId":"' + c + e + '"}}';
    window.thskaihu.reqApp(d)
}

function getPhoneNum() {
    if (getPlatform() == "iphone") {
        setTimeout(function () {
            var a = '{"action":"getPhoneNum","reqId":"getPhoneNum","param":{}}';
            window.thskaihu.reqApp(a);
        }, 300);
    } else {
        var a = '{"action":"getPhoneNum","reqId":"getPhoneNum","param":{}}';
        window.thskaihu.reqApp(a);
    }
}

connectWebViewJavascriptBridge();

/*返回上一步or退出开户*/
function backToBeforeStep(sign) {

    var allList = JSON.parse(localStorage.getItem("allList"));
    var signIndex = $.inArray(sign, allList);
    var rejectedSign = sessionStorage.getItem("rejectedSign");
    $('#backTo').on('click', function () {
        //视频见证返回上一步特殊处理
        if (sign == "reqVideo" && $('#preparePage').hasClass('hide')) {
            if (qsBackground == "sd") {
                clearTimeout(lunxun);
                cancelQueue();//离开视频队列
            } else {
                clearTimeout(shuff);
            }
            hideLoadPage();
            return false;
        }
        if (sign == "messageCheck" || rejectedSign == "true")//审核驳回逻辑处理
        {
            var data = '{"action":"exitKaihu", "reqId":"exitKaihu","param":{}}';
            window.thskaihu.reqApp(data);
        }
        else {
            window.location.href = allList[signIndex - 1] + '.html';
        }
    });
}

/*下一步封装*/
function pickNextStep(data, method, param1, param2, param3) {
    var networkType = data.param.networkType;
    $('.nextstep').data('networkType', networkType);
    if (networkType == "0") {
        alertInfo("网络连接失败,请重新连接网络！");
    } else {
        var param1 = param1 || '';
        var param2 = param2 || '';
        var param3 = param3 || '';
        //加载等待loading页面
        createLoadingDiv();
        method(param1, param2, param3);
    }
}

/*跳转到下一步*/
function gotoNextstep(sign) {

    var nextList = JSON.parse(localStorage.getItem("nextList"));
    var signIndex = $.inArray(sign, nextList);

    if (signIndex == -1) {
        nextList = ["updateOpenBranch", "Sendpic", "updateClientInfo", "reqVideo"];
        signIndex = $.inArray(sign, nextList);
    }
    window.location.href = nextList[signIndex + 1] + '.html';
}

//拨号
function getTel(telNo) {
    var html = '<div class="maskt" onClick="quxiao();" style="position: fixed;width: 100%;height: 100%;top: 0;left: 0;z-index: 50;background: rgba(0,0,0,0.3);">';
    html += '<div class="confirm" style="background-color: #fff;border-radius: 0.1rem;font-size: 0.36rem;position: absolute;top: 50%;left: 50%;width: 5.5rem;height: auto;z-index: 20;-webkit-transform: translateX(-50%) translateY(-50%);transform: translateX(-50%) translateY(-50%);">';
    html += '<div class="isflag" style="border-bottom: 1px solid #D3D3D3;height: 1rem;line-height: 1rem;font-weight: bold;color: #333;text-align: center;">提示</div>';
    html += '<div class="content" style="padding:0.2rem;color:#666;border-bottom:1px solid #d7d7d7;text-align:center;">' + telNo + '</div>'
    html += '<div class="anniu">';
    html += '<div  class="quxiao" onClick="quxiao();" style="display: inline-block;height:0.8rem;line-height:0.8rem;width:50%;border-right:1px solid #d7d7d7;color:#666;margin-right:-1px; text-align:center;"><span>取消</span></div>';
    html += '<div class="bohao" onClick="bohao();"  style="display: inline-block;height:0.8rem;line-height:0.8rem;width:50%; text-align:center;color:#3a83d7;"><span>拨号</span></div>';
    html += '</div></div></div>';
    $("body").prepend(html);
}
function bohao() {
    var telNo = $(".tipmsg2 span").html();
    if (getPlatform() == 'gphone') {
        var data = '{"action":"callTel", "reqId":"callTel","param":{"telNo":"' + telNo + '"}}';
        window.thskaihu.reqApp(data);
    }
    else {
        callNativeHandler(
            'jumpPage',//必填
            {"action": "callTell", "phoneNum": telNo},
            function (data) {
            }
        );
    }
}
//退出开户流程
function isExit() {
    var html = '<div class="maskt" onClick="quxiao();" style="position: fixed;width: 100%;height: 100%;top: 0;left: 0;z-index: 50;background: rgba(0,0,0,0.3);">';
    html += '<div class="confirm" style="background-color: #fff;border-radius: 0.1rem;font-size: 0.36rem;position: absolute;top: 50%;left: 50%;width: 5.5rem;height: auto;z-index: 20;-webkit-transform: translateX(-50%) translateY(-50%);transform: translateX(-50%) translateY(-50%);">';
    html += '<div class="isflag" style="border-bottom: 1px solid #D3D3D3;height: 1rem;line-height: 1rem;font-weight: bold;color: #333;text-align: center;">提示</div>';
    html += '<div class="content" style="padding:0.2rem;color:#666;border-bottom:1px solid #d7d7d7;text-align:center;">是否退出开户，并返回首页</div>'
    html += '<div class="anniu">';
    html += '<div  class="quxiao" onClick="quxiao();" style="display: inline-block;height:0.8rem;line-height:0.8rem;width:50%;border-right:1px solid #d7d7d7;color:#666;margin-right:-1px; text-align:center;"><span>取消</span></div>';
    html += '<div class="tuichu" onClick="queding();"  style="display: inline-block;height:0.8rem;line-height:0.8rem;width:50%; text-align:center;color:#3a83d7;"><span>确定</span></div>';
    html += '</div></div></div>';
    $("body").prepend(html);
}

function quxiao() {
    $(".maskt").hide()
}

function queding() {
    $(".maskt").hide();
    var a = '{"action":"exitKaihu", "reqId":"exitKaihu","param":{}}';
    window.thskaihu.reqApp(a)
}


//自定义弹窗
function createAlertInfoDom() {
    var alertInfoDom = '<div class="alertInfoMask"><div class="alertInfo"><div class="alertInfo_cancel"></div><div class="alertInfo_tit">提示</div><div class="alertInfo_content"></div><div class="alertInfo_btnSure">确定</div></div></div>'
    $('body').append(alertInfoDom);
}

function alertInfo(content, title, btn, callback, param) {
    if ($('.alertInfoMask').size() == 0) {
        createAlertInfoDom();
    }
    var windowHeight = $(window).height();
    $('.alertInfoMask').bind('touchmove', function (e) {
        e.preventDefault();
    });
    $('body').css({'height': windowHeight, 'overflow': 'hidden'});
    var title = title ? title : '提示';
    var content = content ? content : '';
    var btn = btn ? btn : '确认';
    $('.alertInfo .alertInfo_tit').text(title);
    $('.alertInfo .alertInfo_content').text(content);
    $('.alertInfo .alertInfo_btnSure').text(btn);
    $('.alertInfoMask,.alertInfo').show();

    $('.alertInfo .alertInfo_btnSure').off('click').click(function () {
        $('body').attr('style', '');
        $('.alertInfoMask,.alertInfo').hide();
        $('.alertInfo .alertInfo_content').text('');
        if (typeof(callback) == 'function') callback();
    });
    $('.alertInfo_cancel').off('click').click(function () {
        $('body').attr('style', '');
        $('.alertInfoMask,.alertInfo').hide();
        $('.alertInfo .alertInfo_content').text('');
        removeLoadingDiv();
        return false;
    });
    (param) ? $('.alertInfo_cancel').remove() : '';
}

//创建加载等待loading页面
function createLoadingDiv() {
    if ($('.loadingMask').length > 0) return;//防止重复调用创建
    var html = '<div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div>';
    var loadingDom = '<div class="loadingMask"><div class="spinner"><div class="spinner-container container1">' + html + '<div class="spinner-container container2">' + html + '</div></div>';
    $('body').append(loadingDom);
}
//删除加载等待loading页面
function removeLoadingDiv() {
    $('.loadingMask').remove();
}

//创建：重新加载页面
/*
 * content:错误信息提示，不传为默认值
 * btn 按钮名称，不传为默认值
 * fn 函数，用户回调(重新加载按钮)
 * fn2 函数，用户回调(返回按钮)
 * param1: fn 函数参数
 * param2：驳回标志
 * */
function createReloadDiv(content, btn, fn, fn2, param1, param2, param3) {
    var content = content || "网络出错了，请点击按钮重新加载！";
    var btn = btn || "重新加载";
    var param1 = param1 || '';
    var param2 = param2 || '';
    var param3 = param3 || '';
    var reloadDom = '<div class="reloadMask"><div class="reloadContent"><img src="../images/common/empty_failed@2x.png" /><p>' + content + '</p><div class="reloadBtn">' + btn + '</div><div class="backBtn">返回</div></div></div>';
    $('body').append(reloadDom);
    /*重新加载按钮*/
    $('.reloadMask .reloadBtn').click(function () {
        $('.reloadMask').hide();
        if (typeof(fn) == 'function') {
            fn(param1, param2, param3);
        } else {
            window.location.reload();
        }
    });
    /*返回按钮*/
    $('.reloadMask .backBtn').click(function () {
        $('.reloadMask').hide();
        if (param2 == "true") {
            isExit();
        } else {
            if (typeof(fn2) == 'function') {
                fn2();
            } else {
                window.location.href = fn2 + '.html';
            }
        }
    });
}

/*证书封装*/
function Cert() {
    this.count = 0;
}

//param:callback0 不通过 callback1 请求失败断网处理
//中登证书颁发状态
Cert.prototype.zhongDengCertApplyState = function (callback0, callback1) {
    var time,
        _this = this;
    $.ajax({
        type: 'get',
        data: {},
        url: qsInterface + "ZhongDengCertApplyState",
        dataType: 'json',
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == "0") {//证书已颁发
                processArr[0] = true;
                _this.createPkcs10();//生成pkcs10(证书申请号)
                clearInterval(time);
            } else if (tmpData.error_no == "1") {//等待
                time = setInterval(_this.zhongDengCertApplyState, 2000);
                _this.count++;
                if (_this.count > 3) {
                    clearInterval(time);
                    alertInfo(tmpData.error_info);
                    _this.count = 0;
                }
            } else {
                alertInfo(tmpData.error_info);
                if (typeof(callback0) == "function")
                    callback0();
            }
        },
        error: function () {
            if (typeof(callback1) == "function")
                callback1();
        }
    });
}

//callback0 不通过操作 callback1 断网处理
//获取证书
Cert.prototype.zhongDengCert = function (pkcs10, callback0, callback1) {
    var obj = {pkcs10: pkcs10};
    var _this = this;
    $.ajax({
        type: 'post',
        data: obj,
        url: qsInterface + "ZhongDengCert",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == '0') {
                processArr[2] = true;//标志量：获取中登证书是否成功
                if (qsBackground == 'crh') {
                    p7cert = tmpData.csdc_p7cert;
                } else {
                    p7cert = tmpData.p7cert;
                }
                _this.installCert(p7cert);
            } else {
                alertInfo(tmpData.error_info);
                if (typeof(callback0) == "function")
                    callback0(tmpData);
            }
        },
        error: function () {
            if (typeof(callback1) == "function")
                callback1();
        }
    });
}

//安装证书
Cert.prototype.installCert = function (p7cert) {

    var userId = createUserId();
    var data = '{"action":"certInstall", "reqId":"certInstall","param":{"p7cert":"' + p7cert + '","userId":"' + userId + '"}}';
    window.thskaihu.reqApp(data);
}

//param: flag标志 qsQuery券商接口  c1 成功 c2 证书无效 c3 未通过 c4 请求失败
Cert.prototype.zhongDengCertQuery = function (flag, callback1, callback2, callback3, callback4) {

    $.ajax({
        type: 'get',
        data: {},
        url: qsInterface + "ZhongDengCertQuery",
        dataType: 'json',
        async: false,
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == "0") {
                //证书查询状态
                if (tmpData.csdc_cert_status == "2" && flag == 0) {
                    if (typeof(callback1) == "function")
                        callback1(tmpData);
                    //缓存中登证书查询数据
                    //tmpData 中的参数： csdc_cert_dn  证书DN csdc_cert_sn  证书序列号 csdc_cert_status   证书状态(1:证书未下载、2:证书有效、3:证书已冻结、4：证书已作废)
                    localStorage.setItem("zhongDengCertQuery", JSON.stringify(tmpData));
                } else {
                    if (typeof(callback2) == "function")
                        callback2();
                }
            } else {
                alertInfo(tmpData.error_info);
                if (typeof(callback3) == "function")
                    callback3(tmpData);
            }
        },
        error: function () {
            if (typeof(callback4) == "function")
                callback4();
        }
    });
}

//生成pkcs10（证书申请号）
Cert.prototype.createPkcs10 = function () {
    // 1) midServer=中间服务商1.思迪 2.财人汇
    // 2）userId=用户id
    if (qsBackground == 'crh') {
        var midServer = 2;
    } else {
        var midServer = 1;
    }
    var userId = createUserId();
    if (getPlatform() == "iphone") {
        setTimeout(function () {
            var data = '{"action":"createPKCS10", "reqId":"createPKCS102","param":{"midServer":"' + midServer + '","userId":"' + userId + '"}}';
            window.thskaihu.reqApp(data);
        }, 300);
    } else {
        var data = '{"action":"createPKCS10", "reqId":"createPKCS102","param":{"midServer":"' + midServer + '","userId":"' + userId + '"}}';
        window.thskaihu.reqApp(data);
    }
}

/*协议签署封装*/
function Agreement() {
}

/*获取证书签名协议*/
Agreement.prototype.getSignCert = function (agreementList, id) {

    var md5 = agreementList.econtract_md5;
    var userId = createUserId();
    var data = '{"action":"signCert", "reqId":"signCert' + id + '","param":{"md5":"' + md5 + '","userId":"' + userId + '"}}';
    window.thskaihu.reqApp(data);
}

/*agreementList: 协议对象
 index：协议书序号
 certSign：数字签名*/
Agreement.prototype.agreementSign = function (agreementList, index, certSign, callback1) {

    var certSn = JSON.parse(localStorage.getItem("zhongDengCertQuery")).csdc_cert_sn;
    var obj = {
        econtract_id: agreementList.econtract_id,   //电子合同ID
        econtract_name: agreementList.econtract_name, //电子合同名称
        econtract_md5: agreementList.econtract_md5,//电子合同MD5值
        plain_text: agreementList.econtract_md5,   //电子合同MD5值
        cert_sign: certSign,     //数字签名（协议签名接口获得,和本地证书相关）
        cert_sn: certSn,      //证书序列号(唯一的通过安装数字证书得到)
        summary: "",        //签名摘要信息（建行、农行必填）
        biz_id: "1"   //业务标记(1:开户 3：转户 5：简易开户 6：三方存管 7：经纪人 21：中登证书 22：自建证书)
    };

    $.ajax({
        type: 'post',
        data: obj,
        url: qsInterface + "AgreementSign",
        dataType: 'json',
        cache: false,
        timeout: 15000,
        success: function (data) {
            var tmpData = data;
            if (tmpData.error_no == "0") {
                isAgreementSuccessArr[index] = true;
                for (var i = 0; i < isAgreementSuccessArr.length; i++) {
                    if (!isAgreementSuccessArr[i]) return;
                }
                if (typeof(callback1) == 'function')
                    callback1();
            } else {
                removeLoadingDiv();
                isAgreementSuccessArr[index] = false;
                alertInfo(data.error_info);
                return false;
            }
        },
        error: function () {
            removeLoadingDiv();
            alertInfo("签署协议失败！");
            return false;
        }
    });
}
/**
 * 格式化日期函数，给定一个日期对象，会被格式化成"2017/03/18 01:01:02"这种格式
 * @param dateObj 日期对象
 */
function formatDate(dateObj) {
    var year = dateObj.getFullYear();
    var month = dateObj.getMonth() + 1;
    month = month < 9 ? '0' + month : month;
    var day = dateObj.getDate();
    day = day < 9 ? '0' + day : day;
    var hour = dateObj.getHours();
    hour = hour < 9 ? '0' + hour : hour;
    var minute = dateObj.getMinutes();
    minute = minute < 9 ? '0' + minute : minute;
    var second = dateObj.getSeconds();
    second = second < 9 ? '0' + second : second;
    return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
}
/**
 * 对比日期函数
 * @param date1 缓存的日期
 * @param date2 日期2
 * @param distance 日期相差距离，单位天
 */
function compareDate(datestr, distance) {

    var dateBefore = new Date(datestr);
    var dateTime1 = dateBefore.getTime();
    var dateNow = new Date();
    var dateTime2 = dateNow.getTime();
    var dayBetween = Math.abs(Math.floor((dateTime2 - dateTime1) / (24 * 60 * 60 * 1000)));
    return dayBetween > distance
}
