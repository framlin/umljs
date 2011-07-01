var fs = require('fs');
var SHARED_JS_DIR = './';
var SHARED_MODEL_NAME = 'implementation';

function XMI_WALKER() {
	this.stack = [];
}

XMI_WALKER.prototype.start = function start(parse_result, cb_result) {
	var me = this;
	var root_model = parse_result["uml:Model"].packagedElement;
	debugger;
	root_model.forEach(function cb_each_model(pkg) {
		if (me.get_type(pkg) == 'uml:Model') {
			me.visit_model(me.stack, pkg);
		}
	});
	
	//copy the result-stack and pass it to the call_back
	var src = [];
	this.stack.forEach(function cb_eack(elem){
		src.push(elem);
	});
	cb_result(src);
};

XMI_WALKER.prototype.visit_model = function visit_model(stack, model) {
	var me = this;
	debugger;
	if (this.get_name(model) == SHARED_MODEL_NAME) {
		model.packagedElement.forEach(function cb_each_package(pkg) {
			var type = me.get_type(pkg);
			debugger;
			switch (type) {
			case 'uml:Package':
				me.visit_package(stack, pkg);
				break;
			case 'uml:Class':
				me.visit_class(stack, '.', pkg);
				break;
			}
		});
		
	}
};

XMI_WALKER.prototype.visit_package = function visit_package(stack, pkg) {
	var me = this;
	var dir = this.get_name(pkg);
	try {
		fs.mkdirSync(dir, 0777);
	} catch (ex) {

	}
	pkg.packagedElement.forEach(function cb_each_elem(elem) {
		var type = me.get_type(elem);
		switch (type) {
		case 'uml:Class':
			me.visit_class(stack, dir, elem);
			break;
		}
	});
};

XMI_WALKER.prototype.visit_class = function visit_class(stack, pkg_name, cls) {
	var annotation = this.get_annotation(cls);
	var class_name = this.get_name(cls);
	debugger;
	stack.push("//package: "+pkg_name);
	stack.push(annotation);
	stack.push("function " + this.get_name(cls) + "(){\n}\n");
	if ('ownedAttribute' in cls) {
		this.visit_ownedAttribute(stack, cls, cls.ownedAttribute);
	}

	if ('ownedOperation' in cls) {
		this.visit_ownedOperation(stack, cls, cls.ownedOperation);
	}
	// fs.writeFileSync(SHARED_JS_DIR + pkg_name + '/' +
	// class_name.toLowerCase()
	// + '.js', src.join('\n'), 'utf-8');
	//console.log(src.join('\n'));
};

XMI_WALKER.prototype.visit_ownedOperation = function visit_ownedOperation(src,
		cls, op) {
	var me = this;
	op.forEach(function cb_each_op(elem) {
		if (elem) {
			if ('@' in elem) {
				// its a function
				var annotation = me.get_annotation(elem);
				src.push(annotation);
				var defun = me.get_name(cls) + ".prototype." + me.get_name(elem)
						+ " = function " + me.get_name(elem) + "(";
			} 
			if ('ownedParameter' in elem) {
				if (typeof defun != "undefined") {
					me.visit_ownedParameter({
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

XMI_WALKER.prototype.visit_ownedParameter = function visit_ownedParameter(
		fun_obj, params) {
	fun_obj.defun += "**";
};

// ownedAttribute
XMI_WALKER.prototype.visit_ownedAttribute = function visit_ownedAttribute(src,
		cls, attr) {
	// if (attr.constructor == Array) {
	// attr.forEach(function cb_each_attr(elem) {
	// if (elem) {
	// if ('@' in elem) {
	// var annotation = get_annotation(elem);
	// src.push(annotation);
	// var defattr = get_name(cls) + ".prototype."
	// + get_name(elem) + " = null;\n";
	// src.push(defattr);
	// } else {
	// // its a parameter-list ????
	// }
	// }
	// });
	// } else {
	// if (get_name(attr) != "") {
	// src.push("({'ATTR' : " + JSON.stringify(attr, null, 2) + "});");
	// }
	// }
};

XMI_WALKER.prototype.get_name = function get_name(elem) {
	if ('@' in elem) {
		return elem['@']['name'];
	} else {
		console.error('corrupted structure xmi-attribute "@" not found');
	}
};

XMI_WALKER.prototype.get_xmi_id = function get_xmi_id(elem) {
	if ('@' in elem) {
		return elem['@']['xmi:id'];
	} else {
		console.error('corrupted structure xmi-attribute "@" not found');
	}
};

XMI_WALKER.prototype.get_type = function get_type(elem) {
	if ('@' in elem) {
		return elem['@']['xmi:type'];
	} else {
		console.error('corrupted structure xmi-attribute "@" not found');
	}
};

XMI_WALKER.prototype.get_annotation = function get_annotation(elem) {
	if ('@' in elem) {
		return '/*{"@" :' + JSON.stringify((elem['@']), null, 2) + '}*/;';
	} else {
		console.error('corrupted structure xmi-attribute "@" not found');
	}
};

XMI_WALKER.prototype.get_visibility = function get_visibility(elem) {
	return elem['@']['visibility'];
};


// #########################################################
exports.create_walker = function() {
	return new XMI_WALKER();
};