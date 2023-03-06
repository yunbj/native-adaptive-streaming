/**
 * Modifications copyright (C) 2017 David Ćavar
 */
var enabled = true;

var extension_page = chrome.runtime.getURL('/index.html');
var substitution = extension_page + "#\\0"

console.log(extension_page, substitution)

var rules = [{
  id: 1,
  action: {
    type: 'redirect',
    redirect: { regexSubstitution: substitution },
  },
  condition: {
    regexFilter: '^https?://.*/([a-zA-Z0-9-_]+)(\.mpd)|(\.m3u(8)?)|(/Manifest).*',
    resourceTypes: ['main_frame', 'sub_frame'],
  },
}];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request, sender, sendResponse);
    
    if (request == "getState") {
        sendResponse(enabled);
        return;
    }
      
    enabled = request == "ENABLE";
    enabled ? chrome.action.setIcon({path: "assets/icon128.png" }) : chrome.action.setIcon({ path:"assets/icon128grey.png" });

    if(true === enabled) {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: rules.map(r => r.id),
            addRules: rules,
        });
    } else {
        chrome.declarativeNetRequest.updateDynamicRules(chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: rules.map(r => r.id)
        }));
    }
});

chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(r => r.id),
    addRules: rules,
});