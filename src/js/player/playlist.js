var Playlist = function() {
    this.items = [];
    var _playlist = this;
    this.position = 0;
    this.loaded = null;

    this.load = function(url) {
        (new Ajax()).get({
            url: url,
            success: function(e) {
                var lines = e.split("\n");

                for(var i = 0; i < lines.length; i++) {
                    var line = lines[i];

                    if('' == line) {
                        continue;
                    }

                    if('#EXTM3U' == line) {
                        continue;
                    }

                    if(0 == line.indexOf('#EXTINF')) {
                        if(0 == lines[i + 1].indexOf('http')) {
                            var info = line.split(',');

                            _playlist.items.push({
                                url: lines[i + 1],
                                title: info[1]
                            });
                        }
                    }
                }

                if('undefined' !== typeof(_playlist.loaded)) {
                    _playlist.loaded();
                }
            }
        });
    }

    this.getCount = function() {
        return this.items.length;
    }

    this.getNext = function() {
        return this.items[++this.position];
    }

    this.getCurrent = function() {
        return this.items[this.position];
    }

    this.getPrevious = function() {
        return this.items[--this.position];
    }

    this.rewind = function() {
        this.position = 0;
        return this.items[this.position];
    }

    this.getLast = function() {
        return this.items[this.items.length - 1];
    }

    this.getAt = function(index) {
        if(this.getCount() <= index) {
            return null;
        }

        return this.items[index];
    }

    this.addItem = function(item) {
        this.items.push(item);
    }
}
