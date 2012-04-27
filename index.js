var parse = require('esprima').parse;

module.exports = function (src, fn) {
    if (typeof src !== 'string') src = String(src);
    var ast = parse(src, { range : true });
    
    var output = src.split('');
    var index = 0;
    
    function insertUpdate (node) {
        if (!node.range) return;
        node.source = function () {
            return output.slice(node.range[0], node.range[1] + 1).join('');
        };
        
        node.update = function (cb) {
            var res = cb(node.source());
            output[node.range[0]] = res;
            for (var i = node.range[0] + 1; i < node.range[1] + 1; i++) {
                output[i] = '';
            }
        };
    }
    
    (function walk (node) {
        insertUpdate(node);
        
        Object.keys(node).forEach(function (key) {
            var child = node[key];
            if (Array.isArray(child)) {
                child.forEach(function (c) {
                    if (c && typeof c === 'object' && c.type) {
                        walk(c);
                    }
                });
            }
            else if (child && typeof child === 'object' && child.type) {
                insertUpdate(child);
                walk(child);
            }
        });
        fn(node);
    })(ast);
    
    return output.join('');
};
