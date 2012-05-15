var parse = require('esprima').parse;

module.exports = function (src, fn) {
    var opts = {};
    if (typeof src === 'object') {
        opts = src;
        src = opts.source;
        delete opts.source;
    }
    opts.range = true;
    if (typeof src !== 'string') src = String(src);
    
    var ast = parse(src, opts);
    
    var output = src.split('');
    var index = 0;
    
    function insertHelpers (node, parent) {
        if (!node.range) return;
        
        node.parent = parent;
        
        node.source = function () {
            return output.slice(node.range[0], node.range[1] + 1).join('');
        };
        
        node.update = function (s) {
            output[node.range[0]] = s;
            for (var i = node.range[0] + 1; i < node.range[1] + 1; i++) {
                output[i] = '';
            }
        };
    }
    
    (function walk (node, parent) {
        insertHelpers(node, parent);
        
        Object.keys(node).forEach(function (key) {
            if (key === 'parent') return;
            
            var child = node[key];
            if (Array.isArray(child)) {
                child.forEach(function (c) {
                    if (c && typeof c === 'object' && c.type) {
                        walk(c, node);
                    }
                });
            }
            else if (child && typeof child === 'object' && child.type) {
                insertHelpers(child, node);
                walk(child, node);
            }
        });
        fn(node);
    })(ast, undefined);
    
    return output.join('');
};
