var pro = require("uglify-js").uglify;
var hash = require("hashlib");

function XMI_PROCESSOR() {
	this.stack = [];
	this.objects = {};
};

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

	// ------------------------------
	for (var o in this.objects){
		var obj = this.objects[o];
		var id = obj._xmi_id_;
		xmi.push('<packagedElement xmi:type="uml:Class" xmi:id="'+id+'" name="'+o+'">');
		for (var m in obj.ownedOperation){
			var method = obj.ownedOperation[m];
			xmi.push('<ownedOperation xmi:id="'+m+'" name="'+method.name+'" visibility="public"/>');
		}
		xmi.push('</packagedElement>');
	}
	// --------------------------------
	xmi.push('</packagedElement>');
	xmi.push('</uml:Model>');
	xmi.push('</xmi:XMI>');

	return xmi.join('\n');
	/*
	 * for (var o in this.objects){ }
	 */
};

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

XMI_PROCESSOR.prototype._stat = function _stat(stack, arglist) {
	stack.push('<STATEMENT>');
	this.prc(stack, arglist);
	stack.push("</STATEMENT>");
};

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

XMI_PROCESSOR.prototype._is_leaf = function _is_leaf(node) {
	return node.constructor != Array;
};

XMI_PROCESSOR.prototype._assign = function _assign(stack, unused, lvalue,
		rvalue) {
	stack.push('<ASSIGN>');
	this.prc(stack, lvalue);
	stack.push(' = ');
	this.prc(stack, rvalue);
	stack.push("</ASSIGN>");
};

XMI_PROCESSOR.prototype._defun = function _defun(stack, name, args, body) {
	debugger;
	var node = [ 'defun', name, args, body ];
	var id = this._compute_id(stack, node);
	if (this._is_toplevel(stack, node)) {
		if (!(name in this.objects)) {
			this.objects[name] = {
				_xmi_id_ : id
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
				ownedParameter : args
			};
		}
	}

};

XMI_PROCESSOR.prototype._compute_id = function _compute_id(stack, node) {
	var md_prefix = '_17_0_1_6470229_';
	var crypted = hash.sha512(node.join(''));
	// filter alphas to leave only digits
	var digits = crypted.match(/[0-9]+/g).join('').substr(0, 25).split('');
	// format with _: 13_6_4->0-12/13/14-19/20/21-24
	digits[13] = digits[20] = '_';
	return md_prefix + digits.join('');
};

XMI_PROCESSOR.prototype._is_toplevel = function _is_toplevel(stack, node) {
	debugger;
	return stack[stack.length - 1] == '<TOPLEVEL>';
};

XMI_PROCESSOR.prototype._string = function _string(stack, elem) {
	stack.push(elem);
};

XMI_PROCESSOR.prototype._name = function _name(stack, elem) {
	stack.push(elem);
};

XMI_PROCESSOR.prototype._function = function _function(stack, name, args, body) {
	stack.push('<FUNCTIION>');
	this._defun(stack, name, args, body);
	stack.push('</FUNCTIION>');
};

XMI_PROCESSOR.prototype._block = function _block(stack, elem) {
	if (elem) {
		stack.push('<BLOCK>' + elem + '</BLOCK>');
	}
};

XMI_PROCESSOR.prototype._var = function _var(stack, statement) {
	// NOP
	// no top-level VAR-support until now
	/*
	 * var code = ''; var decl = statement ? statement[0] : null; if (decl) {
	 * stack.push('<VAR>' + decl[0] + '<DECL>'); this.prc(stack, decl[1]);
	 * stack.push('</DECL></VAR>'); }
	 */
};

XMI_PROCESSOR.prototype._call = function _call(stack, fun, args) {
	if (fun) {
		stack.push('<CALL>' + JSON.stringify([ fun, args ]) + '</CALL>');
	}
};

// #######################################################
exports.create_processor = function() {
	return new XMI_PROCESSOR();
};