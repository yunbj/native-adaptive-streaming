function Ajax() {
    var _ajax = this;
    
    this.get = function(options) {
        var xhttp = new XMLHttpRequest();
        

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                options.success(this.responseText);
            }
        };

        var async = true;

        if('undefined' !== typeof(options.async)) {
            async = options.async;
        }

        xhttp.open("GET", options.url, async);
        xhttp.send();
    }
}