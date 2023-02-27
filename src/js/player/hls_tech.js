var HlsTech = function(options) {
    this.options = options;
    this.recover_take = 0;
    var _hls_tech = this;
    this.is_live = false;

    this.player = new Hls({
        enableWorker: false,
        debug: options.debug,

        xhrSetup: function(xhr, url) {
            for(var header_name in _hls_tech.options.headers) {
                xhr.setRequestHeader(header_name, _hls_tech.options.headers[header_name]);
            }
        }
    });

    this.player.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
        data.type = event;
        _hls_tech.options.event_handler(data);

        if(_hls_tech.options.autoplay === true) {
            _hls_tech.options.video_element.play();
        }
    });

    this.player.on(Hls.Events.LEVEL_LOADED, function(event, data) {
        if(data.details != undefined && data.details.type !== 'VOD') {
            _hls_tech.is_live = true;
        }

        data.type = event;
        _hls_tech.options.event_handler(data);
    });

    this.player.on(Hls.Events.ERROR, function(event, data) {
        data.type = event;
        console.error(event, data);

        if(data.fatal) {
            switch(data.type) {
                case Hls.ErrorTypes.MEDIA_ERROR: 
                    console.error("Media error");
                    _hls_tech.options.event_handler(data);

                    if(_hls_tech.recover_take == 1) {
                        hls.swapAudioCodec();
                    }

                    hls.recoverMediaError();
                    _hls_tech.recover_take++;
                    break;
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error");
                    _hls_tech.options.event_handler(data);
                    hls.startLoad();
                    break;
                default:
                    console.error("Unrecoverable error");
                    _hls_tech.options.event_handler(data);
                    _hls_tech.destroy();
                    break;
            }
        }
    });

    this.player.loadSource(this.options.url);
    this.player.attachMedia(options.video_element);

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
        var tracks = this.player.audioTracks;
        var tr = [];
        
        for(var i = 0; i < tracks.length; i++) {
            tr.push({
                name: tracks[i].name,
                index: i,
                lang: tracks[i].lang
            });
        }
        
        return tr;
    }

    this.setAudioTrack = function(index) {
        this.player.audioTrack = index + 1;
    }

    this.getQualities = function() {
        var u = this.player.levels;
        var bitrates = [];

        for(var i = 0; i < u.length; i++) {
            var b = {};
            b.index = u[i].level != undefined ? u[i].level : i;
            b.bitrate = u[i].bitrate;
            b.height = u[i].height;
            b.bane = u[i].name;
            bitrates.push(b);
        }

        return bitrates;
    }

    this.setQuality = function(index) {
        index = parseInt(index);
        this.player.currentLevel = index;
    }

    this.setMaxQuality = function() {
        var qualities = this.getQualities();
        maxQualityIndex = -1;
        bitrate = 0;

        for(var i = 0; i < qualities.length; i++) {
            if(qualities[i].bitrate > bitrate) {
                bitrate = qualities[i].bitrate;
                maxQualityIndex = i;
            }
        }

        this.setQuality(maxQualityIndex);
    }

    this.destroy = function() {
        if(this.player != null) {
            this.player.destroy();
            this.player = null;
        }
    }
}