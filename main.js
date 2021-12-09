// ==UserScript==
// @name         学习强国爬取助手
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  爬取各类资源
// @author       琴梨梨
// @match        *://www.xuexi.cn/*
// @match        *://boot-source.xuexi.cn/newmoocdown?*
// @match        *://boot-source.xuexi.cn/audiodown?*
// @icon         https://www.xuexi.cn/favicon.ico
// @grant        none
// @run-at        document-idle
// ==/UserScript==


(async function() {
    'use strict';
    //共享库
    var SakiProgress = {
        isLoaded: false,
        progres: false,
        pgDiv: false,
        textSpan: false,
        first: false,
        alertMode: false,
        init: function (color) {
            if (!this.isLoaded) {
                this.isLoaded = true;
                console.info("SakiProgress Initializing!\nVersion:1.0.3\nQinlili Tech:Github@qinlili23333");
                this.pgDiv = document.createElement("div");
                this.pgDiv.id = "pgdiv";
                this.pgDiv.style = "z-index:9999;position:fixed;background-color:white;min-height:32px;width:auto;height:32px;left:0px;right:0px;top:0px;box-shadow:0px 2px 2px 1px rgba(0, 0, 0, 0.5);transition:opacity 0.5s;display:none;";
                this.pgDiv.style.opacity = 0;
                this.first = document.body.firstElementChild;
                document.body.insertBefore(this.pgDiv, this.first);
                this.first.style.transition = "margin-top 0.5s"
                this.progress = document.createElement("div");
                this.progress.id = "dlprogress"
                this.progress.style = "position: absolute;top: 0;bottom: 0;left: 0;background-color: #F17C67;z-index: -1;width:0%;transition: width 0.25s ease-in-out,opacity 0.25s,background-color 1s;"
                if (color) {
                    this.setColor(color);
                }
                this.pgDiv.appendChild(this.progress);
                this.textSpan = document.createElement("span");
                this.textSpan.style = "padding-left:4px;font-size:24px;";
                this.textSpan.style.display = "inline-block"
                this.pgDiv.appendChild(this.textSpan);
                var css = ".barBtn:hover{ background-color: #cccccc }.barBtn:active{ background-color: #999999 }";
                var style = document.createElement('style');
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
                document.getElementsByTagName('head')[0].appendChild(style);
                console.info("SakiProgress Initialized!");
            } else {
                console.error("Multi Instance Error-SakiProgress Already Loaded!");
            }
        },
        destroy: function () {
            if (this.pgDiv) {
                document.body.removeChild(this.pgDiv);
                this.isLoaded = false;
                this.progres = false;
                this.pgDiv = false;
                this.textSpan = false;
                this.first = false;
                console.info("SakiProgress Destroyed!You Can Reload Later!");
            }
        },
        setPercent: function (percent) {
            if (this.progress) {
                this.progress.style.width = percent + "%";
            } else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        clearProgress: function () {
            if (this.progress) {
                this.progress.style.opacity = 0;
                setTimeout(function () { SakiProgress.progress.style.width = "0%"; }, 500);
                setTimeout(function () { SakiProgress.progress.style.opacity = 1; }, 750);
            } else {
                console.error("Not Initialized Error-Please Call `init` First!")
            }
        },
        hideDiv: function () {
            if (this.pgDiv) {
                if (this.alertMode) {
                    setTimeout(function () {
                        SakiProgress.pgDiv.style.opacity = 0;
                        SakiProgress.first.style.marginTop = "";
                        setTimeout(function () {
                            SakiProgress.pgDiv.style.display = "none";
                        }, 500);
                    }, 3000);
                } else {
                    this.pgDiv.style.opacity = 0;
                    this.first.style.marginTop = "";
                    setTimeout(function () {
                        SakiProgress.pgDiv.style.display = "none";
                    }, 500);
                }
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        showDiv: function () {
            if (this.pgDiv) {
                this.pgDiv.style.display = "";
                setTimeout(function () { SakiProgress.pgDiv.style.opacity = 1; }, 10);
                this.first.style.marginTop = (this.pgDiv.clientHeight + 8) + "px";
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        setText: function (text) {
            if (this.textSpan) {
                if (this.alertMode) {
                    setTimeout(function () {
                        if (!SakiProgress.alertMode) {
                            SakiProgress.textSpan.innerText = text;
                        }
                    }, 3000);
                } else {
                    this.textSpan.innerText = text;
                }
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        setTextAlert: function (text) {
            if (this.textSpan) {
                this.textSpan.innerText = text;
                this.alertMode = true;
                setTimeout(function () { this.alertMode = false; }, 3000);
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        setColor: function (color) {
            if (this.progress) {
                this.progress.style.backgroundColor = color;
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        addBtn: function (img) {
            if (this.pgDiv) {
                var btn = document.createElement("img");
                btn.style = "display: inline-block;right:0px;float:right;height:32px;width:32px;transition:background-color 0.2s;"
                btn.className = "barBtn"
                btn.src = img;
                this.pgDiv.appendChild(btn);
                return btn;
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        },
        removeBtn: function (btn) {
            if (this.pgDiv) {
                if (btn) {
                    this.pgDiv.removeChild(btn);
                }
            }
            else {
                console.error("Not Initialized Error-Please Call `init` First!");
            }
        }
    }
    var XHRDL = {
        isLoaded: false,
        dlList: [],
        listBtn: false,
        listDiv: false,
        listBar: false,
        clsBtn: false,
        init: function () {
            if (!this.isLoaded) {
                console.info("WebXHRDL Initializing!\nVersion:Preview0.1.0\nQinlili Tech:Github@qinlili23333")
                try {
                    SakiProgress.init();
                } catch{
                    console.error("Initialize Failed!Is SakiProgress Loaded?")
                    return false;
                }
                this.isLoaded = true;
                this.listBtn = SakiProgress.addBtn("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjQ4cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjQ4cHgiIGZpbGw9IiMwMDAwMDAiPjxnPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iMjQiIHdpZHRoPSIyNCIvPjwvZz48Zz48Zz48cGF0aCBkPSJNMTguMzIsNC4yNkMxNi44NCwzLjA1LDE1LjAxLDIuMjUsMTMsMi4wNXYyLjAyYzEuNDYsMC4xOCwyLjc5LDAuNzYsMy45LDEuNjJMMTguMzIsNC4yNnogTTE5LjkzLDExaDIuMDIgYy0wLjItMi4wMS0xLTMuODQtMi4yMS01LjMyTDE4LjMxLDcuMUMxOS4xNyw4LjIxLDE5Ljc1LDkuNTQsMTkuOTMsMTF6IE0xOC4zMSwxNi45bDEuNDMsMS40M2MxLjIxLTEuNDgsMi4wMS0zLjMyLDIuMjEtNS4zMiBoLTIuMDJDMTkuNzUsMTQuNDYsMTkuMTcsMTUuNzksMTguMzEsMTYuOXogTTEzLDE5LjkzdjIuMDJjMi4wMS0wLjIsMy44NC0xLDUuMzItMi4yMWwtMS40My0xLjQzIEMxNS43OSwxOS4xNywxNC40NiwxOS43NSwxMywxOS45M3ogTTEzLDEyVjdoLTJ2NUg3bDUsNWw1LTVIMTN6IE0xMSwxOS45M3YyLjAyYy01LjA1LTAuNS05LTQuNzYtOS05Ljk1czMuOTUtOS40NSw5LTkuOTV2Mi4wMiBDNy4wNSw0LjU2LDQsNy45Miw0LDEyUzcuMDUsMTkuNDQsMTEsMTkuOTN6Ii8+PC9nPjwvZz48L3N2Zz4=");
                this.listBtn.onclick = XHRDL.showList;
                SakiProgress.showDiv();
                SakiProgress.setText("初始化下载器...");
                SakiProgress.setPercent(20);
                this.listDiv = document.createElement("div");
                this.listDiv.style = "z-index:9999;position:fixed;background-color:white;width:auto;margin-top:32px;height:100%;left:0px;right:0px;top:0px;transition:opacity 0.5s;display:none;";
                this.listDiv.style.opacity = 0;
                this.listBar = document.createElement("div");
                this.listBar.style = "z-index:10000;position:fixed;background-color:white;min-height:32px;margin-top:32px;width:auto;height:32px;left:0px;right:0px;top:0px;box-shadow:0px 2px 2px 1px rgba(0, 0, 0, 0.5);";
                this.listDiv.appendChild(this.listBar);
                document.body.appendChild(this.listDiv);
                var btn = document.createElement("img");
                btn.style = "display: inline-block;right:0px;float:right;height:32px;width:32px;transition:background-color 0.2s;"
                btn.className = "barBtn"
                btn.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjQ4cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjQ4cHgiIGZpbGw9IiMwMDAwMDAiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iMjQiIHdpZHRoPSIyNCIvPjxwYXRoIGQ9Ik0yMiwzLjQxbC01LjI5LDUuMjlMMjAsMTJoLThWNGwzLjI5LDMuMjlMMjAuNTksMkwyMiwzLjQxeiBNMy40MSwyMmw1LjI5LTUuMjlMMTIsMjB2LThINGwzLjI5LDMuMjlMMiwyMC41OUwzLjQxLDIyeiIvPjwvc3ZnPg==";
                this.listBar.appendChild(btn);
                btn.onclick = function () {
                    XHRDL.hideList();
                }
                this.clsBtn = btn;
                SakiProgress.setPercent(100);
                SakiProgress.setText("下载器已加载！");
                setTimeout(function () { SakiProgress.clearProgress(); SakiProgress.hideDiv(); }, 1000);
                console.info("WebXHRDL Initialized!");
            } else {
                console.error("Multi Instance Error-WebXHRDL Already Loaded!")
            }
        },
        destroy: function (saki) {
            if (this.isLoaded) {
                if (saki) {
                    SakiProgress.destroy();
                }
                this.isLoaded = false;
                this.dlList = [];
                this.listBtn = false;
                this.listDiv = false;
                this.listBar = false;
                this.clsBtn = false;
                console.info("WebXHRDL Destroyed!You Can Reload Later!");
            }
        },
        showList: function () {
            if (XHRDL.isLoaded) {
                XHRDL.listDiv.style.display = "";
                setTimeout(function () { XHRDL.listDiv.style.opacity = 1; }, 10);
            } else {
                console.error("Not Initialized Error-Please Call `init` First!")
            }
        },
        hideList: function () {
            if (XHRDL.isLoaded) {
                XHRDL.listDiv.style.opacity = 0;
                setTimeout(function () { XHRDL.listDiv.style.display = "none"; }, 500);
            } else {
                console.error("Not Initialized Error-Please Call `init` First!")
            }
        },
        saveTaskList: function () {
            if (XHRDL.isLoaded) {
                var storage = window.localStorage;
                storage.setItem("XHRDL_List", JSON.stringify(this.dlList));
            } else {
                console.error("Not Initialized Error-Please Call `init` First!")
            }
        },
        loadTaskList: function () {
            if (XHRDL.isLoaded) {
                var storage = window.localStorage;
                this.dlList = JSON.parse(storage.getItem("XHRDL_List"));
            } else {
                console.error("Not Initialized Error-Please Call `init` First!")
            }
        },
        newTask: function (url, name) {
            if (this.isLoaded) {
                var list = this.dlList;
                list[list.length] = {
                    taskUrl: url,
                    fileName: name
                }
                SakiProgress.showDiv();
                SakiProgress.setText("已添加新任务：" + name);
                if (!this.DLEngine.isWorking) {
                    this.DLEngine.start();
                }
            } else {
                console.error("Not Initialized Error-Please Call `init` First!")
            }
        },
        DLEngine: {
            isWorking: false,
            start: function () {
                if (!this.isWorking) {
                    console.info("Start WebXHRDL Engine...\nChecking Tasks...");
                    this.isWorking = true;
                    SakiProgress.showDiv();
                    this.dlFirstFile();
                } else {
                    console.error("WebXHRDL Engine Already Started!");
                }
            },
            stop: function () {
                this.isWorking = false;
                SakiProgress.hideDiv();
                SakiProgress.setText("");
                if (XHRDL.dlList[0]) {
                    console.info("All Tasks Done!WebXHRDL Engine Stopped!");
                } else {
                    console.info("WebXHRDL Engine Stopped!Tasks Paused!");
                }
            },
            dlFirstFile: function () {
                var taskInfo = XHRDL.dlList[0];
                SakiProgress.showDiv();
                SakiProgress.setPercent(0);
                SakiProgress.setText("正在下载" + taskInfo.fileName);
                var xhr = new XMLHttpRequest();
                xhr.responseType = "blob";
                xhr.onprogress = event => {
                    if (event.loaded && event.total) {
                        var percent = String(Number(event.loaded) / Number(event.total) * 100).substring(0, 4);
                        SakiProgress.setText(taskInfo.fileName + "已下载" + percent + "%");
                        SakiProgress.setPercent(percent)
                    }
                };
                xhr.onload = event => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            var bloburl = URL.createObjectURL(xhr.response);
                            SakiProgress.setText("正在写出" + taskInfo.fileName);
                            var a = document.createElement('a');
                            var filename = taskInfo.fileName;
                            a.href = bloburl;
                            a.download = filename;
                            a.click();
                            window.URL.revokeObjectURL(bloburl);
                            SakiProgress.clearProgress();
                            XHRDL.dlList.splice(0, 1);
                            XHRDL.DLEngine.checkNext();
                        } else {
                            //TODO:支持更多特殊状态处理
                            SakiProgress.setTextAlert(taskInfo.fileName + "暂不支持下载，跳过");
                            XHRDL.dlList.splice(0, 1);
                            XHRDL.DLEngine.checkNext();
                        }
                    }
                }
                xhr.onerror = function (e) {
                    //TODO:支持处理不同类别出错
                    if(!taskInfo.errorRetry){
                        SakiProgress.setTextAlert(taskInfo.fileName + "下载失败，置入列尾等待重试");
                        taskInfo.errorRetry = true;
                        var list = XHRDL.dlList;
                        list[list.length] = taskInfo;
                    }else{
                        SakiProgress.setTextAlert(taskInfo.fileName + "下载又失败了，放弃");
                    }
                    XHRDL.dlList.splice(0, 1);
                    XHRDL.DLEngine.checkNext();
                }
                xhr.open('GET', taskInfo.taskUrl)
                xhr.send()
            },
            checkNext: function () {
                if (XHRDL.dlList[0]) {
                    this.dlFirstFile();
                } else {
                    this.stop();
                }
            }
        }
    }


    //主站检测
    if(document.location.host=="www.xuexi.cn"){
        console.log("JS Loaded,Sleep 5 Sec-Qinlili");
        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
        await sleep(5000)
        if(window.self === window.top){
            //初始化下载工具条
            XHRDL.init();
            var dlPannel=document.createElement("div");
            var downloadBtn = document.createElement("button");
            downloadBtn.innerText = "下载本页内容";
            downloadBtn.style.display="inline-block";
            dlPannel.appendChild(downloadBtn);
            var dlText=document.createElement("p");
            dlText.style.display="inline-block";
            dlText.innerText="等待检测页面类型";
            dlPannel.appendChild(dlText);
            var first=document.body.firstChild;
            document.body.insertBefore(dlPannel,first);
            //检测爬取页面类型
            console.log("Detecting Page "+document.location.pathname+"-Qinlili");
            var detected=false;
            //旧慕课列表
            if((document.body.innerText.indexOf("课程介绍")>=1)||(document.body.innerText.indexOf("课程详情")>=1)){
                console.log("Old Mooc List Detected "+document.location.pathname+"-Qinlili");
                detected=true;
                dlText.innerText="页面类型:旧慕课列表，支持全部批量下载，请开启网站自动下载权限";
                downloadBtn.onclick=function(){
                    OldMoocListDL();
                }
            }
            //页面有播放器
            if(window.Aliplayer){
                //旧慕课、电视剧播放单页
                if(document.getElementsByClassName("radio-inline")[0]){
                    console.log("Old Video Player Detected "+document.location.pathname+"-Qinlili");
                    detected=true;
                    dlText.innerText="页面类型:旧视频播放单页，支持全部批量下载，请开启网站自动下载权限";
                    downloadBtn.onclick=function(){
                        OldMoocVideoDL();
                    }
                }
                //新慕课、影视总页
                if(document.getElementsByClassName("video-article-content")[0]||document.getElementsByClassName("videoSet-article-wrap")[0]){
                    console.log("New Video Player Detected "+document.location.pathname+"-Qinlili");
                    detected=true;
                    dlText.innerText="页面类型:新视频总，支持全部批量下载最高清晰度，需要打开新标签页下载";
                    downloadBtn.onclick=function(){
                        NewMoocPageDL();
                    }
                }
            }
            //音频
            if(document.getElementsByClassName("album-play-btn")[0]){
                console.log("Audio Detected "+document.location.pathname+"-Qinlili");
                detected=true;
                dlText.innerText="页面类型:音频，支持全部批量下载，需要打开新标签页下载";
                downloadBtn.onclick=function(){
                    AudioDL();
                }
            }
            if(!detected){
                console.log("Unsupported Page "+document.location.pathname+"-Qinlili");
                dlText.innerText="本页面不支持下载";
                downloadBtn.innerText = "暂不支持";
            }

            //下载器部分
            //旧慕课列表
            function OldMoocListDL(){
                //读取全部视频列表
                var videoList=globalCache[Object.keys(globalCache)[0]];
                console.log("Found "+videoList.length+" Videos-Qinlili")
                for(var i=0;videoList[i];i++){
                    console.log("Try Analysis "+i+" Video-Qinlili")
                    getInfoAndDL(pagetoinfourl(videoList[i].static_page_url));
                }

            }
            //旧慕课播放单页
            function OldMoocVideoDL(){
                console.log("Analysis Page Info-Qinlili")
                getInfoAndDL(pagetoinfourl(document.location.href))
            }
            function NewMoocPageDL(){
                console.log("Open DL Page-Qinlili");
                var searchParams = new URLSearchParams(document.location.search);
                var dlurl="https://boot-source.xuexi.cn/newmoocdown?id="+searchParams.get("id");
                window.open(dlurl, "_blank");
            }
            function AudioDL(){
                console.log("Open DL Page-Qinlili");
                var searchParams = new URLSearchParams(document.location.search);
                var dlurl="https://boot-source.xuexi.cn/audiodown?id="+searchParams.get("id");
                window.open(dlurl, "_blank");
            }
        }else{
            console.log("Iframe Page "+document.location.pathname+"\nSkip Detect-Qinlili");
        }
    }

    //全局共享函数
    //读取视频信息并下载
    function getInfoAndDL(infourl){
        console.log("Get Video Info:"+infourl+"\n-Qinlili")
        var xhr = new XMLHttpRequest();
        xhr.onload = event => {
            console.log("Success Get Video Info:"+infourl+"\n-Qinlili")
            if (xhr.readyState === 4 && xhr.status === 200) {
                var videoInfo=JSON.parse(xhr.response.replace("globalCache = ","").replace(";",""));
                stringToObject(videoInfo);
                //判断慕课
                if(videoInfo[Object.keys(videoInfo)[0]].info){
                    videoInfo=videoInfo[Object.keys(videoInfo)[0]].info;
                    for(var vi=0;videoInfo.ossUrl[vi];vi++){
                        console.log("Video Name:"+videoInfo.frst_name+"-"+(vi+1)+"\nChapter Name:"+videoInfo.mooc_class+"\nMooc Name:"+videoInfo.mooc+"\nVideo Url:"+videoInfo.ossUrl[vi]+"\n-Qinlili");
                        var filename=videoInfo.frst_name+"-"+(vi+1)+"-"+videoInfo.mooc_class+"-"+videoInfo.mooc+".mp4"
                        console.log("File Name:"+filename+"\nPrepare Download-Qinlili");
                        downloadFile(videoInfo.ossUrl[vi],filename);
                    }
                }
                //判断电视剧
                if(videoInfo[Object.keys(videoInfo)[0]].list){
                    videoInfo=videoInfo[Object.keys(videoInfo)[0]].list;
                    for(var vii=0;videoInfo[vii];vii++){
                        console.log("Video Name:"+videoInfo[vii].frst_name+"-"+(vi+1)+"\nList Name:"+videoInfo[vii].title+"\nVideo Url:"+videoInfo[vii].ossUrl+"\n-Qinlili");
                        var filename2=videoInfo[vii].frst_name+"-"+(vi+1)+"-"+videoInfo[vii].title+".mp4"
                        console.log("File Name:"+filename2+"\nPrepare Download-Qinlili");
                        downloadFile(videoInfo[vii].ossUrl,filename2);
                    }
                }
            }
            xhr.onerror = function (e) {
                console.log("Fail Get Video Info:"+infourl+"\n-Qinlili")
            }
        }
        xhr.open('GET',infourl,false);
        xhr.send();

        //平整化Array工具，从学习强国本身的js里抄过来的，看不懂原理但是能跑就完事了
        function stringToObject(params) {
            for (var key in params) {
                var value = params[key];
                if (isString(value)) {
                    try {
                        if (typeof JSON.parse(value) == 'object') {
                            params[key] = JSON.parse(value);
                        }
                    } catch (e) { }
                } else if (isArray(value)) {
                    try {
                        for (var index = 0; index < value.length; index++) {
                            stringToObject(value[index]);
                        }
                    } catch (e) { }
                } else if (isObject(value)) {
                    try {
                        stringToObject(params[key])
                    } catch (e) { }
                }
            }
        }

        function isArray(o) {
            return Object.prototype.toString.call(o) === '[object Array]';
        }

        function isString(o) {
            return Object.prototype.toString.call(o) === '[object String]';
        }

        function isObject(o) {
            return Object.prototype.toString.call(o) === '[object Object]';
        }
    }

    //404注入页面避免cors
    if(document.location.host=="boot-source.xuexi.cn"){
        console.log("JS Domain Detected, Prepare Inject-Qinlili");
        document.querySelector("body").innerHTML="<H2>本页面仅用于CORS注入，分享网址没有用，请允许下载多个文件</H2><H4 id=\"logcat\"></H4>"
        XHRDL.init();
        logcat("Initializing Downloader...");
        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
        await sleep(3000)
        var searchParams = new URLSearchParams(document.location.search);
        var vid=searchParams.get("id");
        document.title="下载：" + vid;
        logcat("Found ID:"+vid);
        logcat("Get Video Info:"+vid)
        var xhr = new XMLHttpRequest();
        xhr.onload = event => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                logcat("Success Get JSON Info:"+vid)
                var videoInfo=JSON.parse(xhr.response.replace("callback(","").replace("})","}"));
                console.log(videoInfo);
                logcat("List Name:"+videoInfo.normalized_title)
                logcat("List Origin:"+videoInfo.show_source)
                //文件名后缀
                var filenamesource="-"+videoInfo.normalized_title+"-"+videoInfo.show_source;
                //视频下载模式
                if(document.location.pathname=="/newmoocdown"){
                    //检测是否为多视频
                    if(videoInfo.sub_items){
                        logcat("Found "+videoInfo.sub_items.length+" Videos");
                        //循环解析并下载视频
                        for(var vi=0;videoInfo.sub_items[vi];vi++){
                            logcat("Analysis Video "+ (vi+1));
                            //currentVideo，缩写为cV看起来清爽点
                            var cV=videoInfo.sub_items[vi];
                            var vName=cV.title;
                            logcat("Video Name:"+vName);
                            //检测多个清晰度
                            var vurl=getHighest(cV.videos[0].video_storage_info);
                            logcat("Video Url:"+vurl);
                            var fName=vName+filenamesource+".mp4";
                            logcat("File Name:"+fName);
                            logcat("Call Downloader, Downloader Log Output In F12");
                            downloadFile(vurl,fName);
                        }
                    }else{
                        //单个视频
                        var singlevurl=getHighest(videoInfo.videos[0].video_storage_info);
                        logcat("Video Url:"+singlevurl);
                        vName=videoInfo.title;
                        var sfName=vName+filenamesource+".mp4";
                        logcat("File Name:"+sfName);
                        logcat("Call Downloader, Downloader Log Output In F12");
                        downloadFile(singlevurl,sfName);
                    }
                }
                //音频下载模式
                if(document.location.pathname=="/audiodown"){
                    if(videoInfo.sub_items){
                        logcat("Found "+videoInfo.sub_items.length+" Audios");
                        //循环解析并下载音频
                        for(var ai=0;videoInfo.sub_items[ai];ai++){
                            logcat("Analysis Video "+ (ai+1));
                            //currentAudio，缩写为cA看起来清爽点
                            var cA=videoInfo.sub_items[ai];
                            var aName=cA.title;
                            logcat("Audio Name:"+aName);
                            //音频不区分清晰度
                            var aurl=cA.audios[0].audio_storage_info[0].url;
                            logcat("Audio Url:"+aurl);
                            var afName=aName+filenamesource+".mp3";
                            logcat("File Name:"+fName);
                            logcat("Call Downloader, Downloader Log Output In F12");
                            downloadFile(aurl,afName);
                        }
                    }
                }
            }
        }
        xhr.onerror = function (e) {
                    logcat("Fail Get Json Info:"+vid)
                }
        xhr.open('GET',"https://boot-source.xuexi.cn/data/app/"+vid+".js?callback=callback&_st="+Date.now());
        xhr.send();
        //打印日志方法，空页面就不用console.log了
        function logcat(text){
            //获取时间参考https://www.jianshu.com/p/067469a4eed8
            let myDate = new Date();
            let str = myDate.toTimeString();
            let timeStr = str.substring(0,8);
            document.getElementById("logcat").innerText=timeStr+"  "+text+"\n"+document.getElementById("logcat").innerText;
        }
        //分析最高清晰度
        function getHighest(vObj){
            var maxHeight=1;
            var maxId=0;
            for(var vii=0;vObj[vii];vii++){
                if(!(vObj[vii].format=="m3u8")){
                    if(vObj[vii].height>maxHeight){
                        maxHeight=vObj[vii].height;
                        maxId=vii;
                    }
                }
            }
            logcat("Max Vide Height:"+maxHeight);
            return vObj[maxId].normal
        }
    }


    //地址转换函数
    function pagetoinfourl(pageurl){
        var tempurl=pageurl.replace(".html",".js");
        tempurl=insertStr(tempurl,tempurl.indexOf("/",21)+1,"data");
        return tempurl;
    }
    //插入
    function insertStr(soure, start, newStr){
        return soure.slice(0, start) + newStr + soure.slice(start);
    }
    //下载
    function downloadFile(url,name){
        XHRDL.newTask(url,name);
    }
}
 )();
