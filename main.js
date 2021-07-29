// ==UserScript==
// @name         学习强国爬取助手
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  爬取各类资源
// @author       琴梨梨
// @match        *://www.xuexi.cn/*
// @match        *://boot-source.xuexi.cn/newmoocdown?*
// @icon         https://www.xuexi.cn/favicon.ico
// @grant        none
// @run-at        document-idle
// ==/UserScript==

(async function() {
    'use strict';
    //主站检测
    if(document.location.host=="www.xuexi.cn"){
        console.log("JS Loaded,Sleep 5 Sec-Qinlili");
        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
        await sleep(5000)
        if(window.self === window.top){
            //初始化下载工具条
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
                if(document.getElementsByClassName("video-article-content")[0]){
                    console.log("New Video Player Detected "+document.location.pathname+"-Qinlili");
                    detected=true;
                    dlText.innerText="页面类型:新视频总，支持全部批量下载最高清晰度，需要打开新标签页下载";
                    downloadBtn.onclick=function(){
                        NewMoocPageDL();
                    }
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
        xhr.open('GET',infourl);
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
        var searchParams = new URLSearchParams(document.location.search);
        var vid=searchParams.get("id");
        document.title="下载：" + vid;
        logcat("Found ID:"+vid);
        logcat("Get Video Info:"+vid)
        var xhr = new XMLHttpRequest();
        xhr.onload = event => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                logcat("Success Get Video Info:"+vid)
                var videoInfo=JSON.parse(xhr.response.replace("callback(","").replace("})","}"));
                console.log(videoInfo);
                logcat("List Name:"+videoInfo.normalized_title)
                logcat("List Origin:"+videoInfo.show_source)
                //文件名后缀
                var filenamesource="-"+videoInfo.normalized_title+"-"+videoInfo.show_source;
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
            xhr.onerror = function (e) {
                logcat("Fail Get Video Info:"+vid)
            }
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
        console.log("Downloader Start\nUrl:"+url+"\nName:"+name+"\nQinlili JS Fetch");
        fetch(url).then(res => res.blob().then(blob => {
            console.log("Download Finish:"+name+"\nQinlili JS Fetch")
            var a = document.createElement('a');
            var url = window.URL.createObjectURL(blob);
            var filename =name;
            a.href = url;
            a.download = filename;
            a.click();
            console.log("Writing File:"+name+"\nQinlili JS Fetch")
            window.URL.revokeObjectURL(url);
        }))
    }
})();
