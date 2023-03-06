/**
 * Modifications copyright (C) 2017 David Ćavar
 */

var debug = false;
var hlsjsCurrentVersion = "0";
var dashjsCurrentVersion = "0";

var loaded1 = loaded2 = false;

/**
 * Abstraction
 */
var Player = function(options) {
    this.tech = null;
    this.volume = .5;
    this.muted = false;
    
    this.playlist = null;
    this.options = options;
    this.event_handlers = {};
    this.event_handler_count = 0;

    this.available_events = [
        "abort", "canplay", "canplaythrough", "durationchange", "emptied", "encrypted", "ended", "error", "interruptbegin", "loadeddata", 
        "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "seeked", "seeking", "stalled", "suspend", 
        "timeupdate", "volumechange", "waiting"
    ];
    
    var _player = this;

    if(options.debug == undefined) {
        options.debug = false;
    }

    this.getOptions = function() {
        return this.options;
    }

    this.getUrl = function() {
        return this.options.url;
    }

    this.getTech = function() {
        return this.tech;
    }

    this.handleEvent = function(event) {
        if((event.type in _player.event_handlers)) {
            for(event_handler_id in _player.event_handlers[event.type]) {
                _player.event_handlers[event.type][event_handler_id](event);
            }
        }
    }

    for(var i = 0; i < this.available_events.length; i++) {
        this.options.video_element.addEventListener(this.available_events[i], this.handleEvent, false);
    }

    this.addEventHandler = function(event, handler) {
        if(!(event.type in this.event_handlers)) {
            this.event_handlers[event] = {};
        }

        var id = 'handler_' + this.event_handler_count++;
        this.event_handlers[event][id] = handler;
        return id;
    }

    this.removeEventHandler = function(event, id) {
        delete this.event_handlers[event][id];
    }

    this.clearEventHandlers = function() {
        for(var i = 0; i < this.available_events.length; i++) {
            this.options.video_element.removeEventListener(this.available_events[i], this.handleEvent, false);
        }
    }

    this.play = function() {
        this.options.video_element.play();
    }

    this.pause = function() {
        this.options.video_element.pause();
    }

    this.seek = function(seconds) {
        var v = this.options.video_element;
        v.currentTime = seconds;
    }

    this.getDuration = function() {
        return this.options.video_element.duration;
    }

    this.isLive = function() {
        return this.getTech().isLive();
    }

    this.getAudioTracks = function() {
        return this.getTech().getAudioTracks();
    }

    this.setAudioTrack = function(index) {
        this.getTech().setAudioTrack(index);
    }

    this.getQualities = function() {
        return this.getTech().getQualities();
    }

    this.setQuality = function(index) {
        this.getTech().setQuality(index);
    }

    this.getAudioTracks = function() {
        return this.getTech().getAudioTracks();
    }

    this.setMaxQuality = function() {
        this.tech.setMaxQuality();
    }

    this.setPlaybackRate = function(value) {
        this.options.video_element.playbackRate = value;
    }

    this.setVolume = function(volume) {
        this.muted = false;
        this.options.video_element.volume = volume;
        this.volume = volume;
    }

    this.getVolume = function() {
        return this.volume;
    }

    this.mute = function() {
        this.muted = true;
        this.options.video_element.volume = 0;
    }

    this.unmute = function() {
        this.muted = false;
        this.options.video_element.volume = this.volume;
    }

    this.isMuted = function() {
        return this.muted;
    }

    this.loadSubtitles = function(url) {
        this.clearVideoElement();
        var track = document.createElement('track');
        track.label = 'Subtitle';
        track.kind = 'subtitles';
        track.default = 'default';
        track.src = url;
        this.options.video_element.appendChild(track);
    }

    this.clearVideoElement = function() {
        clearNode(this.options.video_element);
    }

    this.destroy = function() {
        this.clearVideoElement();
        this.clearEventHandlers();

        if('undefinded' != typeof(this.tech)) {
            this.tech.destroy();
        }
        
        this.tech = null;
    }
    
    this.init = function() {
        this.options.event_handler = this.handleEvent;

        if('dash' == this.options.tech) {
            this.tech = new DashTech(this.options);
        } else if('smooth' == this.options.tech) {
            this.tech = new SmoothTech(this.options);
        } else if('hls' == this.options.tech) {
            this.tech = new HlsTech(this.options);
        }
    }
}
