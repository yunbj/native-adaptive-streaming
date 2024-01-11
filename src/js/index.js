/**
 * Modifications copyright (C) 2017 David Ćavar
 */
var maxQuality = false;
var player_resize_mode = 0;
var selected_playlist_element = null;

function resize() {
    player_container.style.width = window.innerWidth + 'px';

    if(!video_native_mode) {
        video_element.style.width = window.innerWidth + 'px';
    }
}

var hlsjs_version = 0;
var dashjs_version = 0;
var hasplayerjs_version = 0;

var hlsjs_loaded = false;
var dashjs_loaded = false;
var hasplayerjs_loaded = false;

var maxQuality = false;

var video_native_mode = false;
var player_tech = null;
var playlist = new Playlist();

playlist.updated = function() {
    clearNode(playlist_drawer_list);
    var items = playlist.getAll();

    for(var index in items) {
        var item = items[index];

        var li = document.createElement('li');
        var a = document.createElement('a');
        a.classList.add('waves-effect');
        a.classList.add('waves-red');
        a.classList.add('btn-flat');
        a.innerText = item.title;
        a.setAttribute('data-index', index);

        a.addEventListener('click', function(e) {
            if(null !== selected_playlist_element) {
                selected_playlist_element.classList.remove('selected');
            }

            selected_playlist_element = e.currentTarget;
            selected_playlist_element.classList.add('selected');

            var playlist_element = e.currentTarget;
            // playlist_element.classList.remove('btn-flat-animate');
            void playlist_element.offsetWidth;
            // playlist_element.classList.add('btn-flat-animate');

            var target = e.target;
            var i = target.getAttribute('data-index');
            var it = playlist.getAt(i);
            playUrl(it.url);
        });
        
        // a.addEventListener('animationend', function(e) {
        //     var playlist_element = e.currentTarget;
        //     playlist_element.classList.remove('btn-flat-animate');
        // });

        li.appendChild(a);
        playlist_drawer_list.appendChild(li);
    }
}

function techAscertained() {
    playUrl(playlist.getCurrent().url);
}

function libsLoaded() {
    guessTech(getUrlFromLocation());
}

function loadLibs() {
    var s1 = document.createElement('script');
    var s2 = document.createElement('script');
    var s3 = document.createElement('script');

    s3.onload = function() {
        hasplayerjs_loaded = true;

        if(hasplayerjs_loaded && hlsjs_loaded && dashjs_loaded) {
            libsLoaded();
        }
    };

    s2.onload = function() {
        dashjs_loaded = true;

        if(hasplayerjs_loaded && hlsjs_loaded && dashjs_loaded) {
            libsLoaded();
        }
    };

    s1.onload = function() {
        hlsjs_loaded = true;
        
        if(hasplayerjs_loaded && hlsjs_loaded && dashjs_loaded) {
            libsLoaded(); 
        }
    }

    s1.src = '/libs/hlsjs/hls-' + hlsjs_version + '.min.js';
    document.querySelector('head').appendChild(s1);
    s2.src = '/libs/dashjs/dash-' + dashjs_version + '.all.min.js';
    document.querySelector('head').appendChild(s2);
    s3.src = '/libs/hasplayerjs/hasplayer-' + hasplayerjs_version + '.min.js';
    document.querySelector('head').appendChild(s3);
}


state_machine.addTransitions('loader', [
    {from: 'visible', to: 'invisible', object: loader, handle: function(transition) {
        loader.style.visibility = 'collapse';
    }},
    {from: 'invisible', to: 'visible', object: loader, handle: function(transition) {
        loader.style.visibility = 'visible';
    }}
], 'visible');

state_machine.addTransitions('load_audio_selection', [
    {from: false, to: true, object: undefined, handle: function(transition) {
    }},
    {from: true, to: false, object: undefined, handle: function(transition) {
    }}
], false);

state_machine.addTransitions('load_qualities', [
    {from: false, to: true, object: undefined, handle: function(transition) {
    }},
    {from: true, to: false, object: undefined, handle: function(transition) {
    }}
], false);

function reset() {
    if(player != null) {
        player.destroy();
    }

    player = null;
    state_machine.transition('la_url_form', 'invisible');
}

function reloadPlayer(e) {
    state_machine.transition('la_url_form', 'invisible');
    playUrl(media_url_input.value);
}

function prepareLaUrlInput() {
    state_machine.transition('la_url_form', 'visible');
}

function getUrlFromLocation() {
    var urls = window.location.href.split("#");
    var url = urls[1];

    return url;
}

function mediaUrlChanged(e) {
    // window.location.href = window.location.href.replace(window.location.hash, media_url_input.value);
}

window.addEventListener("hashchange", function() {
    console.log('hashchange');

    var url = getUrlFromLocation();
    guessTech(url, false);
    playUrl(url);
    
}, false);

var formatTimeFromSeconds = function(val) {
    var hours = Math.floor(val / 3600);

    if((hours + '').length == 1) {
        hours = '0' + hours;
    }

    var minutes = Math.floor(val / 60);
    minutes = minutes < 60 ? minutes :  (Math.floor(val / 60) - hours * 60);
    
    if((minutes + '').length == 1) {
        minutes = '0' + minutes;
    }

    var seconds = val < 60 ? val : val - ((hours * 3600) + (minutes * 60));
    seconds = Math.floor(seconds);

    if((seconds + '').length == 1) {
        seconds = '0' + seconds;
    }

    return hours + ':' + minutes + ':' + seconds;
}

function guessTech(url, recursive = false) {
    if('undefined' === typeof(url)) {
        console.log('URL is undefined');
        return;
    }
    
    if(url.indexOf('.mpd') > -1) {
        console.log("Selecting DASH tech...");
        player_tech = 'dash';

        if(false === recursive) {
            var count = playlist.getCount();
            playlist.addItem({
                title: 'Stream ' + (count + 1),
                url: url
            });

            techAscertained();
        }

    } else if(url.indexOf('.m3u8') > -1) {
        console.log("Selecting HLS tech...");
        player_tech = 'hls';
        
        if(false === recursive) {
            var count = playlist.getCount();
            playlist.addItem({
                title: 'Stream ' + (count + 1),
                url: url
            });

            techAscertained();
        }

    } else if(url.indexOf('Manifest') > -1) {
        console.log("Selecting Smooth tech...");
        player_tech = 'smooth';
        
        if(false === recursive) {
            var count = playlist.getCount();
            
            playlist.addItem({
                title: 'Stream ' + (count + 1),
                url: url
            });

            techAscertained();
        }
    } else if(url.indexOf('m3u') > -1) {
        console.log("URL is a media playlist...");

        playlist.loaded = function() {
            var item = playlist.getCurrent(); 
            guessTech(item.url, true);
            techAscertained();
        }

        playlist.load(url);
    } else {
        if(player_tech == undefined) {
            throw 'Url ' + url + ' not recognized.';
        }
    }
}

function playerOnSeek(event) {
    state_machine.transition('loader', 'visible');
}

function playerOnWait(event) {
    state_machine.transition('loader', 'visible');
}

function playerOnLoadedData(event) {
    fillBitrates(player.getQualities());
    fillAudioSelection(player.getAudioTracks());

    if(!player.isLive()) {
        progress.classList.remove('collapsed');
        time.classList.remove('collapsed');
        duration.classList.remove('collapsed');
        duration.innerText = formatTimeFromSeconds(video_element.duration);
    }
}

function playerOnHlsNetworkError(event) {
    state_machine.transition('loader', 'visible');
}

function playerOnStreamInitialized(event) {
    fillBitrates(player.getQualities());
    fillAudioSelection(player.getAudioTracks());
}

function playerOnHlsLevelLoaded(event) {
    if(event.details != undefined && event.details.live == false) {
        progress.classList.remove('collapsed');
        time.classList.remove('collapsed');
        duration.classList.remove('collapsed');
        duration.innerText = formatTimeFromSeconds(video_element.duration);
    }

    fillBitrates(player.getQualities());
    fillAudioSelection(player.getAudioTracks());
}

function playerOnManifestLoaded(event) {
    if(event.data.type == 'static') {
        progress.classList.remove('collapsed');
        time.classList.remove('collapsed');
        duration.classList.remove('collapsed');
        duration.innerText = formatTimeFromSeconds(video_element.duration);
    }

    fillBitrates(player.getQualities());
    fillAudioSelection(player.getAudioTracks());
}

function playerOnTimeUpdate(event) {
    if(!seek_lock) {
        var val = (video_element.currentTime / video_element.duration) * 100;
        progress_range.setValue(val);
    }
    
    var span = document.createElement('span');
    span.innerText = formatTimeFromSeconds(video_element.currentTime);
    clearNode(time);
    time.appendChild(span);
}

function playerOnPlaying(event) {
    state_machine.transition('play_pause', 'playing');

    if(!player.isMuted()) {
        player.setVolume(user_volume);
    }
    
    state_machine.transition('loader', 'invisible');
    resize();
}

// picture_format.addEventListener('change', function(e) {
//     player_resize_mode = parseInt(e.value);
//     resize();
// });

function playerOnPause(event) {
    state_machine.transition('play_pause', 'paused');
}

function playerOnVolumeChange(event) {
    if(false === player.isMuted()) {
        volume_range.setValue(player.getVolume() * 100);
        user_volume = player.getVolume();
        
        chrome.storage.local.set({ user_volume: player.getVolume() }, function() {
        });

        if(player.getVolume() == 0) {
            volume_btn.childNodes[0].innerText = 'volume_mute';
        } else if(player.getVolume() > 0 && player.getVolume() <= .5) {
            volume_btn.childNodes[0].innerText = 'volume_down';
        } else if(player.getVolume() > .5) {
            volume_btn.childNodes[0].innerText = 'volume_up';
        }
    } else {
        volume_range.setValue(0);
        volume_btn.childNodes[0].innerText = 'volume_off';
    }
}

function playUrl(url) {
    reset();
    media_url_input.value = url;
    state_machine.setState('load_qualities', true);
    state_machine.setState('load_audio_selection', true);

    player = new Player({
        "url": url,
        "debug": false,
        "autoplay": true,
        "headers": headers,
        "tech": player_tech,
        "maxQuality": maxQuality,
        "video_element": video_element,
        
        "protData": {
            "com.widevine.alpha": {
                "serverURL": la_url.value,
                "httpRequestHeaders": headers
            }
        },
        "onLicenseError": function() {
            prepareLaUrlInput();
        }
    });

    player.addEventHandler('pause', playerOnPause);
    player.addEventHandler('seeking', playerOnSeek);
    player.addEventHandler('waiting', playerOnWait);
    player.addEventHandler('playing', playerOnPlaying);
    player.addEventHandler('loadeddata', playerOnLoadedData);
    player.addEventHandler('timeupdate', playerOnTimeUpdate);
    player.addEventHandler('volumechange', playerOnVolumeChange);
    player.addEventHandler('hlsLevelLoaded', playerOnHlsLevelLoaded);
    player.addEventHandler('manifestLoaded', playerOnManifestLoaded);
    player.addEventHandler('hlsNetworkError', playerOnHlsNetworkError);

    player.init();
}

var addHeader = function() {
    var header_name = header_name_input.value;
    var header_value = header_value_input.value;
    var list_item = header_list_view.querySelector('#' + header_name);

    if(list_item != undefined) {
        list_item.childNodes[1].innerText = header_value;
    } else {
        var list_item = document.createElement('li');
        list_item.id = header_name;
        var header_name_div = document.createElement('div');
        var header_value_div = document.createElement('div');
        var remove_div = document.createElement('div');
        var icon = document.createElement('i');
        icon.className = 'material-icons control';
        icon.innerText = 'delete_outline';
        header_name_div.className = 'col s5';
        header_value_div.className = 'col s5';
        remove_div.className = 'col s1';
        header_name_div.innerText = header_name;
        header_value_div.innerText = header_value;
        remove_div.appendChild(icon);
        remove_div.setAttribute('data-header', header_name);
        icon.setAttribute('data-header', header_name);
        remove_div.addEventListener('click', removeHeader, false);
        list_item.appendChild(header_name_div);
        list_item.appendChild(header_value_div);
        list_item.appendChild(remove_div);
        header_list_view.appendChild(list_item);
    }

    headers[header_name] = header_value;
}

var removeHeader = function(event) {
    var btn = event.target;
    var header = btn.getAttribute('data-header');
    var item = document.querySelector('#' + header);
    item.parentElement.removeChild(item);
    delete headers[header];
}

var close_input = document.getElementsByClassName('close-input');

for(var i = 0; i < close_input.length; i++) {
    close_input[i].addEventListener('click', function(e) {
        state_machine.transition(e.target.getAttribute('data-target'), 'invisible');
    }, false);
}

// {% if env['target'] != 'self_hosted' %}

function restoreSettings() {
    chrome.storage.local.get({
        hlsjs_version: "1.1.5",
        dashjs_version: "4.3.0",
        hasplayerjs_version: "4.3.0",
        use_latest_dashjs: true,
        use_latest_hlsjs: true,
        use_latest_hasplayerjs: true,
        debug: false,
        video_native_mode: false,
        maxQuality: false,
        user_volume: .5,
    }, function(settings) {
        debug = settings.debug;
        maxQuality = settings.maxQuality;
        video_native_mode = settings.video_native_mode;
        user_volume = settings.user_volume;

        if(settings.use_latest_hlsjs) {
            hlsjs_version = versions['hls.js'][0];
        } else {
            hlsjs_version = settings.hlsjs_version;
        }

        if(settings.use_latest_dashjs) {
            dashjs_version = versions['dashjs'][0];
        } else {
            dashjs_version = settings.dashjs_version;
        }

        if(settings.use_latest_hasplayerjs) {
            hasplayerjs_version = versions['hasplayer.js'][0];
        } else {
            hasplayerjs_version = settings.hasplayerjs_version;
        }

        loadLibs();

        if(video_native_mode) {
            video_element.classList.remove('responsive');
        }

        window.addEventListener('resize', resize);
        resize();
    });
}

restoreSettings();

// FIXME: Dropdowns get recreated and event listeners are cleared
var btn_flats = document.querySelectorAll('.btn-flat');

for(var i = 0; i < btn_flats.length; i++) {
    btn_flats[i].addEventListener('click', function(e) {
        var btn_flat = e.currentTarget;
        btn_flat.classList.remove('btn-flat-animate');
        void btn_flat.offsetWidth;
        btn_flat.classList.add('btn-flat-animate');
    });

    btn_flats[i].addEventListener('animationend', function(e) {
        var btn_flat = e.currentTarget;
        btn_flat.classList.remove('btn-flat-animate');
    });
}

video_element.addEventListener('click', function() {
    state_machine.transition('controls', 'invisible');
    state_machine.transition('settings_form', 'invisible');
    state_machine.transition('playlist_drawer', 'invisible');
    state_machine.transition('la_url_form', 'invisible');
    state_machine.transition('headers_form', 'invisible');
    state_machine.transition('subtitles_url_form', 'invisible');
    state_machine.transition('media_url_form', 'invisible');
});

// {% endif %}