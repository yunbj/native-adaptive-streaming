/**
 * Modifications copyright (C) 2017 David Ćavar
 */
var enabled = true;

var extension_page = chrome.runtime.getURL('/index.html');

var rules = [{
  id: 1,
  action: {
    type: 'redirect',
    redirect: { regexSubstitution: extension_page + '#\\0' },
  },
  condition: {
    regexFilter: '^https?://.*/.*(\.mpd|\.m3u8?|/Manifest).*',
    resourceTypes: ['main_frame', 'sub_frame'],
  },
}];

chrome.declarativeNetRequest.updateDynamicRules({
  removeRuleIds: rules.map(r => r.id),
  addRules: rules,
});
