var falafel = require('../');
var src = 'console.log(beep "boop", "BOOP");';
var opts = { isKeyword: isKeyword };

function isKeyword (id) {
    if (id === 'beep') return true;
}

var output = falafel(src, opts, function (node) {
    if (node.type === 'UnaryExpression'
    && node.operator === 'beep') {
        node.update(
            'String(' + node.argument.source() + ').toUpperCase()'
        );
    }
});
console.log(output);
