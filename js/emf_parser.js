var sys = require('sys'), fs = require('fs'), xml2js = require('xml2js');
var MODEL_FILE = '/../shared/uml/work.mdxml';
var SHARED_JS_DIR = '../shared/js/';
var SHARED_MODEL_NAME = 'implementation';
	
var parser = new xml2js.Parser();

parser.addListener('end', function(result) {
	var root_model = result["uml:Model"].packagedElement;
	debugger;
	root_model.forEach(function cb_each_model(pkg) {
		if (get_type(pkg) == 'uml:Model') {
			visit_model(pkg);
		}
	});
});

function visit_model(model) {
	debugger;
	if (get_name(model) == SHARED_MODEL_NAME){
		model.packagedElement.forEach(function cb_each_package(pkg) {
			var type = get_type(pkg);
			debugger;
			switch (type) {
			case 'uml:Package':
				visit_package(pkg);
				break;
			case 'uml:Class':
				visit_class('.', pkg);
				break;
			}
		});
	}
}

function visit_package(pkg) {
	var dir = get_name(pkg);
	try {
		fs.mkdirSync(dir, 0777);
	} catch (ex) {

	}
	pkg.packagedElement.forEach(function cb_each_elem(elem) {
		var type = get_type(elem);
		switch (type) {
		case 'uml:Class':
			visit_class(dir, elem);
			break;
		}
	});
}

function visit_class(pkg_name, cls) {
	var annotation = get_annotation(cls);
	var class_name = get_name(cls);
	debugger;
	var src = [];
	src.push(annotation);
	src.push("function " + get_name(cls) + "(){\n}\n");
	if ('ownedAttribute' in cls) {
		visit_ownedAttribute(src, cls, cls.ownedAttribute);
	}

	if ('ownedOperation' in cls) {
		visit_ownedOperation(src, cls, cls.ownedOperation);
	}
	try {

	} catch (ex) {

	}
//	fs.writeFileSync(SHARED_JS_DIR + pkg_name + '/' + class_name.toLowerCase()
//			+ '.js', src.join('\n'), 'utf-8');
	console.log(src.join('\n'));
};

function visit_ownedOperation(src, cls, op) {
	op.forEach(function cb_each_op(elem) {
		if (elem) {
			if ('@' in elem) {
				// its a function
				var annotation = get_annotation(elem);
				src.push(annotation);
				var defun = get_name(cls) + ".prototype." + get_name(elem)
						+ " = function " + get_name(elem) + "(";
			} else {
				// its a parameter-list ????
			}
			if ('ownedParameter' in elem) {
				if (typeof defun != "undefined") {
					visit_ownedParameter({
						fun : defun
					}, elem.ownedParameter);
				}
			}
			if (typeof defun != "undefined") {
				defun += "){\n};\n";
				src.push(defun);
			}
		}
	});
};

function visit_ownedParameter(fun_obj, params) {
	fun_obj.defun += "**";
};

// ownedAttribute
function visit_ownedAttribute(src, cls, attr) {
//	if (attr.constructor == Array) {
//		attr.forEach(function cb_each_attr(elem) {
//			if (elem) {
//				if ('@' in elem) {
//					var annotation = get_annotation(elem);
//					src.push(annotation);
//					var defattr = get_name(cls) + ".prototype."
//							+ get_name(elem) + " = null;\n";
//					src.push(defattr);
//				} else {
//					// its a parameter-list ????
//				}
//			}
//		});
//	} else {
//		if (get_name(attr) != "") {
//			src.push("({'ATTR' : " + JSON.stringify(attr, null, 2) + "});");
//		}
//	}
};

function get_name(elem) {
	if ('@' in elem) {
		return elem['@']['name'];
	} else {
		console.error('corrupted structure xmi-attribute "@" not found');
	}
};

function get_xmi_id(elem) {
	if ('@' in elem) {
		return elem['@']['xmi:id'];
	} else {
		console.error('corrupted structure xmi-attribute "@" not found');
	}
};

function get_type(elem) {
	if ('@' in elem) {
		return elem['@']['xmi:type'];
	} else {
		console.error('corrupted structure xmi-attribute "@" not found');
	}
};

function get_annotation(elem) {
	if ('@' in elem) {
		return '/*{"@" :' + JSON.stringify((elem['@']), null, 2) + '}*/;';
	} else {
		console.error('corrupted structure xmi-attribute "@" not found');
	}
};

function get_visibility(elem) {
	return elem['@']['visibility'];
}

// ##########################################################
fs.readFile(__dirname + MODEL_FILE, function(err, data) {
	parser.parseString(data);
});