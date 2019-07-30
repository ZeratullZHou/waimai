var gWs = null;
var gId = -1;
var socketQueueId = 0;
var socketQueue = {};
var systemPpi = 1;
var gShowState = true;
var gFullScreenLeft = 0;
var gFullScreenTop = 0;
var gNotFullScreenLeft = 0;
var gNotFullScreenTop = 0;
window.bodyOffset = [window.outerWidth - window.innerWidth, window.outerHeight - window.innerHeight];


function getIEVersion() {
    var win = window;
    var doc = win.document;
    var input = doc.createElement("input");
    var ie = (function () {
        if (win.ActiveXObject === undefined) return null;
        if (!win.XMLHttpRequest) return 6;
        if (!doc.querySelector) return 7;
        if (!doc.addEventListener) return 8;
        if (!win.atob) return 9;
        if (!input.dataset) return 10;
        return 11;
    })();
    return ie;
}

var gIsIE = false;
var gIsFirefox = false;
var gIsOpera = false;
var gIsChrome = false;
var gIsSafari = false;
var gIsEdge = false;

function getBrowser() {
    var ua = window.navigator.userAgent;
    gIsIE = getIEVersion();
    gIsFirefox = ua.indexOf("Firefox") != -1;
    gIsOpera = ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1;
    gIsChrome = ua.indexOf("Chrome") && window.chrome;
    gIsSafari = ua.indexOf("Safari") != -1 && ua.indexOf("Version") != -1;
    gIsEdge = ua.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE;
    if (gIsIE) {
        return "IE";
    } else if (gIsFirefox) {
        return "Firefox";
    } else if (gIsOpera) {
        return "Opera";
    } else if (gIsChrome) {
        return "Chrome";
    } else if (gIsSafari) {
        return "Safari";
    } else if (gIsEdge) {
        return "Edge";
    } else {
        return "Unknown";
    }
}

function isFullScreen(){
    if(window.outerHeight === screen.availHeight && window.outerWidth === screen.availWidth){
        return true;
    }else{
        return false;
    }
}

function detectZoom() {
    var ratio = 0,
        screen = window.screen,
        ua = navigator.userAgent.toLowerCase();
    if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    } else if (~ua.indexOf('msie')) {
        if (screen.deviceXDPI && screen.logicalXDPI) {
            ratio = screen.deviceXDPI / screen.logicalXDPI;
        }
    } else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
        ratio = window.outerWidth / window.innerWidth;
    }
    if (ratio) {
        ratio = Math.round(ratio * 100);
    }
    return ratio;
}
var gPosState = false;
var markX = 0;
var markY = 71;

function hasScrollbar(mapCtrl) {
    return document.body.scrollHeight > window.innerHeight || document.body.scrollHeight < document.getElementById(mapCtrl.div).clientHeight;
}

function getSystemPPI(){
    return systemPpi;
}

function changeMapPositionAndSize(mapCtrl) {
    var ppi = getSystemPPI();
    var rate = detectZoom() / 100 / ppi;
    if (1) {
        var x = window.outerWidth - window.innerWidth;
        var y = window.outerHeight - window.innerHeight;
        if(x < 0 && y < 0){
            console.log("window.outerWidth:" + window.outerWidth + ",window.innerWidth:" + window.innerWidth);
            console.log("window.outerHeight:" + window.outerHeight + ",window.innerHeight:" + window.innerHeight);
        }
        console.log("x:" + x);
        console.log("y:" + y);
        if (x <= 0 && y < 0) { //最大化时，计算出来的值为负，不正常，故使用上一次保存的值
            if(gFullScreenLeft == 0 && gFullScreenTop == 0){
                var e = document.createEvent("Event");
                e.initEvent("resize", true, true);
                window.dispatchEvent(e);
            }
            window.bodyOffset = [gFullScreenLeft, gFullScreenTop];
        } else {
            if (gIsOpera) { //opera自带左侧边栏
                if (x > 0 && x != 40) {
                    x = -4;
                    y -= 15;
                } else {

                }
            }
            if (gIsChrome || gIsFirefox || gIsIE) {
                if (!isFullScreen()) { //当为非最大化状态时，对top进行修正
                    y -= x;
                    x = 0;
                }
                if(x < 0){
                    x = 0;
                }
            }
            if(isFullScreen() && gFullScreenLeft == 0 && gFullScreenTop == 0){
                gFullScreenLeft = x;
                gFullScreenTop = y;
            }
            if(isFullScreen()){
                window.bodyOffset = [gFullScreenLeft, gFullScreenTop];
            }else{
                window.bodyOffset = [x, y];
            }
        }
    } else {
        console.log("do nothing");
    }
    var rect = document.getElementById(mapCtrl.div).getBoundingClientRect();
    //console.log("left:" + rect.left + ",top:" + rect.top + "offleft:" + window.bodyOffset[0] + ",offtop:" + window.bodyOffset[1]);
    //mapCtrl.ChangePositionAndSize(rect.left * rate + window.bodyOffset[0]* rate, rect.top * rate + window.bodyOffset[1]* rate, (rect.right - rect.left) * rate * ppi, (rect.bottom - rect.top) * rate * ppi);
    if(getBrowser() == "Chrome" || getBrowser() == "IE" || getBrowser() == "Opera"){
        mapCtrl.ChangePositionAndSize(rect.left * rate, rect.top * rate, (rect.right - rect.left) * rate * ppi, (rect.bottom - rect.top) * rate * ppi);
    }else if(getBrowser() == "Firefox"){
        mapCtrl.ChangePositionAndSize(rect.left * rate + window.bodyOffset[0]* rate, rect.top * rate + window.bodyOffset[1]* rate, (rect.right - rect.left) * rate * ppi, (rect.bottom - rect.top) * rate * ppi);
    }
    
    //console.log("rLeft:" + rect.left + ",rTop:" + rect.top + ",window.bodyOffset[0]:" + window.bodyOffset[0] + ",window.bodyOffset[1]:" + window.bodyOffset[1] + ",ppi:" + ppi);
}

function changeMapPositionAndSizeForScroll(mapCtrl) {
    var ppi = getSystemPPI();
    var rate = detectZoom() / 100 / ppi;
    if (rate == 1) {
        var x = window.outerWidth - window.innerWidth;
        var y = window.outerHeight - window.innerHeight;
        console.log("x:" + x);
        console.log("y:" + y);
        if (x <= 0 && y < 0) { //最大化时，计算出来的值为负，不正常，故使用上一次保存的值
            if(gFullScreenLeft == 0 && gFullScreenTop == 0){
                var e = document.createEvent("Event");
                e.initEvent("resize", true, true);
                window.dispatchEvent(e);
            }
            window.bodyOffset = [gFullScreenLeft, gFullScreenTop];
        } else {
            if (gIsOpera) { //opera自带左侧边栏
                if (x > 0 && x != 40) {
                    x = -4;
                    y -= 15;
                } else {

                }
            }
            if (gIsChrome || gIsFirefox || gIsIE) {
                if (x > 0) { //当为非最大化状态时，对top进行修正
                    y -= x;
                    x = 0;
                }
            }
            if(isFullScreen() && gFullScreenLeft == 0 && gFullScreenTop == 0){
                gFullScreenLeft = x;
                gFullScreenTop = y;
            }
            if(isFullScreen()){
                window.bodyOffset = [gFullScreenLeft, gFullScreenTop];
            }else{
                window.bodyOffset = [x, y];
            }
        }
    } else {

    }
    var scrollLeft = window.pageXOffset;
    var scrollTop = window.pageYOffset;
    var rect = document.getElementById(mapCtrl.div).getBoundingClientRect();
    var dLeft = getElementLeft(document.getElementById(mapCtrl.div));
    var dTop = getElementTop(document.getElementById(mapCtrl.div));
    //var left = dLeft - scrollLeft + window.bodyOffset[0];
    //var top = dTop - scrollTop + window.bodyOffset[1];
    var left = dLeft - scrollLeft ;
    var top = dTop - scrollTop;
    var barWidth = getScrollbarWidth();
    var delWidth = document.body.scrollWidth - window.innerWidth + barWidth;
    var delHeight = document.body.scrollHeight - window.innerHeight + barWidth;

    var type = 0;
    if (delHeight == 0 && delWidth == 0) { //双滚动条
        type = 0;
    } else if (delHeight != 0 && delWidth == 0) { //垂直滚动条
        type = 1;
    } else if (delHeight == 0 && delWidth != 0) { //水平滚动条
        type = 2;
    }
    console.log("dLeft:" + dLeft + ",dTop:" + dTop + ",left:" + left + ",top:" + top + ",delWidth:" + delWidth + ",delHeight" + delHeight);
    
    //mapCtrl.ChangePositionAndSizeForScroll(left, top, (rect.right - rect.left) * rate * ppi, (rect.bottom - rect.top) * rate * ppi, type, barWidth, window.bodyOffset[1]);
    if(getBrowser() == "Chrome" || getBrowser() == "IE" || getBrowser() == "Opera"){
        mapCtrl.ChangePositionAndSizeForScroll(left * rate, top * rate, (rect.right - rect.left) * rate * ppi, (rect.bottom - rect.top) * rate * ppi, type, barWidth, window.bodyOffset[1]);
    }else if(getBrowser() == "Firefox"){
        mapCtrl.ChangePositionAndSizeForScroll(left + window.bodyOffset[0], top + window.bodyOffset[1], (rect.right - rect.left) * rate * ppi, (rect.bottom - rect.top) * rate * ppi, type, barWidth, window.bodyOffset[1]);
    }
}

function getElementLeft(ele) {
    var actualLeft = ele.offsetLeft;
    var current = ele.offsetParent;
    while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    return actualLeft;
}

function getElementTop(ele) {
    var actualTop = ele.offsetTop;
    var current = ele.offsetParent;
    while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }
    return actualTop;
}

function getScrollbarWidth() {
    var oP = document.createElement('p'),
        styles = {
            width: '100px',
            height: '100px',
            overflowY: 'scroll'
        },
        i, scrollbarWidth;
    for (i in styles) oP.style[i] = styles[i];
    document.body.appendChild(oP);
    scrollbarWidth = oP.offsetWidth - oP.clientWidth;
    document.body.removeChild(oP);
    return scrollbarWidth;
}

//兼容ie11自定义事件
(function () {
    if (typeof window.CustomEvent === "function")
        return false;

    function CustomEvent(event, params) {
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    //CustomEvent.prototype = window.event.prototype;
    window.CustomEvent = CustomEvent;
})();

function ConnectParams(type, info) {
    var result = type + ":" + info;
    return result;
}

function initWebsocket(ctrlObj) {
    var wsServer = 'ws://' + ctrlObj.localIp + ':' + ctrlObj.localPort; //'ws://127.0.0.1:9002'; 
    gWs = new WebSocket(wsServer);
    ctrlObj.isConnect = false;
    gWs.onopen = function (evt) {
        onOpen(evt)
    };
    gWs.onclose = function (evt) {
        onClose(evt)
    };
    gWs.onmessage = function (evt) {
        onMessage(evt)
    };
    gWs.onerror = function (evt) {
        onError(evt)
    };

    function onOpen(evt) {
        if (!ctrlObj.isConnect) {
            console.log("连接服务器成功");
            ctrlObj.isConnect = true;
            sendMsg();
        }
    }

    function onClose(evt) {
        console.log("Disconnected");
        ctrlObj.isConnect = false;
        //initWebsocket(ctrlObj);
    }

    function onMessage(evt) {
        var array = new Array();
        array = evt.data.split('|');
        if (array[0] == "Event") {
            if (eventBind(array, "FireOnLButtonDown")) {

            } else if (eventBind(array, "FireOnLButtonUp")) {

            } else if (eventBind(array, "FireOnLButtonDblClk")) {

            } else if (eventBind(array, "FireOnMButtonDown")) {

            } else if (eventBind(array, "FireOnMButtonUp")) {

            } else if (eventBind(array, "FireOnMButtonDblClk")) {

            } else if (eventBind(array, "FireOnRButtonDown")) {

            } else if (eventBind(array, "FireOnRButtonUp")) {

            } else if (eventBind(array, "FireOnLButtonUp")) {

            } else if (eventBind(array, "FireOnRButtonDblClk")) {

            } else if (eventBind(array, "FireMouseHover")) {

            } else if (eventBind(array, "FireOnMouseWheel")) {

            } else if (eventBind(array, "FireOnKeyDown")) {

            } else if (eventBind(array, "FireOnKeyUp")) {

            } else if (eventBind(array, "FireOnLayerNotify")) {

            } else if (eventBind(array, "FireOnResponserNotify")) {

            } else if (eventBind(array, "FireOnOperationNotify")) {

            } else if (eventBind(array, "FireOnDeserializeNotify")) {

            } else if (eventBind(array, "FireOnFullScreenState")) {

            } else if (eventBind(array, "FireOnMouseMove")) {

            } else if (eventBind(array, "FireOnToolsNotify")) {

            }
        } else if (array[0] == "Objid") {

        } else if (array[0] == "Fdtid") {
            if (typeof (socketQueue['i_' + array[1]]) == 'function') {
                exeFunc = socketQueue['i_' + array[1]];
                exeFunc(array[3]);
                delete socketQueue['i_' + array[1]];
                return;
            } else {
                console.log('no match id:' + array[1]);
            }
        } else if(array[0] == "SystemPPI"){
            systemPpi = parseFloat(array[1]);
            if (hasScrollbar(ctrlObj)) {
                changeMapPositionAndSizeForScroll(ctrlObj);
            } else {
                changeMapPositionAndSize(ctrlObj);
            }
        }
    }

    function eventBind(array, eventName) {
        if (array[1] == eventName) {
            var event = new CustomEvent(eventName, {
                detail: {
                    value: array[2]
                }
            });
            document.dispatchEvent(event);
            return true;
        } else {
            return false;
        }
    }

    function onError(evt) {
        console.log('Error occured: ' + evt.data);
    }
    
    function sendMsg() {
        var browser = getBrowser();
        if (ctrlObj.isConnect) {
            var x = window.outerWidth - window.innerWidth;
            var y = window.outerHeight - window.innerHeight;
            //console.log("window.bodyOffset[0]:" + x);
            //console.log("window.bodyOffset[1]:" + y);
            if (gIsOpera) { //opera自带左侧边栏,暂不实现
                if (x > 0 && x != 40) {
                    x = -4;
                    y -= 15;
                }
            }
            if (gIsChrome || gIsFirefox || gIsIE) {
                if (x > 0) { //当为非最大化状态时，对top进行修正
                    x = 0;
                    y -= 16;
                }
            }
            window.bodyOffset = [x, y];
            var title = document.title;

            var rect = document.getElementById(ctrlObj.div).getBoundingClientRect();
            var left = rect.left + window.bodyOffset[0];
            var top = rect.top + window.bodyOffset[1];
            var width = rect.right - rect.left;
            var height = rect.bottom - rect.top;
            gWs.send(ConnectParams("objid", ctrlObj.objid) + '|.CooGisSDKCtrl|' + left + '#' + top + '#' + width + '#' + height + '#' + title + '#' + browser + '#');
            ctrlObj.InitLic(ctrlObj.licIp + "@" + ctrlObj.licPort + "@");
            ctrlObj.GetSystemPPI();
            ctrlObj.FloatingWindow(ctrlObj.floatingUrl);
            ctrlObj.success();
        } else {
            console.log("failed");
        }
    }

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState == "visible") {
            if(gShowState){
                if (hasScrollbar(ctrlObj)) {
                    changeMapPositionAndSizeForScroll(ctrlObj);
                } else {
                    changeMapPositionAndSize(ctrlObj);
                }
            }
        } else {
            if(gShowState){
                ctrlObj.HideMap();
            }
        }
    });
    
    window.onbeforeunload = function () {
        ctrlObj.CloseMap();
    };
    
    window.onresize = function () {
        if(gShowState){
            if (hasScrollbar(ctrlObj)) {
                changeMapPositionAndSizeForScroll(ctrlObj);
            } else {
                changeMapPositionAndSize(ctrlObj);
            }
        }
    };
    
    window.onscroll = function (e) {
        if(gShowState){
            changeMapPositionAndSizeForScroll(ctrlObj);
        }
    };
}

//////////////////////////////////////////SDKCTRL
function CooGisSDKCtrl(props) {
    this.licIp = props.licIp || '127.0.0.1';
    this.licPort = props.licPort || '8102';
    this.div = props.div || NULL;
    this.floatingUrl = props.floatingUrl || '';
    this.isConnect = props.isConnect || false;
    this.success = props.success;
    this.objid = gId++;
    this.eventOnLButtonUp = props.eventOnLButtonUp;
    this.eventOnLayerNotify = props.eventOnLayerNotify;
    this.getFundamentalType = props.getFundamentalType;
    this.localIp = '127.0.0.1';
    this.localPort = '9002';
    this.windowShowSytle = props.windowSytle || true;
    if (gWs == null) {
        console.log("CooGisSDKCtrl.init");
        initWebsocket(this);
    }
}

function createCooGisSDKCtrl(props) {
    return new CooGisSDKCtrl(props || {});
}

CooGisSDKCtrl.prototype.ChangePositionAndSize = function (left, top, width, height) {
    if (this.isConnect) {
        gWs.send('objid:-2|' + this.objid + '.ChangePositionAndSize|' + left + '#' + top + '#' + width + '#' + height + '#');
    }
};

CooGisSDKCtrl.prototype.ChangePositionAndSizeForScroll = function (left, top, width, height, type, barWidth, delTop) {
    if (this.isConnect) {
        gWs.send('objid:-2|' + this.objid + '.ChangePositionAndSizeForScroll|' + left + '#' + top + '#' + width + '#' + height + '#' + type + '#' + barWidth + '#' + delTop + '#');
    }
};
CooGisSDKCtrl.prototype.HideWindow = function(){
    gShowState = false;
    this.HideMap();
};

CooGisSDKCtrl.prototype.ShowWindow = function(){
    gShowState = true;
    if(gShowState){
        if (hasScrollbar(this)) {
            changeMapPositionAndSizeForScroll(this);
        } else {
            changeMapPositionAndSize(this);
        }
    }
};

CooGisSDKCtrl.prototype.Destroy = function(){
    gWs.close();
    gWs = null;
};

CooGisSDKCtrl.prototype.HideMap = function () {
    if (this.isConnect) {
        gWs.send('objid:-2|' + this.objid + '.HideMap|');
    }
};

CooGisSDKCtrl.prototype.CloseMap = function () {
    if (this.isConnect) {
        gWs.send('objid:-2|' + this.objid + '.CloseMap|');
    }
};

CooGisSDKCtrl.prototype.FloatingWindow = function(url){
    if(this.isConnect){
        gWs.send('objid:-2|' + this.objid + '.FloatingWindow|' + url + '#');
    }
}

CooGisSDKCtrl.prototype.ShowFloatingWindow = function(){
    if(this.isConnect){
        gWs.send('objid:-2|' + this.objid + '.ShowFloatingWindow|');
    }
}
CooGisSDKCtrl.prototype.HideFloatingWindow = function(){
    if(this.isConnect){
        gWs.send('objid:-2|' + this.objid + '.HideFloatingWindow|');
    }
}
CooGisSDKCtrl.prototype.GetSystemPPI = function(){
    if (this.isConnect) {
        gWs.send('objid:-2|' + this.objid + '.GetSystemPPI|');
    }
}
CooGisSDKCtrl.prototype.GetIMapMgrPtr = function () {
    var obj = createIMapMgr();
    if (this.isConnect) {
        gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetIMapMgrPtr|');
    }
    return obj;
};

CooGisSDKCtrl.prototype.GetSDKPath = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (this.isConnect) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetSDKPath|');
    }
    return obj;
};

CooGisSDKCtrl.prototype.GetIToolsCOMPtr = function () {
    var obj = createIToolsManager();
    if (this.isConnect) {
        gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetIToolsCOMPtr|');
    }
    return obj;
};

CooGisSDKCtrl.prototype.SetFullScreenState = function (state) {
    if (this.isConnect) {
        if (state.fdtid) {
            gWs.send('|' + this.objid + '.SetFullScreenState|' + ConnectParams("fdtid", state.fdtid) + '#');
        } else {
            gWs.send('|' + this.objid + '.SetFullScreenState|' + ConnectParams("VARIANT_BOOL", state) + '#');
        }
    }
};

CooGisSDKCtrl.prototype.GetCurrentVer = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (this.isConnect) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetCurrentVer|');
    }
    return obj;
};

CooGisSDKCtrl.prototype.RefreshCtrl = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (this.isConnect) {
        gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.RefreshCtrl|');
    }
    return obj;
};

CooGisSDKCtrl.prototype.InitLic = function (info, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (this.isConnect) {
        if (info.fdtid) {
            gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.InitLic|' + ConnectParams("fdtid", info.fdtid) + '#');
        } else {
            gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.InitLic|' + ConnectParams("BSTR", info) + '#');
        }
    }
    return obj;
};

CooGisSDKCtrl.prototype.Recycle = function (info) {
    if (this.isConnect) {
        if (info.objid) {
            gWs.send('|' + this.objid + '.Recycle|' + ConnectParams("objid", info.objid) + '#');
        } else if (info.fdtid) {
            gWs.send('|' + this.objid + '.Recycle|' + ConnectParams("fdtid", info.fdtid) + '#');
        } else {
            gWs.send('|' + this.objid + '.Recycle|' + ConnectParams("LONG", info) + '#');
        }
    }
}

////////////////////////////////////////////////////shadow ctrl
function reconnectWebsocket(ctrlObj) {
    var wsServer = 'ws://' + ctrlObj.localIp + ':' + ctrlObj.localPort; //'ws://127.0.0.1:9002'; 
    gWs = new WebSocket(wsServer);
    gWs.onopen = function (evt) {
        onOpen(evt)
    };
    gWs.onclose = function (evt) {
        onClose(evt)
    };
    gWs.onmessage = function (evt) {
        onMessage(evt)
    };
    gWs.onerror = function (evt) {
        onError(evt)
    };

    function onOpen(evt) {
            console.log("连接服务器成功");
            gWs.send(ConnectParams("objid", -1) + '|.GetCooGisSDKCtrl|');
            ctrlObj.success();
    }

    function onClose(evt) {
        console.log("Disconnected");
    }

    function onMessage(evt) {
        var array = new Array();
        array = evt.data.split('|');
        if (array[0] == "Event") {
            if (eventBind(array, "FireOnLButtonDown")) {

            } else if (eventBind(array, "FireOnLButtonUp")) {

            } else if (eventBind(array, "FireOnLButtonDblClk")) {

            } else if (eventBind(array, "FireOnMButtonDown")) {

            } else if (eventBind(array, "FireOnMButtonUp")) {

            } else if (eventBind(array, "FireOnMButtonDblClk")) {

            } else if (eventBind(array, "FireOnRButtonDown")) {

            } else if (eventBind(array, "FireOnRButtonUp")) {

            } else if (eventBind(array, "FireOnLButtonUp")) {

            } else if (eventBind(array, "FireOnRButtonDblClk")) {

            } else if (eventBind(array, "FireMouseHover")) {

            } else if (eventBind(array, "FireOnMouseWheel")) {

            } else if (eventBind(array, "FireOnKeyDown")) {

            } else if (eventBind(array, "FireOnKeyUp")) {

            } else if (eventBind(array, "FireOnLayerNotify")) {

            } else if (eventBind(array, "FireOnResponserNotify")) {

            } else if (eventBind(array, "FireOnOperationNotify")) {

            } else if (eventBind(array, "FireOnDeserializeNotify")) {

            } else if (eventBind(array, "FireOnFullScreenState")) {

            } else if (eventBind(array, "FireOnMouseMove")) {

            } else if (eventBind(array, "FireOnToolsNotify")) {

            }
        } else if (array[0] == "Objid") {

        } else if (array[0] == "Fdtid") {
            if (typeof (socketQueue['i_' + array[1]]) == 'function') {
                exeFunc = socketQueue['i_' + array[1]];
                exeFunc(array[3]);
                delete socketQueue['i_' + array[1]];
                return;
            } else {
                console.log('no match id:' + array[1]);
            }
        }
    }

    function eventBind(array, eventName) {
        if (array[1] == eventName) {
            var event = new CustomEvent(eventName, {
                detail: {
                    value: array[2]
                }
            });
            document.dispatchEvent(event);
            return true;
        } else {
            return false;
        }
    }

    function onError(evt) {
        console.log('Error occured: ' + evt.data);
    }
}
function ShadowCooGisSDKCtrl(props) {
    this.localIp = props.localIp ||'127.0.0.1';
    this.localPort = props.localPort || '9002';
    this.objid = gId++;
    gId = 10000;
    this.success = props.success;
    if (gWs == null) {
        console.log("ShadowCooGisSDKCtrl.init");
        reconnectWebsocket(this);
    }
}

ShadowCooGisSDKCtrl.prototype.GetIMapMgrPtr = function () {
    var obj = createIMapMgr();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetIMapMgrPtr|');
    return obj;
};

ShadowCooGisSDKCtrl.prototype.GetSDKPath = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetSDKPath|');
    return obj;
};

ShadowCooGisSDKCtrl.prototype.GetIToolsCOMPtr = function () {
    var obj = createIToolsManager();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetIToolsCOMPtr|');
    return obj;
};

ShadowCooGisSDKCtrl.prototype.SetFullScreenState = function (state) {
    if (state.fdtid) {
        gWs.send('|' + this.objid + '.SetFullScreenState|' + ConnectParams("fdtid", state.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetFullScreenState|' + ConnectParams("VARIANT_BOOL", state) + '#');
    }
};

ShadowCooGisSDKCtrl.prototype.GetCurrentVer = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetCurrentVer|');
    return obj;
};

ShadowCooGisSDKCtrl.prototype.RefreshCtrl = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.RefreshCtrl|');
    return obj;
};

ShadowCooGisSDKCtrl.prototype.InitLic = function (info, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (info.fdtid) {
        gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.InitLic|' + ConnectParams("fdtid", info.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.InitLic|' + ConnectParams("BSTR", info) + '#');
    }
    return obj;
};

function getCooGisSDKCtrl(props){
    return new ShadowCooGisSDKCtrl(props || {});
}
///-----------------------------------///ILayerObject
function ILayerObject(props) {
    this.type = props.type || '';
    this.layerOptionsObj = props.layerOptionsObj || null;
    this.objid = gId++;
    this.GetLayerIDObj = null;
    this.GetLayerResultObj = null;
}

function createILayerObject(props) {
    return new ILayerObject(props || {});
}

ILayerObject.prototype.GetLayerID = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetLayerID|');
    return obj;
};

ILayerObject.prototype.GetLayerUID = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetLayerUID|');
    return obj;
};

ILayerObject.prototype.GetLayerName = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetLayerName|');
    return obj;
};

ILayerObject.prototype.SetLayerName = function (name) {
    if (name.fdtid) {
        gWs.send('|' + this.objid + '.SetLayerName|' + ConnectParams("fdtid", name.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetLayerName|' + ConnectParams("BSTR", name) + '#');
    }
};

ILayerObject.prototype.GetVisible = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.GetVisible|');
    return obj;
};

ILayerObject.prototype.SetVisible = function (state) {
    if (state.fdtid) {
        gWs.send('|' + this.objid + '.SetVisible|' + ConnectParams("fdtid", state.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetVisible|' + ConnectParams("VARIANT_BOOL", state) + '#');
    }
};

ILayerObject.prototype.Update = function (type, opt) {
    var param1 = "";
    if (type.fdtid) {
        param1 = ConnectParams("fdtid", type.fdtid);
    } else {
        param1 = ConnectParams("BSTR", type);
    }
    gWs.send('|' + this.objid + '.Update|' + param1 + '#' + ConnectParams("objid", opt.objid) + '#');
};

ILayerObject.prototype.Locate = function () {
    gWs.send('|' + this.objid + '.Locate|');
};
ILayerObject.prototype.UpdateLayerOptions = function (pLayerOptions) {
    gWs.send('|' + this.objid + '.UpdateLayerOptions|' + ConnectParams("objid", pLayerOptions.objid) + '#');
};

ILayerObject.prototype.GetLayerOptions = function () {
    var obj = createILayerOptions();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetLayerOptions|');
    return obj;
};

ILayerObject.prototype.AddObserver = function () {
    gWs.send('|' + this.objid + '.AddObserver|');
};

ILayerObject.prototype.DelObserver = function () {
    gWs.send('|' + this.objid + '.DelObserver|');
};

ILayerObject.prototype.GetLayerResult = function () {
    var obj = createILayerOptions();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetLayerResult|');
    return obj;
};

ILayerObject.prototype.SerializeLayer = function (filePath) {
    if (filePath.fdtid) {
        gWs.send('|' + this.objid + '.SerializeLayer|' + ConnectParams("fdtid", filePath.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SerializeLayer|' + ConnectParams("BSTR", filePath) + '#');
    }
};
// ILayerObject.prototype.BindMapView = function (mapviewId) {

// };
// ILayerObject.prototype.UnBindMapView = function (mapviewId) {

// };
///-----------------------------------///

///-----------------------------------///IPosition
function IPosition(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIPosition(props) {
    return new IPosition(props || {});
}

IPosition.prototype.SetX = function (x) {
    if (x.fdtid) {
        gWs.send('|' + this.objid + '.SetX|' + ConnectParams("fdtid", x.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetX|' + ConnectParams("DOUBLE", x) + '#');
    }
};

IPosition.prototype.SetY = function (y) {
    if (y.fdtid) {
        gWs.send('|' + this.objid + '.SetY|' + ConnectParams("fdtid", y.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetY|' + ConnectParams("DOUBLE", y) + '#');
    }
};

IPosition.prototype.SetZ = function (z) {
    if (z.fdtid) {
        gWs.send('|' + this.objid + '.SetZ|' + ConnectParams("fdtid", z.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetZ|' + ConnectParams("DOUBLE", z) + '#');
    }
};

IPosition.prototype.GetX = function (reFunc) {
    var obj = createIDouble();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("DOUBLE", obj.fdtid) + '|' + this.objid + '.GetX|');
    return obj;
};

IPosition.prototype.GetY = function (reFunc) {
    var obj = createIDouble();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("DOUBLE", obj.fdtid) + '|' + this.objid + '.GetY|');
    return obj;
};

IPosition.prototype.GetZ = function (reFunc) {
    var obj = createIDouble();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("DOUBLE", obj.fdtid) + '|' + this.objid + '.GetZ|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IDataSourceObject
function IDataSourceObject(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIDataSourceObject(props) {
    return new IDataSourceObject(props || {});
}

IDataSourceObject.prototype.Initial = function (iDataSourceOptions) {
    var obj = createIDataSourceOptions();
    gWs.send('|' + this.objid + '.Initial|' + ConnectParams("objid", iDataSourceOptions.objid) + '#');
};

IDataSourceObject.prototype.GetLayerInfo = function (layerIndex, layerConfigKey, reFunc) {
    var param1 = "";
    var param2 = "";
    if (layerIndex.fdtid) {
        param1 = ConnectParams("fdtid", layerIndex.fdtid);
    } else {
        param1 = ConnectParams("UINT", layerIndex);
    }
    if (layerConfigKey.fdtid) {
        param2 = ConnectParams("fdtid", layerConfigKey.fdtid)
    } else {
        param2 = ConnectParams("BSTR", layerConfigKey);
    }
    var obj = createIBstr();
    if (arguments.length == 3) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetLayerInfo|' + param1 + '#' + param2 + '#');
    return obj;
};

IDataSourceObject.prototype.GetLayerCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetLayerCount|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IResourceLibrary
function IResourceLibrary(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIResourceLibrary(props) {
    return new IResourceLibrary(props || {});
}

IResourceLibrary.prototype.AddResource = function (iResource) {
    gWs.send('|' + this.objid + '.AddResource|' + ConnectParams("objid", iResource.objid) + '#');
};

IResourceLibrary.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};

IResourceLibrary.prototype.SetName = function (name) {
    if (name.fdtid) {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("fdtid", name.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("BSTR", name) + '#');
    }
};
///-----------------------------------///

///-----------------------------------///IFeatureModelLayer
function IFeatureModelLayer(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIFeatureModelLayer(props) {
    return new IFeatureModelLayer(props || {});
}

IFeatureModelLayer.prototype.SetLayerID = function (id) {
    if (id.fdtid) {
        gWs.send('|' + this.objid + '.SetLayerID|' + ConnectParams("fdtid", id.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetLayerID|' + ConnectParams("LONG", id) + '#');
    }
};

IFeatureModelLayer.prototype.GetLayerID = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetLayerID|');
    return obj;
};

IFeatureModelLayer.prototype.GetMaxFeatureID = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetMaxFeatureID|');
    return obj;
};

IFeatureModelLayer.prototype.GetFeatureById = function (id, iFeature, reFunc) {
    var param1 = "";
    if (id.fdtid) {
        param1 = ConnectParams("fdtid", id.fdtid);
    } else {
        param1 = ConnectParams("LONG", id);
    }
    var obj = createIBool();
    if (arguments.length == 3) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.GetFeatureById|' + param1 + '#' + ConnectParams("objid", iFeature.objid) + '#');
    return obj;
};

IFeatureModelLayer.prototype.GetFeatureByPick = function (iFeature, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.GetFeatureByPick|' + ConnectParams("objid", iFeature.objid) + '#');
    return obj;
};

IFeatureModelLayer.prototype.DeleteFeature = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.DeleteFeature|');
    return obj;
};

IFeatureModelLayer.prototype.AddFeature = function (iFeature) {
    gWs.send('|' + this.objid + '.AddFeature|' + ConnectParams("objid", iFeature.objid) + '#');
};

IFeatureModelLayer.prototype.SaveLayer = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.SaveLayer|');
    return obj;
};

IFeatureModelLayer.prototype.SaveAsLayer = function (path, reFunc) {
    var param1 = "";
    if (path.fdtid) {
        param1 = ConnectParams("fdtid", path.fdtid);
    } else {
        param1 = ConnectParams("BSTR", path);
    }
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.SaveAsLayer|' + param1 + '#');
    return obj;
};

IFeatureModelLayer.prototype.GetNearestFeatureId = function (posX, posY, posZ, range, reFunc) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    var param4 = "";
    if (posX.fdtid) {
        param1 = ConnectParams("fdtid", posX.fdtid);
    } else {
        param1 = ConnectParams("DOUBLE", posX);
    }
    if (posY.fdtid) {
        param2 = ConnectParams("fdtid", posY.fdtid)
    } else {
        param2 = ConnectParams("DOUBLE", posY);
    }
    if (posZ.fdtid) {
        param3 = ConnectParams("fdtid", posZ.fdtid)
    } else {
        param3 = ConnectParams("DOUBLE", posZ);
    }
    if (range.fdtid) {
        param4 = ConnectParams("fdtid", range.fdtid)
    } else {
        param4 = ConnectParams("DOUBLE", range);
    }
    var obj = createIBstr();
    if (arguments.length == 5) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetNearestFeatureId|' + param1 + '#' + param2 + '#' + param3 + '#' + param4 + '#');
};

IFeatureModelLayer.prototype.SetHighlight = function (r, g, b, a, state) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    var param4 = "";
    var param5 = "";
    if (r.fdtid) {
        param1 = ConnectParams("fdtid", r.fdtid);
    } else {
        param1 = ConnectParams("DOUBLE", r);
    }
    if (g.fdtid) {
        param2 = ConnectParams("fdtid", g.fdtid);
    } else {
        param2 = ConnectParams("DOUBLE", g);
    }
    if (b.fdtid) {
        param3 = ConnectParams("fdtid", b.fdtid);
    } else {
        param3 = ConnectParams("DOUBLE", b);
    }
    if (a.fdtid) {
        param4 = ConnectParams("fdtid", a.fdtid);
    } else {
        param4 = ConnectParams("DOUBLE", a);
    }
    if (state.fdtid) {
        param4 = ConnectParams("fdtid", state.fdtid);
    } else {
        param4 = ConnectParams("VARIANT_BOOL", state);
    }
    gWs.send('|' + this.objid + '.SetHighlight|' + param1 + '#' + param2 + '#' + param3 + '#' + param4 + '#' + param5 + '#');
};

IFeatureModelLayer.prototype.GetFeatureSchema = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetFeatureSchema|');
    return obj;
};

IFeatureModelLayer.prototype.SetEditType = function (type) {
    if (type.fdtid) {
        gWs.send('|' + this.objid + '.SetEditType|' + ConnectParams("fdtid", type.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetEditType|' + ConnectParams("SHORT", type) + '#');
    }
};

IFeatureModelLayer.prototype.GetEditType = function (reFunc) {
    var obj = createIShort();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("SHORT", obj.fdtid) + '|' + this.objid + '.GetEditType|');
    return obj;
};

IFeatureModelLayer.prototype.SaveVectorEdit = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.SaveVectorEdit|');
    return obj;
};

IFeatureModelLayer.prototype.CancelVectorEdit = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.CancelVectorEdit|');
    return obj;
};

IFeatureModelLayer.prototype.DeleteFeatureByGeoPos = function (posX, posY, posZ, reFunc) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    if (posX.fdtid) {
        param1 = ConnectParams("fdtid", posX.fdtid);
    } else {
        param1 = ConnectParams("DOUBLE", posX);
    }
    if (posY.fdtid) {
        param2 = ConnectParams("fdtid", posY.fdtid)
    } else {
        param2 = ConnectParams("DOUBLE", posY);
    }
    if (posZ.fdtid) {
        param3 = ConnectParams("fdtid", posZ.fdtid)
    } else {
        param3 = ConnectParams("DOUBLE", posZ);
    }
    var obj = createIBool();
    if (arguments.length == 4) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.DeleteFeatureByGeoPos|' + param1 + '#' + param2 + '#' + param3 + '#');
    return obj;
};

IFeatureModelLayer.prototype.UpdateFeatureByNew = function (iOldFeature, iNewFeature, reFunc) {
    var obj = createIBool();
    if (arguments.length == 3) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.UpdateFeatureByNew|' + ConnectParams("objid", iOldFeature.objid) + '#' + ConnectParams("objid", iNewFeature.objid) + '#');
    return obj;
};

IFeatureModelLayer.prototype.UpdateFeatureById = function (id, iNewFeature, reFunc) {
    var param1 = "";
    if (id.fdtid) {
        param1 = ConnectParams("fdtid", id.fdtid);
    } else {
        param1 = ConnectParams("LONG", id);
    }
    var obj = createIBool();
    if (arguments.length == 3) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.UpdateFeatureByNew|' + param1 + '#' + ConnectParams("objid", iNewFeature.objid) + '#');
    return obj;
};

IFeatureModelLayer.prototype.CreateFeatureCursor = function (MinXPos, MaxXPos, MinYPos, MaxYPos, reFunc) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    var param4 = "";
    if (MinXPos.fdtid) {
        param1 = ConnectParams("fdtid", MinXPos.fdtid);
    } else {
        param1 = ConnectParams("DOUBLE", MinXPos);
    }
    if (MaxXPos.fdtid) {
        param2 = ConnectParams("fdtid", MaxXPos.fdtid);
    } else {
        param2 = ConnectParams("DOUBLE", MaxXPos);
    }
    if (MinYPos.fdtid) {
        param3 = ConnectParams("fdtid", MinYPos.fdtid);
    } else {
        param3 = ConnectParams("DOUBLE", MinYPos);
    }
    if (MaxYPos.fdtid) {
        param4 = ConnectParams("fdtid", MaxYPos.fdtid);
    } else {
        param4 = ConnectParams("DOUBLE", MaxYPos);
    }
    var obj = createIBool();
    if (arguments.length == 5) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.CreateFeatureCursor|' + param1 + '#' + param2 + '#' + param3 + '#' + param4 + '#');
    return obj;
};

IFeatureModelLayer.prototype.GetNextFeature = function (iFeature, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.GetNextFeature|' + ConnectParams("objid", iFeature.objid) + '#');
    return obj;
};

IFeatureModelLayer.prototype.ClearFeatureCursor = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.ClearFeatureCursor|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IResponserObject
function IResponserObject(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIResponserObject(props) {
    return new IResponserObject(props || {});
}

IResponserObject.prototype.GetResponserUID = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetResponserUID|');
    return obj;
};

IResponserObject.prototype.GetResponserTypeName = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetResponserTypeName|');
    return obj;
};

IResponserObject.prototype.SetResponserType = function (type) {
    if (type.fdtid) {
        gWs.send('|' + this.objid + '.SetResponserType|' + ConnectParams("fdtid", type.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetResponserType|' + ConnectParams("BSTR", type) + '#');
    }
};

IResponserObject.prototype.GetEnabled = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.GetEnabled|');
    return obj;
};

IResponserObject.prototype.SetEnabled = function (state) {
    if (state.fdtid) {
        gWs.send('|' + this.objid + '.SetEnabled|' + ConnectParams("fdtid", state.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetEnabled|' + ConnectParams("VARIANT_BOOL", state) + '#');
    }
};

IResponserObject.prototype.UpdateResponserOptions = function (respo, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.UpdateResponserOptions|' + ConnectParams("objid", respo.objid) + '#');
    return obj;
};

IResponserObject.prototype.GetResponserOptions = function () {
    var obj = createIResponserOption();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetResponserOptions|');
    return obj;
};

IResponserObject.prototype.GetResponserResult = function () {
    var obj = createIResponserOption();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetResponserResult|');
    return obj;
};

IResponserObject.prototype.AddObserver = function () {
    gWs.send('|' + this.objid + '.AddObserver|');
};

IResponserObject.prototype.DelObserver = function () {
    gWs.send('|' + this.objid + '.DelObserver|');
};
///-----------------------------------///

///-----------------------------------///IAnalysisLayer
function IAnalysisLayer(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIAnalysisLayer(props) {
    return new IAnalysisLayer(props || {});
}

IAnalysisLayer.prototype.UpdateLayerOptions = function (LayerOptions) {
    gWs.send('|' + this.objid + '.UpdateLayerOptions|' + ConnectParams("objid", LayerOptions.objid) + '#');
};

IAnalysisLayer.prototype.SetLayerID = function (layerID) {
    if (layerID.fdtid) {
        gWs.send('|' + this.objid + '.SetLayerID|' + ConnectParams("fdtid", layerID.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetLayerID|' + ConnectParams("LONG", layerID) + '#');
    }
};
///-----------------------------------///

///-----------------------------------///IParticleSystemLayer
function IParticleSystemLayer(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIParticleSystemLayer(props) {
    return new IParticleSystemLayer(props || {});
}

IParticleSystemLayer.prototype.SetLayerID = function (id) {
    if (id.fdtid) {
        gWs.send('|' + this.objid + '.SetLayerID|' + ConnectParams("fdtid", id.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetLayerID|' + ConnectParams("LONG", id) + '#');
    }
};

IParticleSystemLayer.prototype.AddParticles = function (groupName, nb, position, velocity, zone, emitter, full) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    var param4 = "";
    var param5 = "";
    var param6 = "";
    var param7 = "";
    if (groupName.fdtid) {
        param1 = ConnectParams("fdtid", groupName.fdtid);
    } else {
        param1 = ConnectParams("BSTR", groupName);
    }
    if (nb.fdtid) {
        param2 = ConnectParams("fdtid", nb.fdtid)
    } else {
        param2 = ConnectParams("LONG", nb);
    }
    if (position.fdtid) {
        param3 = ConnectParams("fdtid", position.fdtid);
    } else {
        param3 = ConnectParams("BSTR", position);
    }
    if (velocity.fdtid) {
        param4 = ConnectParams("fdtid", velocity.fdtid);
    } else {
        param4 = ConnectParams("BSTR", velocity);
    }
    if (zone.fdtid) {
        param5 = ConnectParams("fdtid", zone.fdtid);
    } else {
        param5 = ConnectParams("BSTR", zone);
    }
    if (emitter.fdtid) {
        param6 = ConnectParams("fdtid", emitter.fdtid);
    } else {
        param6 = ConnectParams("BSTR", emitter);
    }
    if (full.fdtid) {
        param7 = ConnectParams("fdtid", full.fdtid);
    } else {
        param7 = ConnectParams("VARIANT_BOOL", full);
    }
    gWs.send('|' + this.objid + '.AddParticles|' + param1 + '#' + param2 + '#' + param3 + '#' + param4 + '#' + param5 + '#' + param6 + '#' + param7 + '#');
};

IParticleSystemLayer.prototype.UpdateParticle = function (particleGroupIndex, particleIndex, position, velocity) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    var param4 = "";
    if (particleGroupIndex.fdtid) {
        param1 = ConnectParams("fdtid", particleGroupIndex.fdtid);
    } else {
        param1 = ConnectParams("LONG", particleGroupIndex);
    }
    if (particleIndex.fdtid) {
        param2 = ConnectParams("fdtid", particleIndex.fdtid)
    } else {
        param2 = ConnectParams("LONG", particleIndex);
    }
    if (position.fdtid) {
        param3 = ConnectParams("fdtid", position.fdtid);
    } else {
        param3 = ConnectParams("BSTR", position);
    }
    if (velocity.fdtid) {
        param4 = ConnectParams("fdtid", velocity.fdtid);
    } else {
        param4 = ConnectParams("BSTR", velocity);
    }
    gWs.send('|' + this.objid + '.UpdateParticle|' + param1 + '#' + param2 + '#' + param3 + '#' + param4 + '#');
};

IParticleSystemLayer.prototype.GetParticlePosition = function (particleGroupIndex, particleIndex, reFunc) {
    var param1 = "";
    var param2 = "";
    if (particleGroupIndex.fdtid) {
        param1 = ConnectParams("fdtid", particleGroupIndex.fdtid);
    } else {
        param1 = ConnectParams("LONG", particleGroupIndex);
    }
    if (particleIndex.fdtid) {
        param2 = ConnectParams("fdtid", particleIndex.fdtid)
    } else {
        param2 = ConnectParams("LONG", particleIndex);
    }
    var obj = createIBstr();
    if (arguments.length == 3) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetParticlePosition|' + param1 + '#' + param2 + '#');
    return obj;
};

IParticleSystemLayer.prototype.GetParticleVelocity = function (particleGroupIndex, particleIndex, reFunc) {
    var param1 = "";
    var param2 = "";
    if (particleGroupIndex.fdtid) {
        param1 = ConnectParams("fdtid", particleGroupIndex.fdtid);
    } else {
        param1 = ConnectParams("LONG", particleGroupIndex);
    }
    if (particleIndex.fdtid) {
        param2 = ConnectParams("fdtid", particleIndex.fdtid)
    } else {
        param2 = ConnectParams("LONG", particleIndex);
    }
    var obj = createIBstr();
    if (arguments.length == 3) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetParticleVelocity|' + param1 + '#' + param2 + '#');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IOperationObject
function IOperationObject(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIOperationObject(props) {
    return new IOperationObject(props || {});
}

IOperationObject.prototype.SetOperationGUID = function (operationGUID, reFunc) {
    var param1 = "";
    if (operationGUID.fdtid) {
        param1 = ConnectParams("fdtid", operationGUID.fdtid);
    } else {
        param1 = ConnectParams("INT", operationGUID);
    }
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.SetOperationGUID|' + param1 + '#');
    return obj;
};

IOperationObject.prototype.GetOperationGUID = function (reFunc) {
    var obj = createIInt();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("INT", obj.fdtid) + '|' + this.objid + '.GetOperationGUID|');
    return obj;
};

IOperationObject.prototype.UpdateOperationOptions = function (LayerOptions) {
    gWs.send('|' + this.objid + '.UpdateOperationOptions|' + ConnectParams("objid", LayerOptions.objid) + '#');
};

IOperationObject.prototype.AddObserver = function () {
    gWs.send('|' + this.objid + '.AddObserver|');
};

IOperationObject.prototype.DelObserver = function () {
    gWs.send('|' + this.objid + '.DelObserver|');
};

IOperationObject.prototype.GetOperationResult = function () {
    var obj = createIOperationOption();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetOperationResult|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IToolsObject
function IToolsObject(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIToolsObject(props) {
    return new IToolsObject(props || {});
}

IToolsObject.prototype.SetToolsID = function (id) {
    if (id.fdtid) {
        gWs.send('|' + this.objid + '.SetToolsID|' + ConnectParams("fdtid", id.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetToolsID|' + ConnectParams("LONG", id) + '#');
    }
};

IToolsObject.prototype.GetToolsID = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetToolsID|');
    return obj;
};

IToolsObject.prototype.GetToolsTypeName = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetToolsTypeName|');
    return obj;
};

IToolsObject.prototype.UpdateToolsOptions = function (pLayerOptions) {
    gWs.send('|' + this.objid + '.UpdateToolsOptions|' + ConnectParams("objid", pLayerOptions.objid) + '#');
};

IToolsObject.prototype.GetToolsOptions = function () {
    var obj = createIToolsOptions();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetToolsOptions|');
    return obj;
};

IToolsObject.prototype.GetToolsResult = function () {
    var obj = createIToolsOptions();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetToolsResult|');
    return obj;
};

IToolsObject.prototype.AddObserver = function () {
    gWs.send('|' + this.objid + '.AddObserver|');
};

IToolsObject.prototype.DelObserver = function () {
    gWs.send('|' + this.objid + '.DelObserver|');
};

IToolsObject.prototype.Active = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.Active|');
    return obj;
};

IToolsObject.prototype.Deactive = function () {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.Deactive|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IRefrenceSystem
///-----------------------------------///

///-----------------------------------///IMapViewObject
///-----------------------------------///
///-----------------------------------///ILayerOptions
function ILayerOptions(optName) {
    this.name = optName;
    this.map = new Map();
    this.objid = gId++;
    this.GetConfigValueByKeyObj = null;
}

function createILayerOptions(name) {
    return new ILayerOptions(name);
}

ILayerOptions.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
    this.map.set(key, value);
};
ILayerOptions.prototype.GetConfigSetCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetConfigSetCount|');
    return obj;
};
ILayerOptions.prototype.GetConfigKeyByIndex = function (index, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (index.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("fdtid", index.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("LONG", index) + '#');
    }
    return obj;
};
ILayerOptions.prototype.GetConfigValueByKey = function (key, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (key.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("fdtid", key.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("BSTR", key) + '#');
    }
    return obj;
};
ILayerOptions.prototype.GetLayerOptionsTypeName = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetLayerOptionsTypeName|');
    return obj;
};
ILayerOptions.prototype.SetName = function (name) {
    if (name.fdtid) {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("fdtid", name.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("BSTR", name) + '#');
    }
};
///-----------------------------------///

///-----------------------------------///IStyle
function IStyle(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIStyle(props) {
    return new IStyle(props || {});
}
IStyle.prototype.SetName = function (name) {
    if (name.fdtid) {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("fdtid", name.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("BSTR", name) + '#');
    }
};
IStyle.prototype.AddSymbol = function (symbolType, config) {
    var param1 = "";
    var param2 = "";
    if (symbolType.fdtid) {
        param1 = ConnectParams("fdtid", symbolType.fdtid);
    } else {
        param1 = ConnectParams("BSTR", symbolType);
    }
    if (config.fdtid) {
        param2 = ConnectParams("fdtid", config.fdtid)
    } else {
        param2 = ConnectParams("BSTR", config);
    }
    gWs.send('|' + this.objid + '.AddSymbol|' + param1 + '#' + param2 + '#');
};
IStyle.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};
IStyle.prototype.AddFilterName = function (filterName) {
    if (filterName.fdtid) {
        gWs.send('|' + this.objid + '.AddFilterName|' + ConnectParams("fdtid", filterName.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.AddFilterName|' + ConnectParams("BSTR", filterName) + '#');
    }
};
///-----------------------------------///

///-----------------------------------///ISymbolObject
function ISymbolObject(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createISymbolObject(props) {
    return new ISymbolObject(props || {});
}
ISymbolObject.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
ISymbolObject.prototype.SetType = function (type) {
    if (type.fdtid) {
        gWs.send('|' + this.objid + '.SetType|' + ConnectParams("fdtid", type.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetType|' + ConnectParams("BSTR", type) + '#');
    }
};
ISymbolObject.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};
ISymbolObject.prototype.GetType = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetType|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IStyleSheet
function IStyleSheet(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIStyleSheet(props) {
    return new IStyleSheet(props || {});
}
IStyleSheet.prototype.AddStyle = function (style) {
    if (style.fdtid) {
        gWs.send('|' + this.objid + '.AddStyle|' + ConnectParams("fdtid", style.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.AddStyle|' + ConnectParams("BSTR", style) + '#');
    }
};
IStyleSheet.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};
IStyleSheet.prototype.AddStyleSelector = function (styleName) {
    if (styleName.fdtid) {
        gWs.send('|' + this.objid + '.AddStyleSelector|' + ConnectParams("fdtid", styleName.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.AddStyleSelector|' + ConnectParams("BSTR", styleName) + '#');
    }
};
IStyleSheet.prototype.SetNumExpression = function (expression) {
    if (expression.fdtid) {
        gWs.send('|' + this.objid + '.SetNumExpression|' + ConnectParams("fdtid", expression.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetNumExpression|' + ConnectParams("BSTR", expression) + '#');
    }
};
IStyleSheet.prototype.SetStrExpression = function (expression) {
    if (expression.fdtid) {
        gWs.send('|' + this.objid + '.SetStrExpression|' + ConnectParams("fdtid", expression.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetStrExpression|' + ConnectParams("BSTR", expression) + '#');
    }
};
IStyleSheet.prototype.AddResLib = function (reslib) {
    if (reslib.fdtid) {
        gWs.send('|' + this.objid + '.AddResLib|' + ConnectParams("fdtid", reslib.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.AddResLib|' + ConnectParams("BSTR", reslib) + '#');
    }
};
///-----------------------------------///

///-----------------------------------///IDataSourceOptions
function IDataSourceOptions(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIDataSourceOptions(props) {
    return new IDataSourceOptions(props || {});
}
IDataSourceOptions.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IDataSourceOptions.prototype.SetDataSourceTypeName = function (dataSourceTypeName) {
    if (dataSourceTypeName.fdtid) {
        gWs.send('|' + this.objid + '.SetDataSourceTypeName|' + ConnectParams("fdtid", dataSourceTypeName.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetDataSourceTypeName|' + ConnectParams("BSTR", dataSourceTypeName) + '#');
    }
};
IDataSourceOptions.prototype.GetDataSourceTypeName = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetDataSourceTypeName|');
    return obj;
};
IDataSourceOptions.prototype.GetConfigSetCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetConfigSetCount|');
    return obj;
};
IDataSourceOptions.prototype.GetConfigKeyByIndex = function (index, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (index.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("fdtid", index.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("LONG", index) + '#');
    }
    return obj;
};
IDataSourceOptions.prototype.GetConfigValueByKey = function (key, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (key.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("fdtid", key.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("BSTR", key) + '#');
    }
    return obj;
};
///-----------------------------------///

///-----------------------------------///IResourceObject
function IResourceObject(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIResourceObject(props) {
    return new IResourceObject(props || {});
}
IResourceObject.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IResourceObject.prototype.SetType = function (type) {
    if (type.fdtid) {
        gWs.send('|' + this.objid + '.SetType|' + ConnectParams("fdtid", type.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetType|' + ConnectParams("BSTR", type) + '#');
    }
};
IResourceObject.prototype.GetType = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetType|');
    return obj;
};
IResourceObject.prototype.GetConfigSetCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetConfigSetCount|');
    return obj;
};
IResourceObject.prototype.GetConfigKeyByIndex = function (index, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (index.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("fdtid", index.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("LONG", index) + '#');
    }
    return obj;
};
IResourceObject.prototype.GetConfigValueByKey = function (key, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (key.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("fdtid", key.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("BSTR", key) + '#');
    }
    return obj;
};
///-----------------------------------///

///-----------------------------------///IResponserOption
function IResponserOption(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIResponserOption(props) {
    return new IResponserOption(props || {});
}
IResponserOption.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IResponserOption.prototype.GetConfigSetCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetConfigSetCount|');
    return obj;
};
IResponserOption.prototype.GetConfigKeyByIndex = function (index, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (index.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("fdtid", index.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("LONG", index) + '#');
    }
    return obj;
};
IResponserOption.prototype.GetConfigValueByKey = function (key, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (key.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("fdtid", key.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("BSTR", key) + '#');
    }
    return obj;
};
///-----------------------------------///

///-----------------------------------///IParticleRender
function IParticleRender(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIParticleRender(props) {
    return new IParticleRender(props || {});
}
IParticleRender.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IParticleRender.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IParticleModel
function IParticleModel(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIParticleModel(props) {
    return new IParticleModel(props || {});
}
IParticleModel.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IParticleModel.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IParticleEmitter
function IParticleEmitter(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIParticleEmitter(props) {
    return new IParticleEmitter(props || {});
}
IParticleEmitter.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IParticleEmitter.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IParticleGroup
function IParticleGroup(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIParticleGroup(props) {
    return new IParticleGroup(props || {});
}
IParticleGroup.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IParticleGroup.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IParticleZone
function IParticleZone(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIParticleZone(props) {
    return new IParticleZone(props || {});
}
IParticleZone.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IParticleZone.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IParticleModifier
function IParticleModifier(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIParticleModifier(props) {
    return new IParticleModifier(props || {});
}
IParticleModifier.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IParticleModifier.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IOperationOption
function IOperationOption(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIOperationOption(props) {
    return new IOperationOption(props || {});
}
IOperationOption.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IOperationOption.prototype.GetConfigSetCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetConfigSetCount|');
    return obj;
};
IOperationOption.prototype.GetConfigKeyByIndex = function (index, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (index.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("fdtid", index.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("LONG", index) + '#');
    }
    return obj;
};
IOperationOption.prototype.GetConfigValueByKey = function (key, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (key.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("fdtid", key.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("BSTR", key) + '#');
    }
    return obj;
};
IOperationOption.prototype.GetUpdateOptionsTypeName = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetUpdateOptionsTypeName|');
    return obj;
};
IOperationOption.prototype.SetName = function (name) {
    if (name.fdtid) {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("fdtid", name.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("BSTR", name) + '#');
    }
};
///-----------------------------------///

///-----------------------------------///IFeature
function IFeature(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIFeature(props) {
    return new IFeature(props || {});
}
IFeature.prototype.GetFeatureId = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetFeatureId|');
    return obj;
};
IFeature.prototype.SetFeatureId = function (featureId) {
    if (featureId.fdtid) {
        gWs.send('|' + this.objid + '.SetFeatureId|' + ConnectParams("fdtid", featureId.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetFeatureId|' + ConnectParams("LONG", featureId) + '#');
    }
};
IFeature.prototype.SetGeometryType = function (type) {
    if (type.fdtid) {
        gWs.send('|' + this.objid + '.SetGeometryType|' + ConnectParams("fdtid", type.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetGeometryType|' + ConnectParams("SHORT", type) + '#');
    }
};
IFeature.prototype.GetGeometryType = function (reFunc) {
    var obj = createIShort();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("SHORT", obj.fdtid) + '|' + this.objid + '.GetGeometryType|');
    return obj;
};
IFeature.prototype.SetComponentType = function (type) {
    if (type.fdtid) {
        gWs.send('|' + this.objid + '.SetComponentType|' + ConnectParams("fdtid", type.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetComponentType|' + ConnectParams("SHORT", type) + '#');
    }
};
IFeature.prototype.GetComponentType = function (reFunc) {
    var obj = createIShort();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("SHORT", obj.fdtid) + '|' + this.objid + '.GetComponentType|');
    return obj;
};
IFeature.prototype.AddAttribute = function (name, value, type, reFunc) {
    var obj = createIBool();
    var param1 = "";
    var param2 = "";
    var param3 = "";
    if (name.fdtid) {
        param1 = ConnectParams("fdtid", name.fdtid);
    } else {
        param1 = ConnectParams("BSTR", name);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid);
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    if (type.fdtid) {
        param3 = ConnectParams("fdtid", type.fdtid);
    } else {
        param3 = ConnectParams("SHORT", type.fdtid);
    }
    if (arguments.length == 4) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.AddAttribute|' + param1 + '#' + param2 + '#' + param3 + '#');
    return obj;
};
IFeature.prototype.GetAttributeValueByName = function (name, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (name.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetAttributeValueByName|' + ConnectParams("fdtid", name.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetAttributeValueByName|' + ConnectParams("BSTR", name) + '#');
    }
    return obj;
};
IFeature.prototype.GetAttributeTypeByName = function (name, reFunc) {
    var obj = createIShort();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (name.fdtid) {
        gWs.send(ConnectParams("SHORT", obj.fdtid) + '|' + this.objid + '.GetAttributeTypeByName|' + ConnectParams("fdtid", name.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("SHORT", obj.fdtid) + '|' + this.objid + '.GetAttributeTypeByName|' + ConnectParams("BSTR", name) + '#');
    }
    return obj;
};
IFeature.prototype.AddPoint = function (posX, posY, posZ) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    if (posX.fdtid) {
        param1 = ConnectParams("fdtid", posX.fdtid);
    } else {
        param1 = ConnectParams("DOUBLE", posX);
    }
    if (posY.fdtid) {
        param2 = ConnectParams("fdtid", posY.fdtid)
    } else {
        param2 = ConnectParams("DOUBLE", posY);
    }
    if (posZ.fdtid) {
        param3 = ConnectParams("fdtid", posZ.fdtid)
    } else {
        param3 = ConnectParams("DOUBLE", posZ);
    }
    gWs.send('|' + this.objid + '.AddPoint|' + param1 + '#' + param2 + '#' + param3 + '#');
};
IFeature.prototype.AddPoints = function (bstrPoints) {
    if (bstrPoints.fdtid) {
        gWs.send('|' + this.objid + '.AddPoints|' + ConnectParams("fdtid", bstrPoints.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.AddPoints|' + ConnectParams("BSTR", bstrPoints) + '#');
    }
};
IFeature.prototype.GetPoints = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetPoints|');
    return obj;
};
IFeature.prototype.ClearFeature = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.ClearFeature|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IToolsOptions
function IToolsOptions(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIToolsOptions(props) {
    return new IToolsOptions(props || {});
}
IToolsOptions.prototype.AddConfig = function (key, value) {
    var param1 = "";
    var param2 = "";
    if (key.fdtid) {
        param1 = ConnectParams("fdtid", key.fdtid);
    } else {
        param1 = ConnectParams("BSTR", key);
    }
    if (value.fdtid) {
        param2 = ConnectParams("fdtid", value.fdtid)
    } else {
        param2 = ConnectParams("BSTR", value);
    }
    gWs.send('|' + this.objid + '.AddConfig|' + param1 + '#' + param2 + '#');
};
IToolsOptions.prototype.GetConfigSetCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetConfigSetCount|');
    return obj;
};
IToolsOptions.prototype.GetConfigKeyByIndex = function (index, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (index.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("fdtid", index.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigKeyByIndex|' + ConnectParams("LONG", index) + '#');
    }
    return obj;
};
IToolsOptions.prototype.GetConfigValueByKey = function (key, reFunc) {
    var obj = createIBstr();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    if (key.fdtid) {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("fdtid", key.fdtid) + '#');
    } else {
        gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfigValueByKey|' + ConnectParams("BSTR", key) + '#');
    }
    return obj;
};
IToolsOptions.prototype.GetToolsOptionsTypeName = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetToolsOptionsTypeName|');
    return obj;
};
IToolsOptions.prototype.SetName = function (name) {
    if (name.fdtid) {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("fdtid", name.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("BSTR", name) + '#');
    }
};
///-----------------------------------///

///-----------------------------------///IGeometry
function IGeometry(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIGeometry(props) {
    return new IGeometry(props || {});
}
IGeometry.prototype.SetType = function (type) {
    if (type.fdtid) {
        gWs.send('|' + this.objid + '.SetType|' + ConnectParams("fdtid", type.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetType|' + ConnectParams("LONG", type) + '#');
    }
};
IGeometry.prototype.GetType = function (reFunc) {
    var obj = createIShort();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("SHORT", obj.fdtid) + '|' + this.objid + '.GetType|');
    return obj;
};
IGeometry.prototype.AddPoints = function (points) {
    if (points.fdtid) {
        gWs.send('|' + this.objid + '.AddPoints|' + ConnectParams("fdtid", points.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.AddPoints|' + ConnectParams("BSTR", points) + '#');
    }
};
IGeometry.prototype.GetPoints = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetPoints|');
    return obj;
};
IGeometry.prototype.GetConfig = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetConfig|');
    return obj;
};
///-----------------------------------///
///-----------------------------------///ITransformate
function ITransformate(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createITransformate(props) {
    return new ITransformate(props || {});
}
ITransformate.prototype.ScreenPosToWorldPos = function (screenX, screenY) {
    var param1 = "";
    var param2 = "";
    if (screenX.fdtid) {
        param1 = ConnectParams("fdtid", screenX.fdtid);
    } else {
        param1 = ConnectParams("INT", screenX);
    }
    if (screenY.fdtid) {
        param2 = ConnectParams("fdtid", screenY.fdtid)
    } else {
        param2 = ConnectParams("INT", screenY);
    }
    var obj = createIPosition();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.ScreenPosToWorldPos|' + param1 + '#' + param2 + '#');
    return obj;
};
ITransformate.prototype.ConvertCoordBySRS = function (srcPos, srcSRS, destSRS) {
    var param1 = "";
    var param2 = "";
    if (srcSRS.fdtid) {
        param1 = ConnectParams("fdtid", srcSRS.fdtid);
    } else {
        param1 = ConnectParams("BSTR", srcSRS);
    }
    if (destSRS.fdtid) {
        param2 = ConnectParams("fdtid", destSRS.fdtid)
    } else {
        param2 = ConnectParams("BSTR", destSRS);
    }
    var obj = createIPosition();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.ConvertCoordBySRS|' + ConnectParams("objid", srcPos.objid) + '#' + param1 + '#' + param2 + '#');
    return obj;
};
ITransformate.prototype.ConvertXYZToLongLatHeight = function (sPos) {
    var obj = createIPosition();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.ConvertXYZToLongLatHeight|' + ConnectParams("objid", sPos.objid) + '#');
    return obj;
};
ITransformate.prototype.ConvertLongLatHeightToXYZ = function (sPos) {
    var obj = createIPosition();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.ConvertLongLatHeightToXYZ|' + ConnectParams("objid", sPos.objid) + '#');
    return obj;
};
ITransformate.prototype.GetNewPosByTranslate = function (srcPos, tX, tY, tZ) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    if (tX.fdtid) {
        param1 = ConnectParams("fdtid", tX.fdtid);
    } else {
        param1 = ConnectParams("DOUBLE", tX);
    }
    if (tY.fdtid) {
        param2 = ConnectParams("fdtid", tY.fdtid)
    } else {
        param2 = ConnectParams("DOUBLE", tY);
    }
    if (tZ.fdtid) {
        param3 = ConnectParams("fdtid", tZ.fdtid)
    } else {
        param3 = ConnectParams("DOUBLE", tZ);
    }
    var obj = createIPosition();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetNewPosByTranslate|' + ConnectParams("objid", srcPos.objid) + '#' + param1 + '#' + param2 + '#' + param3 + '#');
    return obj;
};
ITransformate.prototype.JudgePointInFivePoint = function (srcPos, firstPos, secondPos, thirdPos, forthPos, fifthPos, reFunc) {
    var obj = createIBool();
    if (arguments.length == 7) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.JudgePointInFivePoint|' + ConnectParams("objid", srcPos.objid) + '#' + ConnectParams("objid", firstPos.objid) + '#' + ConnectParams("objid", secondPos.objid) + '#' + ConnectParams("objid", thirdPos.objid) + '#' + ConnectParams("objid", forthPos.objid) + '#' + ConnectParams("objid", fifthPos.objid) + '#');
    return obj;
};
ITransformate.prototype.ConvertLongLatHeightToScreen = function (sPos) {
    var obj = createIPosition();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.ConvertLongLatHeightToScreen|' + ConnectParams("objid", sPos.objid) + '#');
    return obj;
};
///-----------------------------------///
///-----------------------------------///ILayerGroup
function ILayerGroup(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createILayerGroup(props) {
    return new ILayerGroup(props || {});
}
ILayerGroup.prototype.AddLayer = function (iLayerObject, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.AddLayer|' + ConnectParams("objid", iLayerObject.objid) + '#');
    return obj;
};
ILayerGroup.prototype.RemoveLayer = function (layerObject, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.RemoveLayer|' + ConnectParams("objid", layerObject.objid) + '#');
    return obj;
};
ILayerGroup.prototype.GetLayerCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetLayerCount|');
    return obj;
};
ILayerGroup.prototype.GetLayerGroupCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("LONG", obj.fdtid) + '|' + this.objid + '.GetLayerGroupCount|');
    return obj;
};
ILayerGroup.prototype.SetVisible = function (state) {
    if (state.fdtid) {
        gWs.send('|' + this.objid + '.SetVisible|' + ConnectParams("fdtid", state.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetVisible|' + ConnectParams("VARIANT_BOOL", state) + '#');
    }
};
ILayerGroup.prototype.GetVisible = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.GetVisible|');
    return obj;
};
ILayerGroup.prototype.GetName = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetName|');
    return obj;
};
ILayerGroup.prototype.SetName = function (name) {
    if (name.fdtid) {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("fdtid", name.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetName|' + ConnectParams("BSTR", name) + '#');
    }
};
ILayerGroup.prototype.AddLayerGroup = function (iLayerGroup, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.AddLayerGroup|' + ConnectParams("objid", iLayerGroup.objid) + '#');
    return obj;
};
ILayerGroup.prototype.RemoveLayerGroup = function (iLayerGroup, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.RemoveLayerGroup|' + ConnectParams("objid", iLayerGroup.objid) + '#');
    return obj;
};
ILayerGroup.prototype.GetLayerGroupByIndex = function (index) {
    var param1 = "";
    if (index.fdtid) {
        param1 = ConnectParams("fdtid", index.fdtid);
    } else {
        param1 = ConnectParams("LONG", index);
    }
    var obj = createILayerGroup();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetLayerGroupByIndex|' + param1 + '#');
    return obj;
};
ILayerGroup.prototype.GetLayerByIndex = function (index) {
    var param1 = "";
    if (index.fdtid) {
        param1 = ConnectParams("fdtid", index.fdtid);
    } else {
        param1 = ConnectParams("LONG", index);
    }
    var obj = createILayerObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetLayerByIndex|' + param1 + '#');
    return obj;
};
///-----------------------------------///
///-----------------------------------///IMapMgr
function IMapMgr(props) {
    this.objid = gId++;
}

function createIMapMgr(props) {
    return new IMapMgr(props || {});
}
IMapMgr.prototype.CreateLayerOptions = function (name) {
    var param1 = "";
    if (name.fdtid) {
        param1 = ConnectParams("fdtid", name.fdtid);
    } else {
        param1 = ConnectParams("BSTR", name);
    }
    var obj = createILayerOptions();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateLayerOptions|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreateSymbol = function (type) {
    var param1 = "";
    if (type.fdtid) {
        param1 = ConnectParams("fdtid", type.fdtid);
    } else {
        param1 = ConnectParams("BSTR", type);
    }
    var obj = createISymbolObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateSymbol|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreateStyle = function (name) {
    var param1 = "";
    if (name.fdtid) {
        param1 = ConnectParams("fdtid", name.fdtid);
    } else {
        param1 = ConnectParams("BSTR", name);
    }
    var obj = createIStyle();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateStyle|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreateStyleSheet = function () {
    var obj = createIStyleSheet();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateStyleSheet|');
    return obj;
};
IMapMgr.prototype.AddLayer = function (iLayerObject, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.AddLayer|' + ConnectParams("objid", iLayerObject.objid) + '#');
    return obj;
};
IMapMgr.prototype.AddLayerGroup = function (iLayerGroup) {
    gWs.send('|' + this.objid + '.AddLayerGroup|' + ConnectParams("objid", iLayerGroup.objid) + '#');
};
IMapMgr.prototype.AddLayerGroupChild = function (fatherGroup, iLayerGroup) {
    gWs.send('|' + this.objid + '.AddLayerGroupChild|' + ConnectParams("objid", fatherGroup.objid) + '#' + ConnectParams("objid", iLayerGroup.objid) + '#');
};
IMapMgr.prototype.RemoveLayer = function (layer, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.RemoveLayer|' + ConnectParams("objid", layer.objid) + '#');
    return obj;
};
IMapMgr.prototype.RemoveLayerGroup = function (iLayerGroup, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.RemoveLayer|' + ConnectParams("objid", iLayerGroup.objid) + '#');
    return obj;
};
IMapMgr.prototype.RemoveAll = function (reFunc) {
    var obj = createIBool();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.RemoveAll|');
    return obj;
};
IMapMgr.prototype.GetLayerCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send('LONG' + '|' + this.objid + '.GetLayerCount|');
    return obj;
};
IMapMgr.prototype.GetLayerGroupCount = function (reFunc) {
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send('LONG' + '|' + this.objid + '.GetLayerGroupCount|');
    return obj;
};
IMapMgr.prototype.GetLayerIDByIndex = function (index, reFunc) {
    var param1 = "";
    if (index.fdtid) {
        param1 = ConnectParams("fdtid", index.fdtid);
    } else {
        param1 = ConnectParams("LONG", index);
    }
    var obj = createILong();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send('LONG' + '|' + this.objid + '.GetLayerIDByIndex|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreatePosition = function (x, y, z) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    if (x.fdtid) {
        param1 = ConnectParams("fdtid", x.fdtid);
    } else {
        param1 = ConnectParams("DOUBLE", x);
    }
    if (y.fdtid) {
        param2 = ConnectParams("fdtid", y.fdtid)
    } else {
        param2 = ConnectParams("DOUBLE", y);
    }
    if (z.fdtid) {
        param3 = ConnectParams("fdtid", z.fdtid);
    } else {
        param3 = ConnectParams("DOUBLE", z);
    }
    var obj = createIPosition();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreatePosition|' + param1 + '#' + param2 + '#' + param3 + '#');
    return obj;
};
IMapMgr.prototype.CreateNavigation = function () {
    var obj = createINavigate();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateNavigation|');
    return obj;
};
IMapMgr.prototype.CreateTransformation = function () {
    var obj = createITransformate();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateTransformation|');
    return obj;
};
IMapMgr.prototype.CreateDataSourceOptions = function (dataSourceTypeName) {
    var param1 = "";
    if (dataSourceTypeName.fdtid) {
        param1 = ConnectParams("fdtid", dataSourceTypeName.fdtid);
    } else {
        param1 = ConnectParams("BSTR", dataSourceTypeName);
    }
    var obj = createIDataSourceOptions();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateDataSourceOptions|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreateDataSource = function (iDataSourceOptions) {
    var obj = createIDataSourceObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateDataSource|' + ConnectParams("objid", iDataSourceOptions.objid) + '#');
    return obj;
};
IMapMgr.prototype.CreateParticleModifier = function () {
    var obj = createIParticleModifier();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateParticleModifier|');
    return obj;
};
IMapMgr.prototype.CreateResource = function (symbol) {
    var param1 = "";
    if (symbol.fdtid) {
        param1 = ConnectParams("fdtid", symbol.fdtid);
    } else {
        param1 = ConnectParams("BSTR", symbol);
    }
    var obj = createIResourceObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateResource|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreateResourceLibrary = function (name) {
    var param1 = "";
    if (name.fdtid) {
        param1 = ConnectParams("fdtid", name.fdtid);
    } else {
        param1 = ConnectParams("BSTR", name);
    }
    var obj = createIResourceLibrary();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateResourceLibrary|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.GetFeatureModelLayer = function (layerId) {
    var param1 = "";
    if (layerId.fdtid) {
        param1 = ConnectParams("fdtid", layerId.fdtid);
    } else {
        param1 = ConnectParams("LONG", layerId);
    }
    var obj = createIFeatureModelLayer();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetFeatureModelLayer|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.GetLayerGroupByIndex = function (index) {
    var param1 = "";
    if (index.fdtid) {
        param1 = ConnectParams("fdtid", index.fdtid);
    } else {
        param1 = ConnectParams("LONG", index);
    }
    var obj = createILayerGroup();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetLayerGroupByIndex|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.GetLayerByIndex = function (index) {
    var param1 = "";
    if (index.fdtid) {
        param1 = ConnectParams("fdtid", index.fdtid);
    } else {
        param1 = ConnectParams("LONG", index);
    }
    var obj = createILayerObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetLayerByIndex|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.GetAnalysisLayer = function (layerID) {
    var param1 = "";
    if (layerID.fdtid) {
        param1 = ConnectParams("fdtid", layerID.fdtid);
    } else {
        param1 = ConnectParams("LONG", layerID);
    }
    var obj = createIAnalysisLayer();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetAnalysisLayer|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreateLayer = function (layerType, iLayerOptions) {
    //var obj = createILayerObject({ type: layerType, layerOptionsObj: iLayerOptions });
    var param1 = "";
    if (layerType.fdtid) {
        param1 = ConnectParams("fdtid", layerType.fdtid);
    } else {
        param1 = ConnectParams("BSTR", layerType);
    }
    var obj = createILayerObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateLayer|' + param1 + '#' + ConnectParams("objid", iLayerOptions.objid) + "#");
    return obj;
};
IMapMgr.prototype.CreateResponser = function (type, opt) {
    var param1 = "";
    if (type.fdtid) {
        param1 = ConnectParams("fdtid", type.fdtid);
    } else {
        param1 = ConnectParams("BSTR", type);
    }
    var obj = createIResponserObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateResponser|' + param1 + '#' + ConnectParams("objid", opt.objid) + "#");
    return obj;
};
IMapMgr.prototype.AddResponser = function (rsp, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.AddResponser|' + ConnectParams("objid", rsp.objid) + '#');
    return obj;
};
IMapMgr.prototype.RemoveResponser = function (type, reFunc) {
    var param1 = "";
    if (type.fdtid) {
        param1 = ConnectParams("fdtid", type.fdtid);
    } else {
        param1 = ConnectParams("BSTR", type);
    }
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.RemoveResponser|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreateResponserOptions = function (name) {
    var param1 = "";
    if (name.fdtid) {
        param1 = ConnectParams("fdtid", name.fdtid);
    } else {
        param1 = ConnectParams("BSTR", name);
    }
    var obj = createIResponserOption();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateResponserOptions|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreateParticleRender = function () {
    var obj = createIParticleRender();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateParticleRender|');
    return obj;
};
IMapMgr.prototype.CreateParticleModel = function () {
    var obj = createIParticleModel();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateParticleModel|');
    return obj;
};
IMapMgr.prototype.CreateParticleEmitter = function () {
    var obj = createIParticleEmitter();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateParticleEmitter|');
    return obj;
};
IMapMgr.prototype.CreateParticleGroup = function () {
    var obj = createIParticleGroup();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateParticleGroup|');
    return obj;
};
IMapMgr.prototype.CreateParticleZone = function () {
    var obj = createIParticleZone();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateParticleZone|');
    return obj;
};
IMapMgr.prototype.GetParticleSystemLayer = function (layerId) {
    var param1 = "";
    if (layerId.fdtid) {
        param1 = ConnectParams("fdtid", layerId.fdtid);
    } else {
        param1 = ConnectParams("LONG", layerId);
    }
    var obj = createIParticleSystemLayer();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetParticleSystemLayer|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.DeserializeLayer = function (filePath) {
    var param1 = "";
    if (filePath.fdtid) {
        param1 = ConnectParams("fdtid", filePath.fdtid);
    } else {
        param1 = ConnectParams("BSTR", filePath);
    }
    var obj = createILayerObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.DeserializeLayer|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.SerializeMap = function (filePath) {
    if (filePath.fdtid) {
        gWs.send('|' + this.objid + '.SerializeMap|' + ConnectParams("fdtid", filePath.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SerializeMap|' + ConnectParams("BSTR", filePath) + '#');
    }
};
IMapMgr.prototype.DeserializeMap = function (filePath, readType) {
    var param1 = "";
    var param2 = "";
    if (filePath.fdtid) {
        param1 = ConnectParams("fdtid", filePath.fdtid);
    } else {
        param1 = ConnectParams("BSTR", filePath);
    }
    if (readType.fdtid) {
        param2 = ConnectParams("fdtid", readType.fdtid);
    } else {
        param2 = ConnectParams("LONG", readType);
    }
    gWs.send('|' + this.objid + '.DeserializeMap|' + param1 + '#' + param2 + '#');
};
IMapMgr.prototype.CreateFeature = function () {
    var obj = createIFeature();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateFeature|');
    return obj;
};
IMapMgr.prototype.CreateOperationOptions = function (name) {
    var param1 = "";
    if (name.fdtid) {
        param1 = ConnectParams("fdtid", name.fdtid);
    } else {
        param1 = ConnectParams("BSTR", name);
    }
    var obj = createIOperationOption();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateOperationOptions|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreateOperation = function (layerType, opt) {
    var param1 = "";
    if (layerType.fdtid) {
        param1 = ConnectParams("fdtid", layerType.fdtid);
    } else {
        param1 = ConnectParams("BSTR", layerType);
    }
    var obj = createIOperationObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateOperation|' + param1 + '#' + ConnectParams("objid", opt.objid) + '#');
    return obj;
};
IMapMgr.prototype.AddOperation = function (iOperationObject, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.AddOperation|' + ConnectParams("objid", iOperationObject.objid) + '#');
    return obj;
};
IMapMgr.prototype.RemoveOperation = function (iOperationObject, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.RemoveOperation|' + ConnectParams("objid", iOperationObject.objid) + '#');
    return obj;
};
IMapMgr.prototype.CreateLayerGroup = function (name) {
    var param1 = "";
    if (name.fdtid) {
        param1 = ConnectParams("fdtid", name.fdtid);
    } else {
        param1 = ConnectParams("BSTR", name);
    }
    var obj = createILayerGroup();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateLayerGroup|' + param1 + '#');
    return obj;
};
IMapMgr.prototype.GetLayerGroupChildByIndex = function (fatherGroup, index) {
    var param1 = "";
    if (index.fdtid) {
        param1 = ConnectParams("fdtid", index.fdtid);
    } else {
        param1 = ConnectParams("LONG", index);
    }
    var obj = createILayerGroup();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetLayerGroupChildByIndex|' + ConnectParams("objid", fatherGroup.objid) + '#' + param1 + '#');
    return obj;
};
IMapMgr.prototype.CreateRoam = function () {
    var obj = createIRoam();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateRoam|');
    return obj;
};
IMapMgr.prototype.SetParame = function (parameType, parameValue, reFunc) {
    var param1 = "";
    var param2 = "";
    if (parameType.fdtid) {
        param1 = ConnectParams("fdtid", parameType.fdtid);
    } else {
        param1 = ConnectParams("BSTR", parameType);
    }
    if (parameValue.fdtid) {
        param2 = ConnectParams("fdtid", parameValue.fdtid);
    } else {
        param2 = ConnectParams("BSTR", parameValue);
    }
    var obj = createIBool();
    if (arguments.length == 3) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.SetParame|' + param1 + '#' + param2 + '#');
};
IMapMgr.prototype.CreateGeometry = function () {
    var obj = createIGeometry();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateGeometry|');
    return obj;
};
IMapMgr.prototype.GetLayerObject = function (layerID) {
    var param1 = "";
    if (layerID.fdtid) {
        param1 = ConnectParams("fdtid", layerID.fdtid);
    } else {
        param1 = ConnectParams("LONG", layerID);
    }
    var obj = createILayerObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetLayerObject|' + param1 + '#');
    return obj;
};
///-----------------------------------///
///-----------------------------------///INavigate
function INavigate(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createINavigate(props) {
    return new INavigate(props || {});
}
INavigate.prototype.SetPosition = function (focalPosition) {
    gWs.send('|' + this.objid + '.SetPosition|' + ConnectParams("objid", focalPosition.objid) + '#');
};
INavigate.prototype.SetAzimuth = function (azimuth) {
    if (azimuth.fdtid) {
        gWs.send('|' + this.objid + '.SetAzimuth|' + ConnectParams("fdtid", azimuth.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetAzimuth|' + ConnectParams("DOUBLE", azimuth) + '#');
    }
};
INavigate.prototype.SetZenith = function (zenith) {
    if (zenith.fdtid) {
        gWs.send('|' + this.objid + '.SetZenith|' + ConnectParams("fdtid", zenith.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetZenith|' + ConnectParams("DOUBLE", zenith) + '#');
    }
};
INavigate.prototype.SetDistance = function (distance) {
    if (distance.fdtid) {
        gWs.send('|' + this.objid + '.SetDistance|' + ConnectParams("fdtid", distance.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetDistance|' + ConnectParams("DOUBLE", distance) + '#');
    }
};
INavigate.prototype.SetFlyTime = function (flyTime) {
    if (flyTime.fdtid) {
        gWs.send('|' + this.objid + '.SetFlyTime|' + ConnectParams("fdtid", flyTime.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetFlyTime|' + ConnectParams("DOUBLE", flyTime) + '#');
    }
};
INavigate.prototype.GetPosition = function () {
    var obj = createIPosition();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.GetPosition|');
    return obj;
};
INavigate.prototype.GetAzimuth = function (reFunc) {
    var obj = createIDouble();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("DOUBLE", obj.fdtid) + '|' + this.objid + '.GetAzimuth|');
    return obj;
};
INavigate.prototype.GetZenith = function (reFunc) {
    var obj = createIDouble();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("DOUBLE", obj.fdtid) + '|' + this.objid + '.GetZenith|');
    return obj;
};
INavigate.prototype.GetDistance = function (reFunc) {
    var obj = createIDouble();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("DOUBLE", obj.fdtid) + '|' + this.objid + '.GetDistance|');
    return obj;
};
INavigate.prototype.GetFlyTime = function (reFunc) {
    var obj = createIDouble();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("DOUBLE", obj.fdtid) + '|' + this.objid + '.GetFlyTime|');
    return obj;
};
INavigate.prototype.Locate = function () {
    gWs.send('|' + this.objid + '.Locate|');
};
INavigate.prototype.FlyToDest = function (focalPosition, azimuth, zenith, distance, flyTime) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    var param4 = "";
    if (azimuth.fdtid) {
        param1 = ConnectParams("fdtid", azimuth.fdtid);
    } else {
        param1 = ConnectParams("DOUBLE", azimuth);
    }
    if (zenith.fdtid) {
        param2 = ConnectParams("fdtid", zenith.fdtid)
    } else {
        param2 = ConnectParams("DOUBLE", zenith);
    }
    if (distance.fdtid) {
        param3 = ConnectParams("fdtid", distance.fdtid);
    } else {
        param3 = ConnectParams("DOUBLE", distance);
    }
    if (flyTime.fdtid) {
        param4 = ConnectParams("fdtid", flyTime.fdtid);
    } else {
        param4 = ConnectParams("DOUBLE", flyTime);
    }
    gWs.send('|' + this.objid + '.FlyToDest|' + ConnectParams("objid", focalPosition.objid) + '#' + param1 + '#' + param2 + '#' + param3 + '#' + param4 + '#');
};
INavigate.prototype.LocateToLayer = function (iLayerObj) {
    gWs.send('|' + this.objid + '.LocateToLayer|' + ConnectParams("objid", iLayerObj.objid) + '#');
};
INavigate.prototype.LocateByEyeToCenter = function (eyePos, centerPos, reFunc) {
    var obj = createIBool();
    if (arguments.length == 3) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.LocateByEyeToCenter|' + ConnectParams("objid", eyePos.objid) + '#' + ConnectParams("objid", centerPos.objid) + '#');
    return obj;
};
INavigate.prototype.SetViewType = function (type, flyTime) {
    var param1 = "";
    var param2 = "";
    if (type.fdtid) {
        param1 = ConnectParams("fdtid", type.fdtid);
    } else {
        param1 = ConnectParams("LONG", type);
    }
    if (flyTime.fdtid) {
        param2 = ConnectParams("fdtid", flyTime.fdtid)
    } else {
        param2 = ConnectParams("DOUBLE", flyTime);
    }
    gWs.send('|' + this.objid + '.SetViewType|' + param1 + '#' + param2 + '#');
};
INavigate.prototype.SetCustomFlyMode = function (state, height, speed, pitch) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    var param4 = "";
    if (state.fdtid) {
        param1 = ConnectParams("fdtid", state.fdtid);
    } else {
        param1 = ConnectParams("VARIANT_BOOL", state);
    }
    if (height.fdtid) {
        param2 = ConnectParams("fdtid", height.fdtid)
    } else {
        param2 = ConnectParams("DOUBLE", height);
    }
    if (speed.fdtid) {
        param3 = ConnectParams("fdtid", speed.fdtid);
    } else {
        param3 = ConnectParams("DOUBLE", speed);
    }
    if (pitch.fdtid) {
        param4 = ConnectParams("fdtid", pitch.fdtid);
    } else {
        param4 = ConnectParams("DOUBLE", pitch);
    }
    gWs.send('|' + this.objid + '.SetCustomFlyMode|' + param1 + '#' + param2 + '#' + param3 + '#' + param4 + '#');
};
INavigate.prototype.GetViewpoint = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetViewpoint|');
    return obj;
};
INavigate.prototype.GetRoamViewPoint = function (reFunc) {
    var obj = createIBstr();
    if (arguments.length == 1) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("BSTR", obj.fdtid) + '|' + this.objid + '.GetRoamViewPoint|');
    return obj;
};
///-----------------------------------///

///-----------------------------------///IRoam
function IRoam(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIRoam(props) {
    return new IRoam(props || {});
}
IRoam.prototype.SetOnGroundRoamMode = function (state) {
    if (state.fdtid) {
        gWs.send('|' + this.objid + '.SetOnGroundRoamMode|' + ConnectParams("fdtid", state.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetOnGroundRoamMode|' + ConnectParams("VARIANT_BOOL", state) + '#');
    }
};
IRoam.prototype.SetUnderGroundRoamMode = function (state, underGroundHeight) {
    var param1 = "";
    var param2 = "";
    if (state.fdtid) {
        param1 = ConnectParams("fdtid", state.fdtid);
    }else{
        param1 = ConnectParams("VARIANT_BOOL", state);
    }
    if (underGroundHeight.fdtid) {
        param2 = ConnectParams("fdtid", underGroundHeight.fdtid);
    }else{
        param2 = ConnectParams("DOUBLE", underGroundHeight);
    }
        gWs.send('|' + this.objid + '.SetUnderGroundRoamMode|' + param1 + '#' + param2 + '#');
};
IRoam.prototype.SetInDoorRoamMode = function (state, idStr, reFunc) {
    var param1 = "";
    var param2 = "";
    if (state.fdtid) {
        param1 = ConnectParams("fdtid", state.fdtid);
    } else {
        param1 = ConnectParams("VARIANT_BOOL", state);
    }
    if (idStr.fdtid) {
        param2 = ConnectParams("fdtid", idStr.fdtid);
    } else {
        param2 = ConnectParams("BSTR", idStr);
    }
    var obj = createIBstr();
    if (arguments.length == 3) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.SetInDoorRoamMode|' + param1 + '#' + param2 + '#');
    return obj;
};
IRoam.prototype.SetAutoRotateRoamMode = function (state) {
    if (state.fdtid) {
        gWs.send('|' + this.objid + '.SetAutoRotateRoamMode|' + ConnectParams("fdtid", state.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetAutoRotateRoamMode|' + ConnectParams("VARIANT_BOOL", state) + '#');
    }
};
IRoam.prototype.SetCustomGlideRoamMode = function (state, height, speed, pitch) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    var param4 = "";
    if (state.fdtid) {
        param1 = ConnectParams("fdtid", state.fdtid);
    } else {
        param1 = ConnectParams("VARIANT_BOOL", state);
    }
    if (height.fdtid) {
        param2 = ConnectParams("fdtid", height.fdtid)
    } else {
        param2 = ConnectParams("DOUBLE", height);
    }
    if (speed.fdtid) {
        param3 = ConnectParams("fdtid", speed.fdtid);
    } else {
        param3 = ConnectParams("DOUBLE", speed);
    }
    if (pitch.fdtid) {
        param4 = ConnectParams("fdtid", pitch.fdtid);
    } else {
        param4 = ConnectParams("DOUBLE", pitch);
    }
    gWs.send('|' + this.objid + '.SetCustomGlideRoamMode|' + param1 + '#' + param2 + '#' + param3 + '#' + param4 + '#');
};
IRoam.prototype.SetViewRotateRoamMode = function (viewType, vecticalAngle, horizontalAngle, flyTime) {
    var param1 = "";
    var param2 = "";
    var param3 = "";
    var param4 = "";
    if (viewType.fdtid) {
        param1 = ConnectParams("fdtid", viewType.fdtid);
    } else {
        param1 = ConnectParams("VARIANT_BOOL", viewType);
    }
    if (vecticalAngle.fdtid) {
        param2 = ConnectParams("fdtid", vecticalAngle.fdtid)
    } else {
        param2 = ConnectParams("DOUBLE", vecticalAngle);
    }
    if (horizontalAngle.fdtid) {
        param3 = ConnectParams("fdtid", horizontalAngle.fdtid);
    } else {
        param3 = ConnectParams("DOUBLE", horizontalAngle);
    }
    if (flyTime.fdtid) {
        param4 = ConnectParams("fdtid", flyTime.fdtid);
    } else {
        param4 = ConnectParams("DOUBLE", flyTime);
    }
    gWs.send('|' + this.objid + '.SetViewRotateRoamMode|' + param1 + '#' + param2 + '#' + param3 + '#' + param4 + '#');
};
IRoam.prototype.SetCursorFromFile = function (type, path, reFunc) {
    var param1 = "";
    var param2 = "";
    if (type.fdtid) {
        param1 = ConnectParams("fdtid", type.fdtid);
    } else {
        param1 = ConnectParams("SHORT", type);
    }
    if (path.fdtid) {
        param2 = ConnectParams("fdtid", path.fdtid);
    } else {
        param2 = ConnectParams("BSTR", path);
    }
    var obj = createIBool();
    if (arguments.length == 3) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.SetCursorFromFile|' + param1 + '#' + param2 + '#');
    return obj;
};
IRoam.prototype.SetCursorMode = function (type) {
    if (type.fdtid) {
        gWs.send('|' + this.objid + '.SetCursorMode|' + ConnectParams("fdtid", type.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetCursorMode|' + ConnectParams("SHORT", type) + '#');
    }
};
IRoam.prototype.SetIntersectLayer = function (layerid) {
    if (layerid.fdtid) {
        gWs.send('|' + this.objid + '.SetIntersectLayer|' + ConnectParams("fdtid", layerid.fdtid) + '#');
    } else {
        gWs.send('|' + this.objid + '.SetIntersectLayer|' + ConnectParams("LONG", layerid) + '#');
    }
};
///-----------------------------------///
///-----------------------------------///IToolsManager
function IToolsManager(props) {
    this.type = props.type || '';
    this.objid = gId++;
}

function createIToolsManager(props) {
    return new IToolsManager(props || {});
}
IToolsManager.prototype.CreateToolsOptions = function (name) {
    var param1 = "";
    if (name.fdtid) {
        param1 = ConnectParams("fdtid", name.fdtid);
    } else {
        param1 = ConnectParams("BSTR", name);
    }
    var obj = createIToolsOptions();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateToolsOptions|' + param1 + '#');
    return obj;
};
IToolsManager.prototype.CreateToolsObject = function (toolsType, iToolsOptions) {
    var param1 = "";
    if (toolsType.fdtid) {
        param1 = ConnectParams("fdtid", toolsType.fdtid);
    } else {
        param1 = ConnectParams("BSTR", toolsType);
    }
    var obj = createIToolsObject();
    gWs.send(ConnectParams("objid", obj.objid) + '|' + this.objid + '.CreateToolsObject|' + param1 + '#' + ConnectParams("objid", iToolsOptions.objid) + '#');
    return obj;
};
IToolsManager.prototype.ActiveTools = function (iToolsObject, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.ActiveTools|' + ConnectParams("objid", iToolsObject.objid) + '#');
    return obj;
};
IToolsManager.prototype.DestoryTools = function (iToolsObject, reFunc) {
    var obj = createIBool();
    if (arguments.length == 2) {
        socketQueue['i_' + obj.fdtid] = reFunc;
    }
    gWs.send(ConnectParams("VARIANT_BOOL", obj.fdtid) + '|' + this.objid + '.DestoryTools|' + ConnectParams("objid", iToolsObject.objid) + '#');
    return obj;
};
///-----------------------------------///
///-----------------------------------///ILong
function ILong() {
    this.fdtid = gId++;
    this.value = null;
}

function createILong() {
    return new ILong();
}
///-----------------------------------///

///-----------------------------------///IShort
function IShort() {
    this.fdtid = gId++;
    this.value = null;
}

function createIShort() {
    return new IShort();
}
///-----------------------------------///

///-----------------------------------///IUint
function IUint() {
    this.fdtid = gId++;
    this.value = null;
}

function createIUint() {
    return new IUint();
}
///-----------------------------------///

///-----------------------------------///IInt
function IInt() {
    this.fdtid = gId++;
    this.value = null;
}

function createIInt() {
    return new IInt();
}
///-----------------------------------///

///-----------------------------------///IFloat
function IFloat() {
    this.fdtid = gId++;
    this.value = null;
}

function createIFloat() {
    return new IFloat();
}
///-----------------------------------///

///-----------------------------------///IDouble
function IDouble() {
    this.fdtid = gId++;
    this.value = null;
}

function createIDouble() {
    return new IDouble();
}
///-----------------------------------///

///-----------------------------------///IBool
function IBool() {
    this.fdtid = gId++;
    this.value = null;
}

function createIBool() {
    return new IBool();
}
///-----------------------------------///

///-----------------------------------///IBstr
function IBstr() {
    this.fdtid = gId++;
    this.value = null;
}

function createIBstr() {
    return new IBstr();
}
///-----------------------------------///