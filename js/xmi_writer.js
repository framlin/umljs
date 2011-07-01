require.paths.unshift('../shared/js');
var json2xml = require('json2xml');
var jsonData = {"@":{"hallo":"welt"},"na":{"geht":"doch"}};
console.log(json2xml.toXml("firstXmlTag",jsonData));
