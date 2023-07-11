var DashTech = function(options) {
    this.options = options;
    this.player = dashjs.MediaPlayer().create();
    
    if(typeof this.player.setFastSwitchEnabled != 'undefined') {
        this.player.setFastSwitchEnabled(true);
    }
    
    if(typeof this.player.getDebug().setLogToBrowserConsole !== 'undefined') {
        this.player.getDebug().setLogToBrowserConsole(options.debug);
    }

    this.is_live = false;

    if(options.protData != undefined) {
        this.player.getProtectionController().setRobustnessLevel('SW_SECURE_CRYPTO')
        this.player.setProtectionData(options.protData);
    }

    var _dash_tech = this;

    this.player.on(dashjs.MediaPlayer.events.METRIC_CHANGED, function(e) {
        _dash_tech.options.event_handler(e);
    });

    this.player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, function(e) {
        _dash_tech.options.event_handler(e);
    });

    this.player.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, function(e) {
        if(e.data.type == 'dynamic') {
            _dash_tech.is_live = true;
        }

        _dash_tech.options.event_handler(e);
    });

    this.player.on(dashjs.MediaPlayer.events.ERROR, function(e) {
        console.log(e, _dash_tech.options.event_handler, typeof(_dash_tech.options.event_handler));

        console.error(e.error.message);

        if('undefined' !== typeof(_dash_tech.options.event_handler)) {
            _dash_tech.options.event_handler(e);
        } else {
            console.warn('_dash_tech.options.event_handler is undefined');
        }

        if(e.error.code == 111) {
            _dash_tech.options.onLicenseError();
        }

        if(e.error == 'key_session') {
            _dash_tech.options.onLicenseError();
            return;
        }

        _dash_tech.destroy();
    });

    this.player.extend("RequestModifier", () => {
            return {
                modifyRequestHeader: xhr => {
                    for(var header_name in _dash_tech.options.headers) {
                        xhr.setRequestHeader(header_name, _dash_tech.options.headers[header_name]);
                    }

                    return xhr;
                },
                modifyRequestURL: url => {
                    return url;
                }
            };
        },
        true
    );

    this.player.initialize();
    this.player.label = "dash";
    this.player.attachView(options.video_element);
    this.player.setAutoPlay(options.autoplay);
    this.player.attachSource(this.options.url);

    this.getOptions = function() {
        return this.options;
    }

    this.getPlayer = function() {
        return this.player;
    }

    this.isLive = function() {
        return this.is_live;
    }

    this.getAudioTracks = function() {
        var u = this.player.getTracksFor('audio');

        var audio_list = [];

        for(var i = 0; i < u.length; i++) {
            var b = {};
            b.name = u[i].lang;
            b.index = u[i].index;
            audio_list.push({
                lang: u[i].lang,
                name: u[i].name,
                index: u[i].index
            });
        }

        return audio_list;
    }

    this.setAudioTrack = function(index) {
        this.player.setCurrentTrack(this.player.getTracksFor('audio')[index]);
    }

    this.getQualities = function() {
        var u = this.player.getBitrateInfoListFor("video");
        var bitrates = [];

        for(var i = 0; i < u.length; i++) {
            var b = {};
            b.index = u[i].qualityIndex;
            b.bitrate = u[i].bitrate;
            b.height = u[i].height;
            bitrates.push(b);
        }

        return bitrates;
    }

    this.setQuality = function(index) {
        index = parseInt(index);

        if(index == -1) {
            if(typeof this.player.setAutoSwitchQuality !== 'undefined') {
                this.player.setAutoSwitchQuality(true);
            } else if(typeof this.player.setAutoSwitchQualityFor !== 'undefined') {
                this.player.setAutoSwitchQualityFor('video', true);
            } else if(typeof this.player.updateSettings !== 'undefined') {
                this.player.updateSettings({
                    'streaming': {
                        'abr': {
                            'autoSwitchBitrate': {
                                'video': true
                            }
                        }
                    }
                });
            }

            return;
        }

        if(typeof this.player.setAutoSwitchQuality !== 'undefined') {
            this.player.setAutoSwitchQuality(false);
        } else if(typeof this.player.setAutoSwitchQualityFor !== 'undefined') {
            this.player.setAutoSwitchQualityFor('video', false);
        } else if(typeof this.player.updateSettings !== 'undefined') {
            this.player.updateSettings({
                'streaming': {
                    'abr': {
                        'autoSwitchBitrate': {
                            'video': false
                        }
                    }
                }
            });
        }

        this.player.setQualityFor("video", index);
    }

    this.setMaxQuality = function() {
        var qualities = this.getQualities();
        var quality = qualities[0];
        
        for(var i = 1; i < qualities.length; i++) {
            if(qualities[i].bitrate > quality.bitrate) {
                quality = qualities[i];
            }
        }

        this.setQuality(quality.index);
    }

    this.destroy = function() {
        if(this.player != null) {
            this.player.reset();
            this.player = null;
        }
    }
}
