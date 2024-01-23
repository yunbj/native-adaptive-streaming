var Range = function(options) {
    if(options.min_value > options.max_value) {
        throw "max_value must be larger than min_value";
    }

    if(options.value > options.max_value || options.value < options.min_value) {
        throw "Default value out of range";
    }

    var _range = this;
    this.seek_lock = false;
    this.options = options;
    this.value = options.value;
    this.min_value = options.min_value;
    this.max_value = options.max_value;
    this.type = options.type;

    this.path = document.createElement('div');
    this.path.style.border = '1px solid white';
    this.path.style.cursor = 'pointer';

    this.fill = document.createElement('div');

    if(this.options.type == 'horizontal') {
        this.path.style.height = '15px';
        this.path.style.width = '100%';
        this.fill.style.height = '15px';
        this.fill.style.float = 'left';
        this.fill.borderRadius = '0 100%';
        this.fill.style.backgroundColor = '#FF4136';
    }

    if(this.options.type == 'vertical') {
        this.path.style.width = '15px';
        this.path.style.height = '100%';
        this.path.style.backgroundColor = '#FF4136';
        this.fill.style.width = '15px';
        this.fill.style.height = '100%';
        this.fill.borderRadius = '100% 100% 0 0';
        this.fill.style.backgroundColor = 'black';
    }

    this.path.appendChild(this.fill);
    this.options.target.appendChild(this.path);
    this.options.target.className = this.options.target_classlist;

    this.setValue = function(value) {
        if(_range.seek_lock) {
            return;
        }

        if(this.type == 'vertical') {
            value = this.max_value - value;
        }

        if(value > this.max_value && value < this.min_value) {
            return;
        }
        
        this.value = value;
        this.percentage = (value - this.min_value) / (this.max_value - this.min_value);

        if(this.type == 'vertical') {
            this.fill.style.height = (this.percentage * 100) + '%';
        }

        if(this.type == 'horizontal') {
            this.fill.style.width = (this.percentage * 100) + '%';
        }
    }

    this.setPercentage = function(percentage) {
        if(percentage < 0) {
            percentage = 0;
        }

        if(percentage > 1) {
            percentage = 1;
        }

        this.value = percentage * (this.max_value - this.min_value)
        this.percentage = percentage;

        if(this.type == 'vertical') {
            this.fill.style.height = (this.percentage * 100) + '%';
        }

        if(this.type == 'horizontal') {
            this.fill.style.width = (this.percentage * 100) + '%';
        }
    }

    this.seekMouseUp = function(e) {
        window.removeEventListener('mouseup', _range.seekMouseUp);
    
        if(!_range.seek_lock) {
            return;
        }
       
        _range.seek_lock = false;
        window.removeEventListener('mousemove', _range.updateProgressPosition);

        if(_range.options.valueChanged != undefined) {
            if(_range.type == 'horizontal') {
                _range.options.valueChanged(_range.value);
            }

            if(_range.type == 'vertical') {
                _range.options.valueChanged(_range.max_value - _range.value);
            }
        }
    }
    
    this.updateProgressPosition = function(e) {
        var rect = _range.options.target.getBoundingClientRect();

        if(_range.type == 'horizontal') {
            _range.setPercentage((e.clientX - rect.left) / rect.width);
        }

        if(_range.type == 'vertical') {
            _range.setPercentage((e.clientY - rect.top) / rect.height);
        }
    }
    
    this.options.target.addEventListener('mousedown', function(e) {
        if(e.which != 1) {
            return;
        }
        
        _range.seek_lock = true;
        var rect = _range.options.target.getBoundingClientRect();
        window.addEventListener('mousemove', _range.updateProgressPosition, false);
        window.addEventListener('mouseup', _range.seekMouseUp, false);

        if(_range.type == 'horizontal') {
            _range.setPercentage((e.clientX - rect.left) / rect.width);
        }

        if(_range.type == 'vertical') {
            _range.setPercentage((e.clientY - rect.top) / rect.height);
        }

    }, false);
}