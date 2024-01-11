var enabled = true;

var extension_page = chrome.runtime.getURL('/index.html');
var substitution = extension_page + "#\\0"

var rules = [{
  id: 2,
  action: {
    type: 'redirect',
    redirect: { regexSubstitution: substitution },
  },
  condition: {
    regexFilter: '^https?://.*/.*\\.m3u8?|.*\\.mpd|Manifest.*',
    resourceTypes: ['main_frame', 'sub_frame'],
  },
}];


function onClick(info) {
    console.log(info);

    if('link' == info.menuItemId) {
        chrome.tabs.create({ 'url': extension_page + "#" + info.linkUrl }, function (tab) { });
    }

    if('link-text' == info.menuItemId) {
        chrome.tabs.create({ 'url': extension_page + "#" + info.selectionText }, function (tab) { });
    }
}

chrome.contextMenus.onClicked.addListener(onClick);

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        title: 'Open in Native MPEG-Dash + HLS Playback',
        contexts: ['link'],
        id: 'link',
        targetUrlPatterns: [
            '*://*/Manifest*',
            '*://*/*.mpd*',
            '*://*/*.m3u*',
            '*://*/*.m3u8*'
        ]
    });

    chrome.contextMenus.create({
        title: "Open in Native MPEG-Dash + HLS Playback", 
        contexts:["selection"],
        id: 'link-text'
    });
});

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request == "getState") {
//         sendResponse(enabled);
//         return;
//     }
//       
//     enabled = request == "ENABLE";
//     enabled ? chrome.action.setIcon({path: "assets/icon128.png" }) : chrome.action.setIcon({ path:"assets/icon128grey.png" });
// 
//     if(true === enabled) {
//         chrome.declarativeNetRequest.updateDynamicRules({
//             removeRuleIds: oldRules.map(r => r.id),
//             addRules: rules,
//         });
//     } else {
//         chrome.declarativeNetRequest.updateDynamicRules(chrome.declarativeNetRequest.updateDynamicRules({
//             removeRuleIds: oldRules.map(r => r.id)
//         }));
//     }
// });

chrome.declarativeNetRequest.getDynamicRules().then(function(oldRules) {
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRules.map(r => r.id),
        addRules: rules,
    });

    console.log(chrome.declarativeNetRequest.getDynamicRules());
});
