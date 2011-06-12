var pro = require("uglify-js").uglify;
var hash = require("hashlib");
/*
 * {'@':{ "xmi:type": "uml:Class", "xmi:id":
 * "_17_0_1_6470229_4721571026284_017346_2123", "name": "XMI_PROCESSOR" }}
 */
function XMI_PROCESSOR() {
	this.stack = [];
	this.objects = {};
}

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_3795988477175_752417_1323", "name":
 * "process", "visibility": "public" }}
 */
XMI_PROCESSOR.prototype.process = function process(root) {
	this.stack = [];
	this.prc(this.stack, root);
	var xmi = [];
	xmi.push('<?xml version="1.0" encoding="UTF-8"?>');
	xmi
			.push('<xmi:XMI xmi:version="2.1" xmlns:xmi="http://schema.omg.org/spec/XMI/2.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:MagicDrawProfile="http:///schemas/MagicDrawProfile/_FMHycIL4EeCeFcl69vJk-A/0" xmlns:Standard="http://www.eclipse.org/uml2/schemas/Standard/1" xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore" xmlns:uml="http://www.eclipse.org/uml2/3.0.0/UML" xsi:schemaLocation="http:///schemas/MagicDrawProfile/_FMHycIL4EeCeFcl69vJk-A/0 UML_Standard_Profile.MagicDraw_Profile.profile.uml#_FMfl6YL4EeCeFcl69vJk-A http://www.eclipse.org/uml2/schemas/Standard/1 pathmap://UML_PROFILES/Standard.profile.uml#_yzU58YinEdqtvbnfB2L_5w">');
	xmi
			.push('<uml:Model xmi:id="eee_1045467100313_135436_1" name="Data" viewpoint="">');
	xmi
			.push('<packagedElement xmi:type="uml:Model" xmi:id="_17_0_1_6470229_1305116141090_150905_1870" name="static" viewpoint="">');

	// 1 ------------------------------
	// 2 ------------------------------
	// 3 ------------------------------

	/**
	 * this is a little test about remarks
	 */

	// here we start .....
	for ( var o in this.objects) {
		var obj = this.objects[o];
		var id = obj._xmi_id_;
		xmi.push('<packagedElement xmi:type="uml:Class" xmi:id="' + id
				+ '" name="' + o + '">');
		for ( var m in obj.ownedOperation) {
			var method = obj.ownedOperation[m];
debugger;
			var visibility = method.ann ? method.ann.visibility : "public";
			xmi.push('<ownedOperation xmi:id="' + m + '" name="' + method.name
					+ '" visibility="' + visibility + '"/>');
		}
		xmi.push('</packagedElement>');
	}
	// --------------------------------
	xmi.push('</packagedElement>');
	xmi.push('</uml:Model>');
	xmi.push('</xmi:XMI>');

	return xmi.join('\n');
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_7815686991192_814328_1270", "name": "prc",
 * "visibility": "public" }}
 */
XMI_PROCESSOR.prototype.prc = function prc(stack, node) {
	var code = "";
	try {
		var op = node[0];
		var args = node.slice(1);
		args.unshift(stack);
		this['_' + op].apply(this, args);
	} catch (ex) {
		console.log('<<' + op + '>> ' + ex);
	}
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_7252724834200_439533_9354", "name":
 * "_toplevel", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._toplevel = function _toplevel(stack, arglist) {
	var me = this;
	function get_cb(stack) {
		return function cb_each_arg(arg, i) {
			me.prc(stack, arg);
		};
	}
	stack.push('<TOPLEVEL>');
	arglist.forEach(get_cb(stack));
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_0245933826055_204184_7584", "name":
 * "_stat", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._stat = function _stat(stack, arglist) {
	stack.push('<STATEMENT>');
	this.prc(stack, arglist);
	stack.push("</STATEMENT>");
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_4126985507716_249917_6032", "name":
 * "_object", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._object = function _object(stack, decl) {
	var me = this;
	function get_cb(stack) {
		return function cb_each_decl(prop, i) {
			code += '<PROPERTY>' + prop[0] + ' : ' + me.prc(stack, prop[1])
					+ '</PROPERTY>';
		};
	}
	stack.push('<OBJECT>');
	decl.forEach(get_cb(stack));
	stack.push("</OBJECT>");
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_6450194885572_304060_7857", "name": "_dot",
 * "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._dot = function _dot(stack, lvalue, rvalue, multi) {
	if (!multi) {
		stack.push('<IDENT>');
	}
	if (this._is_leaf(lvalue)) {
		stack.push(lvalue);
	} else {
		if (lvalue[0] == 'dot') {
			var args = lvalue.slice(1);
			var lval = args[0];
			var rval = args[1];
			this._dot(stack, lval, rval, true);
		} else {
			this.prc(stack, lvalue);
		}
	}

	if (this._is_leaf(rvalue)) {
		stack.push('.');
		stack.push(rvalue);
	} else {
		if (rvalue[0] == 'dot') {
			args = rvalue.slice(1);
			lval = args[0];
			rval = args[1];
			this._dot(stack, lval, rval, true);
		} else {
			this.prc(stack, rvalue);
		}
	}
	if (!multi) {
		stack.push('</IDENT>');
	}
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_9091684632553_710202_3224", "name":
 * "_is_leaf", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._is_leaf = function _is_leaf(node) {
	return node.constructor != Array;
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_0725708457148_017554_8695", "name":
 * "_assign", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._assign = function _assign(stack, unused, lvalue,
		rvalue) {
	stack.push('<ASSIGN>');
	this.prc(stack, lvalue);
	stack.push(' = ');
	this.prc(stack, rvalue);
	stack.push("</ASSIGN>");
};

XMI_PROCESSOR.prototype._has_annotation = function _has_annotation(stack) {
	for ( var i = stack.length - 1; i >= 0; i--) {
		if (stack[i] == '<ANN>') {
			return i;
		}
	}
	return i;
};

XMI_PROCESSOR.prototype._pop_ann = function _pop_ann(stack, ann_idx) {
	var start = ann_idx;
	stack.splice(start, 3);
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_5750551641835_903109_8624", "name":
 * "_defun", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._defun = function _defun(stack, name, args, body) {
	var node = [ 'defun', name, args, body ];
	// pop annotation
	var ann = null;
	var ann_idx = this._has_annotation(stack);
	if (ann_idx > 0) {
		ann = stack[ann_idx + 1];
		this._pop_ann(stack, ann_idx);
	}

	var id = 0;
	if (ann && ('xmi:id' in ann)) {
		id = ann['xmi:id'];
	} else {
		id = this._compute_id(stack, node);
		if (ann){
			ann['xmi:id'] = id;
		}
	}

	if (this._is_toplevel(stack, node)) {
		if (!(name in this.objects)) {
			this.objects[name] = {
				_xmi_id_ : id,
				ann : ann
			};
		}

	} else {
		var classname = stack[stack.length - 8];
		if (classname in this.objects) {
			if (!('ownedOperation' in this.objects[classname])) {
				this.objects[classname].ownedOperation = {};
			}
			var ast = [ 'toplevel' ];
			ast.push(body);
			var body_src = pro.gen_code(ast);
			this.objects[classname].ownedOperation[id] = {
				name : name,
				body : body_src,
				ownedParameter : args,
				ann : ann
			};
		}
	}

};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_1301258113191_433411_5280", "name":
 * "_compute_id", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._compute_id = function _compute_id(stack, node) {
	var md_prefix = '_17_0_1_6470229_';
	var crypted = hash.sha512(node.join(''));

	// filter alphas to leave only digits
	var digits = crypted.match(/[0-9]+/g).join('').substr(0, 25).split('');

	// format with _: 13_6_4->0-12/13/14-19/20/21-24
	digits[13] = digits[20] = '_';

	return md_prefix + digits.join('');
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_8980574786382_423683_9266", "name":
 * "_is_toplevel", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._is_toplevel = function _is_toplevel(stack, node) {
	return stack[stack.length - 1] == '<TOPLEVEL>';
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_5490949272326_788702_6124", "name":
 * "_string", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._string = function _string(stack, elem) {
	stack.push(elem);
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_1091494769175_498384_4044", "name":
 * "_name", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._name = function _name(stack, elem) {
	stack.push(elem);
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_6668981780430_206770_0703", "name":
 * "_function", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._function = function _function(stack, name, args, body) {
	stack.push('<FUNCTIION>');
	this._defun(stack, name, args, body);
	stack.push('</FUNCTIION>');
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_5598626242317_677329_7177", "name":
 * "_block", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._block = function _block(stack, elem) {
	if (elem) {
		stack.push('<BLOCK>' + elem + '</BLOCK>');
	}
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_0018556265519_531999_3062", "name": "_var",
 * "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._var = function _var() {
};

/*
 * {'@':{ "xmi:id": "_17_0_1_6470229_1995002140703_919153_1458", "name":
 * "_call", "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._call = function _call(stack, fun, args) {
	if (fun) {
		stack.push('<CALL>' + JSON.stringify([ fun, args ]) + '</CALL>');
	}
};

/*
 * {'@':{ "visibility": "private" }}
 */
XMI_PROCESSOR.prototype._rem = function _rem(stack, remarks) {
	var me = this;
	remarks.forEach(function cb_each(remark) {
		if (me._is_annotation(remark)) {
			stack.push('<ANN>');
			var annotation = me._get_annotation(remark[1])['@'];
			if (!('xmi:id' in annotation)) {
				annotation['xmi:id'] = me._compute_id(stack, remark);
			}
			stack.push(annotation);
			stack.push('</ANN>');
		}
	});
};

XMI_PROCESSOR.prototype._get_annotation = function _get_annotation(ann_src) {
	var src = ann_src.split('\n').join('').replace(/'/g, '"')
			.replace(/\*/g, '');
	var ann = JSON.parse(src);
	return ann;
};

XMI_PROCESSOR.prototype._is_annotation = function _is_annotation(remark) {
	return (remark[0] == 'comment2') && (remark[1].indexOf("{'@':{") != -1);
};

/*
 * {'@':{ "xmi:id": "_17_0_2_6470229_1307200886870_482180_1666", "name":
 * "merge", "visibility": "public" }}
 */
XMI_PROCESSOR.prototype.merge = function merge() {
};

// #######################################################
exports.create_processor = function() {
	return new XMI_PROCESSOR();
};