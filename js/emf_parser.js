require.paths.unshift('../shared/js');
var sys = require('sys'), fs = require('fs'), xml2js = require('xml2js');
var MODEL_FILE = '/../shared/uml/work.mdxml';
var xmi_walker = require('xmi_walker').create_walker();
	
var parser = new xml2js.Parser();

parser.addListener('end', function(result) {
	xmi_walker.start(result);
});

// ##########################################################
fs.readFile(__dirname + MODEL_FILE, function(err, data) {
	parser.parseString(data);
});