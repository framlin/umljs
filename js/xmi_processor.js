var pro = require("uglify-js").uglify;

function XMI_PROCESSOR() {
	this.stack = [];
};

XMI_PROCESSOR.prototype.process = function process(root) {
	this.stack = [];
	return this.prc(this.stack, root);
};

XMI_PROCESSOR.prototype.prc = function prc(stack, node) {
	var code = "";
	debugger;
	try {
		var op = node[0];
		var args = node.slice(1);
		args.unshift(stack);
		debugger;
		this['_' + op].apply(this, args);
		code = stack.join('');
	} catch (ex) {
		code = '<<' + op + '>> ' + ex;
	}
	return code;
};

XMI_PROCESSOR.prototype._toplevel = function _toplevel(stack, arglist) {
	var me = this;
	function get_cb(stack) {
		return function cb_each_arg(arg, i) {
			me.prc(stack, arg);
		};
	}
	stack.push('<TOPLEVEL>\n');
	debugger;
	arglist.forEach(get_cb(stack));
	stack.push("</TOPLEVEL>\n");
};

XMI_PROCESSOR.prototype._stat = function _stat(stack, arglist) {
	stack.push('\n<STATEMENT>\n');
	this.prc(stack, arglist);
	stack.push("</STATEMENT>\n");
};

XMI_PROCESSOR.prototype._object = function _object(stack, decl) {
	var me = this;
	function get_cb(stack) {
		return function cb_each_decl(prop, i) {
			code += '<PROPERTY>' + prop[0] + ' : ' + me.prc(stack, prop[1])
					+ '</PROPERTY>\n';
		};
	}
	stack.push('<OBJECT>\n');
	decl.forEach(get_cb(stack));
	stack.push("\n</OBJECT>\n");
};

XMI_PROCESSOR.prototype._dot = function _dot(stack, lvalue, rvalue, multi) {
	stack.push(multi ? '' : '<IDENT>');
	debugger;
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
	stack.push(multi ? '' : "</IDENT>\n");
};

XMI_PROCESSOR.prototype._is_leaf = function _is_leaf(node) {
	return node.constructor != Array;
};

XMI_PROCESSOR.prototype._assign = function _assign(stack, unused, lvalue,
		rvalue) {
	stack.push('<ASSIGN>\n');
	this.prc(stack, lvalue);
	stack.push(' = ');
	this.prc(stack, rvalue);
	stack.push("</ASSIGN>\n");
};

XMI_PROCESSOR.prototype._defun = function _defun(stack, name, args, body) {
	stack.push('<DEFUN>\n<NAME>');
	stack.push(name + '</NAME>\n<ARGS>' + args + '</ARGS>\n<BODY>\n');
	var ast = [ 'toplevel' ];
	ast.push(body);
	stack.push(pro.gen_code(ast, {
		beautify : false
	}));
	stack.push('\n</BODY>\n');
	stack.push("</DEFUN>\n");
};

XMI_PROCESSOR.prototype._string = function _string(stack, elem) {
	stack.push(elem);
};

XMI_PROCESSOR.prototype._name = function _name(stack, elem) {
	stack.push(elem);
};

XMI_PROCESSOR.prototype._function = function _function(stack, name, args, body) {
	debugger;
	stack.push('<FUNCTIION>');
	this._defun(stack, name, args, body);
	stack.push('</FUNCTIION>\n');
};

XMI_PROCESSOR.prototype._block = function _block(stack, elem) {
	if (elem) {
		stack.push('<BLOCK>' + elem + '</BLOCK>\n');
	}
};

XMI_PROCESSOR.prototype._var = function _var(stack, statement) {
	var code = '';
	var decl = statement ? statement[0] : null;
	if (decl) {
		stack.push('<VAR>' + decl[0] + '<DECL>');
		this.prc(stack, decl[1]);
		stack.push('</DECL>\n</VAR>\n');
	}
};

XMI_PROCESSOR.prototype._call = function _call(stack, fun, args) {
	debugger;
	if (fun) {
		stack.push('<CALL>' + JSON.stringify([ fun, args ]) + '</CALL>\n');
	}
};

// #######################################################
exports.create_processor = function() {
	return new XMI_PROCESSOR();
};