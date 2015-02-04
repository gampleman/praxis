console.log("HELLO");
console.log(process.argv[2], __dirname);
var server = require('observe-json')(process.argv[2], __dirname + '/app');
