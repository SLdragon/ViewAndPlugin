
/*
  浏览点赞插件by 翠#，无需服务器，简单配置即可使用
  详细说明参见：http://blog.turenlong.com/post/2016/05/10/krpano
  技术交流群：551278936
*/

var krpanoplugin = function () {

    var local = this;
    // save the 'this' pointer from the current plugin object

    var krpano = null;
    // the krpano and plugin interface objects
    var plugin = null;

    var plugincanvas = null;
    // optionally - a canvas object for graphic content
    var plugincanvascontext = null;



    // registerplugin - startup point for the plugin (required)
    // - krpanointerface = krpano interface object
    // - pluginpath = string with the krpano path of the plugin (e.g. "plugin[pluginname]")
    // - pluginobject = the plugin object itself (the same as: pluginobject = krpano.get(pluginpath) )
    local.registerplugin = function (krpanointerface, pluginpath, pluginobject) {
        krpano = krpanointerface;
        plugin = pluginobject;

        // add a from xml callable functions:
        plugin.initial_plugin = initial_plugin;

        plugin.addViewNum = addViewNum;
        plugin.add_agree = add_agree;
        plugin.cancel_agree = cancel_agree;
        plugin.getViewAndAgreeWithAddView = getViewAndAgreeWithAddView;
        plugin.getViewAndAgree = getViewAndAgree;

        plugin.registerattribute("onloadnumok", "");

    }

    // unloadplugin - end point for the plugin (optionally)
    // - will be called from krpano when the plugin will be removed
    // - everything that was added by the plugin (objects,intervals,...) should be removed here
    local.unloadplugin = function () {
        plugin = null;
        krpano = null;
    }


    var baseURL = "http://www.yjh001.com:8080/api/ViewAndAgreeModels/";

    var site_url;
    var password;

    function initial_plugin(uid) {
        site_url = window.location.href;
        password = uid;
        if (hasAgreeCookie()) {
            krpano.call("set(layer[agree_num].url,'agree2.png');set(layer[agree_num].onclick,'plugin[va].cancel_agree();')");
        }
        getViewAndAgreeWithAddView();
    }

    function setAgreeView(text) {
        krpano.call("set_agree_view(" + text + ")");
    }

    function setAgree(text) {
        krpano.call("set_agree(" + text + ")");
        setAgreeCookie();
        krpano.call("set(layer[agree_num].url,'agree2.png');set(layer[agree_num].onclick,'plugin[va].cancel_agree();')");
    }

    function cancelAgree(text) {
        krpano.call("set_agree(" + text + ")");
        removeAgreeCookie();
        krpano.call("set(layer[agree_num].url,'agree1.png');set(layer[agree_num].onclick,'plugin[va].add_agree();')");
    }

    function setView(text) {
        krpano.call("set_view(" + text + ")");
    }

    function addCookie(objName, objValue, objHours) {//添加cookie 
        var str = objName + "=" + escape(objValue);
        if (objHours > 0) {//为0时不设定过期时间，浏览器关闭时cookie自动消失 
            var date = new Date();
            var ms = objHours * 3600 * 1000;
            date.setTime(date.getTime() + ms);
            str += "; expires=" + date.toGMTString();
        }
        document.cookie = str;
    }

    function hasAgreeCookie() {
        var strCookie = document.cookie;
        //将多cookie切割为多个名/值对 
        var arrCookie = strCookie.split("; ");
        var userId;
        //遍历cookie数组，处理每个cookie对 
        for (var i = 0; i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            //找到名称为userId的cookie，并返回它的值 
            if ("hasAgree" == arr[0]) {
                return true;
            }
        }
        return false;
    }

    function removeAgreeCookie()//删除cookie
    {

        function getCookie(name)//取cookies函数        
        {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (arr != null) return unescape(arr[2]); return null;
        }

        name = "hasAgree";
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = getCookie(name);
        if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    }


    function setAgreeCookie() {
        addCookie("hasAgree", 1, 24 * 30);
    }

    function getViewAndAgree() {
        var url = baseURL + "GetViewAndAgree";
        doGet(url, setAgreeView);
    }

    function getViewAndAgreeWithAddView() {
        var url = baseURL + "GetViewAndAgreeWithAddView";
        doGet(url, setAgreeView);
    }

    function addViewNum() {
        var url = baseURL + "AddViewNum";
        doPost(url, setView);
    }

    function add_agree() {
        if (!hasAgreeCookie()) {
            krpano.call("set(layer[agree_num].onclick,'')");
            var url = baseURL + "addAgreeNum";
            doPost(url, setAgree);
        }
    }

    function cancel_agree() {
        if (hasAgreeCookie()) {
            krpano.call("set(layer[agree_num].onclick,'')");
            var url = baseURL + "CancelAgreeNum";
            doPost(url, cancelAgree);
        }
    }

    function doGet(url, setFun) {

        url = url + "?url=" + site_url + "&password=" + password;
        var xmlHttp;
        if (window.ActiveXObject) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        } else if (window.XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        }

        xmlHttp.open("GET", url);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send();
        xmlHttp.onreadystatechange = function () {
            if ((xmlHttp.readyState == 4) && (xmlHttp.status == 200)) {
                var text = xmlHttp.responseText;
                if (text.indexOf("passworderror") >= 0) {
                    alert("浏览点赞插件中的密码设置错误，请加入群156364025找管理人员免费获取密码")
                }
                else {
                    text = text.replace(/"/g, "");
                    if (setFun) {
                        setFun(text);
                    }
                }

            } else {

            }
        }
    }

    function doPost(url, setFun) {

        url = url + "?url=" + site_url + "&password=" + password;
        var xmlHttp;
        if (window.ActiveXObject) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        } else if (window.XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        }

        xmlHttp.open("POST", url);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send();
        xmlHttp.onreadystatechange = function () {
            if ((xmlHttp.readyState == 4) && (xmlHttp.status == 200)) {
                var text = xmlHttp.responseText;
                if (text.indexOf("passworderror") >= 0) {
                    alert("浏览点赞插件中的密码设置错误，请加入群156364025找管理人员免费获取密码")
                }
                else {
                    text = text.replace(/"/g, "");
                    if (setFun) {
                        setFun(text);
                    }
                }

            } else {


            }
        }
    }
};
