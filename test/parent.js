var falafel = require('../');
var test = require('tap').test;
var vm = require('vm');

test('parent', function (t) {
    t.plan(3);
    
    var src = '(' + function () {
        var xs = [ 1, 2, 3 ];
        fn(xs);
    } + ')()';
    
    var output = falafel(src, function (node) {
        if (node.type === 'ArrayExpression') {
            t.equal(node.parent.type, 'VariableDeclaration');
            t.equal(node.parent.source(), 'var xs = [ 1, 2, 3 ];');
            node.parent.update('var xs = 4;');
        }
    });
    
    vm.runInNewContext(output, {
        fn : function (xs) {
            t.equal(xs, 4);
        },
    });
});
