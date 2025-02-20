state_machine.addTransitions('controls', [
    {from: "visible", to: "invisible", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeIn');
        o.classList.add('fadeOut');
        video_element.style.cursor = 'none';
    }},
    {from: "invisible", to: "visible", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeOut');
        o.classList.add('fadeIn');
        video_element.style.cursor = 'initial';
    }},
    {from: "visible", to: "frozen", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeOut', 'fadeIn');
    }},
    {from: "frozen", to: "visible", object: controls, handle: function(transition) {
    }}
], 'visible'); 

state_machine.addTransitions('play_pause', [
    {from: "playing", to: "paused", object: play_pause, handle: function(transition) {
        transition.object.querySelector('i').innerText = "play_arrow";
    }},
    {from: "paused", to: "playing", object: play_pause, handle: function(transition) {
        transition.object.querySelector('i').innerText = "pause";
    }}
], 'paused');

state_machine.addTransitions('volume_popup', [
    {from: "visible", to: "invisible", object: volume_popup, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeIn');
        o.classList.add('fadeOut');
    }},
    {from: "invisible", to: "visible", object: volume_popup, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('collapsed', 'fadeOut');
        o.classList.add('fadeIn');
    }}
], 'invisible');

state_machine.addTransitions('settings_form', [
    {from: "visible", to: "invisible", object: settings_form, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeInRight');
        o.classList.add('fadeOutRight');
    }},
    {from: "invisible", to: "visible", object: settings_form, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('collapsed', 'fadeOutRight');
        o.classList.add('fadeInRight');
    }}
], 'invisible');

state_machine.addTransitions('playlist_drawer', [
    {from: "visible", to: "invisible", object: playlist_drawer, handle: function(transition) {
        playlist_drawer.classList.remove('fadeInLeft');
        playlist_drawer.classList.add('animated', 'fadeOutLeft');
    }},
    {from: "invisible", to: "visible", object: playlist_drawer, handle: function(transition) {
        playlist_drawer.classList.remove('collapsed');
        playlist_drawer.classList.remove('fadeOutLeft');
        playlist_drawer.classList.add('animated', 'fadeInLeft');
    }}
], 'invisible');


var timeout_id;

function playerMouseMove() {
    state_machine.transition('controls', 'visible');
    clearTimeout(timeout_id);

    timeout_id = setTimeout(function() {
        state_machine.transition('controls', 'invisible');
    }, 3000);
}

function toggleSettings() {
    if(state_machine.getState('settings_form') == 'visible') {
        state_machine.transition('settings_form', 'invisible');
        return;
    }

    state_machine.transition('settings_form', 'visible');
}

function togglePlaylist() {
    if(state_machine.getState('playlist_drawer') == 'visible') {
        state_machine.transition('playlist_drawer', 'invisible');
        return;
    }

    state_machine.transition('playlist_drawer', 'visible');
}

function toggleMute() {
    if(player != null) {
        if(player.isMuted()) {
            player.unmute()
        } else {
            player.mute()
        }
    }
}

video_element.addEventListener('mousemove', playerMouseMove);

controls.addEventListener('mouseover', function() {
    state_machine.transition('controls', 'frozen');
});

controls.addEventListener('mouseout', function() {
    state_machine.transition('controls', 'visible');
});

timeout_id = setTimeout(function() {
    state_machine.transition('controls', 'invisible');
}, 3000);

var fillAudioSelection = function(audio_list) {
    if(audio_list.length == 0) {
        return;
    }

    if(state_machine.getState('load_audio_selection') === false) {
        return;
    }

    state_machine.setState('load_audio_selection', false);
    audio_selection.clear();
    audio_selection.addOption({label: "Auto", value: -1, selected: true});
    var label = '';
    var lbl = [];

    for(var i = 0; i < audio_list.length; i++) {
        label = '';
        lbl = [];

        if(audio_list[i].id != undefined) {
            lbl.push(audio_list[i].id + ': ');
        }

        if(audio_list[i].name != undefined) {
            lbl.push(audio_list[i].name);
        }

        if(audio_list[i].lang != undefined) {
            lbl.push(audio_list[i].lang);
        }

        label = lbl.join(', ');

        audio_selection.addOption({label: label, value: audio_list[i].index, selected: false});
    }

    audio_selection.addEventListener('change', function(e) {
        player.setAudioTrack(parseInt(e.value) - 1);
    });
}

var fillBitrates = function(bitrates) {
    if(bitrates.length == 0) {
        return;
    }

    if(state_machine.getState('load_qualities') === false) {
        return;
    }

    state_machine.setState('load_qualities', false);
    bitrate_selection.clear();
    bitrate_selection.addOption({label: "Auto", value: -1, selected: true});
    var label = '';
    var lbl = [];

    for(var i = 0; i < bitrates.length; i++) {
        lbl = [];

        if(bitrates[i].name != undefined) {
            lbl.push(bitrates[i].name);
        }

        if(bitrates[i].height != undefined) {
            lbl.push(bitrates[i].height);
        }

        if(bitrates[i].bitrate != undefined) {
            lbl.push(bitrates[i].bitrate);
        }

        label = lbl.join(', ');

        bitrate_selection.addOption({label: label, value: bitrates[i].index, selected: false});
    }

    bitrate_selection.addEventListener('change', function(e) {
        player.setQuality(parseInt(e.value));
    });

    if(player.getOptions().maxQuality === true) {
        player.setMaxQuality();
    }
}

play_pause.addEventListener('click', playPause);

function playPause() {
    if(state_machine.getState('play_pause') == 'paused') {
        video_element.play();
    } else {
        video_element.pause();
    }
}

state_machine.addTransitions('la_url_form', [
    {from: "visible", to: "invisible", object: la_url_toggle_btn, handle: function(transition) {
        la_url_form.classList.add('fadeOutUp');
        la_url_form.classList.remove('fadeInDown');
        reload_source_la_url_btn.removeEventListener('click', reloadPlayer);
    }},
    {from: "invisible", to: "visible", object: la_url_toggle_btn, handle: function(transition) {
        la_url_form.classList.remove('collapsed');
        la_url_form.classList.remove('fadeOutUp');
        la_url_form.classList.add('animated', 'fadeInDown');
        reload_source_la_url_btn.addEventListener('click', reloadPlayer);
    }}
], 'invisible');

state_machine.addTransitions('headers_form', [
    {from: "visible", to: "invisible", object: la_url_toggle_btn, handle: function(transition) {
        headers_form.classList.add('fadeOutUp');
        headers_form.classList.remove('fadeInDown');
        add_header_btn.removeEventListener('click', addHeader);
        headers_reload_player_btn.removeEventListener('click', reloadPlayer);
    }},
    {from: "invisible", to: "visible", object: la_url_toggle_btn, handle: function(transition) {
        headers_form.classList.remove('collapsed');
        headers_form.classList.remove('fadeOutUp');
        headers_form.classList.add('animated', 'fadeInDown');
        add_header_btn.addEventListener('click', addHeader);
        headers_reload_player_btn.addEventListener('click', reloadPlayer);
    }}
], 'invisible');

state_machine.addTransitions('media_url_form', [
    {from: "visible", to: "invisible", object: media_url_form, handle: function(transition) {
        media_url_form.classList.add('fadeOutUp');
        media_url_form.classList.remove('fadeInDown');
        reload_source_media_url_btn.removeEventListener('click', reloadPlayer);
    }},
    {from: "invisible", to: "visible", object: media_url_form, handle: function(transition) {
        media_url_form.classList.remove('collapsed');
        media_url_form.classList.remove('fadeOutUp');
        media_url_form.classList.add('animated', 'fadeInDown');
        reload_source_media_url_btn.addEventListener('click', reloadPlayer);
    }}
], 'invisible');

state_machine.addTransitions('subtitles_url_form', [
    {from: "visible", to: "invisible", object: subtitles_url_form, handle: function(transition) {
        subtitles_url_form.classList.add('fadeOutUp');
        subtitles_url_form.classList.remove('fadeInDown');
        reload_source_media_url_btn.removeEventListener('click', loadSubtitles);
    }},
    {from: "invisible", to: "visible", object: subtitles_url_form, handle: function(transition) {
        subtitles_url_form.classList.remove('collapsed');
        subtitles_url_form.classList.remove('fadeOutUp');
        subtitles_url_form.classList.add('animated', 'fadeInDown');
        load_subtitles_url_btn.addEventListener('click', loadSubtitles);
    }}
], 'invisible');

la_url_toggle_btn.addEventListener('click', function() {
    state_machine.transition('la_url_form', 'visible');
    state_machine.transition('settings_form', 'invisible');
});

headers_toggle_btn.addEventListener('click', function() {
    state_machine.transition('headers_form', 'visible');
    state_machine.transition('settings_form', 'invisible');
});

subtitles_toggle_btn.addEventListener('click', function() {
    state_machine.transition('subtitles_url_form', 'visible');
    state_machine.transition('settings_form', 'invisible');
});

media_url_toggle_btn.addEventListener('click', function() {
    state_machine.transition('media_url_form', 'visible');
    state_machine.transition('settings_form', 'invisible');
});

var volumePopupTransitionEnd = function() {
    volume_popup.removeEventListener('animationend', volumePopupTransitionEnd);
    volume_popup.classList.add('collapsed');
}

volume.addEventListener('mouseover', function() {
    volume_popup.removeEventListener('animationend', volumePopupTransitionEnd);
    state_machine.transition('volume_popup', 'visible');
});

volume.addEventListener('mouseout', function() {
    volume_popup.addEventListener('animationend', volumePopupTransitionEnd, false);
    state_machine.transition('volume_popup', 'invisible');
});

state_machine.addTransitions('window', [
    {from: "fullscreen", to: "windowed", object: null, handle: function(transition) {
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }},
    {from: "windowed", to: "fullscreen", object: null, handle: function(transition) {
        if (body.requestFullscreen) {
            body.requestFullscreen();
        }
        else if (body.mozRequestFullScreen) {
            body.mozRequestFullScreen();
        }
        else if (body.webkitRequestFullscreen) {
            body.webkitRequestFullscreen();
        }
    }}
], 'windowed');

var fullscreen_clicked = false;

function switchToFullscreen() {
    fullscreen_clicked = true;

    if(state_machine.getState('window') == 'windowed') {
        state_machine.transition('window', 'fullscreen');
    } else {
        state_machine.transition('window', 'windowed');
    }
}

fullscreen_toggle_btn.addEventListener('click', switchToFullscreen, false);
video_element.addEventListener('dblclick', switchToFullscreen);

window.addEventListener('webkitfullscreenchange', fullscreenExitHandler, false);
window.addEventListener('mozfullscreenchange', fullscreenExitHandler, false);
window.addEventListener('fullscreenchange', fullscreenExitHandler, false);

function fullscreenExitHandler() {
    if(body.webkitIsFullScreen || body.mozFullScreen || body.msFullscreenElement !== null && state_machine.getState('window') == 'fullscreen' && !fullscreen_clicked) {
        state_machine.setState('window', 'windowed');
    }

    fullscreen_clicked = false;
}

function loadSubtitles() {
    player.loadSubtitles(subtitles_url_input.value);
}

window.addEventListener('keyup', function(e) {
    if(e.key == 'f') {
        switchToFullscreen();
        return;
    }

    if(e.key == ' ') {
        playPause();
        return;
    }

    if(e.key == 'ArrowUp') {
        if(player.getVolume() + .1 > 1) {
            player.setVolume(1.0);
            return;
        }

        player.setVolume(player.getVolume() + .1);
        return;
    }

    if(e.key == 'ArrowDown') {
        if(player.getVolume() - .1 < 0) {
            player.setVolume(0.0);
            return;
        }

        player.setVolume(player.getVolume() - .1);
    }

    if(e.key == 'ArrowLeft') {
        if(video_element.currentTime - 10 < 0) {
            video_element.currentTime = 0;
            return;
        }

        video_element.currentTime -= 10;
    }

    if(e.key == 'ArrowRight') {
        if(video_element.currentTime + 10 > video_element.duration) {
            video_element.currentTime = video_element.duration;
            return;
        }

        video_element.currentTime += 10;
    }

}, false);

window.addEventListener('resize', progress_resize);

function progress_resize() {
    var controls_center = document.querySelector('#controls-center');
    controls_center.style.width = (window.innerWidth - 380 - (window.innerWidth * .02)) + 'px';
}

progress_resize();

settings_btn.addEventListener('click', toggleSettings);
playlist_btn.addEventListener('click', togglePlaylist);
volume_btn.addEventListener('click', toggleMute);