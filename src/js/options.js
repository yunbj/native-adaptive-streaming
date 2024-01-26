/**
 * Modifications copyright (C) 2017 David Ćavar
 */

 document.getElementById('useLatestHlsjs').addEventListener('change', function(e) {

    if(document.getElementById('useLatestHlsjs').checked) {
        document.getElementById('hlsjsSel').disabled = 'disabled';
    } else {
        document.getElementById('hlsjsSel').disabled = false;
    }
});

 document.getElementById('useLatestDashjs').addEventListener('change', function(e) {
    if(document.getElementById('useLatestDashjs').checked) {
        document.getElementById('dashjsSel').disabled = 'disabled';
    } else {
        document.getElementById('dashjsSel').disabled = false;
    }
});

document.getElementById('useLatestHasplayerjs').addEventListener('change', function(e) {
    if(document.getElementById('useLatestHasplayerjs').checked) {
        document.getElementById('hasplayerjsSel').disabled = 'disabled';
    } else {
        document.getElementById('hasplayerjsSel').disabled = false;
    }
});

function save_options() {
    var hlsjs_version = document.getElementById('hlsjsSel').value;
    var dashjs_version = document.getElementById('dashjsSel').value;
    var hasplayerjs_version = document.getElementById('hasplayerjsSel').value;

    var use_latest_dashjs = document.getElementById('useLatestDashjs').checked;
    var use_latest_hlsjs = document.getElementById('useLatestHlsjs').checked;
    var use_latest_hasplayerjs = document.getElementById('useLatestHasplayerjs').checked;

    var dbg = document.getElementById('cbDebug').checked;
    var maxQuality = document.getElementById('maxQuality').checked;
    var video_native_mode = document.getElementById('video-native-mode').checked;

    var cmcd_enable = document.getElementById("cmcd").checked;
    var cmcd_use_header = document.getElementById("cmcd-use-header").checked;

    chrome.storage.local.set({
        hlsjs_version: hlsjs_version,
        dashjs_version: dashjs_version,
        hasplayerjs_version: hasplayerjs_version,
        use_latest_dashjs: use_latest_dashjs,
        use_latest_hlsjs: use_latest_hlsjs,
        use_latest_hasplayerjs: use_latest_hasplayerjs,
        debug: dbg,
        maxQuality: maxQuality,
        video_native_mode: video_native_mode,
        cmcd_enable: cmcd_enable,
        cmcd_use_header: cmcd_use_header
    }, function() {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
        status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.local.get({
        hlsjs_version: '1.1.5',
        dashjs_version: '4.3.0',
        hasplayerjs_version: '1.15.0',
        use_latest_hlsjs: true,
        use_latest_dashjs: true,
        use_latest_hasplayerjs: true,
        debug: false,
        maxQuality: false,
        video_native_mode: false,
        cmcd_enable: false,
        cmcd_use_header: false
    }, function(items) {
        console.log(items);

        document.getElementById('useLatestHlsjs').checked = items.use_latest_hlsjs;

        if(true == items.use_latest_hlsjs) {
            document.getElementById('hlsjsSel').value = versions['hls.js'][0];
            document.getElementById('hlsjsSel').disabled = 'disabled';
        } else {
            document.getElementById('hlsjsSel').value = items.hlsjs_version
        }

        document.getElementById('useLatestDashjs').checked = items.use_latest_dashjs;

        if(true == items.use_latest_dashjs) {
            document.getElementById('dashjsSel').value = versions['dashjs'][0];
            document.getElementById('dashjsSel').disabled = 'disabled';
        } else {
            document.getElementById('dashjsSel').value = items.dashjs_version
        }

        document.getElementById('useLatestHasplayerjs').checked = items.use_latest_hasplayerjs;

        if(true == items.use_latest_hasplayerjs) {
            document.getElementById('hasplayerjsSel').value = versions['hasplayer.js'][0];
            document.getElementById('hasplayerjsSel').disabled = 'disabled';
        } else {
            document.getElementById('hasplayerjsSel').value = items.hasplayerjs_version
        }

        document.getElementById('cbDebug').checked = items.debug;
        document.getElementById('maxQuality').checked = items.maxQuality;
        document.getElementById('video-native-mode').checked = items.video_native_mode;

        document.getElementById("cmcd").checked = items.cmcd_enable;
        document.getElementById("cmcd-use-header").checked = items.cmcd_use_header;
    });
}

function attachEventListeners() {
    restore_options();
    document.getElementById('saveSettings').addEventListener('click', save_options);
}

var data = versions['dashjs'];
var target = document.querySelector('#dashjsSel');
populateSelection(data, target)

var data = versions['hls.js'];
var target = document.querySelector('#hlsjsSel');
populateSelection(data, target)

var data = versions['hasplayer.js'];
var target = document.querySelector('#hasplayerjsSel');
populateSelection(data, target)

function populateSelection(data, target) {
    for(var i = 0; i < data.length; i++) {
        var option = document.createElement('option');
        option.value = data[i];
        option.innerText = data[i];
        target.appendChild(option);
    }
}

attachEventListeners();
