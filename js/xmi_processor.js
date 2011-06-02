var pro = require("uglify-js").uglify;

function XMI_PROCESSOR() {
	var bla = "BLUB";
	this.blubb = 'fasel';
};

XMI_PROCESSOR.prototype.prc = function prc(node) {
	var code = "";
	try {
		var op = node[0];
		code = this['_' + op].apply(this, node.slice(1));
	} catch (ex) {
		code = '<<' + op + '>> ' + ex;
	}
	return code;
};

XMI_PROCESSOR.prototype._toplevel = function _toplevel(arglist) {
	var code = '<TOPLEVEL>\n';
	var me = this;
	arglist.forEach(function cb_each_arg(arg, i) {
		code += me.prc(arg);
	});
	return code + "\n</TOPLEVEL>\n";
};

XMI_PROCESSOR.prototype._stat = function _stat(arglist) {
	var code = '<STATEMENT>\n';
	code += this.prc(arglist);
	return code + "\n</STATEMENT>\n";
};

XMI_PROCESSOR.prototype._object = function _object(decl) {
	var code = '<OBJECT>\n';
	var me = this;
	decl.forEach(function cb_each_decl(prop, i) {
		code += '<PROPERTY>' + prop[0] + ' : ' + me.prc(prop[1])
				+ '</PROPERTY>\n';
	});
	return code + "\n</OBJECT>\n";
};

XMI_PROCESSOR.prototype._dot = function _dot(unused, lvalue, rvalue) {
	var code = '<DOT>\n';
	if (this._is_leaf(lvalue))
		code += this._is_leaf(lvalue) ? lvalue : this.prc(lvalue) + '.'
				+ this._is_leaf(rvalue) ? rvalue : this.prc(rvalue);
	return code + "\n</DOT>\n";
};

XMI_PROCESSOR.prototype._is_leaf = function _is_leaf(node) {
	return node.constructor != Array;
};

XMI_PROCESSOR.prototype._assign = function _assign(unused, lvalue, rvalue) {
	var code = '<ASSIGN>\n';
	code += this.prc(lvalue) + ' = ' + this.prc(rvalue);
	return code + "\n</ASSIGN>\n";
};

XMI_PROCESSOR.prototype._defun = function _defun(name, args, body) {
	var code = '<DEFUN>\n<NAME>';
	code += name + '</NAME>\n<ARGS>' + args + '</ARGS>\n<BODY>\n';
	code += JSON.stringify(body);
	code += '\n</BODY>\n';
	return code + "\n</DEFUN>\n";
};

XMI_PROCESSOR.prototype._string = function _string(elem) {
	return elem;
};

XMI_PROCESSOR.prototype._name = function _name(elem) {
	return elem;
};

XMI_PROCESSOR.prototype._function = function _function(name, args, body) {
	debugger;
	var	code = '<FUNCTIION>' + this._defun(name,args,body) + '</FUNCTIION>\n';
	return code;
};

XMI_PROCESSOR.prototype._block = function _block(elem) {
	var code = '';
	if (elem) {
		code = '<BLOCK>' + elem + '</BLOCK>\n';
	}
	return code;
};

XMI_PROCESSOR.prototype._var = function _var(statement) {
	var code = '';
	var decl = statement ? statement[0] : null;
	if (decl) {
		code = '<VAR>' + decl[0] + '<DECL>'+ this.prc(decl[1]) + '</DECL>\n</VAR>\n';
	}
	return code;
};
// #######################################################
exports.create_processor = function() {
	return new XMI_PROCESSOR();
};