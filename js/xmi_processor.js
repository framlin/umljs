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

XMI_PROCESSOR.prototype._dot = function _dot(lvalue, rvalue, multi) {
	var code = multi ? '' : '<IDENT>';
debugger;	
	if (this._is_leaf(lvalue)){
		code += lvalue;
	} else {
		if (lvalue[0] == 'dot'){
			var args = lvalue.slice(1);
			var lval = args[0];
			var rval = args[1];
			code += this._dot(lval,rval,true);
		} else {
			code += this.prc(lvalue);
		}
	}

	
	if (this._is_leaf(rvalue)){
		code += '.'+rvalue;
	} else {
		if (rvalue[0] == 'dot'){
			args = rvalue.slice(1);
			lval = args[0];
			rval = args[1];
			code += this._dot(lval,rval,true);
		} else {
			code += this.prc(rvalue);
		}
	}
	return code + (multi ? '' : "</IDENT>\n");
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
	var ast = ['toplevel'];
	ast.push(body);
	code += pro.gen_code(ast,{beautify: false});
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

XMI_PROCESSOR.prototype._call = function _call(fun, args) {
	var code = '';
	debugger;
	if (fun) {
		code = '<CALL>' + JSON.stringify([fun,args]) + '</CALL>\n';
	}
	return code;
};

// #######################################################
exports.create_processor = function() {
	return new XMI_PROCESSOR();
};