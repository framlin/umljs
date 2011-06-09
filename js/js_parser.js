require.paths.unshift('../generated_js');
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;
var xmi_processor = require('xmi_processor').create_processor();

var fs = require('fs');

var orig_code = fs.readFileSync("../generated_js/xmi_processor.js",'utf-8');
debugger;
var ast = jsp.parse(orig_code); // parse code and get the initial AST
var final_code = pro.gen_code(ast,{beautify:true}); // compressed code here
//var xmi = xmi_processor.process(ast);
debugger;
//console.log(JSON.stringify(ast, null, 2));
console.log(final_code);