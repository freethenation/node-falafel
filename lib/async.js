var falafel = require('../');

module.exports = function (src, fn) {
    var offsets = [];
    var isNext = false;
    
    var result = {};
    result.source = falafel(src, function (node) {
        var ix = offsets.length;
        offsets.push(offsets[offsets.length - 1] || 0);
        
        var update = node.update;
        node.update = function (s_) {
            if (!isNext) {
                var delta = s_.length - (node.range[1] - node.range[0] + 1);
                var prev = offsets[ix - 1] || 0;
                offsets[ix] = prev + delta;
                return update.call(this, s_);
            }
            
            var delta = s_.length - (node.range[1] - node.range[0] + 1);
            for (var i = ix + 1; i < offsets.length; i++) {
                offsets[i] += delta;
            }
            var offset = offsets[ix];
            var xs = result.source.split('');
            
            var len = node.range[1] - node.range[0] + 1;
            xs.splice(node.range[0] + offset, len, s_);
            result.source = xs.join('');
            node.range[1] = node.range[0] + s_.length - 1;
        };
        fn(node);
    });
    
    isNext = true;
    return result;
};
