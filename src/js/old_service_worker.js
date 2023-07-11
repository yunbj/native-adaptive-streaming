/**
 * Modifications copyright (C) 2017 David Ćavar
 */
var enabled = true;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request == "getState") {
        sendResponse(enabled);
        return;
    }
    
    enabled = request == "ENABLE";
    enabled ? chrome.browserAction.setIcon({path: "assets/icon128.png" }) : chrome.browserAction.setIcon({ path:"assets/icon128grey.png" });
});

chrome.webRequest.onBeforeRequest.addListener(function(info) { 
    if(
        !enabled 
        || (
            !info.url.split("?")[0].split("#")[0].endsWith(".m3u") && 
            !info.url.split("?")[0].split("#")[0].endsWith(".m3u8") && 
            !info.url.split("?")[0].split("#")[0].endsWith(".mpd") && 
            !info.url.split("?")[0].split("#")[0].endsWith("Manifest")
            )
        ) {
            
        return null;
    }

    var playerUrl = chrome.runtime.getURL('index.html') + "#" + info.url;

    // {% if env['target'] == 'chrome' %}

    chrome.tabs.update(info.tabId, {url: playerUrl});
    return {cancel: true};

    // {% endif %}
    
    // {% if env['target'] == 'firefox' %}

    return { redirectUrl:  playerUrl };

    // {% endif %}

}, {urls: ["*://*/*.m3u*", "*://*/*.mpd*", "*://*/*/Manifest*"], types:["main_frame"]}, ["blocking"]);