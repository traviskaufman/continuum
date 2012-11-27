continuum = (function(global, exports, require, module){


exports.esprima = (function(exports){
/*
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint bitwise:true plusplus:true */
/*global esprima:true, define:true, exports:true, window: true,
throwError: true, createLiteral: true, generateStatement: true,
parseAssignmentExpression: true, parseBlock: true,
parseClassExpression: true, parseClassDeclaration: true, parseExpression: true,
parseForStatement: true,
parseFunctionDeclaration: true, parseFunctionExpression: true,
parseFunctionSourceElements: true, parseVariableIdentifier: true,
parseImportSpecifier: true,
parseLeftHandSideExpression: true,
parseStatement: true, parseSourceElement: true, parseModuleBlock: true, parseConciseBody: true,
parseYieldExpression: true
*/

(function (factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // and plain browser loading,
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((window.esprima = {}));
    }
}(function (exports) {
    'use strict';

    var Token,
        TokenName,
        Syntax,
        PropertyKind,
        Messages,
        Regex,
        source,
        strict,
        yieldAllowed,
        yieldFound,
        index,
        lineNumber,
        lineStart,
        length,
        buffer,
        state,
        extra;

    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8,
        Template: 9,
        AtSymbol: 10
    };

    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';
    TokenName[Token.AtSymbol] = 'AtSymbol';

    Syntax = {
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        AssignmentExpression: 'AssignmentExpression',
        AtSymbol: 'AtSymbol',
        BinaryExpression: 'BinaryExpression',
        BlockStatement: 'BlockStatement',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ClassHeritage: 'ClassHeritage',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExportDeclaration: 'ExportDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExportSpecifierSet: 'ExportSpecifierSet',
        ExpressionStatement: 'ExpressionStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        ForStatement: 'ForStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Glob: 'Glob',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        ImportSpecifier: 'ImportSpecifier',
        LabeledStatement: 'LabeledStatement',
        Literal: 'Literal',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        ModuleDeclaration: 'ModuleDeclaration',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Path:  'Path',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        SwitchCase: 'SwitchCase',
        SwitchStatement: 'SwitchStatement',
        SymbolDeclaration: 'SymbolDeclaration',
        SymbolDeclarator: 'SymbolDeclarator',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    PropertyKind = {
        Data: 1,
        Get: 2,
        Set: 4
    };

    // Error messages should be identical to V8.
    Messages = {
        UnexpectedToken:  'Unexpected token %0',
        UnexpectedNumber:  'Unexpected number',
        UnexpectedString:  'Unexpected string',
        UnexpectedIdentifier:  'Unexpected identifier',
        UnexpectedReserved:  'Unexpected reserved word',
        UnexpectedTemplate:  'Unexpected quasi %0',
        UnexpectedEOS:  'Unexpected end of input',
        NewlineAfterThrow:  'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp:  'Invalid regular expression: missing /',
        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
        InvalidLHSInFormalsList:  'Invalid left-hand side in formals list',
        InvalidLHSInForIn:  'Invalid left-hand side in for-in',
        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
        NoCatchOrFinally:  'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalReturn: 'Illegal return statement',
        IllegalYield: 'Illegal yield expression',
        IllegalSpread: 'Illegal spread element',
        StrictModeWith:  'Strict mode code may not include a with statement',
        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
        StrictVarName:  'Variable name may not be eval or arguments in strict mode',
        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        ParameterAfterRestParameter: 'Rest parameter must be final parameter of an argument list',
        ElementAfterSpreadElement: 'Spread must be the final element of an element list',
        ObjectPatternAsRestParameter: 'Invalid rest parameter',
        ObjectPatternAsSpread: 'Invalid spread argument',
        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
        StrictDelete:  'Delete of an unqualified identifier in strict mode.',
        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictReservedWord:  'Use of future reserved word in strict mode',
        NoFromAfterImport: 'Missing from after import',
        NoYieldInGenerator: 'Missing yield in generator',
        NoUnintializedConst: 'Const must be initialized',
        ComprehensionRequiresBlock: 'Comprehension must have at least one block',
        ComprehensionError:  'Comprehension Error',
        EachNotAllowed:  'Each is not supported',
        DefaultsNotLast: 'Default parameters must come last'
    };

    // See also tools/generate-unicode-regex.py.
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    function sliceSource(from, to) {
        return source.slice(from, to);
    }

    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource = function sliceArraySource(from, to) {
            return source.slice(from, to).join('');
        };
    }

    function isDecimalDigit(ch) {
        return '0123456789'.indexOf(ch) >= 0;
    }

    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }

    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }


    // 7.2 White Space

    function isWhiteSpace(ch) {
        return (ch === ' ') || (ch === '\u0009') || (ch === '\u000B') ||
            (ch === '\u000C') || (ch === '\u00A0') ||
            (ch.charCodeAt(0) >= 0x1680 &&
             '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(ch) >= 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029');
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch === '$') || (ch === '_') || (ch === '\\') ||
            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierStart.test(ch));
    }

    function isIdentifierPart(ch) {
        return (ch === '$') || (ch === '_') || (ch === '\\') ||
            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
            ((ch >= '0') && (ch <= '9')) ||
            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierPart.test(ch));
    }

    // 7.6.1.2 Future Reserved Words

    function isFutureReservedWord(id) {
        switch (id) {

        // Future reserved words.
        case 'class':
        case 'enum':
        case 'export':
        case 'extends':
        case 'import':
        case 'super':
            return true;
        }

        return false;
    }

    function isStrictModeReservedWord(id) {
        switch (id) {

        // Strict Mode reserved words.
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'yield':
        case 'let':
            return true;
        }

        return false;
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    // 7.6.1.1 Keywords

    function isKeyword(id) {
        var keyword = false;
        switch (id.length) {
        case 2:
            keyword = (id === 'if') || (id === 'in') || (id === 'do');
            break;
        case 3:
            keyword = (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
            break;
        case 4:
            keyword = (id === 'this') || (id === 'else') || (id === 'case') || (id === 'void') || (id === 'with');
            break;
        case 5:
            keyword = (id === 'while') || (id === 'break') || (id === 'catch') || (id === 'throw');
            break;
        case 6:
            keyword = (id === 'return') || (id === 'typeof') || (id === 'delete') || (id === 'switch') || (id === 'public');
            break;
        case 7:
            keyword = (id === 'default') || (id === 'finally') || (id === 'private');
            break;
        case 8:
            keyword = (id === 'function') || (id === 'continue') || (id === 'debugger');
            break;
        case 10:
            keyword = (id === 'instanceof');
            break;
        }

        if (keyword) {
            return true;
        }

        switch (id) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;

        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }

        if (strict && isStrictModeReservedWord(id)) {
            return true;
        }

        return isFutureReservedWord(id);
    }

    // Return the next character and move forward.

    function nextChar() {
        return source[index++];
    }

    // 7.4 Comments

    function skipComment() {
        var ch, blockComment, lineComment;

        blockComment = false;
        lineComment = false;

        while (index < length) {
            ch = source[index];

            if (lineComment) {
                ch = nextChar();
                if (isLineTerminator(ch)) {
                    lineComment = false;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                }
            } else if (blockComment) {
                if (isLineTerminator(ch)) {
                    if (ch === '\r' && source[index + 1] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    ++index;
                    lineStart = index;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch = nextChar();
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch === '*') {
                        ch = source[index];
                        if (ch === '/') {
                            ++index;
                            blockComment = false;
                        }
                    }
                }
            } else if (ch === '/') {
                ch = source[index + 1];
                if (ch === '/') {
                    index += 2;
                    lineComment = true;
                } else if (ch === '*') {
                    index += 2;
                    blockComment = true;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch ===  '\r' && source[index] === '\n') {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else {
                break;
            }
        }
    }

    function scanHexEscape(prefix) {
        var i, len, ch, code = 0;

        len = (prefix === 'u') ? 4 : 2;
        for (i = 0; i < len; ++i) {
            if (index < length && isHexDigit(source[index])) {
                ch = nextChar();
                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code);
    }

    function scanUnicodeCodePointEscape() {
        var ch, code, cu1, cu2;

        ch = source[index];
        code = 0;

        // At least, one hex digit is required.
        if (ch === '}') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        while (index < length) {
            ch = nextChar();
            if (!isHexDigit(ch)) {
                break;
            }
            code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
        }

        if (code > 0x10FFFF || ch !== '}') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        // UTF-16 Encoding
        if (code <= 0xFFFF) {
            return String.fromCharCode(code);
        }
        cu1 = ((code - 0x10000) >> 10) + 0xD800;
        cu2 = ((code - 0x10000) & 1023) + 0xDC00;
        return String.fromCharCode(cu1, cu2);
    }

    function scanIdentifier() {
        var ch, atname, start, id, restore;

        ch = source[index];

        if (ch === '@') {
            atname = true;
            ch = source[++index];
        }

        if (!isIdentifierStart(ch)) {
            return;
        }

        start = index;
        if (ch === '\\') {
            ++index;
            if (source[index] !== 'u') {
                return;
            }
            ++index;
            restore = index;
            ch = scanHexEscape('u');
            if (ch) {
                if (ch === '\\' || !isIdentifierStart(ch)) {
                    return;
                }
                id = ch;
            } else {
                index = restore;
                id = 'u';
            }
        } else {
            id = nextChar();
        }

        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch)) {
                break;
            }
            if (ch === '\\') {
                ++index;
                if (source[index] !== 'u') {
                    return;
                }
                ++index;
                restore = index;
                ch = scanHexEscape('u');
                if (ch) {
                    if (ch === '\\' || !isIdentifierPart(ch)) {
                        return;
                    }
                    id += ch;
                } else {
                    index = restore;
                    id += 'u';
                }
            } else {
                id += nextChar();
            }
        }

        if (atname) {
            return {
                type: Token.AtSymbol,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            return {
                type: Token.Identifier,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (isKeyword(id)) {
            return {
                type: Token.Keyword,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // 7.8.1 Null Literals

        if (id === 'null') {
            return {
                type: Token.NullLiteral,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // 7.8.2 Boolean Literals

        if (id === 'true' || id === 'false') {
            return {
                type: Token.BooleanLiteral,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        return {
            type: Token.Identifier,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // 7.7 Punctuators

    function scanPunctuator() {
        var start = index,
            ch1 = source[index],
            ch2,
            ch3,
            ch4;

        // Check for most common single-character punctuators.

        if (ch1 === ';' || ch1 === '{' || ch1 === '}') {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === ',' || ch1 === '(' || ch1 === ')') {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // Dot (.) can also start a floating-point number and ellipsis, hence
        // the need to check the next character.

        ch2 = source[index + 1];
        if (ch1 === '.' && !isDecimalDigit(ch2) && ch2 !== '.') {
            return {
                type: Token.Punctuator,
                value: nextChar(),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // Peek more characters.

        ch3 = source[index + 2];
        ch4 = source[index + 3];

        // 4-character punctuator: >>>=

        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
                index += 4;
                return {
                    type: Token.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        // 3-character punctuators: === !== >>> <<= >>= ...

        if (ch1 === '=' && ch2 === '=' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '===',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '!' && ch2 === '=' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '!==',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>>',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '<<=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '.' && ch2 === '.' && ch3 === '.') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '...',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=

        if (ch2 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: ch1 + ch2,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
            if ('+-<>&|'.indexOf(ch2) >= 0) {
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: ch1 + ch2,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        if (ch1 === '=' && ch2 === '>') {
            index += 2;
            return {
                type: Token.Punctuator,
                value: '=>',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // The remaining 1-character punctuators.

        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1) >= 0) {
            return {
                type: Token.Punctuator,
                value: nextChar(),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    }

    // 7.8.3 Numeric Literals

    function scanNumericLiteral() {
        var number, start, ch, octal;

        ch = source[index];
        assert(isDecimalDigit(ch) || (ch === '.'),
            'Numeric literal must start with a decimal digit or a decimal point');

        start = index;
        number = '';
        if (ch !== '.') {
            number = nextChar();
            ch = source[index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number === '0') {
                if (ch === 'x' || ch === 'X') {
                    number += nextChar();
                    while (index < length) {
                        ch = source[index];
                        if (!isHexDigit(ch)) {
                            break;
                        }
                        number += nextChar();
                    }

                    if (number.length <= 2) {
                        // only 0x
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }

                    if (index < length) {
                        ch = source[index];
                        if (isIdentifierStart(ch)) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token.NumericLiteral,
                        value: parseInt(number, 16),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                } else if (ch === 'b' || ch === 'B') {
                    nextChar();
                    number = '';

                    while (index < length) {
                        ch = source[index];
                        if (ch !== '0' && ch !== '1') {
                            break;
                        }
                        number += nextChar();
                    }

                    if (number.length === 0) {
                        // only 0b or 0B
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }

                    if (index < length) {
                        ch = source[index];
                        if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token.NumericLiteral,
                        value: parseInt(number, 2),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                } else if (ch === 'o' || ch === 'O' || isOctalDigit(ch)) {
                    if (isOctalDigit(ch)) {
                        octal = true;
                        number = nextChar();
                    } else {
                        octal = false;
                        nextChar();
                        number = '';
                    }

                    while (index < length) {
                        ch = source[index];
                        if (!isOctalDigit(ch)) {
                            break;
                        }
                        number += nextChar();
                    }

                    if (number.length === 0) {
                        // only 0o or 0O
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }

                    if (index < length) {
                        ch = source[index];
                        if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    }

                    return {
                        type: Token.NumericLiteral,
                        value: parseInt(number, 8),
                        octal: octal,
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                }

                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit(ch)) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }

            while (index < length) {
                ch = source[index];
                if (!isDecimalDigit(ch)) {
                    break;
                }
                number += nextChar();
            }
        }

        if (ch === '.') {
            number += nextChar();
            while (index < length) {
                ch = source[index];
                if (!isDecimalDigit(ch)) {
                    break;
                }
                number += nextChar();
            }
        }

        if (ch === 'e' || ch === 'E') {
            number += nextChar();

            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += nextChar();
            }

            ch = source[index];
            if (isDecimalDigit(ch)) {
                number += nextChar();
                while (index < length) {
                    ch = source[index];
                    if (!isDecimalDigit(ch)) {
                        break;
                    }
                    number += nextChar();
                }
            } else {
                ch = 'character ' + ch;
                if (index >= length) {
                    ch = '<end>';
                }
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        if (index < length) {
            ch = source[index];
            if (isIdentifierStart(ch)) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // 7.8.4 String Literals

    function scanStringLiteral() {
        var str = '', quote, start, ch, code, unescaped, restore, octal = false;

        quote = source[index];
        assert((quote === '\'' || quote === '"'),
            'String literal must starts with a quote');

        start = index;
        ++index;

        while (index < length) {
            ch = nextChar();

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = nextChar();
                if (!isLineTerminator(ch)) {
                    switch (ch) {
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source[index] === '{') {
                            ++index;
                            str += scanUnicodeCodePointEscape();
                        } else {
                            restore = index;
                            unescaped = scanHexEscape(ch);
                            if (unescaped) {
                                str += unescaped;
                            } else {
                                index = restore;
                                str += ch;
                            }
                        }
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\v';
                        break;

                    default:
                        if (isOctalDigit(ch)) {
                            code = '01234567'.indexOf(ch);

                            // \0 is not octal escape sequence
                            if (code !== 0) {
                                octal = true;
                            }

                            if (index < length && isOctalDigit(source[index])) {
                                octal = true;
                                code = code * 8 + '01234567'.indexOf(nextChar());

                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch) >= 0 &&
                                        index < length &&
                                        isOctalDigit(source[index])) {
                                    code = code * 8 + '01234567'.indexOf(nextChar());
                                }
                            }
                            str += String.fromCharCode(code);
                        } else {
                            str += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch ===  '\r' && source[index] === '\n') {
                        ++index;
                    }
                }
            } else if (isLineTerminator(ch)) {
                break;
            } else {
                str += ch;
            }
        }

        if (quote !== '') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    function scanTemplate() {
        var cooked = '', ch, start, terminated, tail, restore, unescaped, code, octal;

        terminated = false;
        tail = false;
        start = index;

        ++index;

        while (index < length) {
            ch = nextChar();
            if (ch === '`') {
                tail = true;
                terminated = true;
                break;
            } else if (ch === '$') {
                if (source[index] === '{') {
                    ++index;
                    terminated = true;
                    break;
                }
                cooked += ch;
            } else if (ch === '\\') {
                ch = nextChar();
                if (!isLineTerminator(ch)) {
                    switch (ch) {
                    case 'n':
                        cooked += '\n';
                        break;
                    case 'r':
                        cooked += '\r';
                        break;
                    case 't':
                        cooked += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source[index] === '{') {
                            ++index;
                            cooked += scanUnicodeCodePointEscape();
                        } else {
                            restore = index;
                            unescaped = scanHexEscape(ch);
                            if (unescaped) {
                                cooked += unescaped;
                            } else {
                                index = restore;
                                cooked += ch;
                            }
                        }
                        break;
                    case 'b':
                        cooked += '\b';
                        break;
                    case 'f':
                        cooked += '\f';
                        break;
                    case 'v':
                        cooked += '\v';
                        break;

                    default:
                        if (isOctalDigit(ch)) {
                            code = '01234567'.indexOf(ch);

                            // \0 is not octal escape sequence
                            if (code !== 0) {
                                octal = true;
                            }

                            if (index < length && isOctalDigit(source[index])) {
                                octal = true;
                                code = code * 8 + '01234567'.indexOf(nextChar());

                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch) >= 0 &&
                                        index < length &&
                                        isOctalDigit(source[index])) {
                                    code = code * 8 + '01234567'.indexOf(nextChar());
                                }
                            }
                            cooked += String.fromCharCode(code);
                        } else {
                            cooked += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch ===  '\r' && source[index] === '\n') {
                        ++index;
                    }
                }
            } else if (isLineTerminator(ch)) {
                ++lineNumber;
                if (ch ===  '\r' && source[index] === '\n') {
                    ++index;
                }
            } else {
                cooked += ch;
            }
        }

        if (!terminated) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.Template,
            value: {
                cooked: cooked,
                raw: sliceSource(start + 1, index - ((tail) ? 1 : 2))
            },
            tail: tail,
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    function scanTemplateElement(option) {
        var startsWith;

        buffer = null;
        skipComment();

        startsWith = (option.head) ? '`' : '}';

        if (source[index] !== startsWith) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return scanTemplate();
    }

    function scanRegExp() {
        var str = '', ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;

        buffer = null;
        skipComment();

        start = index;
        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = nextChar();

        while (index < length) {
            ch = nextChar();
            str += ch;
            if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '\\') {
                    ch = nextChar();
                    // ECMA-262 7.8.5
                    if (isLineTerminator(ch)) {
                        throwError({}, Messages.UnterminatedRegExp);
                    }
                    str += ch;
                } else if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                } else if (isLineTerminator(ch)) {
                    throwError({}, Messages.UnterminatedRegExp);
                }
            }
        }

        if (!terminated) {
            throwError({}, Messages.UnterminatedRegExp);
        }

        // Exclude leading and trailing slash.
        pattern = str.substr(1, str.length - 2);

        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch)) {
                break;
            }

            ++index;
            if (ch === '\\' && index < length) {
                ch = source[index];
                if (ch === 'u') {
                    ++index;
                    restore = index;
                    ch = scanHexEscape('u');
                    if (ch) {
                        flags += ch;
                        str += '\\u';
                        for (; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                } else {
                    str += '\\';
                }
            } else {
                flags += ch;
                str += ch;
            }
        }

        try {
            value = new RegExp(pattern, flags);
        } catch (e) {
            throwError({}, Messages.InvalidRegExp);
        }

        return {
            literal: str,
            value: value,
            range: [start, index]
        };
    }

    function isIdentifierName(token) {
        return token.type === Token.Identifier ||
            token.type === Token.Keyword ||
            token.type === Token.BooleanLiteral ||
            token.type === Token.NullLiteral ||
            token.type === Token.AtSymbol;
    }

    function advance() {
        var ch, token;

        skipComment();

        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [index, index]
            };
        }

        token = scanPunctuator();
        if (typeof token !== 'undefined') {
            return token;
        }

        ch = source[index];

        if (ch === '\'' || ch === '"') {
            return scanStringLiteral();
        }

        if (ch === '.' || isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }

        if (ch === '`') {
            return scanTemplate();
        }

        token = scanIdentifier();
        if (typeof token !== 'undefined') {
            return token;
        }

        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    function lex() {
        var token;

        if (buffer) {
            index = buffer.range[1];
            lineNumber = buffer.lineNumber;
            lineStart = buffer.lineStart;
            token = buffer;
            buffer = null;
            return token;
        }

        buffer = null;
        return advance();
    }

    function lookahead() {
        var pos, line, start;

        if (buffer !== null) {
            return buffer;
        }

        pos = index;
        line = lineNumber;
        start = lineStart;
        buffer = advance();
        index = pos;
        lineNumber = line;
        lineStart = start;

        return buffer;
    }

    function lookahead2() {
        var adv, pos, line, start, result;

        // If we are collecting the tokens, don't grab the next one yet.
        adv = (typeof extra.advance === 'function') ? extra.advance : advance;

        pos = index;
        line = lineNumber;
        start = lineStart;

        // Scan for the next immediate token.
        if (buffer === null) {
            buffer = adv();
        }
        index = buffer.range[1];
        lineNumber = buffer.lineNumber;
        lineStart = buffer.lineStart;

        // Grab the token right after.
        result = adv();
        index = pos;
        lineNumber = line;
        lineStart = start;

        return result;
    }

    // Return true if there is a line terminator before the next token.

    function peekLineTerminator() {
        var pos, line, start, found;

        pos = index;
        line = lineNumber;
        start = lineStart;
        skipComment();
        found = lineNumber !== line;
        index = pos;
        lineNumber = line;
        lineStart = start;

        return found;
    }

    // Throw an exception

    function throwError(token, messageFormat) {
        var error,
            args = Array.prototype.slice.call(arguments, 2),
            msg = messageFormat.replace(
                /%(\d)/g,
                function (whole, index) {
                    return args[index] || '';
                }
            );

        if (typeof token.lineNumber === 'number') {
            error = new Error('Line ' + token.lineNumber + ': ' + msg);
            error.index = token.range[0];
            error.lineNumber = token.lineNumber;
            error.column = token.range[0] - lineStart + 1;
        } else {
            error = new Error('Line ' + lineNumber + ': ' + msg);
            error.index = index;
            error.lineNumber = lineNumber;
            error.column = index - lineStart + 1;
        }

        throw error;
    }

    function throwErrorTolerant() {
        try {
            throwError.apply(null, arguments);
        } catch (e) {
            if (extra.errors) {
                extra.errors.push(e);
            } else {
                throw e;
            }
        }
    }


    // Throw an exception because of the token.

    function throwUnexpected(token) {
        if (token.type === Token.EOF) {
            throwError(token, Messages.UnexpectedEOS);
        }

        if (token.type === Token.NumericLiteral) {
            throwError(token, Messages.UnexpectedNumber);
        }

        if (token.type === Token.StringLiteral) {
            throwError(token, Messages.UnexpectedString);
        }

        if (token.type === Token.Identifier) {
            throwError(token, Messages.UnexpectedIdentifier);
        }

        if (token.type === Token.Keyword) {
            if (isFutureReservedWord(token.value)) {
                throwError(token, Messages.UnexpectedReserved);
            } else if (strict && isStrictModeReservedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictReservedWord);
                return;
            }
            throwError(token, Messages.UnexpectedToken, token.value);
        }

        if (token.type === Token.Template) {
            throwError(token, Messages.UnexpectedTemplate, token.value.raw);
        }

        if (token.type === Token.AtSymbol) {
            throwError(token, Messages.UnexpectedIdentifier);
        }

        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError(token, Messages.UnexpectedToken, token.value);
    }

    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.

    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpected(token);
        }
    }

    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.

    function expectKeyword(keyword) {
        var token = lex();
        if (token.type !== Token.Keyword || token.value !== keyword) {
            throwUnexpected(token);
        }
    }

    // Return true if the next token matches the specified punctuator.

    function match(value) {
        var token = lookahead();
        return token.type === Token.Punctuator && token.value === value;
    }

    // Return true if the next token matches the specified keyword

    function matchKeyword(keyword) {
        var token = lookahead();
        return token.type === Token.Keyword && token.value === keyword;
    }


    // Return true if the next token matches the specified contextual keyword

    function matchContextualKeyword(keyword) {
        var token = lookahead();
        return token.value === keyword && token.type === Token.Identifier || token.type === Token.AtSymbol;
    }

    // Return true if the next token is an assignment operator

    function matchAssign() {
        var token = lookahead(),
            op = token.value;

        if (token.type !== Token.Punctuator) {
            return false;
        }
        return op === '=' ||
            op === '*=' ||
            op === '/=' ||
            op === '%=' ||
            op === '+=' ||
            op === '-=' ||
            op === '<<=' ||
            op === '>>=' ||
            op === '>>>=' ||
            op === '&=' ||
            op === '^=' ||
            op === '|=';
    }

    function consumeSemicolon() {
        var token, line;

        // Catch the very common case first.
        if (source[index] === ';') {
            lex();
            return;
        }

        line = lineNumber;
        skipComment();
        if (lineNumber !== line) {
            return;
        }

        if (match(';')) {
            lex();
            return;
        }

        token = lookahead();
        if (token.type !== Token.EOF && !match('}')) {
            throwUnexpected(token);
        }
        return;
    }

    // Return true if provided expression is LeftHandSideExpression

    function isLeftHandSide(expr) {
        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
    }

    function isAssignableLeftHandSide(expr) {
        return isLeftHandSide(expr) || expr.type === Syntax.ObjectPattern || expr.type === Syntax.ArrayPattern;
    }

    // 11.1.4 Array Initialiser

    function parseArrayInitialiser() {
        var elements = [], blocks = [], filter = null, token, tmp, possiblecomprehension = true, body;

        expect('[');
        while (!match(']')) {
            token = lookahead();
            switch (token.value) {
            case 'for':
                if (!possiblecomprehension) {
                    throwError({}, Messages.ComprehensionError);
                }
                matchKeyword('for');
                tmp = parseForStatement({ignore_body: true});
                tmp.of = tmp.type === Syntax.ForOfStatement;
                tmp.type = Syntax.ComprehensionBlock;
                if (tmp.left.kind) { // can't be let or const
                    throwError({}, Messages.ComprehensionError);
                }
                blocks.push(tmp);
                break;
            case 'if':
                if (!possiblecomprehension) {
                    throwError({}, Messages.ComprehensionError);
                }
                expectKeyword('if');
                expect('(');
                filter = parseExpression();
                expect(')');
                break;
            case ',':
                possiblecomprehension = false; // no longer allowed.
                lex();
                elements.push(null);
                break;
            default:
                tmp = parseSpreadOrAssignmentExpression();
                elements.push(tmp);
                if (tmp && tmp.type === Syntax.SpreadElement) {
                    if (!match(']')) {
                        throwError({}, Messages.ElementAfterSpreadElement);
                    }
                } else if (!(match(']') || matchKeyword('for') || matchKeyword('if'))) {
                    expect(','); // this lexes.
                    possiblecomprehension = false;
                }
            }
        }

        expect(']');

        if (filter && !blocks.length) {
            throwError({}, Messages.ComprehensionRequiresBlock);
        }

        if (blocks.length) {
            if (elements.length !== 1) {
                throwError({}, Messages.ComprehensionError);
            }
            return {
                type:  Syntax.ComprehensionExpression,
                filter: filter,
                blocks: blocks,
                body: elements[0]
            };
        } else {
            return {
                type: Syntax.ArrayExpression,
                elements: elements
            };
        }
    }

    // 11.1.5 Object Initialiser

    function parsePropertyFunction(options) {
        var previousStrict, previousYieldAllowed, params, body;

        previousStrict = strict;
        previousYieldAllowed = yieldAllowed;
        yieldAllowed = options.generator;
        params = options.params || [];

        body = parseConciseBody();
        if (options.name && strict && isRestrictedWord(params[0].name)) {
            throwErrorTolerant(options.name, Messages.StrictParamName);
        }
        if (yieldAllowed && !yieldFound) {
            throwError({}, Messages.NoYieldInGenerator);
        }
        strict = previousStrict;
        yieldAllowed = previousYieldAllowed;

        return {
            type: Syntax.FunctionExpression,
            id: null,
            params: params,
            defaults: options.defaults || [],
            body: body,
            rest: options.rest || null,
            generator: options.generator,
            expression: body.type !== Syntax.BlockStatement
        };
    }


    function parsePropertyMethodFunction(options) {
        var token, previousStrict, tmp, method, firstRestricted, message;

        previousStrict = strict;
        strict = true;

        tmp = parseParams();

        if (tmp.firstRestricted) {
            throwError(tmp.firstRestricted, tmp.message);
        }
        if (tmp.stricted) {
            throwErrorTolerant(tmp.stricted, tmp.message);
        }


        method = parsePropertyFunction({
            defaults: tmp.defaults,
            params: tmp.params,
            rest: tmp.rest,
            generator: options.generator
        });

        strict = previousStrict;

        return method;
    }


    function parseObjectPropertyKey() {
        var token = lex();

        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.

        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return createLiteral(token);
        }

        if (token.type === Token.AtSymbol) {
            return {
                type: Syntax.AtSymbol,
                name: token.value
            };
        }

        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }

    function parseObjectProperty() {
        var token, key, id, param;

        token = lookahead();

        if (token.type === Token.Identifier || token.type === Token.AtSymbol) {

            id = parseObjectPropertyKey();

            // Property Assignment: Getter and Setter.

            if (token.value === 'get' && !(match(':') || match('('))) {
                key = parseObjectPropertyKey();
                expect('(');
                expect(')');
                return {
                    type: Syntax.Property,
                    key: key,
                    value: parsePropertyFunction({ generator: false }),
                    kind: 'get'
                };
            } else if (token.value === 'set' && !(match(':') || match('('))) {
                key = parseObjectPropertyKey();
                param = parseParams();
                param.name = token;
                param.generator = false;
                return {
                    type: Syntax.Property,
                    key: key,
                    value: parsePropertyFunction(param),
                    kind: 'set'
                };
            } else {
                if (match(':')) {
                    lex();
                    return {
                        type: Syntax.Property,
                        key: id,
                        value: parseAssignmentExpression(),
                        kind: 'init'
                    };
                } else if (match('(')) {
                    return {
                        type: Syntax.Property,
                        key: id,
                        value: parsePropertyMethodFunction({ generator: false }),
                        kind: 'init',
                        method: true
                    };
                } else {
                    return {
                        type: Syntax.Property,
                        key: id,
                        value: id,
                        kind: 'init',
                        shorthand: true
                    };
                }
            }
        } else if (token.type === Token.EOF || token.type === Token.Punctuator) {
            if (!match('*')) {
                throwUnexpected(token);
            }
            lex();

            id = parseObjectPropertyKey();

            if (!match('(')) {
                throwUnexpected(lex());
            }

            return {
                type: Syntax.Property,
                key: id,
                value: parsePropertyMethodFunction({ generator: true }),
                kind: 'init',
                method: true
            };
        } else {
            key = parseObjectPropertyKey();
            if (match(':')) {
                lex();
                return {
                    type: Syntax.Property,
                    key: key,
                    value: parseAssignmentExpression(),
                    kind: 'init'
                };
            } else if (match('(')) {
                return {
                    type: Syntax.Property,
                    key: key,
                    value: parsePropertyMethodFunction({ generator: false }),
                    kind: 'init',
                    method: true
                };
            }
            throwUnexpected(lex());
        }
    }

    function parseObjectInitialiser() {
        var properties = [], property, name, kind, map = {}, toString = String;

        expect('{');

        while (!match('}')) {
            property = parseObjectProperty();

            if (property.key.type === Syntax.Identifier || property.key.type === Syntax.AtSymbol) {
                name = property.key.name;
            } else {
                name = toString(property.key.value);
            }
            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;
            if (Object.prototype.hasOwnProperty.call(map, name)) {
                if (map[name] === PropertyKind.Data) {
                    if (strict && kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                    } else if (kind !== PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    }
                } else {
                    if (kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    } else if (map[name] & kind) {
                        throwErrorTolerant({}, Messages.AccessorGetSet);
                    }
                }
                map[name] |= kind;
            } else {
                map[name] = kind;
            }

            properties.push(property);

            if (!match('}')) {
                expect(',');
            }
        }

        expect('}');

        return {
            type: Syntax.ObjectExpression,
            properties: properties
        };
    }

    function parseTemplateElement(option) {
        var token = scanTemplateElement(option);
        if (strict && token.octal) {
            throwError(token, Messages.StrictOctalLiteral);
        }
        return {
            type: Syntax.TemplateElement,
            value: {
                raw: token.value.raw,
                cooked: token.value.cooked
            },
            tail: token.tail
        };
    }

    function parseTemplateLiteral() {
        var quasi, quasis, expressions;

        quasi = parseTemplateElement({ head: true });
        quasis = [ quasi ];
        expressions = [];

        while (!quasi.tail) {
            expressions.push(parseExpression());
            quasi = parseTemplateElement({ head: false });
            quasis.push(quasi);
        }

        return {
            type: Syntax.TemplateLiteral,
            quasis: quasis,
            expressions: expressions
        };
    }

    // 11.1.6 The Grouping Operator

    function parseGroupExpression() {
        var expr;

        expect('(');

        ++state.parenthesizedCount;

        state.allowArrowFunction = !state.allowArrowFunction;
        expr = parseExpression();
        state.allowArrowFunction = false;

        if (expr.type !== Syntax.ArrowFunctionExpression) {
            expect(')');
        }

        return expr;
    }


    // 11.1 Primary Expressions

    function parsePrimaryExpression() {
        var expr,
            token = lookahead(),
            type = token.type;

        if (type === Token.Identifier) {
            return {
                type: Syntax.Identifier,
                name: lex().value
            };
        }

        if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return createLiteral(lex());
        }

        if (type === Token.Keyword) {
            if (matchKeyword('this')) {
                lex();
                return {
                    type: Syntax.ThisExpression
                };
            }

            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }

            if (matchKeyword('class')) {
                return parseClassExpression();
            }

            if (matchKeyword('super')) {
                lex();
                return {
                    type: Syntax.Identifier,
                    name: 'super'
                };
            }
        }

        if (type === Token.BooleanLiteral) {
            lex();
            token.value = (token.value === 'true');
            return createLiteral(token);
        }

        if (type === Token.NullLiteral) {
            lex();
            token.value = null;
            return createLiteral(token);
        }

        if (match('[')) {
            return parseArrayInitialiser();
        }

        if (match('{')) {
            return parseObjectInitialiser();
        }

        if (match('(')) {
            return parseGroupExpression();
        }

        if (match('/') || match('/=')) {
            return createLiteral(scanRegExp());
        }

        if (type === Token.Template) {
            return parseTemplateLiteral();
        }

        if (type === Token.AtSymbol) {
            return {
                type: Syntax.AtSymbol,
                name: lex().value
            };
        }

        return throwUnexpected(lex());
    }

    // 11.2 Left-Hand-Side Expressions

    function parseArguments() {
        var args = [], arg;

        expect('(');

        if (!match(')')) {
            while (index < length) {
                arg = parseSpreadOrAssignmentExpression();
                args.push(arg);

                if (match(')')) {
                    break;
                } else if (arg.type === Syntax.SpreadElement) {
                    throwError({}, Messages.ElementAfterSpreadElement);
                }

                expect(',');
            }
        }

        expect(')');

        return args;
    }

    function parseSpreadOrAssignmentExpression() {
        if (match('...')) {
            lex();
            return {
                type: Syntax.SpreadElement,
                argument: parseAssignmentExpression()
            };
        } else {
            return parseAssignmentExpression();
        }
    }

    function parseNonComputedProperty() {
        var token = lex();

        if (!isIdentifierName(token)) {
            throwUnexpected(token);
        }

        if (token.type === Token.AtSymbol) {
            return {
                type: Syntax.AtSymbol,
                name: token.value
            };
        }

        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }

    function parseNonComputedMember() {
        expect('.');

        return parseNonComputedProperty();
    }

    function parseComputedMember() {
        var expr;

        expect('[');

        expr = parseExpression();

        expect(']');

        return expr;
    }

    function parseNewExpression() {
        var expr;

        expectKeyword('new');

        expr = {
            type: Syntax.NewExpression,
            callee: parseLeftHandSideExpression(),
            'arguments': []
        };

        if (match('(')) {
            expr['arguments'] = parseArguments();
        }

        return expr;
    }

    function parseLeftHandSideExpressionAllowCall() {
        var expr;

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[') || match('(') || lookahead().type === Token.Template) {
            if (match('(')) {
                expr = {
                    type: Syntax.CallExpression,
                    callee: expr,
                    'arguments': parseArguments()
                };
            } else if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
            } else if (match('.')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
            } else {
                expr = {
                    type: Syntax.TaggedTemplateExpression,
                    tag: expr,
                    quasi: parseTemplateLiteral()
                };
            }
        }

        return expr;
    }


    function parseLeftHandSideExpression() {
        var expr;

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[') || lookahead().type === Token.Template) {
            if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
            } else if (match('.')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
            } else {
                expr = {
                    type: Syntax.TaggedTemplateExpression,
                    tag: expr,
                    quasi: parseTemplateLiteral()
                };
            }
        }

        return expr;
    }

    // 11.3 Postfix Expressions

    function parsePostfixExpression() {
        var expr = parseLeftHandSideExpressionAllowCall(),
            token = lookahead();

        if (token.type !== Token.Punctuator) {
            return expr;
        }

        if ((match('++') || match('--')) && !peekLineTerminator()) {
            // 11.3.1, 11.3.2
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPostfix);
            }

            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }

            expr = {
                type: Syntax.UpdateExpression,
                operator: lex().value,
                argument: expr,
                prefix: false
            };
        }

        return expr;
    }

    // 11.4 Unary Operators

    function parseUnaryExpression() {
        var token, expr;

        token = lookahead();
        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return parsePostfixExpression();
        }

        if (match('++') || match('--')) {
            token = lex();
            expr = parseUnaryExpression();
            // 11.4.4, 11.4.5
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPrefix);
            }

            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }

            expr = {
                type: Syntax.UpdateExpression,
                operator: token.value,
                argument: expr,
                prefix: true
            };
            return expr;
        }

        if (match('+') || match('-') || match('~') || match('!')) {
            expr = {
                type: Syntax.UnaryExpression,
                operator: lex().value,
                argument: parseUnaryExpression()
            };
            return expr;
        }

        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            expr = {
                type: Syntax.UnaryExpression,
                operator: lex().value,
                argument: parseUnaryExpression()
            };
            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                throwErrorTolerant({}, Messages.StrictDelete);
            }
            return expr;
        }

        return parsePostfixExpression();
    }

    // 11.5 Multiplicative Operators

    function parseMultiplicativeExpression() {
        var expr = parseUnaryExpression();

        while (match('*') || match('/') || match('%')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseUnaryExpression()
            };
        }

        return expr;
    }

    // 11.6 Additive Operators

    function parseAdditiveExpression() {
        var expr = parseMultiplicativeExpression();

        while (match('+') || match('-')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseMultiplicativeExpression()
            };
        }

        return expr;
    }

    // 11.7 Bitwise Shift Operators

    function parseShiftExpression() {
        var expr = parseAdditiveExpression();

        while (match('<<') || match('>>') || match('>>>')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseAdditiveExpression()
            };
        }

        return expr;
    }
    // 11.8 Relational Operators

    function parseRelationalExpression() {
        var expr, previousAllowIn;

        previousAllowIn = state.allowIn;
        state.allowIn = true;

        expr = parseShiftExpression();

        while (match('<') || match('>') || match('<=') || match('>=') || (previousAllowIn && matchKeyword('in')) || matchKeyword('instanceof')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseShiftExpression()
            };
        }

        state.allowIn = previousAllowIn;
        return expr;
    }

    // 11.9 Equality Operators

    function parseEqualityExpression() {
        var expr = parseRelationalExpression();

        while ((!peekLineTerminator() && (matchContextualKeyword('is') || matchContextualKeyword('isnt'))) || match('==') || match('!=') || match('===') || match('!==')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseRelationalExpression()
            };
        }

        return expr;
    }

    // 11.10 Binary Bitwise Operators

    function parseBitwiseANDExpression() {
        var expr = parseEqualityExpression();

        while (match('&')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '&',
                left: expr,
                right: parseEqualityExpression()
            };
        }

        return expr;
    }

    function parseBitwiseXORExpression() {
        var expr = parseBitwiseANDExpression();

        while (match('^')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '^',
                left: expr,
                right: parseBitwiseANDExpression()
            };
        }

        return expr;
    }

    function parseBitwiseORExpression() {
        var expr = parseBitwiseXORExpression();

        while (match('|')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '|',
                left: expr,
                right: parseBitwiseXORExpression()
            };
        }

        return expr;
    }

    // 11.11 Binary Logical Operators

    function parseLogicalANDExpression() {
        var expr = parseBitwiseORExpression();

        while (match('&&')) {
            lex();
            expr = {
                type: Syntax.LogicalExpression,
                operator: '&&',
                left: expr,
                right: parseBitwiseORExpression()
            };
        }

        return expr;
    }

    function parseLogicalORExpression() {
        var expr = parseLogicalANDExpression();

        while (match('||')) {
            lex();
            expr = {
                type: Syntax.LogicalExpression,
                operator: '||',
                left: expr,
                right: parseLogicalANDExpression()
            };
        }

        return expr;
    }

    // 11.12 Conditional Operator

    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent;

        expr = parseLogicalORExpression();

        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = parseAssignmentExpression();
            state.allowIn = previousAllowIn;
            expect(':');

            expr = {
                type: Syntax.ConditionalExpression,
                test: expr,
                consequent: consequent,
                alternate: parseAssignmentExpression()
            };
        }

        return expr;
    }

    // 11.13 Assignment Operators

    function reinterpretAsAssignmentBindingPattern(expr) {
        var i, len, property, element;

        if (expr.type === Syntax.ObjectExpression) {
            expr.type = Syntax.ObjectPattern;
            for (i = 0, len = expr.properties.length; i < len; i += 1) {
                property = expr.properties[i];
                if (property.kind !== 'init') {
                    throwError({}, Messages.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern(property.value);
            }
        } else if (expr.type === Syntax.ArrayExpression) {
            expr.type = Syntax.ArrayPattern;
            for (i = 0, len = expr.elements.length; i < len; i += 1) {
                element = expr.elements[i];
                if (element) {
                    reinterpretAsAssignmentBindingPattern(element);
                }
            }
        } else if (expr.type === Syntax.Identifier) {
            if (isRestrictedWord(expr.name)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }
        } else if (expr.type === Syntax.SpreadElement) {
            reinterpretAsAssignmentBindingPattern(expr.argument);
            if (expr.argument.type === Syntax.ObjectPattern) {
                throwError({}, Messages.ObjectPatternAsSpread);
            }
        } else {
            if (expr.type !== Syntax.MemberExpression && expr.type !== Syntax.CallExpression && expr.type !== Syntax.NewExpression) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }
        }
    }


    function reinterpretAsDestructuredParameter(options, expr) {
        var i, len, property, element;

        if (expr.type === Syntax.ObjectExpression) {
            expr.type = Syntax.ObjectPattern;
            for (i = 0, len = expr.properties.length; i < len; i += 1) {
                property = expr.properties[i];
                if (property.kind !== 'init') {
                    throwError({}, Messages.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter(options, property.value);
            }
        } else if (expr.type === Syntax.ArrayExpression) {
            expr.type = Syntax.ArrayPattern;
            for (i = 0, len = expr.elements.length; i < len; i += 1) {
                element = expr.elements[i];
                if (element) {
                    reinterpretAsDestructuredParameter(options, element);
                }
            }
        } else if (expr.type === Syntax.Identifier) {
            validateParam(options, expr, expr.name);
        } else {
            if (expr.type !== Syntax.MemberExpression) {
                throwError({}, Messages.InvalidLHSInFormalsList);
            }
        }
    }

    function reinterpretAsCoverFormalsList(expressions) {
        var i, len, param, params, options, rest;

        params = [];
        rest = null;
        options = {
            paramSet: {}
        };

        for (i = 0, len = expressions.length; i < len; i += 1) {
            param = expressions[i];
            if (param.type === Syntax.Identifier) {
                params.push(param);
                validateParam(options, param, param.name);
            } else if (param.type === Syntax.ObjectExpression || param.type === Syntax.ArrayExpression) {
                reinterpretAsDestructuredParameter(options, param);
                params.push(param);
            } else if (param.type === Syntax.SpreadElement) {
                if (i !== len - 1) {
                    throwError({}, Messages.ParameterAfterRestParameter);
                }
                reinterpretAsDestructuredParameter(options, param.argument);
                rest = param.argument;
            } else {
                return null;
            }
        }

        if (options.firstRestricted) {
            throwError(options.firstRestricted, options.message);
        }
        if (options.stricted) {
            throwErrorTolerant(options.stricted, options.message);
        }

        return { params: params, rest: rest };
    }

    function parseArrowFunctionExpression(options) {
        var previousStrict, previousYieldAllowed, body;

        expect('=>');

        previousStrict = strict;
        previousYieldAllowed = yieldAllowed;
        strict = true;
        yieldAllowed = false;
        body = parseConciseBody();
        strict = previousStrict;
        yieldAllowed = previousYieldAllowed;

        return {
            type: Syntax.ArrowFunctionExpression,
            id: null,
            params: options.params,
            defaults: options.defaults || [],
            body: body,
            rest: options.rest,
            generator: false,
            expression: body.type !== Syntax.BlockStatement
        };
    }

    function parseAssignmentExpression() {
        var expr, token, params, oldParenthesizedCount, coverFormalsList;

        if (matchKeyword('yield')) {
            return parseYieldExpression();
        }

        oldParenthesizedCount = state.parenthesizedCount;

        if (match('(')) {
            token = lookahead2();
            if (token.type === Token.Punctuator && token.value === ')' || token.value === '...') {
                params = parseParams();
                if (!match('=>')) {
                    throwUnexpected(lex());
                }
                return parseArrowFunctionExpression(params);
            }
        }

        token = lookahead();
        expr = parseConditionalExpression();

        if (match('=>') && expr.type === Syntax.Identifier) {
            if (state.parenthesizedCount === oldParenthesizedCount || state.parenthesizedCount === (oldParenthesizedCount + 1)) {
                if (isRestrictedWord(expr.name)) {
                    throwError({}, Messages.StrictParamName);
                }
                return parseArrowFunctionExpression({ params: [ expr ], rest: null });
            }
        }

        if (matchAssign()) {
            // 11.13.1
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant(token, Messages.StrictLHSAssignment);
            }

            // ES.next draf 11.13 Runtime Semantics step 1
            if (match('=') && (expr.type === Syntax.ObjectExpression || expr.type === Syntax.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern(expr);
            } else if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }

            expr = {
                type: Syntax.AssignmentExpression,
                operator: lex().value,
                left: expr,
                right: parseAssignmentExpression()
            };
        }

        return expr;
    }

    // 11.14 Comma Operator

    function parseExpression() {
        var expr, sequence, coverFormalsList, spreadFound, token;

        expr = parseAssignmentExpression();

        if (match(',')) {
            sequence = {
                type: Syntax.SequenceExpression,
                expressions: [ expr ]
            };

            while (index < length) {
                if (!match(',')) {
                    break;
                }

                lex();
                expr = parseSpreadOrAssignmentExpression();
                sequence.expressions.push(expr);

                if (expr.type === Syntax.SpreadElement) {
                    spreadFound = true;
                    if (!match(')')) {
                        throwError({}, Messages.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
        }

        if (state.allowArrowFunction && match(')')) {
            token = lookahead2();
            if (token.value === '=>') {
                lex();

                state.allowArrowFunction = false;
                expr = sequence ? sequence.expressions : [ expr ];
                coverFormalsList = reinterpretAsCoverFormalsList(expr);
                if (coverFormalsList) {
                    return parseArrowFunctionExpression(coverFormalsList);
                }

                throwUnexpected(token);
            }
        }

        if (spreadFound) {
            throwError({}, Messages.IllegalSpread);
        }

        return sequence || expr;
    }

    // 12.1 Block

    function parseStatementList() {
        var list = [],
            statement;

        while (index < length) {
            if (match('}')) {
                break;
            }
            statement = parseSourceElement();
            if (typeof statement === 'undefined') {
                break;
            }
            list.push(statement);
        }

        return list;
    }

    function parseBlock() {
        var block;

        expect('{');

        block = parseStatementList();

        expect('}');

        return {
            type: Syntax.BlockStatement,
            body: block
        };
    }

    // 12.2 Variable Statement

    function parseVariableIdentifier() {
        var token = lex();

        if (token.type !== Token.Identifier) {
            throwUnexpected(token);
        }

        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }


    function parseVariableDeclaration(kind) {
        var id,
            init = null;
        if (match('{')) {
            id = parseObjectInitialiser();
            reinterpretAsAssignmentBindingPattern(id);
        } else if (match('[')) {
            id = parseArrayInitialiser();
            reinterpretAsAssignmentBindingPattern(id);
        } else {
            id = parseVariableIdentifier();
            // 12.2.1
            if (strict && isRestrictedWord(id.name)) {
                throwErrorTolerant({}, Messages.StrictVarName);
            }
        }

        if (kind === 'const') {
            if (!match('=')) {
                throwError({}, Messages.NoUnintializedConst);
            }
            expect('=');
            init = parseAssignmentExpression();
        } else if (match('=')) {
            lex();
            init = parseAssignmentExpression();
        }

        return {
            type: Syntax.VariableDeclarator,
            id: id,
            init: init
        };
    }

    function parseVariableDeclarationList(kind) {
        var list = [];

        while (index < length) {
            list.push(parseVariableDeclaration(kind));
            if (!match(',')) {
                break;
            }
            lex();
        }

        return list;
    }

    function parseVariableStatement() {
        var declarations;

        expectKeyword('var');

        declarations = parseVariableDeclarationList();

        consumeSemicolon();

        return {
            type: Syntax.VariableDeclaration,
            declarations: declarations,
            kind: 'var'
        };
    }

    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration(kind) {
        var declarations;

        expectKeyword(kind);

        declarations = parseVariableDeclarationList(kind);

        consumeSemicolon();

        return {
            type: Syntax.VariableDeclaration,
            declarations: declarations,
            kind: kind
        };
    }


    function parseAtSymbol() {
        var token = lex();

        if (token.type !== Token.AtSymbol) {
            throwUnexpected(token);
        }

        return {
            type: Syntax.AtSymbol,
            name: token.value
        };
    }

    function parsePrivateStatement() {
        var declarations;

        expectKeyword('private');

        declarations = parseSymbolDeclarationList();

        consumeSemicolon();

        return {
            type: Syntax.SymbolDeclaration,
            declarations: declarations,
            kind: 'private'
        };
    }

    function parseSymbolStatement() {
        var declarations;

        matchContextualKeyword('symbol');
        lex();


        declarations = parseSymbolDeclarationList();

        consumeSemicolon();

        return {
            type: Syntax.SymbolDeclaration,
            declarations: declarations,
            kind: 'symbol'
        };
    }

    function parseSymbolDeclarationList() {
        var list = [];

        while (index < length) {
            list.push(parseSymbolDeclaration());
            if (!match(',')) {
                break;
            }
            lex();
        }

        return list;
    }

    function parseSymbolDeclaration() {
        var id, init = null;

        id = parseAtSymbol();

        if (match('=')) {
            lex();
            init = parseAssignmentExpression();
        }

        return {
            type: Syntax.SymbolDeclarator,
            id: id,
            init: init
        };
    }


    // http://wiki.ecmascript.org/doku.php?id=harmony:modules

    function parsePath() {
        var result, id;

        result = {
            type: Syntax.Path,
            body: []
        };

        while (true) {
            id = parseVariableIdentifier();
            result.body.push(id);
            if (!match('.')) {
                break;
            }
            lex();
        }

        return result;
    }

    function parseGlob() {
        expect('*');
        return {
            type: Syntax.Glob
        };
    }

    function parseModuleDeclaration() {
        var id, token, declaration;

        lex();

        id = parseVariableIdentifier();

        if (match('{')) {
            return {
                type: Syntax.ModuleDeclaration,
                id: id,
                body: parseModuleBlock()
            };
        }

        expect('=');

        token = lookahead();
        if (token.type === Token.StringLiteral) {
            declaration = {
                type: Syntax.ModuleDeclaration,
                id: id,
                from: parsePrimaryExpression()
            };
        } else {
            declaration = {
                type: Syntax.ModuleDeclaration,
                id: id,
                from: parsePath()
            };
        }

        consumeSemicolon();

        return declaration;
    }

    function parseExportSpecifierSetProperty() {
        var specifier;

        specifier = {
            type: Syntax.ExportSpecifier,
            id: parseVariableIdentifier(),
            from: null
        };

        if (match(':')) {
            lex();
            specifier.from = parsePath();
        }

        return specifier;
    }

    function parseExportSpecifier() {
        var specifier, specifiers;

        if (match('{')) {
            lex();
            specifiers = [];

            do {
                specifiers.push(parseExportSpecifierSetProperty());
            } while (match(',') && lex());

            expect('}');

            return {
                type: Syntax.ExportSpecifierSet,
                specifiers: specifiers
            };
        }

        if (match('*')) {
            specifier = {
                type: Syntax.ExportSpecifier,
                id: parseGlob(),
                from: null
            };

            if (matchContextualKeyword('from')) {
                lex();
                specifier.from = parsePath();
            }
        } else {
            specifier = {
                type: Syntax.ExportSpecifier,
                id: parseVariableIdentifier(),
                from: null
            };
        }
        return specifier;
    }

    function parseExportDeclaration() {
        var token, specifiers;

        expectKeyword('export');

        token = lookahead();

        if (token.type === Token.Keyword || (token.type === Token.Identifier && token.value === 'module')) {
            switch (token.value) {
            case 'function':
                return {
                    type: Syntax.ExportDeclaration,
                    declaration: parseFunctionDeclaration()
                };
            case 'module':
                return {
                    type: Syntax.ExportDeclaration,
                    declaration: parseModuleDeclaration()
                };
            case 'let':
            case 'const':
                return {
                    type: Syntax.ExportDeclaration,
                    declaration: parseConstLetDeclaration(token.value)
                };
            case 'var':
                return {
                    type: Syntax.ExportDeclaration,
                    declaration: parseStatement()
                };
            case 'class':
                return {
                    type: Syntax.ExportDeclaration,
                    declaration: parseClassDeclaration()
                };
            }
            throwUnexpected(lex());
        }

        specifiers = [ parseExportSpecifier() ];
        if (match(',')) {
            while (index < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                specifiers.push(parseExportSpecifier());
            }
        }

        consumeSemicolon();

        return {
            type: Syntax.ExportDeclaration,
            specifiers: specifiers
        };
    }

    function parseImportDeclaration() {
        var specifiers, from;

        expectKeyword('import');

        if (match('*')) {
            specifiers = [parseGlob()];
        } else if (match('{')) {
            lex();
            specifiers = [];

            do {
                specifiers.push(parseImportSpecifier());
            } while (match(',') && lex());

            expect('}');
        } else {
            specifiers = [parseVariableIdentifier()];
        }

        if (!matchContextualKeyword('from')) {
            throwError({}, Messages.NoFromAfterImport);
        }

        lex();

        if (lookahead().type === Token.StringLiteral) {
            from = parsePrimaryExpression();
        } else {
            from = parsePath();
        }

        consumeSemicolon();

        return {
            type: Syntax.ImportDeclaration,
            specifiers: specifiers,
            from: from
        };
    }

    function parseImportSpecifier() {
        var specifier;

        specifier = {
            type: Syntax.ImportSpecifier,
            id: parseVariableIdentifier(),
            from: null
        };

        if (match(':')) {
            lex();
            specifier.from = parsePath();
        }

        return specifier;
    }

    // 12.3 Empty Statement

    function parseEmptyStatement() {
        expect(';');

        return {
            type: Syntax.EmptyStatement
        };
    }

    // 12.4 Expression Statement

    function parseExpressionStatement() {
        var expr = parseExpression();

        consumeSemicolon();

        return {
            type: Syntax.ExpressionStatement,
            expression: expr
        };
    }

    // 12.5 If statement

    function parseIfStatement() {
        var test, consequent, alternate;

        expectKeyword('if');

        expect('(');

        test = parseExpression();

        expect(')');

        consequent = parseStatement();

        if (matchKeyword('else')) {
            lex();
            alternate = parseStatement();
        } else {
            alternate = null;
        }

        return {
            type: Syntax.IfStatement,
            test: test,
            consequent: consequent,
            alternate: alternate
        };
    }

    // 12.6 Iteration Statements

    function parseDoWhileStatement() {
        var body, test, oldInIteration;

        expectKeyword('do');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        if (match(';')) {
            lex();
        }

        return {
            type: Syntax.DoWhileStatement,
            body: body,
            test: test
        };
    }

    function parseWhileStatement() {
        var test, body, oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        return {
            type: Syntax.WhileStatement,
            test: test,
            body: body
        };
    }

    function parseForVariableDeclaration() {
        var token = lex();

        return {
            type: Syntax.VariableDeclaration,
            declarations: parseVariableDeclarationList(),
            kind: token.value
        };
    }

    function parseForStatement(opts) {
        var init, test, update, left, right, body, operator, oldInIteration;
        init = test = update = null;
        expectKeyword('for');

        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword("each")) {
            lex();//throwError({}, Messages.EachNotAllowed);
        }

        expect('(');

        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var') || matchKeyword('let') || matchKeyword('const')) {
                state.allowIn = false;
                init = parseForVariableDeclaration();
                state.allowIn = true;

                if (init.declarations.length === 1) {
                    if (matchKeyword('in') || matchContextualKeyword('of')) {
                        operator = lookahead();
                        if (!((operator.value === 'in' || init.kind !== 'var') && init.declarations[0].init)) {
                            lex();
                            left = init;
                            right = parseExpression();
                            init = null;
                        }
                    }
                }
            } else {
                state.allowIn = false;
                init = parseExpression();
                state.allowIn = true;

                if (matchContextualKeyword('of')) {
                    operator = lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                } else if (matchKeyword('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide(init)) {
                        throwError({}, Messages.InvalidLHSInForIn);
                    }
                    operator = lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            }

            if (typeof left === 'undefined') {
                expect(';');
            }
        }

        if (typeof left === 'undefined') {

            if (!match(';')) {
                test = parseExpression();
            }
            expect(';');

            if (!match(')')) {
                update = parseExpression();
            }
        }

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        if (!(opts !== undefined && opts.ignore_body)) {
            body = parseStatement();
        }

        state.inIteration = oldInIteration;

        if (typeof left === 'undefined') {
            return {
                type: Syntax.ForStatement,
                init: init,
                test: test,
                update: update,
                body: body
            };
        }

        if (operator.value === 'in') {
            return {
                type: Syntax.ForInStatement,
                left: left,
                right: right,
                body: body,
                each: false
            };
        } else {
            return {
                type: Syntax.ForOfStatement,
                left: left,
                right: right,
                body: body
            };
        }
    }

    // 12.7 The continue statement

    function parseContinueStatement() {
        var token, label = null;

        expectKeyword('continue');

        // Optimize the most common form: 'continue;'.
        if (source[index] === ';') {
            lex();

            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return {
                type: Syntax.ContinueStatement,
                label: null
            };
        }

        if (peekLineTerminator()) {
            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return {
                type: Syntax.ContinueStatement,
                label: null
            };
        }

        token = lookahead();
        if (token.type === Token.Identifier) {
            label = parseVariableIdentifier();

            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !state.inIteration) {
            throwError({}, Messages.IllegalContinue);
        }

        return {
            type: Syntax.ContinueStatement,
            label: label
        };
    }

    // 12.8 The break statement

    function parseBreakStatement() {
        var token, label = null;

        expectKeyword('break');

        // Optimize the most common form: 'break;'.
        if (source[index] === ';') {
            lex();

            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return {
                type: Syntax.BreakStatement,
                label: null
            };
        }

        if (peekLineTerminator()) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return {
                type: Syntax.BreakStatement,
                label: null
            };
        }

        token = lookahead();
        if (token.type === Token.Identifier) {
            label = parseVariableIdentifier();

            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError({}, Messages.IllegalBreak);
        }

        return {
            type: Syntax.BreakStatement,
            label: label
        };
    }

    // 12.9 The return statement

    function parseReturnStatement() {
        var token, argument = null;

        expectKeyword('return');

        if (!state.inFunctionBody) {
            throwErrorTolerant({}, Messages.IllegalReturn);
        }

        // 'return' followed by a space and an identifier is very common.
        if (source[index] === ' ') {
            if (isIdentifierStart(source[index + 1])) {
                argument = parseExpression();
                consumeSemicolon();
                return {
                    type: Syntax.ReturnStatement,
                    argument: argument
                };
            }
        }

        if (peekLineTerminator()) {
            return {
                type: Syntax.ReturnStatement,
                argument: null
            };
        }

        if (!match(';')) {
            token = lookahead();
            if (!match('}') && token.type !== Token.EOF) {
                argument = parseExpression();
            }
        }

        consumeSemicolon();

        return {
            type: Syntax.ReturnStatement,
            argument: argument
        };
    }

    // 12.10 The with statement

    function parseWithStatement() {
        var object, body;

        if (strict) {
            throwErrorTolerant({}, Messages.StrictModeWith);
        }

        expectKeyword('with');

        expect('(');

        object = parseExpression();

        expect(')');

        body = parseStatement();

        return {
            type: Syntax.WithStatement,
            object: object,
            body: body
        };
    }

    // 12.10 The swith statement

    function parseSwitchCase() {
        var test,
            consequent = [],
            statement;

        if (matchKeyword('default')) {
            lex();
            test = null;
        } else {
            expectKeyword('case');
            test = parseExpression();
        }
        expect(':');

        while (index < length) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement = parseSourceElement();
            if (typeof statement === 'undefined') {
                break;
            }
            consequent.push(statement);
        }

        return {
            type: Syntax.SwitchCase,
            test: test,
            consequent: consequent
        };
    }

    function parseSwitchStatement() {
        var discriminant, cases, clause, oldInSwitch, defaultFound;

        expectKeyword('switch');

        expect('(');

        discriminant = parseExpression();

        expect(')');

        expect('{');

        if (match('}')) {
            lex();
            return {
                type: Syntax.SwitchStatement,
                discriminant: discriminant
            };
        }

        cases = [];

        oldInSwitch = state.inSwitch;
        state.inSwitch = true;
        defaultFound = false;

        while (index < length) {
            if (match('}')) {
                break;
            }
            clause = parseSwitchCase();
            if (clause.test === null) {
                if (defaultFound) {
                    throwError({}, Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
            }
            cases.push(clause);
        }

        state.inSwitch = oldInSwitch;

        expect('}');

        return {
            type: Syntax.SwitchStatement,
            discriminant: discriminant,
            cases: cases
        };
    }

    // 12.13 The throw statement

    function parseThrowStatement() {
        var argument;

        expectKeyword('throw');

        if (peekLineTerminator()) {
            throwError({}, Messages.NewlineAfterThrow);
        }

        argument = parseExpression();

        consumeSemicolon();

        return {
            type: Syntax.ThrowStatement,
            argument: argument
        };
    }

    // 12.14 The try statement

    function parseCatchClause() {
        var param;

        expectKeyword('catch');

        expect('(');
        if (!match(')')) {
            param = parseExpression();
            // 12.14.1
            if (strict && param.type === Syntax.Identifier && isRestrictedWord(param.name)) {
                throwErrorTolerant({}, Messages.StrictCatchVariable);
            }
        }
        expect(')');

        return {
            type: Syntax.CatchClause,
            param: param,
            body: parseBlock()
        };
    }

    function parseTryStatement() {
        var block, handlers = [], finalizer = null;

        expectKeyword('try');

        block = parseBlock();

        if (matchKeyword('catch')) {
            handlers.push(parseCatchClause());
        }

        if (matchKeyword('finally')) {
            lex();
            finalizer = parseBlock();
        }

        if (handlers.length === 0 && !finalizer) {
            throwError({}, Messages.NoCatchOrFinally);
        }

        return {
            type: Syntax.TryStatement,
            block: block,
            guardedHandlers: [],
            handlers: handlers,
            finalizer: finalizer
        };
    }

    // 12.15 The debugger statement

    function parseDebuggerStatement() {
        expectKeyword('debugger');

        consumeSemicolon();

        return {
            type: Syntax.DebuggerStatement
        };
    }

    // 12 Statements

    function parseStatement() {
        var token = lookahead(),
            expr,
            labeledBody;

        if (token.type === Token.EOF) {
            throwUnexpected(token);
        }

        if (token.type === Token.Punctuator) {
            switch (token.value) {
            case ';':
                return parseEmptyStatement();
            case '{':
                return parseBlock();
            case '(':
                return parseExpressionStatement();
            default:
                break;
            }
        }


        if (token.type === Token.Keyword) {
            switch (token.value) {
            case 'break':
                return parseBreakStatement();
            case 'continue':
                return parseContinueStatement();
            case 'debugger':
                return parseDebuggerStatement();
            case 'do':
                return parseDoWhileStatement();
            case 'for':
                return parseForStatement();
            case 'function':
                return parseFunctionDeclaration();
            case 'class':
                return parseClassDeclaration();
            case 'if':
                return parseIfStatement();
            case 'private':
                return parsePrivateStatement();
            case 'return':
                return parseReturnStatement();
            case 'switch':
                return parseSwitchStatement();
            case 'throw':
                return parseThrowStatement();
            case 'try':
                return parseTryStatement();
            case 'var':
                return parseVariableStatement();
            case 'while':
                return parseWhileStatement();
            case 'with':
                return parseWithStatement();
            default:
                break;
            }
        }

        if (token.type === Token.Identifier && token.value === 'symbol' && lookahead2().type === Token.AtSymbol) {
            return parseSymbolStatement();
        }

        expr = parseExpression();

        // 12.12 Labelled Statements
        if ((expr.type === Syntax.Identifier) && match(':')) {
            lex();

            if (Object.prototype.hasOwnProperty.call(state.labelSet, expr.name)) {
                throwError({}, Messages.Redeclaration, 'Label', expr.name);
            }

            state.labelSet[expr.name] = true;
            labeledBody = parseStatement();
            delete state.labelSet[expr.name];

            return {
                type: Syntax.LabeledStatement,
                label: expr,
                body: labeledBody
            };
        }

        consumeSemicolon();

        return {
            type: Syntax.ExpressionStatement,
            expression: expr
        };
    }

    // 13 Function Definition

    function parseConciseBody() {
        if (match('{')) {
            return parseFunctionSourceElements();
        } else {
            return parseAssignmentExpression();
        }
    }

    function parseFunctionSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted,
            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody, oldParenthesizedCount;

        expect('{');

        while (index < length) {
            token = lookahead();
            if (token.type !== Token.StringLiteral) {
                break;
            }

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        oldLabelSet = state.labelSet;
        oldInIteration = state.inIteration;
        oldInSwitch = state.inSwitch;
        oldInFunctionBody = state.inFunctionBody;
        oldParenthesizedCount = state.parenthesizedCount;

        state.labelSet = {};
        state.inIteration = false;
        state.inSwitch = false;
        state.inFunctionBody = true;
        state.parenthesizedCount = 0;

        while (index < length) {
            if (match('}')) {
                break;
            }
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }

        expect('}');

        state.labelSet = oldLabelSet;
        state.inIteration = oldInIteration;
        state.inSwitch = oldInSwitch;
        state.inFunctionBody = oldInFunctionBody;
        state.parenthesizedCount = oldParenthesizedCount;

        return {
            type: Syntax.BlockStatement,
            body: sourceElements
        };
    }


    function validateParam(options, param, name) {
        if (strict) {
            if (isRestrictedWord(name)) {
                options.stricted = param;
                options.message = Messages.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options.paramSet, name)) {
                options.stricted = param;
                options.message = Messages.StrictParamDupe;
            }
        } else if (!options.firstRestricted) {
            if (isRestrictedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictParamName;
            } else if (isStrictModeReservedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options.paramSet, name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictParamDupe;
            }
        }
        options.paramSet[name] = true;
    }


    function parseParam(options) {
        var token, rest, param;

        token = lookahead();
        if (token.value === '...') {
            token = lex();
            rest = true;
        }

        if (match('[')) {
            param = parseArrayInitialiser();
            reinterpretAsDestructuredParameter(options, param);
        } else if (match('{')) {
            if (rest) {
                throwError({}, Messages.ObjectPatternAsRestParameter);
            }
            param = parseObjectInitialiser();
            reinterpretAsDestructuredParameter(options, param);
        } else {
            param = parseVariableIdentifier();
            validateParam(options, token, token.value);
        }

        if (rest) {
            if (!match(')')) {
                throwError({}, Messages.ParameterAfterRestParameter);
            }
            options.rest = param;
            return false;
        }

        if (match('=')) {
            lex();
            options.defaults.push(parseAssignmentExpression());
        } else if (options.defaults.length) {
            throwError({}, Messages.DefaultsNotLast);
        }

        options.params.push(param);
        return !match(')');
    }


    function parseParams(firstRestricted) {
        var options;

        options = {
            params: [],
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted
        }

        expect('(');

        if (!match(')')) {
            options.paramSet = {};
            while (index < length) {
                if (!parseParam(options)) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        return options;
    }


    function parseFunctionDeclaration() {
        var id, body, token, tmp, firstRestricted, message, previousStrict, previousYieldAllowed, generator, expression;

        expectKeyword('function');

        generator = false;
        if (match('*')) {
            lex();
            generator = true;
        }

        token = lookahead();

        id = parseVariableIdentifier();
        if (strict) {
            if (isRestrictedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictFunctionName;
            } else if (isStrictModeReservedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictReservedWord;
            }
        }

        tmp = parseParams(firstRestricted);
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        previousYieldAllowed = yieldAllowed;
        yieldAllowed = generator;

        // here we redo some work in order to set 'expression'
        expression = !match('{');
        body = parseConciseBody();

        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && tmp.stricted) {
            throwErrorTolerant(tmp.stricted, message);
        }
        if (yieldAllowed && !yieldFound) {
            throwError({}, Messages.NoYieldInGenerator);
        }
        strict = previousStrict;
        yieldAllowed = previousYieldAllowed;

        return {
            type: Syntax.FunctionDeclaration,
            id: id,
            params: tmp.params,
            defaults: tmp.defaults,
            body: body,
            rest: tmp.rest,
            generator: generator,
            expression: expression
        };
    }

    function parseFunctionExpression() {
        var token, id = null, firstRestricted, message, tmp, body, previousStrict, previousYieldAllowed, generator, expression;

        expectKeyword('function');

        generator = false;

        if (match('*')) {
            lex();
            generator = true;
        }

        if (!match('(')) {
            token = lookahead();
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        tmp = parseParams(firstRestricted);
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        previousYieldAllowed = yieldAllowed;
        yieldAllowed = generator;

        // here we redo some work in order to set 'expression'
        expression = !match('{');
        body = parseConciseBody();

        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && tmp.stricted) {
            throwErrorTolerant(tmp.stricted, message);
        }
        if (yieldAllowed && !yieldFound) {
            throwError({}, Messages.NoYieldInGenerator);
        }
        strict = previousStrict;
        yieldAllowed = previousYieldAllowed;


        return {
            type: Syntax.FunctionExpression,
            id: id,
            params: tmp.params,
            defaults: tmp.defaults,
            body: body,
            rest: tmp.rest,
            generator: generator,
            expression: expression
        };
    }

    function parseYieldExpression() {
        var delegate, expr, previousYieldAllowed;

        expectKeyword('yield');

        if (!yieldAllowed) {
            throwErrorTolerant({}, Messages.IllegalYield);
        }

        delegate = false;
        if (match('*')) {
            lex();
            delegate = true;
        }

        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed = yieldAllowed;
        yieldAllowed = false;
        expr = parseAssignmentExpression();
        yieldAllowed = previousYieldAllowed;
        yieldFound = true;

        return {
            type: Syntax.YieldExpression,
            argument: expr,
            delegate: delegate
        };
    }

    // 14 Classes

    function parseMethodDefinition() {
        var token, key, param;

        if (match('*')) {
            lex();
            return {
                type: Syntax.MethodDefinition,
                key: parseObjectPropertyKey(),
                value: parsePropertyMethodFunction({ generator: true }),
                kind: ''
            };
        }

        token = lookahead();
        key = parseObjectPropertyKey();

        if (token.value === 'get' && !match('(')) {
            key = parseObjectPropertyKey();
            expect('(');
            expect(')');
            return {
                type: Syntax.MethodDefinition,
                key: key,
                value: parsePropertyFunction({ generator: false }),
                kind: 'get'
            };
        } else if (token.value === 'set' && !match('(')) {
            key = parseObjectPropertyKey();
            param = parseParams();
            param.name = token;
            param.generator = false;
            return {
                type: Syntax.MethodDefinition,
                key: key,
                value: parsePropertyFunction(param),
                kind: 'set'
            };
        } else {
            return {
                type: Syntax.MethodDefinition,
                key: key,
                value: parsePropertyMethodFunction({ generator: false }),
                kind: ''
            };
        }
    }

    function parseClassElement() {
        if (match(';')) {
            lex();
            return;
        } else if (lookahead().value === 'private' && lookahead2().type === Token.AtSymbol) {
            return parsePrivateStatement();
        } else if (lookahead().value === 'symbol' && lookahead2().type === Token.AtSymbol) {
            return parseSymbolStatement();
        } else {
            return parseMethodDefinition();
        }
    }

    function parseClassBody() {
        var classElement, classElements = [];

        expect('{');

        while (index < length) {
            if (match('}')) {
                break;
            }
            classElement = parseClassElement();
            if (typeof classElement !== 'undefined') {
                classElements.push(classElement);
            }
        }

        expect('}');

        return {
            type: Syntax.ClassBody,
            body: classElements
        };
    }

    function parseClassExpression() {
        var id, body, previousYieldAllowed, superClass;

        expectKeyword('class');

        if (!matchKeyword('extends') && !match('{')) {
            id = parseVariableIdentifier();
        }

        if (matchKeyword('extends')) {
            expectKeyword('extends');
            previousYieldAllowed = yieldAllowed;
            yieldAllowed = false;
            superClass = parseAssignmentExpression();
            yieldAllowed = previousYieldAllowed;
        }

        body = parseClassBody();
        return {
            id: id,
            type: Syntax.ClassExpression,
            body: body,
            superClass: superClass
        };
    }

    function parseClassDeclaration() {
        var token, id, body, previousYieldAllowed, superClass;

        expectKeyword('class');

        token = lookahead();
        id = parseVariableIdentifier();

        if (matchKeyword('extends')) {
            expectKeyword('extends');
            previousYieldAllowed = yieldAllowed;
            yieldAllowed = false;
            superClass = parseAssignmentExpression();
            yieldAllowed = previousYieldAllowed;
        }

        body = parseClassBody();
        return {
            id: id,
            type: Syntax.ClassDeclaration,
            body: body,
            superClass: superClass
        };
    }

    // 15 Program

    function parseSourceElement() {
        var token = lookahead();

        if (token.type === Token.Keyword) {
            switch (token.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(token.value);
            case 'function':
                return parseFunctionDeclaration();
            default:
                return parseStatement();
            }
        }

        if (token.type !== Token.EOF) {
            return parseStatement();
        }
    }

    function parseProgramElement() {
        var token = lookahead(), lineNumber;

        if (token.type === Token.Keyword) {
            switch (token.value) {
            case 'export':
                return parseExportDeclaration();
            case 'import':
                return parseImportDeclaration();
            }
        }

        if (token.value === 'module' && token.type === Token.Identifier) {
            lineNumber = token.lineNumber;
            token = lookahead2();
            if (token.type === Token.Identifier && token.lineNumber === lineNumber) {
                return parseModuleDeclaration();
            }
        }

        return parseSourceElement();
    }

    function parseProgramElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted;

        while (index < length) {
            token = lookahead();
            if (token.type !== Token.StringLiteral) {
                break;
            }

            sourceElement = parseProgramElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        while (index < length) {
            sourceElement = parseProgramElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }
        return sourceElements;
    }

    function parseModuleElement() {
        return parseProgramElement();
    }

    function parseModuleElements() {
        var list = [],
            statement;

        while (index < length) {
            if (match('}')) {
                break;
            }
            statement = parseModuleElement();
            if (typeof statement === 'undefined') {
                break;
            }
            list.push(statement);
        }

        return list;
    }

    function parseModuleBlock() {
        var block;

        expect('{');

        block = parseModuleElements();

        expect('}');

        return {
            type: Syntax.BlockStatement,
            body: block
        };
    }

    function parseProgram() {
        var program;
        strict = false;
        yieldAllowed = false;
        yieldFound = false;
        program = {
            type: Syntax.Program,
            body: parseProgramElements()
        };
        return program;
    }

    // The following functions are needed only when the option to preserve
    // the comments is active.

    function addComment(type, value, start, end, loc) {
        assert(typeof start === 'number', 'Comment must have valid position');

        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra.comments.length > 0) {
            if (extra.comments[extra.comments.length - 1].range[1] > start) {
                return;
            }
        }

        extra.comments.push({
            type: type,
            value: value,
            range: [start, end],
            loc: loc
        });
    }

    function scanComment() {
        var comment, ch, loc, start, blockComment, lineComment;

        comment = '';
        blockComment = false;
        lineComment = false;

        while (index < length) {
            ch = source[index];

            if (lineComment) {
                ch = nextChar();
                if (isLineTerminator(ch)) {
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart - 1
                    };
                    lineComment = false;
                    addComment('Line', comment, start, index - 1, loc);
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                    comment = '';
                } else if (index >= length) {
                    lineComment = false;
                    comment += ch;
                    loc.end = {
                        line: lineNumber,
                        column: length - lineStart
                    };
                    addComment('Line', comment, start, length, loc);
                } else {
                    comment += ch;
                }
            } else if (blockComment) {
                if (isLineTerminator(ch)) {
                    if (ch === '\r' && source[index + 1] === '\n') {
                        ++index;
                        comment += '\r\n';
                    } else {
                        comment += ch;
                    }
                    ++lineNumber;
                    ++index;
                    lineStart = index;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch = nextChar();
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    comment += ch;
                    if (ch === '*') {
                        ch = source[index];
                        if (ch === '/') {
                            comment = comment.substr(0, comment.length - 1);
                            blockComment = false;
                            ++index;
                            loc.end = {
                                line: lineNumber,
                                column: index - lineStart
                            };
                            addComment('Block', comment, start, index, loc);
                            comment = '';
                        }
                    }
                }
            } else if (ch === '/') {
                ch = source[index + 1];
                if (ch === '/') {
                    loc = {
                        start: {
                            line: lineNumber,
                            column: index - lineStart
                        }
                    };
                    start = index;
                    index += 2;
                    lineComment = true;
                    if (index >= length) {
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        lineComment = false;
                        addComment('Line', comment, start, index, loc);
                    }
                } else if (ch === '*') {
                    start = index;
                    index += 2;
                    blockComment = true;
                    loc = {
                        start: {
                            line: lineNumber,
                            column: index - lineStart - 2
                        }
                    };
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch ===  '\r' && source[index] === '\n') {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else {
                break;
            }
        }
    }

    function filterCommentLocation() {
        var i, entry, comment, comments = [];

        for (i = 0; i < extra.comments.length; ++i) {
            entry = extra.comments[i];
            comment = {
                type: entry.type,
                value: entry.value
            };
            if (extra.range) {
                comment.range = entry.range;
            }
            if (extra.loc) {
                comment.loc = entry.loc;
            }
            comments.push(comment);
        }

        extra.comments = comments;
    }

    function collectToken() {
        var start, loc, token, range, value;

        skipComment();
        start = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        token = extra.advance();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (token.type !== Token.EOF) {
            range = [token.range[0], token.range[1]];
            value = sliceSource(token.range[0], token.range[1]);
            extra.tokens.push({
                type: TokenName[token.type],
                value: value,
                range: range,
                loc: loc
            });
        }

        return token;
    }

    function collectRegex() {
        var pos, loc, regex, token;

        skipComment();

        pos = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        regex = extra.scanRegExp();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        // Pop the previous token, which is likely '/' or '/='
        if (extra.tokens.length > 0) {
            token = extra.tokens[extra.tokens.length - 1];
            if (token.range[0] === pos && token.type === 'Punctuator') {
                if (token.value === '/' || token.value === '/=') {
                    extra.tokens.pop();
                }
            }
        }

        extra.tokens.push({
            type: 'RegularExpression',
            value: regex.literal,
            range: [pos, index],
            loc: loc
        });

        return regex;
    }

    function filterTokenLocation() {
        var i, entry, token, tokens = [];

        for (i = 0; i < extra.tokens.length; ++i) {
            entry = extra.tokens[i];
            token = {
                type: entry.type,
                value: entry.value
            };
            if (extra.range) {
                token.range = entry.range;
            }
            if (extra.loc) {
                token.loc = entry.loc;
            }
            tokens.push(token);
        }

        extra.tokens = tokens;
    }

    function createLiteral(token) {
        return {
            type: Syntax.Literal,
            value: token.value
        };
    }

    function createRawLiteral(token) {
        return {
            type: Syntax.Literal,
            value: token.value,
            raw: sliceSource(token.range[0], token.range[1])
        };
    }

    function createLocationMarker() {
        var marker = {};

        marker.range = [index, index];
        marker.loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            },
            end: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        marker.end = function () {
            this.range[1] = index;
            this.loc.end.line = lineNumber;
            this.loc.end.column = index - lineStart;
        };

        marker.applyGroup = function (node) {
            if (extra.range) {
                node.groupRange = [this.range[0], this.range[1]];
            }
            if (extra.loc) {
                node.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
            }
        };

        marker.apply = function (node) {
            if (extra.range) {
                node.range = [this.range[0], this.range[1]];
            }
            if (extra.loc) {
                node.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
            }
        };

        return marker;
    }

    function trackGroupExpression() {
        var marker, expr;

        skipComment();
        marker = createLocationMarker();
        expect('(');

        ++state.parenthesizedCount;

        state.allowArrowFunction = !state.allowArrowFunction;
        expr = parseExpression();
        state.allowArrowFunction = false;

        if (expr.type === 'ArrowFunctionExpression') {
            marker.end();
            marker.apply(expr);
        } else {
            expect(')');
            marker.end();
            marker.applyGroup(expr);
        }

        return expr;
    }

    function trackLeftHandSideExpression() {
        var marker, expr;

        skipComment();
        marker = createLocationMarker();

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[') || lookahead().type === Token.Template) {
            if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
                marker.end();
                marker.apply(expr);
            } else if (match('.')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
                marker.end();
                marker.apply(expr);
            } else {
                expr = {
                    type: Syntax.TaggedTemplateExpression,
                    tag: expr,
                    quasi: parseTemplateLiteral()
                };
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }

    function trackLeftHandSideExpressionAllowCall() {
        var marker, expr;

        skipComment();
        marker = createLocationMarker();

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[') || match('(') || lookahead().type === Token.Template) {
            if (match('(')) {
                expr = {
                    type: Syntax.CallExpression,
                    callee: expr,
                    'arguments': parseArguments()
                };
                marker.end();
                marker.apply(expr);
            } else if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
                marker.end();
                marker.apply(expr);
            } else if (match('.')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
                marker.end();
                marker.apply(expr);
            } else {
                expr = {
                    type: Syntax.TaggedTemplateExpression,
                    tag: expr,
                    quasi: parseTemplateLiteral()
                };
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }

    function filterGroup(node) {
        var n, i, entry;

        n = (Object.prototype.toString.apply(node) === '[object Array]') ? [] : {};
        for (i in node) {
            if (node.hasOwnProperty(i) && i !== 'groupRange' && i !== 'groupLoc') {
                entry = node[i];
                if (entry === null || typeof entry !== 'object' || entry instanceof RegExp) {
                    n[i] = entry;
                } else {
                    n[i] = filterGroup(entry);
                }
            }
        }
        return n;
    }

    function wrapTrackingFunction(range, loc) {

        return function (parseFunction) {

            function isBinary(node) {
                return node.type === Syntax.LogicalExpression ||
                    node.type === Syntax.BinaryExpression;
            }

            function visit(node) {
                var start, end;

                if (isBinary(node.left)) {
                    visit(node.left);
                }
                if (isBinary(node.right)) {
                    visit(node.right);
                }

                if (range) {
                    if (node.left.groupRange || node.right.groupRange) {
                        start = node.left.groupRange ? node.left.groupRange[0] : node.left.range[0];
                        end = node.right.groupRange ? node.right.groupRange[1] : node.right.range[1];
                        node.range = [start, end];
                    } else if (typeof node.range === 'undefined') {
                        start = node.left.range[0];
                        end = node.right.range[1];
                        node.range = [start, end];
                    }
                }
                if (loc) {
                    if (node.left.groupLoc || node.right.groupLoc) {
                        start = node.left.groupLoc ? node.left.groupLoc.start : node.left.loc.start;
                        end = node.right.groupLoc ? node.right.groupLoc.end : node.right.loc.end;
                        node.loc = {
                            start: start,
                            end: end
                        };
                    } else if (typeof node.loc === 'undefined') {
                        node.loc = {
                            start: node.left.loc.start,
                            end: node.right.loc.end
                        };
                    }
                }
            }

            return function () {
                var marker, node;

                skipComment();

                marker = createLocationMarker();
                node = parseFunction.apply(null, arguments);
                marker.end();

                if (range && typeof node.range === 'undefined') {
                    marker.apply(node);
                }

                if (loc && typeof node.loc === 'undefined') {
                    marker.apply(node);
                }

                if (isBinary(node)) {
                    visit(node);
                }

                return node;
            };
        };
    }

    function patch() {

        var wrapTracking;

        if (extra.comments) {
            extra.skipComment = skipComment;
            skipComment = scanComment;
        }

        if (extra.raw) {
            extra.createLiteral = createLiteral;
            createLiteral = createRawLiteral;
        }

        if (extra.range || extra.loc) {

            extra.parseGroupExpression = parseGroupExpression;
            extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
            extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
            parseGroupExpression = trackGroupExpression;
            parseLeftHandSideExpression = trackLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;

            wrapTracking = wrapTrackingFunction(extra.range, extra.loc);

            extra.parseAdditiveExpression = parseAdditiveExpression;
            extra.parseAssignmentExpression = parseAssignmentExpression;
            extra.parseAtSymbol = parseAtSymbol;
            extra.parseBitwiseANDExpression = parseBitwiseANDExpression;
            extra.parseBitwiseORExpression = parseBitwiseORExpression;
            extra.parseBitwiseXORExpression = parseBitwiseXORExpression;
            extra.parseBlock = parseBlock;
            extra.parseFunctionSourceElements = parseFunctionSourceElements;
            extra.parseCatchClause = parseCatchClause;
            extra.parseComputedMember = parseComputedMember;
            extra.parseConditionalExpression = parseConditionalExpression;
            extra.parseConstLetDeclaration = parseConstLetDeclaration;
            extra.parseEqualityExpression = parseEqualityExpression;
            extra.parseExportDeclaration = parseExportDeclaration;
            extra.parseExportSpecifier = parseExportSpecifier;
            extra.parseExportSpecifierSetProperty = parseExportSpecifierSetProperty;
            extra.parseExpression = parseExpression;
            extra.parseForVariableDeclaration = parseForVariableDeclaration;
            extra.parseFunctionDeclaration = parseFunctionDeclaration;
            extra.parseFunctionExpression = parseFunctionExpression;
            extra.parseParam = parseParam;
            extra.parseGlob = parseGlob;
            extra.parseImportDeclaration = parseImportDeclaration;
            extra.parseImportSpecifier = parseImportSpecifier;
            extra.parseLogicalANDExpression = parseLogicalANDExpression;
            extra.parseLogicalORExpression = parseLogicalORExpression;
            extra.parseMultiplicativeExpression = parseMultiplicativeExpression;
            extra.parseModuleDeclaration = parseModuleDeclaration;
            extra.parseModuleBlock = parseModuleBlock;
            extra.parseNewExpression = parseNewExpression;
            extra.parseNonComputedProperty = parseNonComputedProperty;
            extra.parseObjectProperty = parseObjectProperty;
            extra.parseObjectPropertyKey = parseObjectPropertyKey;
            extra.parseParam = parseParam;
            extra.parsePath = parsePath;
            extra.parsePostfixExpression = parsePostfixExpression;
            extra.parsePrimaryExpression = parsePrimaryExpression;
            extra.parsePrivateStatement = parsePrivateStatement;
            extra.parseProgram = parseProgram;
            extra.parsePropertyFunction = parsePropertyFunction;
            extra.parseRelationalExpression = parseRelationalExpression;
            extra.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression;
            extra.parseSymbolStatement = parseSymbolStatement;
            extra.parseSymbolDeclarationList = parseSymbolDeclarationList;
            extra.parseSymbolDeclaration = parseSymbolDeclaration;
            extra.parseTemplateElement = parseTemplateElement;
            extra.parseTemplateLiteral = parseTemplateLiteral;
            extra.parseStatement = parseStatement;
            extra.parseShiftExpression = parseShiftExpression;
            extra.parseSwitchCase = parseSwitchCase;
            extra.parseUnaryExpression = parseUnaryExpression;
            extra.parseVariableDeclaration = parseVariableDeclaration;
            extra.parseVariableIdentifier = parseVariableIdentifier;
            extra.parseMethodDefinition = parseMethodDefinition;
            extra.parseClassDeclaration = parseClassDeclaration;
            extra.parseClassExpression = parseClassExpression;
            extra.parseClassBody = parseClassBody;

            parseAdditiveExpression = wrapTracking(extra.parseAdditiveExpression);
            parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
            parseAtSymbol = wrapTracking(extra.parseAtSymbol);
            parseBitwiseANDExpression = wrapTracking(extra.parseBitwiseANDExpression);
            parseBitwiseORExpression = wrapTracking(extra.parseBitwiseORExpression);
            parseBitwiseXORExpression = wrapTracking(extra.parseBitwiseXORExpression);
            parseBlock = wrapTracking(extra.parseBlock);
            parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
            parseCatchClause = wrapTracking(extra.parseCatchClause);
            parseComputedMember = wrapTracking(extra.parseComputedMember);
            parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
            parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
            parseExportDeclaration = wrapTracking(parseExportDeclaration);
            parseExportSpecifier = wrapTracking(parseExportSpecifier);
            parseExportSpecifierSetProperty = wrapTracking(parseExportSpecifierSetProperty);
            parseEqualityExpression = wrapTracking(extra.parseEqualityExpression);
            parseExpression = wrapTracking(extra.parseExpression);
            parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
            parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
            parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
            parseParam = wrapTracking(extra.parseParam);
            parseGlob = wrapTracking(extra.parseGlob);
            parseImportDeclaration = wrapTracking(extra.parseImportDeclaration);
            parseImportSpecifier = wrapTracking(extra.parseImportSpecifier);
            parseLogicalANDExpression = wrapTracking(extra.parseLogicalANDExpression);
            parseLogicalORExpression = wrapTracking(extra.parseLogicalORExpression);
            parseMultiplicativeExpression = wrapTracking(extra.parseMultiplicativeExpression);
            parseModuleDeclaration = wrapTracking(extra.parseModuleDeclaration);
            parseModuleBlock = wrapTracking(extra.parseModuleBlock);
            parseNewExpression = wrapTracking(extra.parseNewExpression);
            parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
            parseObjectProperty = wrapTracking(extra.parseObjectProperty);
            parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
            parseParam = wrapTracking(extra.parseParam);
            parsePath = wrapTracking(extra.parsePath);
            parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
            parsePrivateStatement = wrapTracking(extra.parsePrivateStatement);
            parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
            parseProgram = wrapTracking(extra.parseProgram);
            parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
            parseSymbolStatement = wrapTracking(extra.parseSymbolStatement);
            parseSymbolDeclarationList = wrapTracking(extra.parseSymbolDeclarationList);
            parseSymbolDeclaration = wrapTracking(extra.parseSymbolDeclaration);
            parseTemplateElement = wrapTracking(extra.parseTemplateElement);
            parseTemplateLiteral = wrapTracking(extra.parseTemplateLiteral);
            parseRelationalExpression = wrapTracking(extra.parseRelationalExpression);
            parseSpreadOrAssignmentExpression = wrapTracking(extra.parseSpreadOrAssignmentExpression);
            parseStatement = wrapTracking(extra.parseStatement);
            parseShiftExpression = wrapTracking(extra.parseShiftExpression);
            parseSwitchCase = wrapTracking(extra.parseSwitchCase);
            parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
            parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
            parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
            parseMethodDefinition = wrapTracking(extra.parseMethodDefinition);
            parseClassDeclaration = wrapTracking(extra.parseClassDeclaration);
            parseClassExpression = wrapTracking(extra.parseClassExpression);
            parseClassBody = wrapTracking(extra.parseClassBody);
        }

        if (typeof extra.tokens !== 'undefined') {
            extra.advance = advance;
            extra.scanRegExp = scanRegExp;

            advance = collectToken;
            scanRegExp = collectRegex;
        }
    }

    function unpatch() {
        if (typeof extra.skipComment === 'function') {
            skipComment = extra.skipComment;
        }

        if (extra.raw) {
            createLiteral = extra.createLiteral;
        }

        if (extra.range || extra.loc) {
            parseAdditiveExpression = extra.parseAdditiveExpression;
            parseAssignmentExpression = extra.parseAssignmentExpression;
            parseAtSymbol = extra.parseAtSymbol;
            parseBitwiseANDExpression = extra.parseBitwiseANDExpression;
            parseBitwiseORExpression = extra.parseBitwiseORExpression;
            parseBitwiseXORExpression = extra.parseBitwiseXORExpression;
            parseBlock = extra.parseBlock;
            parseFunctionSourceElements = extra.parseFunctionSourceElements;
            parseCatchClause = extra.parseCatchClause;
            parseComputedMember = extra.parseComputedMember;
            parseConditionalExpression = extra.parseConditionalExpression;
            parseConstLetDeclaration = extra.parseConstLetDeclaration;
            parseEqualityExpression = extra.parseEqualityExpression;
            parseExportDeclaration = extra.parseExportDeclaration;
            parseExportSpecifier = extra.parseExportSpecifier;
            parseExportSpecifierSetProperty = extra.parseExportSpecifierSetProperty;
            parseExpression = extra.parseExpression;
            parseForVariableDeclaration = extra.parseForVariableDeclaration;
            parseFunctionDeclaration = extra.parseFunctionDeclaration;
            parseFunctionExpression = extra.parseFunctionExpression;
            parseParam = extra.parseParam;
            parseGlob = extra.parseGlob;
            parseImportDeclaration = extra.parseImportDeclaration;
            parseImportSpecifier = extra.parseImportSpecifier;
            parseGroupExpression = extra.parseGroupExpression;
            parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
            parseLogicalANDExpression = extra.parseLogicalANDExpression;
            parseLogicalORExpression = extra.parseLogicalORExpression;
            parseMultiplicativeExpression = extra.parseMultiplicativeExpression;
            parseModuleDeclaration = extra.parseModuleDeclaration;
            parseModuleBlock = extra.parseModuleBlock;
            parseNewExpression = extra.parseNewExpression;
            parseNonComputedProperty = extra.parseNonComputedProperty;
            parseObjectProperty = extra.parseObjectProperty;
            parseObjectPropertyKey = extra.parseObjectPropertyKey;
            parsePath = extra.parsePath;
            parsePostfixExpression = extra.parsePostfixExpression;
            parsePrimaryExpression = extra.parsePrimaryExpression;
            parsePrivateStatement = extra.parsePrivateStatement;
            parseProgram = extra.parseProgram;
            parsePropertyFunction = extra.parsePropertyFunction;
            parseTemplateElement = extra.parseTemplateElement;
            parseTemplateLiteral = extra.parseTemplateLiteral;
            parseRelationalExpression = extra.parseRelationalExpression;
            parseSpreadOrAssignmentExpression = extra.parseSpreadOrAssignmentExpression;
            parseStatement = extra.parseStatement;
            parseShiftExpression = extra.parseShiftExpression;
            parseSymbolStatement = extra.parseSymbolStatement;
            parseSymbolDeclarationList = extra.parseSymbolDeclarationList;
            parseSymbolDeclaration = extra.parseSymbolDeclaration;
            parseSwitchCase = extra.parseSwitchCase;
            parseUnaryExpression = extra.parseUnaryExpression;
            parseVariableDeclaration = extra.parseVariableDeclaration;
            parseVariableIdentifier = extra.parseVariableIdentifier;
            parseMethodDefinition = extra.parseMethodDefinition;
            parseClassDeclaration = extra.parseClassDeclaration;
            parseClassExpression = extra.parseClassExpression;
            parseClassBody = extra.parseClassBody;
        }

        if (typeof extra.scanRegExp === 'function') {
            advance = extra.advance;
            scanRegExp = extra.scanRegExp;
        }
    }

    function stringToArray(str) {
        var length = str.length,
            result = [],
            i;
        for (i = 0; i < length; ++i) {
            result[i] = str.charAt(i);
        }
        return result;
    }

    function parse(code, options) {
        var program, toString;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        length = source.length;
        buffer = null;
        state = {
            allowIn: true,
            labelSet: {},
            parenthesizedCount: 0,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };

        extra = {};
        if (typeof options !== 'undefined') {
            extra.range = (typeof options.range === 'boolean') && options.range;
            extra.loc = (typeof options.loc === 'boolean') && options.loc;
            extra.raw = (typeof options.raw === 'boolean') && options.raw;
            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
        }

        if (length > 0) {
            if (typeof source[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code instanceof String) {
                    source = code.valueOf();
                }

                // Force accessing the characters via an array.
                if (typeof source[0] === 'undefined') {
                    source = stringToArray(code);
                }
            }
        }

        patch();
        try {
            program = parseProgram();
            if (typeof extra.comments !== 'undefined') {
                filterCommentLocation();
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                filterTokenLocation();
                program.tokens = extra.tokens;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
            if (extra.range || extra.loc) {
                program.body = filterGroup(program.body);
            }
        } catch (e) {
            throw e;
        } finally {
            unpatch();
            extra = {};
        }

        return program;
    }

    // Sync with package.json.
    exports.version = '1.1.0-dev-harmony';

    exports.parse = parse;

    // Deep copy.
    exports.Syntax = (function () {
        var name, types = {};

        if (typeof Object.create === 'function') {
            types = Object.create(null);
        }

        for (name in Syntax) {
            if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
            }
        }

        if (typeof Object.freeze === 'function') {
            Object.freeze(types);
        }

        return types;
    }());

}));
/* vim: set sw=4 ts=4 et tw=80 : */

return exports;
})({});

exports.functions = (function(exports){
  var _slice = [].slice,
      _concat = [].concat,
      _push = [].push;

  function toArray(o){
    var len = o.length;
    if (!len) return [];
    if (len === 1) return [o[0]];
    if (len === 2) return [o[0], o[1]];
    if (len === 3) return [o[0], o[1], o[2]];
    if (len > 9)   return _slice.call(o);
    if (len === 4) return [o[0], o[1], o[2], o[3]];
    if (len === 5) return [o[0], o[1], o[2], o[3], o[4]];
    if (len === 6) return [o[0], o[1], o[2], o[3], o[4], o[5]];
    if (len === 7) return [o[0], o[1], o[2], o[3], o[4], o[5], o[6]];
    if (len === 8) return [o[0], o[1], o[2], o[3], o[4], o[5], o[6], o[7]];
    if (len === 9) return [o[0], o[1], o[2], o[3], o[4], o[5], o[6], o[7], o[8]];
  }
  exports.toArray = toArray;

  function slice(o, start, end){
    if (!o.length) {
      return [];
    } else if (!end && !start) {
      return toArray(o);
    } else {
      return _slice.call(o, start, end);
    }
  }
  exports.slice = slice;


  var _call, _apply, _bind;

  if (typeof Function.prototype.bind === 'function' && !('prototype' in Function.prototype.bind)) {
    _bind = Function.prototype.bind;
    _call = Function.prototype.call;
    _apply = Function.prototype.apply;
  } else {
    void function(){
      function bind(receiver){
        if (typeof this !== 'function') {
          throw new TypeError("Function.prototype.bind called on non-callable");
        }

        var args = toArray(arguments),
            params = '',
            F = this;

        for (var i=1; i < args.length; i++) {
          if (i > 1) params += ',';
          params += '$['+i+']';
        }

        var bound = function(){
          if (this instanceof bound) {
            var p = params;
            for (var i=0; i < arguments.length; i++) {
              p += ',_['+i+']';
            }
            return new Function('F,$,_', 'return new F('+p+')')(F, args, arguments);
          } else {
            var a = toArray(args);
            for (var i=0; i < arguments.length; i++) {
              a[a.length] = arguments[i];
            }
            return _call.apply(F, a);
          }
        };

        return bound;
      }

      var iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = 'javascript:';
      _call = iframe.contentWindow.Function.prototype.call;
      _apply = _call.apply;
      _bind = bind;
      iframe = null;
    }();
  }

  var __ = partial.__ = {};

  function partial(f){
    var argv = [],
        argc = 0,
        holes = 0;

    for (var i=1; i < arguments.length; i++) {
      if (arguments[i] === __) {
        holes++;
      }
      argv[argc++] = arguments[i];
    }

    if (holes) {
      return function(){
        var extra = arguments.length > holes ? arguments.length - holes : 0,
            args = [],
            j = 0;

        for (var i=0; i < argc; i++) {
          args[i] = argv[i] === __ ? arguments[j++] : argv[i];
        }

        while (extra--) {
          args[i++] = arguments[j++];
        }

        return f.apply(this, args);
      };
    } else if (argc) {
      return function(){
        return f.apply(this, _concat.apply(argv, arguments));
      };
    } else {
      return function(){
        return f.apply(this, arguments);
      };
    }
  }
  exports.partial = partial;


  function bind(f, receiver){
    var argv = [],
        argc = 0;

    for (var i=2; i < arguments.length; i++) {
      argv[argc++] = arguments[i];
    }

    if (argc) {
      return function(){
        return f.apply(receiver, _concat.apply(argv, arguments));
      };
    } else {
      return function(){
        return f.apply(receiver, arguments);
      };
    }
  }
  exports.bind = bind;


  var bindbind  = exports.bindbind  = bind(_bind, _bind),
      callbind  = exports.callbind  = partial(bind, _call),
      applybind = exports.applybind = partial(bind, _apply),
      bindapply = exports.bindapply = applybind(_bind),
      call      = exports.call      = callbind(_call),
      apply     = exports.apply     = callbind(_apply);

  var nil = [null];

  exports.applyNew = function applyNew(Ctor, args){
    return new (bindapply(Ctor, nil.concat(args)));
  }

  exports.pushable = bindbind([].push);

  var hasOwn   = callbind({}.hasOwnProperty),
      toSource = callbind(function(){}.toString);

  var hidden = { configurable: true,
                 enumerable: false,
                 writable: true,
                 value: undefined }

  var defineProperty = Object.getOwnPropertyNames && !('prototype' in Object.getOwnPropertyNames)
                       ? Object.defineProperty
                       : function defineProperty(o, k, d){ o[k] = d.value };

  exports.fname = (function(){
    if (Function.name === 'Function') {
      return function fname(f){
        return f ? f.name || '' : '';
      };
    }
    return function fname(f){
      if (typeof f !== 'function') {
        return '';
      }

      if (!hasOwn(f, 'name')) {
        var match = toSource(f).match(/^\n?function\s?(\w*)?_?\(/);
        if (match) {
          hidden.value = match[1];
          defineProperty(f, 'name', hidden);
        }
      }

      return f.name || '';
    };
  })();

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});



exports.objects = (function(exports){
  var functions = require('./functions'),
      callbind  = functions.callbind,
      bind      = functions.bind,
      fname     = functions.fname;

  var toBrand = callbind({}.toString),
      hasOwn = callbind({}.hasOwnProperty);

  exports.hasOwn = hasOwn;

  var hasDunderProto = { __proto__: [] } instanceof Array,
      isES5 = !(!Object.getOwnPropertyNames || 'prototype' in Object.getOwnPropertyNames);

  var hidden = {
    configurable: true,
    enumerable: false,
    writable: true,
    value: undefined
  };


  function getBrandOf(o){
    if (o === null) {
      return 'Null';
    } else if (o === undefined) {
      return 'Undefined';
    } else {
      return toBrand(o).slice(8, -1);
    }
  }
  exports.getBrandOf = getBrandOf;

  function ensureObject(name, o){
    if (typeof o === 'object' ? o === null : typeof o !== 'function') {
      throw new TypeError(name + ' called with non-object ' + getBrandOf(o));
    }
  }

  function isObject(v){
    var type = typeof v;
    return type === 'object' ? v !== null : type === 'function';
  }
  exports.isObject = isObject;



  if (isES5) {
    var create = exports.create = Object.create;
  } else {
    var Null = function(){};
    var hiddens = ['constructor', 'hasOwnProperty', 'propertyIsEnumerable',
                   'isPrototypeOf', 'toLocaleString', 'toString', 'valueOf'];

    var create = exports.create = (function(F){
      var iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = 'javascript:';
      Null.prototype = iframe.contentWindow.Object.prototype;
      document.body.removeChild(iframe);

      while (hiddens.length) {
        delete Null.prototype[hiddens.pop()];
      }

      return function create(object){
        if (object === null) {
          return new Null;
        } else {
          F.prototype = object;
          object = new F;
          F.prototype = null;
          return object;
        }
      };
    })(function(){});
  }

  var ownKeys = exports.keys = (function(){
    if (isES5) return Object.keys;
    return function keys(o){
      var out = [], i=0;
      for (var k in o) {
        if (hasOwn(o, k)) {
          out[i++] = k;
        }
      }
      return out;
    };
  })();

  var getPrototypeOf = exports.getPrototypeOf = (function(){
    if (isES5) {
      return Object.getPrototypeOf;
    } else if (hasDunderProto) {
      return function getPrototypeOf(o){
        ensureObject('getPrototypeOf', o);
        return o.__proto__;
      };
    } else {
      return function getPrototypeOf(o){
        ensureObject('getPrototypeOf', o);

        var ctor = o.constructor;

        if (typeof ctor === 'function') {
          var proto = ctor.prototype;
          if (o !== proto) {
            return proto;
          } else if (ctor._super) {
            return ctor._super.prototype;
          } else {
            delete o.constructor;
            var _super = ctor._super = o.constructor;
            o.constructor = ctor;
            if (_super) {
              return _super.prototype;
            } else if (o instanceof Object) {
              return Object.prototype;
            } else {
              return null;
            }
          }
        } else if (o instanceof Null) {
          return null;
        } else if (o instanceof Object) {
          return Object.prototype;
        }
      };
    }
  })();

  var defineProperty = exports.defineProperty = (function(){
    if (isES5) return Object.defineProperty;
    return function defineProperty(o, k, desc){
      try { o[k] = desc.value } catch (e) {}
      return o;
    };
  })();


  var describeProperty = exports.describeProperty = (function(){
    if (isES5) return Object.getOwnPropertyDescriptor;
    return function getOwnPropertyDescriptor(o, k){
      ensureObject('getOwnPropertyDescriptor', o);
      if (hasOwn(o, k)) {
        return { value: o[k] };
      }
    };
  })();

  var ownProperties = exports.properties = isES5 ? Object.getOwnPropertyNames : ownKeys;

  if (isES5) {
    exports.isExtensible = Object.isExtensible;
  } else {
    exports.isExtensible = function isExtensible(){ return true };
  }

  function enumerate(o){
    var out = [], i = 0;
    for (out[i++] in o);
    return out;
  }
  exports.enumerate = enumerate;


  function copy(o){
    return assign(create(getPrototypeOf(o)), o);
  }
  exports.copy = copy;


  function define(o, p, v){
    switch (typeof p) {
      case 'function':
        v = p;
        p = fname(v);
      case 'string':
        hidden.value = v;
        defineProperty(o, p, hidden);
        break;
      case 'object':
        if (p instanceof Array) {
          for (var i=0; i < p.length; i++) {
            var f = p[i];
            if (typeof f === 'function') {
              var name = fname(f);
            } else if (typeof f === 'string' && typeof p[i+1] !== 'function' || !fname(p[i+1])) {
              var name = f;
              f = p[i+1];
            }
            if (name) {
              hidden.value = f;
              defineProperty(o, name, hidden);
            }
          }
        } else if (p) {
          var keys = ownKeys(p)

          for (var i=0; i < keys.length; i++) {
            var desc = describeProperty(p, keys[i]);
            if (desc) {
              desc.enumerable = 'get' in desc;
              defineProperty(o, keys[i], desc);
            }
          }
        }
    }

    hidden.value = undefined;
    return o;
  }
  exports.define = define;



  function safeDefine(o, p, v){
    try {
      switch (typeof p) {
        case 'function':
          v = p;
          p = fname(v);
        case 'string':
          hidden.value = v;
          defineProperty(o, p, hidden);
          break;
        case 'object':
          if (p instanceof Array) {
            for (var i=0; i < p.length; i++) {
              var f = p[i];
              if (typeof f === 'function') {
                var name = fname(f);
              } else if (typeof f === 'string' && typeof p[i+1] !== 'function' || !fname(p[i+1])) {
                var name = f;
                f = p[i+1];
              }
              if (name) {
                hidden.value = f;
                try {
                  defineProperty(o, name, hidden);
                } catch (e) {}
              }
            }
          } else if (p) {
            var keys = ownKeys(p)

            for (var i=0; i < keys.length; i++) {
              try {
                var desc = describeProperty(p, keys[i]);
                if (desc) {
                  desc.enumerable = 'get' in desc;
                  defineProperty(o, keys[i], desc);
                }
              } catch (e) {}
            }
          }
      }
    } catch (e) {}

    hidden.value = undefined;
    return o;
  }
  exports.safeDefine = safeDefine;



  function assign(o, p, v){
    switch (typeof p) {
      case 'function':
        o[fname(p)] = p;
        break;
      case 'string':
        o[p] = v;
        break;
      case 'object':
        if (p instanceof Array) {
          for (var i=0; i < p.length; i++) {
            var f = p[i];
            if (typeof f === 'function' && fname(f)) {
              var name = fname(f);
            } else if (typeof f === 'string' && typeof p[i+1] !== 'function' || !fname(p[i+1])) {
              var name = f;
              f = p[i+1];
            }
            if (name) {
              o[name] = f;
            }
          }
        } else if (p) {
          var keys = ownKeys(p)

          for (var i=0; i < keys.length; i++) {
            var k = keys[i];
            o[k] = p[k];
          }
        }
    }
    return o;
  }
  exports.assign = assign;

  exports.assignAll = function assignAll(o, array){
    for (var i=0; i < array.length; i++) {
      assign(o, array[i]);
    }
    return o;
  }

  var nonEnumerable = { enumerable: false };

  var hide = exports.hide = (function(){
    if (isES5) {
      return function hide(o, k){
        defineProperty(o, k, nonEnumerable);
      };
    }
    return function hide(){};
  })();

  function inherit(Ctor, Super, properties, methods){
    define(Ctor, 'inherits', Super);
    Ctor.prototype = create(Super.prototype);
    define(Ctor.prototype, 'constructor', Ctor);
    properties && define(Ctor.prototype, properties);
    methods    && define(Ctor.prototype, methods);
    return Ctor;
  }
  exports.inherit = inherit;

  function Hash(){}
  Hash.prototype = create(null);
  exports.Hash = Hash;

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});


exports.iteration = (function(exports){
  var objects   = require('./objects'),
      functions = require('./functions');

  var define   = objects.define,
      ownKeys  = objects.keys,
      isObject = objects.isObject,
      call     = functions.call,
      apply    = functions.apply;


  var StopIteration = exports.StopIteration = global.StopIteration || {};

  function Iterator(){}

  define(Iterator.prototype, [
    function __iterator__(){
      return this;
    }
  ]);

  exports.Iterator = Iterator;

  function Item(key, value){
    this[0] = key;
    this[1] = value;
  }

  exports.Item = Item;
  define(Item.prototype, {
    isItem: true,
    length: 2
  }, [
    function toString(){
      return this[0] + '';
    },
    function valueOf(){
      return this[1];
    }
  ]);

  function createItem(key, value){
    return new Item(key, value);
  }

  exports.createItem = createItem;


  function iterate(o, callback, context){
    if (o == null) return;
    var type = typeof o;
    context = context || o;
    if (type === 'number' || type === 'boolean') {
      callback.call(context, new Item(0, o));
    } else {
      o = Object(o);
      var iterator = o.__iterator__ || o.iterator;

      if (typeof iterator === 'function') {
        var iter = iterator.call(o);
        if (iter && typeof iter.next === 'function') {
          try {
            while (1) callback.call(context, iter.next());
          } catch (e) {
            if (e === StopIteration) return;
            throw e;
          }
        }
      }

      if (type !== 'function' && o.length) {
        try {
          for (var i=0; i < o.length; i++) {
            callback.call(context, new Item(i, o[i]));
          }
        } catch (e) {
          if (e === StopIteration) return;
          throw e;
        }
      } else {
        var keys = ownKeys(o);
        try {
          for (var i=0; i < keys.length; i++) {
            var key = keys[i];
            callback.call(context, new Item(key, o[key]));
          }
        } catch (e) {
          if (e === StopIteration) return;
          throw e;
        }
      }
    }
  }
  exports.iterate = iterate;


  function each(o, callback, context){
    if (!o) return;
    if (context === undefined) {
      if (typeof o === 'object' && 'length' in o) {
        for (var i=0; i < o.length; i++) {
          callback(o[i], i, o);
        }
      } else if (isObject(o)) {
        var keys = ownKeys(o);
        for (var i=0; i < keys.length; i++) {
          var key = keys[i];
          callback(o[key], key, o);
        }
      }
    } else {
      if (typeof o === 'object' && 'length' in o) {
        for (var i=0; i < o.length; i++) {
          callback.call(context, o[i], i, o);
        }
      } else if (isObject(o)) {
        var keys = ownKeys(o);
        for (var i=0; i < keys.length; i++) {
          var key = keys[i];
          callback.call(context, o[key], key, o);
        }
      }
    }
  }
  exports.each = each;


  function map(o, callback, context){
    if (context === undefined) {
      if (typeof o === 'object' && 'length' in o) {
        var out = new Array(o.length);

        for (var i=0; i < o.length; i++) {
          out[i] = callback(o[i], i, o);
        }
      } else if (isObject(o)) {
        var out = ownKeys(o);

        for (var i=0; i < out.length; i++) {
          var key = out[i];
          out[i] = callback(o[key], key, o);
        }
      }
    } else {
      if (typeof o === 'object' && 'length' in o) {
        var out = new Array(o.length);

        for (var i=0; i < o.length; i++) {
          out[i] = callback.call(context, o[i], i, o);
        }
      } else if (isObject(o)) {
        var out = ownKeys(o);

        for (var i=0; i < out.length; i++) {
          var key = out[i];
          out[i] = callback.call(context, o[key], key, o);
        }
      }
    }

    return out;
  }
  exports.map = map;


  function fold(o, initial, callback){
    if (callback) {
      var val = initial, i = 0;
    } else {
      if (typeof initial === 'string') {
        callback = fold[initial];
      } else {
        callback = initial;
      }

      var val = o[0], i = 1;
    }
    for (; i < o.length; i++) {
      val = callback(val, o[i], i, o);
    }
    return val;
  }
  exports.fold = fold;

  fold['+'] = function(a, b){ return a + b };
  fold['*'] = function(a, b){ return a - b };
  fold['-'] = function(a, b){ return a * b };
  fold['/'] = function(a, b){ return a / b };


  function repeat(n, args, callback){
    if (typeof args === 'function') {
      callback = args;
      for (var i=0; i < n; i++) {
        callback();
      }
    } else {
      for (var i=0; i < n; i++) {
        callback.apply(this, args);
      }
    }
  }
  exports.repeat = repeat;


  function generate(n, callback){
    var out = new Array(n);
    for (var i=0; i < n; i++) {
      out[i] = callback(i, n, out);
    }
    return out;
  }
  exports.generate = generate;


  return exports;
})(typeof module !== 'undefined' ? module.exports : {});



exports.utility = (function(exports){
  var objects   = require('./objects'),
      functions = require('./functions');

  var Hash      = objects.Hash,
      applybind = functions.applybind;

  var seed = Math.random().toString(36).slice(2),
      count = (Math.random() * (1 << 30)) | 0;

  exports.uid = function uid(){
    return seed + count++;
  }

  exports.pushAll = applybind([].push, []);

  exports.nextTick = typeof process !== 'undefined'
                    ? process.nextTick
                    : function nextTick(f){ setTimeout(f, 1) };


  exports.numbers = (function(cache){
    return function numbers(start, end){
      if (!isFinite(end)) {
        end = start;
        start = 0;
      }
      var length = end - start,
          curr;

      if (end > cache.length) {
        while (length--)
          cache[curr = length + start] = '' + curr;
      }
      return cache.slice(start, end);
    };
  })([]);


  function quotes(s) {
    s = (''+s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
    var singles = 0,
        doubles = 0,
        i = s.length;

    while (i--) {
      if (s[i] === '"') {
        doubles++;
      } else if (s[i] === "'") {
        singles++;
      }
    }

    if (singles > doubles) {
      return '"' + s.replace(/"/g, '\\"') + '"';
    } else {
      return "'" + s.replace(/'/g, "\\'") + "'";
    }
  }
  exports.quotes = quotes;


  function unique(strings){
    var seen = new Hash,
        out = [];

    for (var i=0; i < strings.length; i++) {
      if (!(strings[i] in seen)) {
        seen[strings[i]] = true;
        out.push(strings[i]);
      }
    }

    return out;
  }
  exports.unique = unique;


  var MAX_INTEGER = 9007199254740992;

  function toInteger(v){
    if (v === Infinity) {
      return MAX_INTEGER;
    } else if (v === -Infinity) {
      return -MAX_INTEGER;
    } else {
      return v - 0 >> 0;
    }
  }
  exports.toInteger = toInteger;


  function isNaN(number){
    return number !== number;
  }
  exports.isNaN = isNaN;


  function isFinite(number){
    return typeof value === 'number'
               && value === value
               && value < Infinity
               && value > -Infinity;
  }
  exports.isFinite = isFinite;


  function isInteger(value) {
    return typeof value === 'number'
               && value === value
               && value > -MAX_INTEGER
               && value < MAX_INTEGER
               && value >> 0 === value;
  }
  exports.isInteger = isInteger;

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});


exports.Queue = (function(module){
  var objects   = require('./objects'),
      functions = require('./functions'),
      iteration = require('./iteration');

  var isObject      = objects.isObject,
      define        = objects.define,
      inherit       = objects.inherit,
      toArray       = functions.toArray,
      pushable      = functions.pushable,
      iterate       = iteration.iterate,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


  function QueueIterator(queue){
    this.queue = queue;
    this.index = queue.index;
  }

  inherit(QueueIterator, Iterator, [
    function next(){
      if (this.index === this.queue.items.length) {
        throw StopIteration;
      }
      return this.queue.items[this.index++];
    }
  ]);

  function Queue(iterable){
    this.index = this.length = 0;
    if (iterable != null) {
      if (iterable instanceof Queue) {
        this.items = iterable.items.slice(iterable.front);
        this.length = this.items.length;
      } else {
        this.items = [];
        iterate(iterable, this.push, this);
      }
    } else {
      this.items = [];
    }
  }

  define(Queue.prototype, [
    function push(item){
      this.items.push(item);
      this.length++;
      return this;
    },
    function shift(){
      if (this.length) {
        var item = this.items[this.index];
        this.items[this.index++] = null;
        this.length--;
        if (this.index === 500) {
          this.items = this.items.slice(this.index);
          this.index = 0;
        }
        return item;
      }
    },
    function empty(){
      this.length = 0;
      this.index = 0;
      this.items = [];
      return this;
    },
    function front(){
      return this.items[this.index];
    },
    function item(depth){
      return this.items[this.index + depth];
    },
    function __iterator__(){
      return new QueueIterator(this);
    }
  ]);

  return module.exports = Queue;
})(typeof module !== 'undefined' ? module : {});


exports.traversal = (function(exports){
  var objects   = require('./objects'),
      functions = require('./functions'),
      utility   = require('./utility'),
      iteration = require('./iteration'),
      Queue     = require('./Queue'),
      Stack     = require('./Stack');

  var isObject       = objects.isObject,
      hasOwn         = objects.hasOwn,
      create         = objects.create,
      define         = objects.define,
      ownKeys        = objects.keys,
      ownProperties  = objects.properties,
      getPrototypeOf = objects.getPrototypeOf,
      Hash           = objects.Hash,
      each           = iteration.each,
      iterate        = iteration.iterate,
      Item           = iteration.Item,
      StopIteration  = iteration.StopIteration,
      uid            = utility.uid,
      toArray        = functions.toArray,
      fname          = functions.fname;



  function clone(o, hidden){
    function recurse(from, to, key){
      try {
        var val = from[key];
        if (!isObject(val)) {
          return to[key] = val;
        }
        if (from[key] === val) {
          if (hasOwn(from[key], tag)) {
            return to[key] = from[key][tag];
          }
          to[key] = enqueue(from[key]);
        }
      } catch (e) {}
    }

    function enqueue(o){
      var out = o instanceof Array ? [] : create(getPrototypeOf(o));
      tagged.push(o);
      each(list(o), function(item){
        queue.push([o, out, item]);
      });
      o[tag] = out;
      return out;
    }

    var queue = new Queue,
        tag = uid(),
        tagged = [],
        list = hidden ? ownProperties : ownKeys,
        out = enqueue(o);

    while (queue.length) {
      recurse.apply(this, queue.shift());
    }

    each(tagged, function(item){
      delete item[tag];
    });

    return out;
  }
  exports.clone = clone;

  function walk(root, callback){
    var queue = new Queue([[root]]),
        branded = [],
        tag = uid();

    while (queue.length) {
      recurse(queue.shift());
    }

    each(branded, function(item){
      delete item[tag];
    });

    function recurse(node){
      each(node, function(item, key){
        if (isObject(item) && !hasOwn(item, tag)) {
          item[tag] = true;
          branded.push(item);
          var result = callback(item, node);
          if (result === walk.RECURSE) {
            queue.push(item);
          } else if (result === walk.BREAK) {
            queue.empty();
            throw StopIteration;
          }
        }
      });
    }
  }
  exports.walk = walk;

  var BREAK    = walk.BREAK    = 0,
      CONTINUE = walk.CONTINUE = 1,
      RECURSE  = walk.RECURSE  = 2;

  exports.collector = (function(){
    function path(){
      var parts = toArray(arguments);

      for (var i=0; i < parts.length; i++) {

        if (typeof parts[i] === 'function') {
          return function(o){
            for (var i=0; i < parts.length; i++) {
              var part = parts[i],
                  type = typeof part;

              if (type === 'string') {
                o = o[part];
              } else if (type === 'function') {
                o = part(o);
              }
            }
            return o;
          };
        }
      }

      return function(o){
        for (var i=0; i < parts.length; i++) {
          o = o[parts[i]];
        }
        return o;
      };
    }


    function collector(o){
      var handlers = new Hash;
      for (var k in o) {
        if (o[k] instanceof Array) {
          handlers[k] = path(o[k]);
        } else if (typeof o[k] === 'function') {
          handlers[k] = o[k];
        } else {
          handlers[k] = o[k];
        }
      }

      return function(node){
        var items  = [];

        function walker(node, parent){
          if (!node) return CONTINUE;

          if (node instanceof Array) {
            return RECURSE;
          }

          var handler = handlers[node.type];

          if (handler === true) {
            items.push(node);
          } else if (handler === RECURSE || handler === CONTINUE) {
            return handler;
          } else if (typeof handler === 'string') {
            if (node[handler]) {
              walk(node[handler], walker);
            }
          } else if (typeof handler === 'function') {
            var item = handler(node);
            if (item !== undefined) {
              items.push(item);
            }
          }
          return CONTINUE;
        }

        walk(node, walker);

        return items;
      };
    }

    return collector;
  })();


  function walk(root, callback){
    var queue = new Queue([[root]]),
        branded = [],
        tag = uid();

    try {
      while (queue.length) {
        recurse(queue.shift());
      }
    } catch (e) {
      if (e !== StopIteration) throw e;
    }

    each(branded, function(item){
      delete item[tag];
    });

    function recurse(node){
      each(node, function(item, key){
        if (isObject(item) && !hasOwn(item, tag)) {
          item[tag] = true;
          branded.push(item);
          var result = callback(item, node);
          if (result === walk.RECURSE) {
            queue.push(item);
          } else if (result === walk.BREAK) {
            queue.empty();
            throw StopIteration;
          }
        }
      });
    }
  }

  var Visitor = exports.Visitor = (function(){
    function VisitorHandlers(handlers){
      var self = this;
      if (handlers instanceof Array) {
        each(handlers, function(handler){
          self[fname(handler)] = handler;
        });
      } else if (isObject(handlers)) {
        each(handlers, function(handler, name){
          self[name] = handler;
        });
      }
    }

    VisitorHandlers.prototype = create(null);

    function VisitorState(handlers, root){
      var stack = this.stack = new Stack([[root]]);
      this.handlers = handlers;
      this.branded = [];
      this.tag = uid();
      this.context = {
        push: function push(node){
          stack.push(node);
        }
      };
    }

    define(VisitorState.prototype, [
      function cleanup(){
        each(this.branded, function(item){
          delete item[this.tag];
        }, this);
        this.branded = [];
        this.tag = uid();
      },
      function next(node){
        if (node instanceof Item) {
          node = node[1];
        }
        if (isObject(node) && !hasOwn(node, this.tag)) {
          define(node, this.tag, true);
          this.branded.push(node);

          if (node instanceof Array) {
            each(node.slice().reverse(), this.context.push);
          } else if (node.type) {
            if (node.type in this.handlers) {
              var result = this.handlers[node.type].call(this.context, node);
            } else if (this.handlers.__noSuchHandler__) {
              var result = this.handlers.__noSuchHandler__.call(this.context, node);
            }

            if (result == BREAK) {
              throw StopIteration;
            } else if (result === RECURSE) {
              var temp = [];
              iterate(node, temp.push, temp);
              each(temp.reverse(), this.context.push);
            }
          }
        }
      }
    ]);


    function Visitor(handlers){
      if (handlers instanceof VisitorHandlers) {
        this.handlers = handlers;
      } else {
        this.handlers = new VisitorHandlers(handlers);
      }
    }


    define(Visitor.prototype, [
      function visit(root){
        if (root instanceof VisitorState) {
          var visitor = root;
        } else {
          var visitor = new VisitorState(this.handlers, root);
        }

        try {
          while (visitor.stack.length) {
            visitor.next(visitor.stack.pop());
          }
          visitor.cleanup();
        } catch (e) {
          if (e !== StopIteration) throw e;
          var self = this;
          var _resume = function(){
            _resume = function(){};
            return self.visit(visitor);
          }
          return function resume(){ return _resume() };
        }
      }
    ]);


    return Visitor;
  })();


  function createVisitor(handlers){
    return new Visitor(handlers);
  }
  exports.createVisitor = createVisitor;


  function visit(node, handlers){
    return new Visitor(handlers).visit(node);
  }
  exports.visit = visit;


  return exports;
})(typeof module !== 'undefined' ? module.exports : {});



exports.Emitter = (function(module){
  var objects   = require('./objects'),
      iteration = require('./iteration');

  var define   = objects.define,
      Hash     = objects.Hash,
      each     = iteration.each;

 function Emitter(){
    '_events' in this || define(this, '_events', new Hash);
  }

  define(Emitter.prototype, [
    function on(type, handler){
      var events = this._events;
      each(type.split(/\s+/), function(event){
        if (!(event in events)) {
          events[event] = [];
        }
        events[event].push(handler);
      });
    },
    function off(type, handler){
      var events = this._events;
      each(type.split(/\s+/), function(event){
        if (event in events) {
          var index = '__index' in handler ? handler.__index : events[event].indexOf(handler);
          if (~index) {
            events[event].splice(index, 1);
          }
        }
      });
    },
    function once(type, handler){
      function one(val){
        this.off(type, one);
        handler.call(this, val);
      }
      this.on(type, one);
    },
    function emit(type, val){
      var handlers = this._events['*'];

      if (handlers) {;
        for (var i=0; i < handlers.length; i++) {
          handlers[i].call(this, type, val);
        }
      }

      handlers = this._events[type];
      if (handlers) {
        for (var i=0; i < handlers.length; i++) {
          handlers[i].call(this, val);
        }
      }
    }
  ]);

  return module.exports = Emitter;
})(typeof module !== 'undefined' ? module : {});


exports.Stack = (function(module){
  var objects   = require('./objects'),
      functions = require('./functions'),
      iteration = require('./iteration');

  var define        = objects.define,
      inherit       = objects.inherit,
      toArray       = functions.toArray,
      iterate       = iteration.iterate,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


  function StackIterator(stack){
    this.stack = stack;
    this.index = stack.length;
  }

  inherit(StackIterator, Iterator, [
    function next(){
      if (!this.index) {
        throw StopIteration;
      }
      return this.stack[--this.index];
    }
  ]);

  function Stack(iterable){
    this.empty();
    if (iterable != null) {
      iterate(iterable, this.push, this);
    }
  }

  define(Stack.prototype, [
    function push(item){
      this.items.push(item);
      this.length++;
      this.top = item;
      return this;
    },
    function pop(){
      this.length--;
      this.top = this.items[this.length - 1];
      return this.items.pop();
    },
    function empty(){
      this.length = 0;
      this.items = [];
      this.top = undefined;
    },
    function first(callback, context){
      var i = this.length;
      context || (context = this);
      while (i--)
        if (callback.call(context, this[i], i, this))
          return this[i];
    },
    function filter(callback, context){
      var i = this.length,
          out = new Stack;

      context || (context = this);

      for (var i=0; i < this.length; i++) {
        if (callback.call(context, this[i], i, this)) {
          out.push(this[i]);
        }
      }

      return out;
    },
    function __iterator__(){
      return new StackIterator(this);
    }
  ]);

  return module.exports = Stack;
})(typeof module !== 'undefined' ? module : {});


exports.LinkedList = (function(module){
  var objects   = require('../lib/objects'),
      iteration = require('../lib/iteration');

  var define        = objects.define,
      inherit       = objects.inherit,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


  function LinkedListIterator(list){
    this.item = list.sentinel;
    this.sentinel = list.sentinel;
  }

  inherit(LinkedListIterator, Iterator, [
    function next(){
      this.item = this.item.next;
      if (this.item === this.sentinel) {
        throw StopIteration;
      }
      return this.item.data;
    }
  ]);


  function Item(data){
    this.data = data;
  }

  define(Item.prototype, [
    function link(item){
      item.next = this;
      return item;
    },
    function unlink(){
      var next = this.next;
      this.next = next.next;
      next.next = null;
      return this;
    },
    function clear(){
      var data = this.data;
      this.data = undefined;
      this.next = null;
      return data;
    }
  ]);

  function Sentinel(){
    this.next = null;
  }

  inherit(Sentinel, Item, [
    function unlink(){
      return this;
    },
    function clear(){}
  ]);

  function find(list, value){
    if (list.lastFind && list.lastFind.next.data === value) {
      return list.lastFind;
    }

    var item = list.tail,
        i = 0;

    while ((item = item.next) !== list.sentinel) {
      if (item.next.data === value) {
        return list.lastFind = item;
      }
    }
  }

  function LinkedList(){
    var sentinel = new Sentinel;
    this.size = 0;
    define(this, {
      sentinel: sentinel,
      tail: sentinel,
      lastFind: null
    });
  }

  define(LinkedList.prototype, [
    function push(value){
      this.tail = this.tail.link(new Item(value));
      return ++this.size;
    },
    function pop() {
      var tail = this.tail,
          data = tail.data;
      this.tail = tail.next;
      tail.next = null;
      tail.data = undefined;
      return data;
    },
    function insert(value, before){
      var item = find(this, before);
      if (item) {
        var inserted = new Item(value);
        inserted.next = item.next;
        item.next = inserted;
        return ++this.size;
      }
      return false;
    },
    function remove(value){
      var item = find(this, value);
      if (item) {
        item.unlink();
        return --this.size;
      }
      return false;
    },
    function replace(value, replacement){
      var item = find(this, value);
      if (item) {
        var replacer = new Item(replacement);
        replacer.next = item.next.next;
        item.next.next = null;
        item.next = replacer;
        return true;
      }
      return false;
    },
    function has(value) {
      return !!find(this, value);
    },
    function items(){
      var item = this.tail,
          array = [];

      while (item !== this.sentinel) {
        array.push(item.data);
        item = item.next;
      }

      return array;
    },
    function clear(){
      var next,
          item = this.tail;

      while (item !== this.sentinel) {
        next = item.next;
        item.clear();
        item = next;
      }

      this.tail = this.sentinel;
      this.size = 0;
      return this;
    },
    function clone(){
      var items = this.items(),
          list = new LinkedList,
          i = items.length;

      while (i--) {
        list.push(items[i]);
      }
      return list;
    },
    function __iterator__(){
      return new LinkedListIterator(this);
    }
  ]);

  return module.exports = LinkedList;
})(typeof module !== 'undefined' ? module : {});


exports.DoublyLinkedList = (function(module){
  var objects   = require('../lib/objects'),
      iteration = require('../lib/iteration');

  var define        = objects.define,
      inherit       = objects.inherit,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;

  function DoublyLinkedListIterator(list){
    this.item = list.sentinel;
    this.sentinel = list.sentinel;
  }

  inherit(DoublyLinkedListIterator, Iterator, [
    function next(){
      this.item = this.item.next;
      if (this.item === this.sentinel) {
        throw StopIteration;
      }
      return this.item.data;
    }
  ]);


  function Item(data, prev){
    this.data = data;
    this.after(prev);
  }

  define(Item.prototype, [
    function after(item){
      this.relink(item);
      return this;
    },
    function before(item){
      this.prev.relink(item);
      return this;
    },
    function relink(prev){
      if (this.next) {
        this.next.prev = this.prev;
        this.prev.next = this.next;
      }
      this.prev = prev;
      this.next = prev.next;
      prev.next.prev = this;
      prev.next = this;
      return this;
    },
    function unlink(){
      if (this.next) {
        this.next.prev = this.prev;
      }
      if (this.prev) {
        this.prev.next = this.next;
      }
      this.prev = this.next = null;
      return this;
    },
    function clear(){
      var data = this.data;
      this.next = this.prev = this.data = null;
      return data;
    }
  ]);

  function Sentinel(list){
    this.next = this;
    this.prev = this;
  }

  inherit(Sentinel, Item, [
    function unlink(){
      return this;
    }
  ]);

  function find(list, value){
    if (list.lastFind && list.lastFind.data === value) {
      return list.lastFind;
    }

    var item = list.sentinel,
        i = 0;

    while ((item = item.next) !== list.sentinel) {
      if (item.data === value) {
        return list.lastFind = item;
      }
    }
  }

  function DoublyLinkedList(){
    this.size = 0;
    define(this, {
      sentinel: new Sentinel,
      lastFind: null
    });
  }

  define(DoublyLinkedList.prototype, [
    function first() {
      return this.sentinel.next.data;
    },
    function last() {
      return this.sentinel.prev.data;
    },
    function unshift(value){
      var item = new Item(value, this.sentinel);
      return this.size++;
    },
    function push(value){
      var item = new Item(value, this.sentinel.prev);
      return this.size++;
    },
    function insert(value, after){
      var item = find(this, after);
      if (item) {
        item = new Item(value, item);
        return this.size++;
      }
      return false;
    },
    function replace(value, replacement){
      var item = find(this, value);
      if (item) {
        new Item(replacement, item);
        item.unlink();
        return true;
      }
      return false;
    },
    function insertBefore(value, before){
      var item = find(this, before);
      if (item) {
        item = new Item(value, item.prev);
        return this.size++;
      }
      return false;
    },
    function pop(){
      if (this.size) {
        this.size--;
        return this.sentinel.prev.unlink().data;
      }
    },
    function shift() {
      if (this.size) {
        this.size--;
        return this.sentinel.next.unlink().data;
      }
    },
    function remove(value){
      var item = find(this, value);
      if (item) {
        item.unlink();
        return true;
      }
      return false;
    },
    function has(value) {
      return !!find(this, value);
    },
    function items(){
      var item = this.sentinel,
          array = [];

      while ((item = item.next) !== this.sentinel) {
        array.push(item.data);
      }

      return array;
    },
    function clear(){
      var next,
          item = this.sentinel.next;

      while (item !== this.sentinel) {
        next = item.next;
        item.clear();
        item = next;
      }

      this.lastFind = null;
      this.size = 0;
      return this;
    },
    function clone(){
      var item = this.sentinel,
          list = new DoublyLinkedList;

      while ((item = item.next) !== this.sentinel) {
        list.push(item.data);
      }
      return list;
    },
    function __iterator__(){
      return new DoublyLinkedListIterator(this);
    }
  ]);

  return module.exports = DoublyLinkedList;
})(typeof module !== 'undefined' ? module : {});


exports.HashMap = (function(module){
  var objects   = require('../lib/objects'),
      functions = require('../lib/functions'),
      iteration = require('../lib/iteration'),
      DoublyLinkedList = require('../lib/DoublyLinkedList');

  var define        = objects.define,
      inherit       = objects.inherit,
      assign        = objects.assign,
      Hash          = objects.Hash,
      bind          = functions.bind,
      iterate       = functions.iterate,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


  var types = assign(new Hash, {
    'string': 'strings',
    'number': 'numbers',
    'undefined': 'others',
    'boolean': 'others',
    'object': 'others'
  });


  function HashMapIterator(map, type){
    this.item = map.list.sentinel;
    this.sentinel = map.list.sentinel;
    this.type = type || 'items';
  }

  inherit(HashMapIterator, Iterator, [
    function next(){
      var item = this.item = this.item.next;

      if (item === this.sentinel) {
        throw StopIteration;
      } else if (this.type === 'key') {
        return item.key;
      } else if (this.type === 'value') {
        return item.data;
      } else {
        return [item.key, item.data];
      }
    }
  ]);

  function HashMap(iterable){
    define(this, 'list', new DoublyLinkedList);
    this.clear();
    if (iterable != null) {
      iterate(iterable, function(item){
        if (item && typeof item === 'object' && item.length  === 2) {
          this.set(item[0], item[1]);
        }
      }, this);
    }
  }

  define(HashMap.prototype, [
    function get(key){
      var item = this[types[typeof key]][key];
      if (item) {
        return item.data;
      }
    },
    function set(key, value){
      var data = this[types[typeof key]],
          item = data[key];

      if (item) {
        item.data = value;
      } else {
        this.list.push(value);
        item = this.list.sentinel.prev;
        item.key = key;
        data[key] = item;
      }
      this.size = this.list.size;
      return value;
    },
    function has(key){
      return key in this[types[typeof key]];
    },
    function remove(key){
      var data = this[types[typeof key]];

      if (key in data) {
        data[key].unlink();
        delete data[key];
        this.size = this.list.size;
        return true;
      }
      return false;
    },
    function clear(){
      define(this, {
        strings: new Hash,
        numbers: new Hash,
        others: new Hash
      });
      this.list.clear();
      this.size = 0;
    },
    function keys(){
      var out = [];
      iterate(this.__iterator__('key'), bind(_push, out));
      return out;
    },
    function values(){
      var out = [];
      iterate(this.__iterator__('value'), bind(_push, out));
      return out;
    },
    function items(){
      var out = [];
      iterate(this, bind(_push, out));
      return out;
    },
    function __iterator__(type){
      return new HashMapIterator(this, type);
    }
  ]);


  return module.exports = HashMap;
})(typeof module !== 'undefined' ? module : {});


exports.HashSet = (function(module){
  var objects   = require('../lib/objects'),
      functions = require('../lib/functions'),
      iteration = require('../lib/iteration'),
      DoublyLinkedList = require('../lib/DoublyLinkedList');

  var define        = objects.define,
      inherit       = objects.inherit,
      assign        = objects.assign,
      Hash          = objects.Hash,
      bind          = functions.bind,
      iterate       = functions.iterate,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


  var types = assign(new Hash, {
    'string': 'strings',
    'number': 'numbers',
    'undefined': 'others',
    'boolean': 'others',
    'object': 'others'
  });


  function HashSetIterator(set){
    this.item = set.list.sentinel;
    this.sentinel = set.list.sentinel;
  }

  inherit(HashSetIterator, Iterator, [
    function next(){
      var item = this.item = this.item.next;
      if (item === this.sentinel) {
        throw StopIteration;
      } else {
        return item.data;
      }
    }
  ]);

  function HashSet(){
    define(this, 'list', new DoublyLinkedList);
    this.clear();
  }

  define(HashSet.prototype, [
    function add(value){
      var data = this[types[typeof value]],
          item = data[value];

      if (!item) {
        this.list.push(value);
        data[value] = this.list.sentinel.prev;
        this.size = this.list.size;
      }
      return value;
    },
    function has(value){
      return value in this[types[typeof value]];
    },
    function remove(value){
      var data = this[types[typeof value]];

      if (value in data) {
        data[value].unlink();
        delete data[value];
        this.size = this.list.size;
        return true;
      }
      return false;
    },
    function clear(){
      define(this, {
        strings: new Hash,
        numbers: new Hash,
        others: new Hash
      });
      this.list.clear();
      this.size = 0;
    },
    function values(){
      var out = [];
      iterate(this, bind(_push, out));
      return out;
    },
    function __iterator__(){
      return new HashSetIterator(this);
    }
  ]);

  return module.exports = HashSet;
})(typeof module !== 'undefined' ? module : {});


exports.Feeder = (function(module){
  var objects = require('./objects'),
      Queue   = require('./Queue');

  var define = objects.define;


  function Feeder(callback, context, pace){
    var self = this;
    this.queue = new Queue;
    this.active = false;
    this.pace = pace || 5;
    this.feeder = function feeder(){
      var count = Math.min(self.pace, self.queue.length);

      while (self.active && count--) {
        callback.call(context, self.queue.shift());
      }

      if (!self.queue.length) {
        self.active = false;
      } else if (self.active) {
        setTimeout(feeder, 15);
      }
    };
  }

  define(Feeder.prototype, [
    function push(item){
      this.queue.push(item);
      if (!this.active) {
        this.active = true;
        setTimeout(this.feeder, 15);
      }
      return this;
    },
    function pause(){
      this.active = false;
    }
  ]);

  return module.exports = Feeder;
})(typeof module !== 'undefined' ? module.exports : {});


exports.PropertyList = (function(module){
  var objects   = require('./objects'),
      iteration = require('./iteration');

  var isObject      = objects.isObject,
      define        = objects.define,
      inherit       = objects.inherit,
      Hash          = objects.Hash,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;

  var proto = require('./utility').uid();

  var PropertyListIterator = (function(){
    var types = {
      keys: 0,
      values: 1,
      attributes: 2
    };

    function PropertyListIterator(list, type){
      this.list = list;
      this.type = type ? types[type] : 'items';
      this.index = 0;
    }

    inherit(PropertyListIterator, Iterator, [
      function next(){
        var props = this.list.props, property;
        while (!property) {
          if (this.index >= props.length) {
            throw StopIteration;
          }
          property = props[this.index++];
        }
        return this.type === 'items' ? property : property[this.type];
      }
    ]);

    return PropertyListIterator;
  })();

  function PropertyList(){
    this.hash = new Hash;
    this.props = [];
    this.holes = 0;
    this.length = 0;
  }

  define(PropertyList.prototype, [
    function get(key){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index !== undefined) {
        return this.props[index][1];
      }
    },
    function getAttribute(key){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index !== undefined) {
        return this.props[index][2];
      } else {
        return null;
      }
    },
    function getProperty(key){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index !== undefined) {
        return this.props[index];
      } else {
        return null;
      }
    },
    function set(key, value, attr){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name],
          prop;

      if (index === undefined) {
        index = this.hash[name] = this.props.length;
        prop = this.props[index] = [key, value, 0];
        this.length++;
      } else {
        prop = this.props[index];
        prop[1] = value;
      }

      if (attr !== undefined) {
        prop[2] = attr;
      }
      return true;
    },
    function initialize(props){
      var len = props.length;
      for (var i=0; i < len; i += 3) {
        var index = this.hash[props[i]] = this.props.length;
        this.props[index] = [props[i], props[i + 1], props[i + 2]];
      }
    },
    function setAttribute(key, attr){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index !== undefined) {
        this.props[index][2] = attr;
        return true;
      } else {
        return false;
      }
    },
    function setProperty(prop){
      var key = prop[0],
          name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index === undefined) {
        index = this.hash[name] = this.props.length;
        this.length++;
      }
      this.props[index] = prop;
    },
    function remove(key){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index !== undefined) {
        this.hash[name] = undefined;
        this.props[index] = undefined;
        this.holes++;
        this.length--;
        return true;
      } else {
        return false;
      }
    },
    function has(key){
      var name = key === '__proto__' ? proto : key;
      return this.hash[name] !== undefined;
    },
    function hasAttribute(key, mask){
      var name = key === '__proto__' ? proto : key,
          attr = this.getAttribute(name);
      if (attr !== null) {
        return (attr & mask) > 0;
      }
    },
    function compact(){
      var props = this.props,
          len = props.length,
          index = 0,
          prop;

      this.hash = new Hash;
      this.props = [];
      this.holes = 0;

      for (var i=0; i < len; i++) {
        if (prop = props[i]) {
          var name = prop[0] === '__proto__' ? proto : prop[0];
          this.props[index] = prop;
          this.hash[name] = index++;
        }
      }
    },
    function forEach(callback, context){
      var len = this.props.length,
          index = 0,
          prop;

      context = context || this;

      for (var i=0; i < len; i++) {
        if (prop = this.props[i]) {
          callback.call(context, prop, index++, this);
        }
      }
    },
    function map(callback, context){
      var out = [],
          len = this.props.length,
          index = 0,
          prop;

      context = context || this;

      for (var i=0; i < len; i++) {
        if (prop = this.props[i]) {
          out[index] = callback.call(context, prop, index++, this);
        }
      }

      return out;
    },
    function translate(callback, context){
      var out = new PropertyList;

      out.length = this.length;
      context = context || this;

      this.forEach(function(prop, index){
        prop = callback.call(context, prop, index, this);
        var name = prop[0] === '__proto__' ? proto : prop[0];
        out.props[index] = prop;
        out.hash[name] = index;
      });

      return out;
    },
    function filter(callback, context){
      var out = new PropertyList,
          index = 0;

      context = context || this;

      this.forEach(function(prop, i){
        if (callback.call(context, prop, i, this)) {
          var name = prop[0] === '__proto__' ? proto : prop[0];
          out.props[index] = prop;
          out.hash[name] = index++;
        }
      });

      return out;
    },
    function clone(deep){
      return this.translate(function(prop, i){
        return deep ? prop.slice() : prop;
      });
    },
    function keys(){
      return this.map(function(prop){
        return prop[0];
      });
    },
    function values(){
      return this.map(function(prop){
        return prop[1];
      });
    },
    function items(){
      return this.map(function(prop){
        return prop.slice();
      });
    },
    function merge(list){
      each(list, this.setProperty, this);
    },
    function __iterator__(type){
      return new PropertyListIterator(this, type);
    }
  ]);

  if (require('util')) {
    void function(){
      var insp = require('util').inspect;

      function Token(value){
        this.value = value + '';
      }

      Token.prototype.inspect = function(){ return this.value };

      define(PropertyList.prototype, function inspect(){
        var out = new Hash;

        this.forEach(function(prop){
          var key = typeof prop[0] === 'string' ? prop[0] : '_@_'+insp(prop[0]);

          var attrs = (prop[2] & 0x01 ? 'E' : '_') +
                      (prop[2] & 0x02 ? 'C' : '_') +
                      (prop[2] & 0x04 ? 'W' :
                       prop[2] & 0x08 ? 'A' : '_');

          out[key] = new Token(attrs + ' ' + (isObject(prop[1]) ? prop[1].NativeBrand : prop[1]));
        });

        return insp(out).replace(/'_@_@(\w+)'/g, '@$1');
      });
    }();
  }

  return module.exports = PropertyList;
})(typeof module !== 'undefined' ? module : {});


exports.buffers = (function(global, exports){
  if ('DataView' in global) {
    exports.DataView = global.DataView;
    exports.ArrayBuffer = global.ArrayBuffer;
    return exports;
  }

  var objects = require('./objects'),
      define = objects.define,
      create = objects.create,
      hide = objects.hide;

  var log = Math.log,
      pow = Math.pow,
      LN2 = Math.LN2,
      _slice = [].slice,
      chr = String.fromCharCode;

  var endian = {
    little: { 1: [0],
              2: [1, 0],
              4: [3, 2, 1, 0],
              8: [7, 6, 5, 4, 3, 2, 1, 0] },
    big:    { 1: [0],
              2: [0, 1],
              4: [0, 1, 2, 3],
              8: [0, 1, 2, 3, 4, 5, 6, 7] }
  };


  var chars = create(null),
      indices = [];

  void function(i){
    for (i = 0; i < 0x100; ++i) {
      chars[indices[i] = chr(i)] = i;
      if (i >= 0x80) {
        chars[chr(0xf700 + i)] = i;
      }
    }
  }();


  function DataView(buffer, byteOffset, byteLength){
    if (!(buffer instanceof ArrayBuffer)) {
      throw new TypeError('DataView must be initialized with an ArrayBuffer');
    }

    this.byteOffset = byteOffset === undefined ? buffer.byteOffset | 0 : byteOffset >>> 0;
    this.byteLength = byteLength === undefined ? (buffer.byteLength - this.byteOffset) | 0 : byteLength >>> 0;
    this.buffer = buffer;
  }

  exports.DataView = DataView;


  define(DataView.prototype, [
    function getUint8(byteOffset){
      var b = this.buffer._data,
          off = byteOffset + this.byteOffset;
      return b[off];
    },
    function getUint16(byteOffset, littleEndian){
      var b = this.buffer._data,
          o = (littleEndian ? endian.little : endian.big)[2],
          off = byteOffset + this.byteOffset;
      return (b[off + o[1]] << 8) | b[off + o[0]];
    },
    function getUint32(byteOffset, littleEndian){
      var b = this.buffer._data,
          o = (littleEndian ? endian.little : endian.big)[4],
          off = byteOffset + this.byteOffset;
      return (((((b[off + o[3]] << 8) | b[off + o[2]]) << 8) | b[off + o[1]]) << 8) | b[off + o[0]];
    },
    function getInt8(byteOffset){
      var b = this.getUint8(byteOffset);
      return b & 0x80 ? b - 0x100 : b;
    },
    function getInt16(byteOffset, littleEndian){
      var b = this.getUint16(byteOffset, littleEndian);
      return b & 0x8000 ? b - 0x10000 : b;
    },
    function getInt32(byteOffset, littleEndian){
      var b = this.getUint32(byteOffset, littleEndian);
      return b & 0x80000000 ? b - 0x100000000 : b;
    },
    function getFloat32(byteOffset, littleEndian){
      return readFloat(this.buffer._data, this.byteOffset + byteOffset, littleEndian, 23, 4);
    },
    function getFloat64(byteOffset, littleEndian){
      return readFloat(this.buffer._data, this.byteOffset + byteOffset, littleEndian, 52, 8);
    },

    function setUint8(byteOffset, value){
      var b = this.buffer._data,
          off = byteOffset + this.byteOffset;

      boundsCheck(off, 1, b.length);

      b[off] = value & 0xff;
    },
    function setUint16(byteOffset, value, littleEndian){
      var b = this.buffer._data,
          o = (littleEndian ? endian.little : endian.big)[2],
          off = byteOffset + this.byteOffset;

      boundsCheck(off, 2, b.length);

      b[off + o[0]] =  value & 0x00ff;
      b[off + o[1]] = (value & 0xff00) >>> 8;
    },
    function setUint32(byteOffset, value, littleEndian){
      var b = this.buffer._data,
          o = (littleEndian ? endian.little : endian.big)[4],
          off = byteOffset + this.byteOffset;

      boundsCheck(off, 4, b.length);

      b[off + o[0]] =  value & 0x000000ff;
      b[off + o[1]] = (value & 0x0000ff00) >>> 8;
      b[off + o[2]] = (value & 0x00ff0000) >>> 16;
      b[off + o[3]] = (value & 0xff000000) >>> 24;
    },
    function setInt8(byteOffset, value){
      if (value < 0) value |= 0x100;
      this.setUint8(byteOffset, value);
    },
    function setInt16(byteOffset, value, littleEndian){
      if (value < 0) value |= 0x10000;
      this.setUint16(byteOffset, value, littleEndian);
    },
    function setInt32(byteOffset, value, littleEndian){
      if (value < 0) value |= 0x100000000;
      this.setUint32(byteOffset, value, littleEndian);
    },
    function setFloat32(byteOffset, value, littleEndian){
      writeFloat(this.buffer._data, this.byteOffset + byteOffset, value, littleEndian, 23, 4);
    },
    function setFloat64(byteOffset, value, littleEndian){
      writeFloat(this.buffer._data, this.byteOffset + byteOffset, value, littleEndian, 52, 8);
    }
  ]);

  function boundsCheck(offset, size, max){
    if (offset < 0) {
      throw new RangeError('Tried to write to a negative index');
    } else if (offset + size > max) {
      throw new RangeError('Tried to write '+size+' bytes past the end of a buffer at index '+offset+' of '+max);
    }
  }

  var ArrayBuffer = exports.ArrayBuffer = (function(){
    function readString(string){
      var array = [],
          cycles = string.length % 8,
          i = 0;

      while (cycles--) {
        array[i] = chars[string[i++]];
      }

      cycles = string.length >> 3;

      while (cycles--) {
        array.push(chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]]);
      }

      return array;
    }

    function writeString(array){
      try {
        return chr.apply(null, array);
      } catch (err) {}

      var string = '',
          cycles = array.length % 8,
          i = 0;

      while (cycles--) {
        string += indices[array[i++]];
      }

      cycles = array.length >> 3;

      while (cycles--) {
        string += indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]];
      }

      return string;
    }

    function zerodArray(size){
      var data = new Array(size);
      while (size--) {
        data[size] = 0;
      }
      return data;
    }


    function ArrayBuffer(len){
      if (len == null) {
        this._data = [];
      } else {
        var type = typeof len;
        if (type === 'number') {
          this._data = zerodArray(len);
        } else if (type === 'string') {
          this._data = readString(len);
        } else if (type === 'object') {
          if (len instanceof ArrayBuffer) {
            this._data = len._data.slice();
          } else if (len.length) {
            this._data = _slice.call(len);
          } else if ((len /= 1) > 0) {
            this._data = zerodArray(len);
          }
        }
      }

      if (!this._data) {
        throw new TypeError('unable to convert input to size or buffer');
      }

      hide(this, '_data');
      this.byteLength = this._data.length;
    }

    define(ArrayBuffer.prototype, [
      function slice(begin, end){
        if (begin == null) {
          begin = 0;
        } else if (begin < 0) {
          begin += this.byteLength;
          if (begin < 0) begin = 0;
        } else if (begin >= this.byteLength) {
          begin = this.byteLength;
        }

        if (end == null) {
          end = this.byteLength;
        } else if (end < 0) {
          end += this.byteLength;
          if (end < 0) end = 0;
        } else if (end >= this.byteLength) {
          end = this.byteLength;
        }


        var ab = new ArrayBuffer(0);
        ab._data = this._data.slice(begin, end);
        ab.byteLength = ab._data.length;
        return ab;
      }
    ]);

    return ArrayBuffer;
  })();


  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  function readFloat(buffer, offset, littleEndian, mLen, bytes){
    var e, m,
        eLen = bytes * 8 - mLen - 1,
        eMax = (1 << eLen) - 1,
        eBias = eMax >> 1,
        nBits = -7,
        i = littleEndian ? bytes - 1 : 0 ,
        d = littleEndian ? -1 : 1,
        s = buffer[offset + i];

    i += d;

    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = e * 0x100 + buffer[offset + i], i += d, nBits -= 8);

    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 0x100 + buffer[offset + i], i += d, nBits -= 8);

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : s ? -Infinity : Infinity;
    } else {
      m = m + pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * pow(2, e - mLen);
  }

  function writeFloat(buffer, offset, value, littleEndian, mLen, bytes){
    var e, m, c,
        eLen = bytes * 8 - mLen - 1,
        eMax = (1 << eLen) - 1,
        eBias = eMax >> 1,
        rt = (mLen === 23 ? pow(2, -24) - pow(2, -77) : 0),
        i = littleEndian ? 0 : bytes - 1,
        d = littleEndian ? 1 : -1,
        s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

    value < 0 && (value = -value);

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = (log(value) / LN2) | 0;
      if (value * (c = pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * pow(2, eBias - 1) * pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 0x100, mLen -= 8);

    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 0x100, eLen -= 8);

    buffer[offset + i - d] |= s * 0x80;
  }

  return exports;
})(this, typeof module !== 'undefined' ? exports : {});


exports.constants = (function(exports){
  var objects = require('../lib/objects');

  var create  = objects.create,
      define  = objects.define,
      ownKeys = objects.keys,
      Hash    = objects.Hash;

  function Constants(array){
    this.hash = new Hash;
    for (var i=0; i < array.length; i++) {
      this.hash[array[i]] = i;
    }
    this.array = array;
  }

  define(Constants.prototype, [
    function getIndex(key){
      return this.hash[key];
    },
    function getKey(index){
      return this.array[index];
    }
  ]);



  function Token(name){
    this.name = name;
  }

  define(Token.prototype, [
    function toString(){
      return this.name;
    },
    function inspect(){
      return '['+this.name+']';
    }
  ]);


  function BuiltinBrand(name){
    this.name = name;
    this.brand = '[object '+name+']';
  }

  define(BuiltinBrand.prototype, [
    function toString(){
      return this.name;
    },
    function inspect(){
      return this.name;
    }
  ]);


  exports.BRANDS = {
    BooleanWrapper      : new BuiltinBrand('Boolean'),
    GlobalObject        : new BuiltinBrand('global'),
    BuiltinArguments    : new BuiltinBrand('Arguments'),
    BuiltinArrayIterator: new BuiltinBrand('ArrayIterator'),
    BuiltinArray        : new BuiltinBrand('Array'),
    BuiltinDate         : new BuiltinBrand('Date'),
    BuiltinDataView     : new BuiltinBrand('DataView'),
    BuiltinError        : new BuiltinBrand('Error'),
    BuiltinFunction     : new BuiltinBrand('Function'),
    BuiltinIterator     : new BuiltinBrand('Iterator'),
    BuiltinJSON         : new BuiltinBrand('JSON'),
    BuiltinMap          : new BuiltinBrand('Map'),
    BuiltinMath         : new BuiltinBrand('Math'),
    BuiltinModule       : new BuiltinBrand('Module'),
    BuiltinObject       : new BuiltinBrand('Object'),
    BuiltinRegExp       : new BuiltinBrand('RegExp'),
    BuiltinSet          : new BuiltinBrand('Set'),
    BuiltinSymbol       : new BuiltinBrand('Symbol'),
    BuiltinWeakMap      : new BuiltinBrand('WeakMap'),
    NumberWrapper       : new BuiltinBrand('Number'),
    StopIteration       : new BuiltinBrand('StopIteration'),
    StringWrapper       : new BuiltinBrand('String'),
    BuiltinArrayBuffer  : new BuiltinBrand('ArrayBuffer'),
    BuiltinInt8Array    : new BuiltinBrand('Int8Array'),
    BuiltinUint8Array   : new BuiltinBrand('Uint8Array'),
    BuiltinInt16Array   : new BuiltinBrand('Int16Array'),
    BuiltinUint16Array  : new BuiltinBrand('Uint16Array'),
    BuiltinInt32Array   : new BuiltinBrand('Int32Array'),
    BuiltinUint32Array  : new BuiltinBrand('Uint32Array'),
    BuiltinFloat32Array : new BuiltinBrand('Float32Array'),
    BuiltinFloat64Array : new BuiltinBrand('Float64Array')
  };


  exports.BINARYOPS = new Constants(['instanceof', 'in', '==', '!=', '===', '!==', '<', '>',
                                   '<=', '>=', '*', '/','%', '+', '-', '<<', '>>', '>>>', '|', '&', '^', 'string+']);
  exports.UNARYOPS = new Constants(['delete', 'void', 'typeof', '+', '-', '~', '!']);
  exports.ENTRY = new Constants(['ENV', 'FINALLY', 'TRYCATCH', 'FOROF' ]);
  exports.FUNCTYPE = new Constants(['NORMAL', 'METHOD', 'ARROW' ]);
  exports.SCOPE = new Constants(['EVAL', 'FUNCTION', 'GLOBAL', 'MODULE' ]);

  exports.SYMBOLS = {
    Break            : new Token('Break'),
    Pause            : new Token('Pause'),
    Throw            : new Token('Throw'),
    Empty            : new Token('Empty'),
    Resume           : new Token('Resume'),
    Return           : new Token('Return'),
    Normal           : new Token('Normal'),
    Abrupt           : new Token('Abrupt'),
    Builtin          : new Token('Builtin'),
    Continue         : new Token('Continue'),
    Reference        : new Token('Reference'),
    Completion       : new Token('Completion'),
    Uninitialized    : new Token('Uninitialized')
  };

  var E = 0x1,
      C = 0x2,
      W = 0x4,
      A = 0x8;

  exports.ATTRIBUTES = {
    ENUMERABLE  : E,
    CONFIGURABLE: C,
    WRITABLE    : W,
    ACCESSOR    : A,
    ___: 0,
    E__: E,
    _C_: C,
    EC_: E | C,
    __W: W,
    E_W: E | W,
    _CW: C | W,
    ECW: E | C | W,
    __A: A,
    E_A: E | A,
    _CA: C | A,
    ECA: E | C | A
  };

  exports.AST = new Constants(ownKeys(require('esprima').Syntax));

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});


exports.errors = (function(errors, messages, exports){
  var objects   = require('../lib/objects'),
      constants = require('./constants');

  var define    = objects.define,
      inherit   = objects.inherit;

  function Exception(name, type, message){
    var args = {},
        argNames = [],
        src = '';

    for (var i=0; i < message.length; i++) {
      var str = message[i];
      if (str[0] === '$') {
        if (!args.hasOwnProperty(str))
          argNames.push(str);
        src += '+'+str;
      } else {
        src += '+'+'"'+str.replace(/["\\\n]/g, '\\$0')+'"';
      }
    }

    this.name = name;
    this.type = type;
    return new Function('e', 'return function '+name+'('+argNames.join(', ')+'){ return '+src.slice(1)+'; }')(this);
  }



  for (var name in messages) {
    for (var type in messages[name]) {
      errors[type] = new Exception(name, type, messages[name][type]);
    }
  }




  // ##################
  // ### Completion ###
  // ##################

  function Completion(type, value, target){
    this.type = type;
    this.value = value;
    this.target = target;
  }

  exports.Completion = Completion;

  define(Completion.prototype, {
    Completion: true
  });

  define(Completion.prototype, [
    function toString(){
      return this.value;
    },
    function valueOf(){
      return this.value;
    }
  ]);


  function AbruptCompletion(type, value, target){
    this.type = type;
    this.value = value;
    this.target = target;
  }

  inherit(AbruptCompletion, Completion, {
    Abrupt: true
  });

  exports.AbruptCompletion = AbruptCompletion;

  function MakeException(type, args){
    if (!(args instanceof Array)) {
      args = [args];
    }
    var error = errors[type];
    return exports.createError(error.name, type, error.apply(null, args));
  }

  exports.MakeException = MakeException;


  function ThrowException(type, args){
    return new AbruptCompletion('throw', MakeException(type, args));
  }

  exports.ThrowException = ThrowException;


  return exports;
})({}, {
  TypeError: {
    bad_argument                   : ["$0", " received a bad argument, expecting a ", "$1"],
    cyclic_proto                   : ["Cyclic __proto__ value"],
    incompatible_method_receiver   : ["Method ", "$0", " called on incompatible receiver ", "$1"],
    invalid_lhs_in_assignment      : ["Invalid left-hand side in assignment"],
    invalid_lhs_in_for_in          : ["Invalid left-hand side in for-in"],
    invalid_lhs_in_postfix_op      : ["Invalid left-hand side expression in postfix operation"],
    invalid_lhs_in_prefix_op       : ["Invalid left-hand side expression in prefix operation"],
    redeclaration                  : ["$0", " '", "$1", "' has already been declared"],
    uncaught_exception             : ["Uncaught ", "$0"],
    stack_trace                    : ["Stack Trace:\n", "$0"],
    called_non_callable            : ["$0", " is not a function"],
    property_not_function          : ["Property '", "$0", "' of object ", "$1", " is not a function"],
    not_constructor                : ["$0", " is not a constructor"],
    cannot_convert_to_primitive    : ["Cannot convert object to primitive value"],
    with_expression                : ["$0", " has no properties"],
    illegal_invocation             : ["Illegal invocation"],
    invalid_in_operator_use        : ["Cannot use 'in' operator to search for '", "$0", "' in ", "$1"],
    instanceof_function_expected   : ["Expecting a function in instanceof check, but got ", "$0"],
    instanceof_nonobject_proto     : ["Function has non-object prototype '", "$0", "' in instanceof check"],
    null_to_object                 : ["Cannot convert null to object"],
    undefined_to_object            : ["Cannot convert undefined to object"],
    object_not_coercible           : ["$0", " cannot convert ", "$1", " to an object"],
    reduce_no_initial              : ["Reduce of empty array with no initial value"],
    callback_must_be_callable      : ["$0", " requires a function callback"],
    getter_must_be_callable        : ["Getter must be a function: ", "$0"],
    setter_must_be_callable        : ["Setter must be a function: ", "$0"],
    value_and_accessor             : ["A property cannot both have accessors and be writable or have a value, ", "$0"],
    proto_object_or_null           : ["Object prototype may only be an Object or null"],
    property_desc_object           : ["Property description must be an object: ", "$0"],
    redefine_disallowed            : ["Cannot redefine property: ", "$0"],
    apply_wrong_args               : ["Invalid arguments used in apply"],
    define_disallowed              : ["Cannot define property:", "$0", ", object is not extensible."],
    non_extensible_proto           : ["$0", " is not extensible"],
    handler_non_object             : ["Proxy.", "$0", " called with non-object as handler"],
    proto_non_object               : ["Proxy.", "$0", " called with non-object as prototype"],
    trap_function_expected         : ["Proxy.", "$0", " called with non-function for '", "$1", "' trap"],
    handler_trap_missing           : ["Proxy handler ", "$0", " has no '", "$1", "' trap"],
    handler_trap_must_be_callable  : ["Proxy handler ", "$0", " has non-callable '", "$1", "' trap"],
    handler_returned_false         : ["Proxy handler ", "$0", " returned false from '", "$1", "' trap"],
    handler_returned_undefined     : ["Proxy handler ", "$0", " returned undefined from '", "$1", "' trap"],
    proxy_non_object_prop_names    : ["Trap '", "$1", "' returned non-object ", "$0"],
    proxy_repeated_prop_name       : ["Trap '", "$1", "' returned repeated property name '", "$2", "'"],
    invalid_weakmap_key            : ["Invalid value used as weak map key"],
    invalid_json                   : ["String '", "$0", "' is not valid JSON"],
    circular_structure             : ["Converting circular structure to JSON"],
    called_on_non_function         : ["$0", " called on non-function"],
    called_on_non_object           : ["$0", " called on non-object"],
    called_on_null_or_undefined    : ["$0", " called on null or undefined"],
    strict_delete_property         : ["Cannot delete property '", "$0", "' of ", "$1"],
    super_delete_property          : ["Cannot delete property '", "$0", "' from super"],
    strict_read_only_property      : ["Cannot assign to read only property '", "$0", "' of ", "$1"],
    strict_cannot_assign           : ["Cannot assign to read only '", "$0", "' in strict mode"],
    strict_poison_pill             : ["'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them"],
    object_not_extensible          : ["Can't add property ", "$0", ", object is not extensible"],
    proxy_prototype_inconsistent        : ["cannot report a prototype value that is inconsistent with target prototype value"],
    proxy_extensibility_inconsistent    : ["cannot report a non-extensible object as extensible or vice versa"],
    proxy_configurability_inconsistent  : ["cannot report innacurate configurability for property '", "$0"],
    proxy_enumerate_properties          : ["enumerate trap failed to include non-configurable enumerable property '", "$0", "'"],
    missing_fundamental_trap            : ["Proxy handler is missing fundamental trap ", "$0"],
    non_object_superclass               : ["non-object super class"],
    non_object_superproto               : ["non-object super prototype"],
    invalid_super_binding               : ["object has no super binding"],
    not_generic                         : ["$0", " is not generic and was called on an invalid target"],
    spread_non_object                   : ["Expecting an object as spread argument, but got ", "$0"],
    called_on_incompatible_object       : ["$0", " called on incompatible object"],
    double_initialization               : ["Initializating an already initialized ", "$0"],
    construct_arrow_function            : ["Arrow functions cannot be constructed"],
    generator_executing                 : ["'", "$0", "' called on executing generator"],
    generator_closed                    : ["'", "$0", "' called on closed generator"],
    generator_send_newborn              : ["Sent value into newborn generator"],
    unnamed_symbol                      : ["Symbol must have a name"],
    missing_fundamental_handler         : ["Exotic object missing fundamental handler for '", "$0", "'"],
    buffer_unaligned_offset             : ["$0", " was called with an unalign offset"],
    buffer_out_of_bounds                : ["$0", " was was called with an out of bounds length and/or offset"],
    buffer_unaligned_length             : ["$0", " was called with an unaligned length"]
  },
  ReferenceError: {
    undefined_symbol               : ["Referenced undefined symbol @", "$0"],
    unknown_label                  : ["Undefined label '", "$0", "'"],
    undefined_method               : ["Object ", "$1", " has no method '", "$0", "'"],
    not_defined                    : ["$0", " is not defined"],
    uninitialized_const            : ["$0", " is not initialized"],
    non_object_property_load       : ["Cannot read property '", "$0", "' of ", "$1"],
    non_object_property_store      : ["Cannot set property '", "$0", "' of ", "$1"],
    non_object_property_call       : ["Cannot call method '", "$0", "' of ", "$1"],
    no_setter_in_callback          : ["Cannot set property ", "$0", " of ", "$1", " which has only a getter"]
  },
  RangeError: {
    invalid_array_length           : ["Invalid array length"],
    invalid_repeat_count           : ["Invalid repeat count"],
    stack_overflow                 : ["Maximum call stack size exceeded"],
    invalid_time_value             : ["Invalid time value"]
  },
  SyntaxError : {
    multiple_defaults_in_switch    : ["More than one default clause in switch statement"],
    newline_after_throw            : ["Illegal newline after throw"],
    no_catch_or_finally            : ["Missing catch or finally after try"],
    malformed_regexp               : ["Invalid regular expression: /", "$0", "/: ", "$1"],
    unterminated_regexp            : ["Invalid regular expression: missing /"],
    regexp_flags                   : ["Cannot supply flags when constructing one RegExp from another"],
    unexpected_token               : ["Unexpected token ", "$0"],
    unexpected_token_number        : ["Unexpected number"],
    unexpected_token_string        : ["Unexpected string"],
    unexpected_token_identifier    : ["Unexpected identifier"],
    unexpected_reserved            : ["Unexpected reserved word"],
    unexpected_strict_reserved     : ["Unexpected strict mode reserved word"],
    unexpected_eos                 : ["Unexpected end of input"],
    invalid_regexp_flags           : ["Invalid flags supplied to RegExp constructor '", "$0", "'"],
    invalid_regexp                 : ["Invalid RegExp pattern /", "$0", "/"],
    illegal_break                  : ["Illegal break statement"],
    illegal_continue               : ["Illegal continue statement"],
    illegal_return                 : ["Illegal return statement"],
    illegal_let                    : ["Illegal let declaration outside extended mode"],
    illegal_access                 : ["Illegal access"],
    strict_mode_with               : ["Strict mode code may not include a with statement"],
    strict_catch_variable          : ["Catch variable may not be eval or arguments in strict mode"],
    strict_param_name              : ["Parameter name eval or arguments is not allowed in strict mode"],
    strict_param_dupe              : ["Strict mode function may not have duplicate parameter names"],
    strict_var_name                : ["Variable name may not be eval or arguments in strict mode"],
    strict_function_name           : ["Function name may not be eval or arguments in strict mode"],
    strict_octal_literal           : ["Octal literals are not allowed in strict mode."],
    strict_duplicate_property      : ["Duplicate data property in object literal not allowed in strict mode"],
    accessor_data_property         : ["Object literal may not have data and accessor property with the same name"],
    accessor_get_set               : ["Object literal may not have multiple get/set accessors with the same name"],
    strict_lhs_assignment          : ["Assignment to eval or arguments is not allowed in strict mode"],
    strict_lhs_postfix             : ["Postfix increment/decrement may not have eval or arguments operand in strict mode"],
    strict_lhs_prefix              : ["Prefix increment/decrement may not have eval or arguments operand in strict mode"],
    strict_reserved_word           : ["Use of future reserved word in strict mode"],
    strict_delete                  : ["Delete of an unqualified identifier in strict mode."],
    strict_caller                  : ["Illegal access to a strict mode caller function."],
    const_assign                   : ["Assignment to constant variable."],
    invalid_module_path            : ["Module does not export '", "$0", "', or export is not itself a module"],
    module_type_error              : ["Module '", "$0", "' used improperly"]
  }
}, typeof module !== 'undefined' ? module.exports : {});



exports.assembler = (function(exports){
  "use strict";
  var util      = require('util');

  var objects   = require('../lib/objects'),
      functions = require('../lib/functions'),
      iteration = require('../lib/iteration'),
      utility   = require('../lib/utility'),
      traversal = require('../lib/traversal'),
      Stack     = require('../lib/Stack'),
      HashMap   = require('../lib/HashMap');

  var walk      = traversal.walk,
      collector = traversal.collector,
      Visitor   = traversal.Visitor,
      fname     = functions.fname,
      define    = objects.define,
      assign    = objects.assign,
      create    = objects.create,
      copy      = objects.copy,
      inherit   = objects.inherit,
      ownKeys   = objects.keys,
      hasOwn    = objects.hasOwn,
      isObject  = objects.isObject,
      Hash      = objects.Hash,
      each      = iteration.each,
      repeat    = iteration.repeat,
      map       = iteration.map,
      fold      = iteration.fold,
      generate  = iteration.generate,
      quotes    = utility.quotes,
      uid       = utility.uid,
      pushAll   = utility.pushAll;

  var constants = require('./constants'),
      BINARYOPS = constants.BINARYOPS.hash,
      UNARYOPS  = constants.UNARYOPS.hash,
      ENTRY     = constants.ENTRY.hash,
      SCOPE     = constants.SCOPE.hash,
      AST       = constants.AST,
      FUNCTYPE  = constants.FUNCTYPE.hash;

  var proto = Math.random().toString(36).slice(2),
      context,
      opcodes = 0;

  function StandardOpCode(params, name){
    var func = this.creator();
    this.id = func.id = opcodes++;
    this.params = func.params = params;
    this.name = func.opname = name;
    func.opcode = this;
    return func;
  }

  define(StandardOpCode.prototype, [
    function creator(){
      var opcode = this;
      return function(){
        return context.code.createDirective(opcode, arguments);
      };
    },
    function inspect(){
      return this.name;
    },
    function toString(){
      return this.name
    },
    function valueOf(){
      return this.id;
    },
    function toJSON(){
      return this.id;
    }
  ]);


  function InternedOpCode(params, name){
    return StandardOpCode.call(this, params, name);
  }

  inherit(InternedOpCode, StandardOpCode, [
    function creator(){
      var opcode = this;
      return function(a, b, c){
        //return context.code.createDirective(opcode, [context.intern(arg)]);
        return context.code.createDirective(opcode, [a, b, c]);
      };
    }
  ]);


  function macro(name){
    var params = [],
        ops = [];

    var body = map(arguments, function(arg, a){
      if (!a) return '';
      arg instanceof Array || (arg = [arg]);
      var opcode = arg.shift();
      ops.push(opcode);
      return opcode.opname + '('+generate(opcode.params, function(i){
        if (i in arg) {
          if (typeof arg[i] === 'string') {
            return quotes(arg[i]);
          }
          return arg[i] + '';
        } else {
          var param = '$'+String.fromCharCode(a + 96) + String.fromCharCode(i + 97);
          params.push(param);
          return param;
        }
      }).join(', ') + ');';
    }).join('');

    var src = 'return function '+name+'('+params.join(', ')+'){'+body+'}';
    var func = Function.apply(null, map(ops, function(op){ return op.opname }).concat(src)).apply(null, ops);
    func.params = func.length;
    func.opname = name;
    return func;
  }



  var ARRAY            = new StandardOpCode(0, 'ARRAY'),
      ARG              = new StandardOpCode(0, 'ARG'),
      ARGS             = new StandardOpCode(0, 'ARGS'),
      ARRAY_DONE       = new StandardOpCode(0, 'ARRAY_DONE'),
      BINARY           = new StandardOpCode(1, 'BINARY'),
      BLOCK            = new StandardOpCode(1, 'BLOCK'),
      CALL             = new StandardOpCode(1, 'CALL'),
      CASE             = new StandardOpCode(1, 'CASE'),
      CLASS_DECL       = new StandardOpCode(1, 'CLASS_DECL'),
      CLASS_EXPR       = new StandardOpCode(1, 'CLASS_EXPR'),
      COMPLETE         = new StandardOpCode(0, 'COMPLETE'),
      CONST            = new StandardOpCode(1, 'CONST'),
      CONSTRUCT        = new StandardOpCode(0, 'CONSTRUCT'),
      DEBUGGER         = new StandardOpCode(0, 'DEBUGGER'),
      DEFAULT          = new StandardOpCode(1, 'DEFAULT'),
      DEFINE           = new StandardOpCode(1, 'DEFINE'),
      DUP              = new StandardOpCode(0, 'DUP'),
      ELEMENT          = new StandardOpCode(0, 'ELEMENT'),
      ENUM             = new StandardOpCode(0, 'ENUM'),
      EXTENSIBLE       = new StandardOpCode(1, 'EXTENSIBLE'),
      FLIP             = new StandardOpCode(1, 'FLIP'),
      FUNCTION         = new StandardOpCode(2, 'FUNCTION'),
      GET              = new StandardOpCode(0, 'GET'),
      IFEQ             = new StandardOpCode(2, 'IFEQ'),
      IFNE             = new StandardOpCode(2, 'IFNE'),
      INC              = new StandardOpCode(0, 'INC'),
      INDEX            = new StandardOpCode(1, 'INDEX'),
      ITERATE          = new StandardOpCode(0, 'ITERATE'),
      JUMP             = new StandardOpCode(1, 'JUMP'),
      LET              = new StandardOpCode(1, 'LET'),
      LITERAL          = new StandardOpCode(1, 'LITERAL'),
      LOG              = new StandardOpCode(0, 'LOG'),
      MEMBER           = new InternedOpCode(1, 'MEMBER'),
      METHOD           = new StandardOpCode(3, 'METHOD'),
      NATIVE_CALL      = new StandardOpCode(1, 'NATIVE_CALL'),
      NATIVE_REF       = new InternedOpCode(1, 'NATIVE_REF'),
      OBJECT           = new StandardOpCode(0, 'OBJECT'),
      POP              = new StandardOpCode(0, 'POP'),
      POPN             = new StandardOpCode(1, 'POPN'),
      PROPERTY         = new InternedOpCode(1, 'PROPERTY'),
      PUT              = new StandardOpCode(0, 'PUT'),
      REF              = new InternedOpCode(1, 'REF'),
      REFSYMBOL        = new InternedOpCode(1, 'REFSYMBOL'),
      REGEXP           = new StandardOpCode(1, 'REGEXP'),
      RETURN           = new StandardOpCode(0, 'RETURN'),
      ROTATE           = new StandardOpCode(1, 'ROTATE'),
      SAVE             = new StandardOpCode(0, 'SAVE'),
      SPREAD           = new StandardOpCode(1, 'SPREAD'),
      SPREAD_ARG       = new StandardOpCode(0, 'SPREAD_ARG'),
      SPREAD_ARRAY     = new StandardOpCode(1, 'SPREAD_ARRAY'),
      STRING           = new InternedOpCode(1, 'STRING'),
      SUPER_CALL       = new StandardOpCode(0, 'SUPER_CALL'),
      SUPER_ELEMENT    = new StandardOpCode(0, 'SUPER_ELEMENT'),
      SUPER_MEMBER     = new StandardOpCode(1, 'SUPER_MEMBER'),
      SYMBOL           = new InternedOpCode(3, 'SYMBOL'),
      TEMPLATE         = new StandardOpCode(1, 'TEMPLATE'),
      THIS             = new StandardOpCode(0, 'THIS'),
      THROW            = new StandardOpCode(0, 'THROW'),
      UNARY            = new StandardOpCode(1, 'UNARY'),
      UNDEFINED        = new StandardOpCode(0, 'UNDEFINED'),
      UPDATE           = new StandardOpCode(1, 'UPDATE'),
      UPSCOPE          = new StandardOpCode(0, 'UPSCOPE'),
      VAR              = new StandardOpCode(1, 'VAR'),
      WITH             = new StandardOpCode(0, 'WITH'),
      YIELD            = new StandardOpCode(1, 'YIELD');

  var ASSIGN = macro('ASSIGN', REF, [ROTATE, 1], PUT, POP);


  var Code = exports.code = (function(){
    var Directive = (function(){
      function Directive(op, args){
        this.op = op;
        this.loc = currentNode.loc;
        this.range = currentNode.range;
        for (var i=0; i < op.params; i++) {
          this[i] = args[i];
        }
      }

      define(Directive.prototype, [
        function inspect(){
          var out = [];
          for (var i=0; i < this.op.params; i++) {
            out.push(util.inspect(this[i]));
          }
          return util.inspect(this.op)+'('+out.join(', ')+')';
        }
      ]);

      return Directive;
    })();

    var Params = (function(){
      function Params(node){
        this.length = 0;
        if (node.params) {
          pushAll(this, node.params)
          this.boundNames = boundNames(node.params);
        } else {
          this.boundNames = [];
        }
        this.Rest = node.rest;
        this.ExpectedArgumentCount = this.boundNames.length;
        if (node.rest) {
          this.boundNames.push(node.rest.name);
        }
        if (node.defaults) {
          this.defaults = node.defaults;
        }
      }

      define(Params, [
        function add(items){

        }
      ]);
      return Params;
    })();

    function Code(node, source, type, scope, strict){
      function Instruction(opcode, args){
        Directive.call(this, opcode, args);
      }

      inherit(Instruction, Directive, {
        code: this
      });

      var body = node;

      this.flags = {};
      if (node.type === 'Program') {
        this.flags.topLevel = true;
        this.imports = getImports(node);
      } else {
        this.flags.topLevel = false;
        body = body.body;
        if (node.type === 'ModuleDeclaration') {
          this.imports = getImports(body);
          body = body.body;
        }
      }

      this.path = [];


      define(this, {
        body: body,
        source: source == null ? context.code.source : source,
        children: [],
        createDirective: function(opcode, args){
          var op = new Instruction(opcode, args);
          this.ops.push(op);
          return op;
        }
      });

      this.range = node.range;
      this.loc = node.loc;
      this.lexicalDecls = lexicalDecls(body);


      if (node.id) {
        this.name = node.id.name;
      }

      if (node.generator) {
        this.flags.generator = true;
      }


      this.transfers = [];
      this.scopeType = scope;
      this.lexicalType = type || FUNCTYPE.NORMAL;
      this.varDecls = [];
      this.flags.usesSuper = ReferencesSuper(this.body);
      this.flags.strict = strict || (context.code && context.code.flags.strict) || isstrict(this.body);
      if (scope === SCOPE.MODULE) {
        this.exportedNames = getExports(this.body);
        this.flags.strict = true;
      }
      this.ops = [];
      if (node.params) {
        this.params = new Params(node);
      }
    }


    define(Code.prototype, [
      function derive(code){
        if (code) {
          this.strings = code.strings;
          this.hash = code.hash;
          this.natives = code.natives;
        }
      },
      function lookup(id){
        return id;
        // if (typeof id === 'number') {
        //   return this.strings[id];
        // } else {
        //   return id;
        // }
      }
    ]);

    return Code;
  })();


  var ClassDefinition = (function(){
    function ClassDefinition(node){
      var self = this;
      this.name = node.id ? node.id.name : null;
      this.methods = [];
      this.symbols = [[], []];

      each(node.body.body, function(node){
        if (node.type === 'SymbolDeclaration') {
          self.defineSymbols(node);
        } else {
          self.defineMethod(node);
        }
      });

      if (node.superClass) {
        recurse(node.superClass);
        GET();
        this.superClass = node.superClass.name;
      }
    }

    define(ClassDefinition.prototype, [
      function defineSymbols(node){
        var isPublic = node.kind !== 'private',
            self = this;

        each(node.declarations, function(decl){
          var name = decl.id.name;
          self.symbols[0].push(name);
          self.symbols[1].push(isPublic);
        });
      },
      function defineMethod(node){
        var code = new Code(node.value, context.source, FUNCTYPE.METHOD, SCOPE.CLASS, context.code.flags.strict),
            name = code.name = symbol(node.key);

        context.queue(code);
        code.displayName = this.name ? this.name+'#'+name.join('') : name.join('');
        if (!name[0]) name = name[1];
        node.kind = node.kind || 'method';

        if (name === 'constructor') {
          this.ctor = code;
        } else {
          this.methods.push({
            kind: node.kind,
            code: code,
            name: name
          });
        }
      }
    ]);

    return ClassDefinition;
  })();

  var Unwinder = (function(){
    function Unwinder(type, begin, end){
      this.type = type;
      this.begin = begin;
      this.end = end;
    }

    define(Unwinder.prototype, [
      function toJSON(){
        return [this.type, this.begin, this.end];
      }
    ]);

    return Unwinder;
  })();

  var ControlTransfer = (function(){
    function ControlTransfer(labels){
      this.labels = labels;
      this.breaks = [];
      this.continues = [];
    }

    define(ControlTransfer.prototype, {
      labels: null,
      breaks: null,
      continues: null
    });

    define(ControlTransfer.prototype, [
      function updateContinues(ip){
        if (ip !== undefined) {
          each(this.continues, function(item){ item[0] = ip });
        }
      },
      function updateBreaks(ip){
        if (ip !== undefined) {
          each(this.breaks, function(item){ item[0] = ip });
        }
      }
    ]);

    return ControlTransfer;
  })();



  function isSuperReference(node) {
    return !!node && node.type === 'Identifier' && node.name === 'super';
  }

  function isUsestrictDirective(node){
    return node.type === 'ExpressionSatatement'
        && node.expression.type === 'Literal'
        && node.expression.value === 'use strict';
  }

  function isPattern(node){
    return !!node && node.type === 'ObjectPattern' || node.type === 'ArrayPattern';
  }

  function isLexicalDeclaration(node){
    return !!node && node.type === 'VariableDeclaration' && node.kind !== 'var';
  }

  function isFunction(node){
    return node.type === 'FunctionDeclaration'
        || node.type === 'FunctionExpression'
        || node.type === 'ArrowFunctionExpression';
  }

  function isDeclaration(node){
    return node.type === 'FunctionDeclaration'
        || node.type === 'ClassDeclaration'
        || node.type === 'VariableDeclaration';
  }

  function isAnonymousFunction(node){
    return !!node && !(node.id && node.id.name)
        && node.type === 'FunctionExpression'
        || node.type === 'ArrowFunctionExpression';
  }

  function isstrict(node){
    if (isFunction(node)) {
      node = node.body.body;
    } else if (node.type === 'Program') {
      node = node.body;
    }
    if (node instanceof Array) {
      for (var i=0, element; element = node[i]; i++) {
        if (isUsestrictDirective(element)) {
          return true;
        } else if (element.type !== 'EmptyStatement' && element.type !== 'FunctionDeclaration') {
          return false;
        }
      }
    }
    return false;
  }


  var boundNamesCollector = collector({
    ObjectPattern      : 'properties',
    ArrayPattern       : 'elements',
    VariableDeclaration: 'declarations',
    BlockStatement     : walk.RECURSE,
    Program            : walk.RECURSE,
    ForStatement       : walk.RECURSE,
    Property           : 'value',
    ExportDeclaration  : 'declaration',
    ExportSpecifierSet : 'specifiers',
    ImportDeclaration  : 'specifiers',
    Identifier         : ['name'],
    ImportSpecifier    : 'id',
    VariableDeclarator : 'id',
    ModuleDeclaration  : 'id',
    SpreadElement      : 'argument',
    FunctionDeclaration: 'id',
    ClassDeclaration   : 'id'
  });


  function boundNames(node){
    return boundNamesCollector(node);
  }


  var lexicalDecls = (function(lexical){
    return collector({
      ClassDeclaration: lexical(false),
      FunctionDeclaration: lexical(false),
      ExportDeclaration: walk.RECURSE,
      SwitchCase: walk.RECURSE,
      Program: walk.RECURSE,
      VariableDeclaration: lexical(function(node){
        return node.kind === 'const';
      })
    });
  })(function(isConst){
    if (typeof isConst !== 'function') {
      isConst = (function(v){
        return function(){ return v };
      })(isConst);
    }
    return function(node){
      node.IsConstantDeclaration = isConst(node);
      node.boundNames || (node.boundNames = boundNames(node));
      if (node.kind !== 'var') {
        return node;
      }
    };
  });

  var varDecls = collector({
    VariableDeclaration: function(node){
      if (node.type === 'var') {
        return node;
      }
    },
    BlockStatement: walk.RECURSE,
    IfStatement: walk.RECURSE,
    ForStatement: walk.RECURSE,
    ForOfStatement: walk.RECURSE,
    ForInStatement: walk.RECURSE,
    DoWhileStatement: walk.RECURSE,
    WhileStatement: walk.RECURSE,
    ExportDeclaration: walk.RECURSE,
    CatchClause: walk.RECURSE,
    SwitchCase: walk.RECURSE,
    SwitchStatement: walk.RECURSE,
    TryStatement: walk.RECURSE,
    WithStatement: walk.RECURSE
  });

  function VarScopedDeclarations(node){
    var decls = varDecls(node);
    each(node.body, function(statement){
      if (statement.type === 'FunctionDeclaration') {
        decls.push(statement);
      }
    });

    return decls;
  }


  function FunctionDeclarationInstantiation(code){
    var varDeclarations = VarScopedDeclarations(code.body),
        len = varDeclarations.length,
        argumentsObjectNotNeeded = false

    while (len--) {
      var decl = varDeclarations[len];
      if (decl.type === 'FunctionDeclaration') {
        decl.boundNames || (decl.boundNames = boundNames(decl));
        var name = decl.boundNames[0];
        if (name === 'arguments') {
          argumentsObjectNotNeeded = true;
        }

      }

    }
  }

  var getExports = (function(){
    var collectExportDecls = collector({
      Program          : 'body',
      BlockStatement   : 'body',
      ExportDeclaration: true
    });

    var getExportedDecls = collector({
      ClassDeclaration   : true,
      ExportDeclaration  : walk.RECURSE,
      ExportSpecifier    : true,
      ExportSpecifierSet : walk.RECURSE,
      FunctionDeclaration: true,
      ModuleDeclaration  : true,
      VariableDeclaration: walk.RECURSE,
      VariableDeclarator : true
    });


    var getexportedNames = collector({
      ArrayPattern       : 'elements',
      ObjectPattern      : 'properties',
      Property           : 'value',
      ClassDeclaration   : 'id',
      ExportSpecifier    : 'id',
      FunctionDeclaration: 'id',
      ModuleDeclaration  : 'id',
      VariableDeclarator : 'id',
      Glob               : true,
      Identifier         : ['name']
    });

    return function getExports(node){
      return getexportedNames(getExportedDecls(collectExportDecls(node)));
    };
  })();


  var getImports = (function(){
    var collectImportDecls = collector({
      Program          : 'body',
      BlockStatement   : 'body',
      ImportDeclaration: true,
      ModuleDeclaration: true
    });

    function Import(origin, name, specifiers){
      this.origin = origin;
      this.name = name;
      this.specifiers = specifiers;
    }

    var handlers = {
      Glob: function(){
        return ['*', '*'];
      },
      Path: function(node){
        return map(node.body, function(subpath){
          return handlers[subpath.type](subpath);
        });
      },
      ImportSpecifier: function(node){
        var name = handlers[node.id.type](node.id);
        var from = node.from === null ? name : handlers[node.from.type](node.from);
        return [name, from];
      },
      Identifier: function(node){
        return node.name;
      },
      Literal: function(node){
        return node.value;
      }
    };

    return function getImports(node){
      var decls = collectImportDecls(node),
          imported = [];

      each(decls, function(decl, i){
        if (decl.body) {
          var origin = name = decl.id.name;
          var specifiers = decl;
        } else {
          var origin = handlers[decl.from.type](decl.from);

          if (decl.type === 'ModuleDeclaration') {
            var name = decl.id.name;
          } else {
            var specifiers = new Hash;
            each(decl.specifiers, function(specifier){
              var result = handlers[specifier.type](specifier);
              result = typeof result === 'string' ? [result, result] : result;
              if (!(result[1] instanceof Array)) {
                result[1] = [result[1]];
              }
              specifiers[result[0]] = result[1];
            });
          }
        }

        imported.push(new Import(origin, name, specifiers));
      });

      return imported;
    };
  })();


  var reducer = (function(){
    function convert(node){
      var handler = handlers[node.type];
      if (handler) return handler(node);
    }
    var handlers = {
      ArrayPattern: function(node){
        return map(node.elements, convert);
      },
      Identifier: function(node){
        return node.name;
      },
      Literal: function(node){
        return node.value;
      },
      ObjectPattern: function(node){
        var out = {};
        each(node.properties, function(prop){
          out[convert(prop.key)] = convert(prop.value);
        });
        return out;
      },
      FunctionDeclaration: function(node){
        return map(node.params, convert);
      },
      Program: function(node){
        var out = {
          functions: [],
          vars: []
        };
        each(node.body, function(node){
          if (node.type === 'FunctionDeclaration') {
            out.functions.push({ name: convert(node.id), params: convert(node) });
          } else if (node.type === 'VariableDeclaration' && node.kind === 'var') {
            each(node.declarations, function(decl){

              out.vars.push(convert(decl.id));
            });
          }
        });
        return out;
      }
    };

    return convert;
  })();


  var annotateTailPosition = (function(){
    var RECURSE = walk.RECURSE;

    function set(name, value){
      return function(obj){
        obj && (obj[name] = value);
      };
    }

    function either(consequent, alternate){
      return function(test){
        return test ? consequent : alternate;
      };
    }

    function copier(field){
      return function(a, b){
        a && b && (b[field] = a[field]);
      };
    }


    var isWrapped = set('wrapped', true),
        isntWrapped = set('wrapped', false),
        isTail = set('tail', true),
        isntTail = set('tail', false),
        wrap = either(isWrapped, isntWrapped),
        tail = either(isTail, isntTail),
        copyWrap = copier('wrapped'),
        copyTail = copier('tail');


    var tailVisitor = new Visitor([
      function __noSuchHandler__(node){
        return RECURSE;
      },
      //function ArrayExpression(node){},
      //function ArrayPattern(node){},
      function ArrowFunctionExpression(node){
        isntWrapped(node.body);
        this.push(node.body);
      },
      //function AssignmentExpression(node){},
      //function AtSymbol(node){},
      //function BinaryExpression(node){},
      function BlockStatement(node){
        each(node.body, wrap(node.wrapped));
        return RECURSE;
      },
      //function BreakStatement(node){},
      //function CallExpression(node){},
      function CatchClause(node){
        copyWrap(node, node.body);
        return RECURSE;
      },
      //function ClassBody(node){},
      //function ClassDeclaration(node){},
      //function ClassExpression(node){},
      //function ClassHeritage(node){},
      //function ComprehensionBlock(node){},
      //function ComprehensionExpression(node){},
      function ConditionalExpression(node){
        each(node, tail(node.tail));
        each(node, wrap(node.wrapped));
        return RECURSE;
      },
      //function ContinueStatement(node){},
      //function DebuggerStatement(node){},
      function DoWhileStatement(node){
        each(node, isntTail);
        copyWrap(node, node.body);
        return RECURSE;
      },
      //function EmptyStatement(node){},
      //function ExportDeclaration(node){},
      //function ExportSpecifier(node){},
      //function ExportSpecifierSet(node){},
      function ExpressionStatement(node){
        copyWrap(node, node.expression);
        return RECURSE;
      },
      function ForInStatement(node){
        copyWrap(node, node.body);
        return RECURSE;
      },
      function ForOfStatement(node){
        copyWrap(node, node.body);
        return RECURSE;
      },
      function ForStatement(node){
        copyWrap(node, node.body);
        return RECURSE;
      },
      function FunctionDeclaration(node){
        isntWrapped(node.body);
        this.push(node.body);
      },
      function FunctionExpression(node){
        isntWrapped(node.body);
        this.push(node.body);
      },
      //function Glob(node){},
      //function Identifier(node){},
      function IfStatement(node){
        copyWrap(node, node.consequent);
        copyWrap(node, node.alternate);
        return RECURSE;
      },
      //function ImportDeclaration(node){},
      //function ImportSpecifier(node){},
      function LabeledStatement(node){
        copyWrap(node, node.statement);
        return RECURSE;
      },
      //function Literal(node){},
      //function LogicalExpression(node){},
      //function MemberExpression(node){},
      //function MethodDefinition(node){},
      function ModuleDeclaration(node){
        node.body && each(node.body, isntWrapped);
        return RECURSE;
      },
      //function NewExpression(node){},
      //function ObjectExpression(node){},
      //function ObjectPattern(node){},
      //function Path(node){},
      function Program(node){
        each(node.body, isntWrapped);
        return RECURSE;
      },
      //function Property(node){},
      function ReturnStatement(node){
        tail(!node.wrapped)(node.argument);
        return RECURSE;
      },
      function SequenceExpression(node){
        each(node.expression, wrap(node.wrapped));
        copyTail(node, node.expressions[node.expressions.length - 1]);
        return RECURSE;
      },
      //function SpreadElement(node){},
      function SwitchCase(node){
        each(node.consequent, wrap(node.wrapped))
        return RECURSE;
      },
      function SwitchStatement(node){
        each(node.cases, wrap(node.wrapped));
        return RECURSE;
      },
      //function SymbolDeclaration(node){},
      //function SymbolDeclarator(node){},
      //function TaggedTemplateExpression(node){},
      //function TemplateElement(node){},
      //function TemplateLiteral(node){},
      //function ThisExpression(node){},
      //function ThrowStatement(node){ },
      function TryStatement(node){
        isWrapped(node.block);
        each(node.handlers, wrap(node.finalizer || node.wrapped));
        isntWrapped(node.finalizer);
        return RECURSE;
      },
      //function UnaryExpression(node){},
      //function UpdateExpression(node){},
      //function VariableDeclaration(node){},
      //function VariableDeclarator(node){ },
      function WhileStatement(node){
        copyWrap(node, node.body);
        return RECURSE;
      },
      function WithStatement(node){
        copyWrap(node, node.body);
        return RECURSE;
      }
      //function YieldExpression(node){},
    ]);

    return function annotateTailPosition(node){
      tailVisitor.visit(node);
      return node;
    };
  })();


  function ReferencesSuper(node){
    var found = false;
    walk(node, function(node){
      switch (node.type) {
        case 'MemberExpression':
          if (isSuperReference(node.object)) {
            found = true;
            return walk.BREAK;
          }
          return walk.RECURSE;
        case 'CallExpression':
          if (isSuperReference(node.callee)) {
            found = true;
            return walk.BREAK;
          }
          return walk.RECURSE;
        case 'FunctionExpression':
        case 'FunctionDeclaration':
        case 'ArrowFunctionExpression':
          return walk.CONTINUE;
        default:
          return walk.RECURSE;
      }
    });
    return found;
  }



  var currentNode;
  function recurse(node){
    if (node) {
      if (node.type) {
        var lastNode = currentNode;
        currentNode = node;
        handlers[node.type](node);
        if (lastNode) {
          currentNode = lastNode;
        }
      } else if (node.length) {
        each(node, recurse);
      }
    }
  }


  function intern(str){
    return str;//context.intern(string);
  }

  function current(){
    return context.code.ops.length;
  }

  function last(){
    return context.code.ops[context.code.ops.length - 1];
  }

  function pop(){
    return context.code.ops.pop();
  }

  function adjust(op){
    if (op) {
      return op[0] = context.code.ops.length;
    }
  }

  function symbol(node){
    if (node.type === 'AtSymbol') {
      return ['@', node.name];
    } else if (node.type === 'Literal') {
      return ['', node.value];
    } else {
      return ['', node.name];
    }
  }


  function block(callback){
      var entry = new ControlTransfer(context.labels);
      context.jumps.push(entry);
      context.labels = new Hash;
      callback();
      entry.updateBreaks(current());
      context.jumps.pop();
  }

  function control(callback){
    var entry = new ControlTransfer(context.labels);
    context.jumps.push(entry);
    context.labels = new Hash;
    entry.updateContinues(callback());
    entry.updateBreaks(current());
    context.jumps.pop();
  }

  function lexical(type, callback){
    if (typeof type === 'function') {
      callback = type;
      type = ENTRY.ENV;
    }
    var begin = current();
    callback();
    context.code.transfers.push(new Unwinder(type, begin, current()));
  }

  function move(node, set, pos){
    if (node.label) {
      var transfer = context.jumps.first(function(transfer){
        return node.label.name in transfer.labels;
      });

    } else {
      var transfer = context.jumps.first(function(transfer){
        return transfer && transfer.continues;
      });
    }
    transfer && transfer[set].push(pos);
  }

  var elementAt = {
    elements: function(node, index){
      return node.elements[index];
    },
    properties: function(node, index){
      return node.properties[index].value;
    }
  };

  function destructure(left, STORE){
    var key = left.type === 'ArrayPattern' ? 'elements' : 'properties';

    each(left[key], function(item, i){
      if (!item) return;
      DUP();
      if (item.type === 'Property') {
        MEMBER(symbol(item.key));
        GET();
        if (isPattern(item.value)) {
          destructure(item.value, STORE);
        } else {
          STORE(item.key.name);
        }
      } else if (item.type === 'ArrayPattern') {
        LITERAL(i);
        ELEMENT();
        GET();
        destructure(item, STORE);
      } else if (item.type === 'Identifier') {
        LITERAL(i);
        ELEMENT();
        GET();
        STORE(item.name);
      } else if (item.type === 'SpreadElement') {
        GET();
        SPREAD(i);
        STORE(item.argument.name);
      }
    });
  }


  function args(node){
    ARGS();
    each(node, function(item, i){
      if (item && item.type === 'SpreadElement') {
        recurse(item.argument);
        GET();
        SPREAD_ARG();
      } else {
        recurse(item);
        GET();
        ARG();
      }
    });
  }

  function isGlobalOrEval(){
    return context.code.scopeType === SCOPE.EVAL || context.code.scopeType === SCOPE.GLOBAL;
  }


  function AssignmentExpression(node){
    if (node.operator === '='){
      if (isPattern(node.left)){
        recurse(node.right);
        GET();
        destructure(node.left, ASSIGN);
      } else {
        recurse(node.left);
        recurse(node.right);
        GET();
        PUT();
      }
    } else {
      recurse(node.left);
      DUP();
      GET();
      recurse(node.right);
      GET();
      BINARY(BINARYOPS[node.operator.slice(0, -1)]);
      PUT();
    }
  }

  function ArrayExpression(node){
    ARRAY();
    var holes = 0;
    each(node.elements, function(item){
      if (!item){
        holes++;
      } else if (item.type === 'SpreadElement'){
        recurse(item.argument);
        GET();
        SPREAD_ARRAY(holes);
        holes = 0;
      } else {
        recurse(item);
        GET();
        INDEX(holes);
        holes = 0;
      }
    });
    ARRAY_DONE();
  }

  function ArrayPattern(node){}

  function ArrowFunctionExpression(node, name){
    var code = new Code(node, null, FUNCTYPE.ARROW, SCOPE.FUNCTION);
    if (name) {
      code.name = name.name || name;
    }
    context.queue(code);
    FUNCTION(null, code);
    return code;
  }

  function AtSymbol(node){
    REFSYMBOL(node.name);
  }

  function BinaryExpression(node){
    recurse(node.left);
    GET();
    recurse(node.right);
    GET();
    BINARY(BINARYOPS[node.operator]);
  }

  function BreakStatement(node){
    move(node, 'breaks', JUMP(0));
  }

  function BlockStatement(node){
    block(function(){
      lexical(function(){
        BLOCK(lexicalDecls(node.body));
        each(node.body, recurse);
        UPSCOPE();
      });
    });
  }

  function CallExpression(node){
    if (isSuperReference(node.callee)) {
      if (context.code.scopeType !== SCOPE.FUNCTION) {
        context.earlyError(node, 'illegal_super');
      }
      SUPER_CALL();
    } else {
      recurse(node.callee);
    }
    DUP();
    GET();
    args(node.arguments);
    (node.callee.type === 'NativieIdentifier' ? NATIVE_CALL : CALL)(!!node.tail);
  }

  function CatchClause(node){
    lexical(function(){
      var decls = lexicalDecls(node.body);
      decls.push({
        type: 'VariableDeclaration',
        kind: 'let',
        IsConstantDeclaration: false,
        boundNames: [node.param.name],
        declarations: [{
          type: 'VariableDeclarator',
          id: node.param,
          init: undefined
        }]
      });
      BLOCK(decls);
      recurse(node.param);
      PUT();
      each(node.body.body, recurse);
      UPSCOPE();
    });
  }

  function ClassBody(node){}

  function ClassDeclaration(node){
    CLASS_DECL(new ClassDefinition(node));
  }

  function ClassExpression(node){
    CLASS_EXPR(new ClassDefinition(node));
  }

  function ClassHeritage(node){}

  function ConditionalExpression(node){
    recurse(node.test);
    GET();
    var test = IFEQ(0, false);
    recurse(node.consequent)
    GET();
    var alt = JUMP(0);
    adjust(test);
    recurse(node.alternate);
    GET();
    adjust(alt);
  }

  function ContinueStatement(node){
    move(node, 'continues', JUMP(0));
  }

  function DoWhileStatement(node){
    control(function(){
      var start = current();
      recurse(node.body);
      var cond = current();
      recurse(node.test);
      GET();
      IFEQ(start, true);
      return cond;
    });
  }

  function DebuggerStatement(node){
    DEBUGGER();
  }

  function EmptyStatement(node){}

  function ExportSpecifier(node){}

  function ExportSpecifierSet(node){}

  function ExportDeclaration(node){
    if (node.declaration) {
      recurse(node.declaration);
    }
  }

  function ExpressionStatement(node){
    recurse(node.expression);
    GET();
    isGlobalOrEval() ? SAVE() : POP();
  }

  function ForStatement(node){
    control(function(){
      lexical(function(){
        var init = node.init;
        if (init){
          var isLexical = isLexicalDeclaration(init);
          if (isLexical) {
            var scope = BLOCK([]);
            recurse(init);
            var decl = init.declarations[init.declarations.length - 1].id;
            scope[0] = boundNames(decl);
            var lexicalDecl = {
              type: 'VariableDeclaration',
              kind: init.kind,
              declarations: [{
                type: 'VariableDeclarator',
                id: decl,
                init: null
              }]
            };
            lexicalDecl.boundNames = boundNames(lexicalDecl);
            recurse(decl);
          } else {
            recurse(init);
            GET();
            POP();
          }
        }

        var test = current();

        if (node.test) {
          recurse(node.test);
          GET();
          var op = IFEQ(0, false);
        }

        var update = current();

        if (node.body.body && decl) {
          block(function(){
            lexical(function(){
              var lexicals = lexicalDecls(node.body.body);
              lexicals.push(lexicalDecl);
              GET();
              BLOCK(lexicals);
              recurse(decl);
              ROTATE(1);
              PUT();
              each(node.body.body, recurse);
              UPSCOPE();
            });
          });
        } else {
          recurse(node.body);
        }

        if (node.update) {
          recurse(node.update);
          GET();
          POP();
        }

        JUMP(test);
        adjust(op);
        isLexical && UPSCOPE();
        return update;
      });
    });
  }

  function ForInStatement(node){
    iter(node, ENUM);
  }

  function ForOfStatement(node){
    iter(node, ITERATE);
  }

  function iter(node, KIND){
    control(function(){
      var update;
      lexical(ENTRY.FOROF, function(){
        recurse(node.right);
        GET();
        KIND();
        MEMBER('next');
        update = current();
        DUP();
        DUP();
        GET();
        ARGS();
        CALL();
        if (isLexicalDeclaration(node.left)) {
          block(function(){
            lexical(function(){
              BLOCK(lexicalDecls(node.left));
              VariableDeclaration(node.left, true);
              recurse(node.body);
              UPSCOPE();
            });
          });
        } else {
          if (node.left.type === 'VariableDeclaration') {
            VariableDeclaration(node.left, true);
          } else {
            recurse(node.left);
            ROTATE(1);
            PUT();
            POP();
          }
          recurse(node.body);
        }
        JUMP(update);
      });
      return update;
    });
  }

  function FunctionDeclaration(node){
    node.code = new Code(node, null, FUNCTYPE.NORMAL, SCOPE.FUNCTION);
    context.queue(node.code);
  }

  function FunctionExpression(node, methodName){
    var code = new Code(node, null, FUNCTYPE.NORMAL, SCOPE.FUNCTION);
    if (methodName) {
      code.name = methodName.name || methodName;
    }
    context.queue(code);
    FUNCTION(intern(node.id ? node.id.name : ''), code);
    return code;
  }

  function Glob(node){}

  function Identifier(node){
    REF(node.name);
  }

  function IfStatement(node){
    recurse(node.test);
    GET();
    var test = IFEQ(0, false);
    recurse(node.consequent);

    if (node.alternate) {
      var alt = JUMP(0);
      adjust(test);
      recurse(node.alternate);
      adjust(alt);
    } else {
      adjust(test);
    }
  }

  function ImportDeclaration(node){}

  function ImportSpecifier(node){}

  function Literal(node){
    if (node.value instanceof RegExp) {
      REGEXP(node.value);
    } else if (typeof node.value === 'string') {
      STRING(node.value);
    } else {
      LITERAL(node.value);
    }
  }

  function LabeledStatement(node){
    if (!context.labels){
      context.labels = new Hash;
    } else if (label in context.labels) {
      context.earlyError(node, 'duplicate_label');
    }
    context.labels[node.label.name] = true;
    recurse(node.body);
    context.labels = null;
  }

  function LogicalExpression(node){
    recurse(node.left);
    GET();
    var op = IFNE(0, node.operator === '||');
    recurse(node.right);
    GET();
    adjust(op);
  }

  function MemberExpression(node){
    var isSuper = isSuperReference(node.object);
    if (isSuper){
      if (context.code.scopeType !== SCOPE.FUNCTION) {
        context.earlyError(node, 'illegal_super_reference');
      }
    } else {
      recurse(node.object);
      GET();
    }

    if (node.computed){
      recurse(node.property);
      GET();
      isSuper ? SUPER_ELEMENT() : ELEMENT();
    } else {
      isSuper ? SUPER_MEMBER() : MEMBER(symbol(node.property));
    }
  }

  function MethodDefinition(node){}

  function ModuleDeclaration(node){
    if (node.body) {
      node.code = new Code(node, null, FUNCTYPE.NORMAL, SCOPE.MODULE);
      node.code.path = context.code.path.concat(node.id.name);
      context.queue(node.code);
    }
  }

  function NativeIdentifier(node){
    NATIVE_REF(node.name);
  }

  function NewExpression(node){
    recurse(node.callee);
    GET();
    args(node.arguments);
    CONSTRUCT();
  }

  function ObjectExpression(node){
    OBJECT();
    each(node.properties, recurse);
  }

  function ObjectPattern(node){}

  function Path(node){}

  function Program(node){
    each(node.body, recurse);
  }

  function Property(node){
    var value = node.value;
    if (node.kind === 'init'){
      var key = node.key.type === 'Identifier' ? node.key : node.key.value;
      if (node.method) {
        FunctionExpression(value, intern(key));
      } else if (isAnonymousFunction(value)) {
        var Expr = node.type === 'FunctionExpression' ? FunctionExpression : ArrowFunctionExpression;
        var code = Expr(value, key);
        code.flags.writableName = true;
      } else {
        recurse(value);
      }
      GET();
      PROPERTY(symbol(node.key));
    } else {
      var code = new Code(value, null, FUNCTYPE.NORMAL, SCOPE.FUNCTION);
      context.queue(code);
      METHOD(node.kind, code, symbol(node.key));
    }
  }

  function ReturnStatement(node){
    if (node.argument){
      recurse(node.argument);
      GET();
    } else {
      UNDEFINED();
    }

    RETURN();
  }

  function SequenceExpression(node){
    each(node.expressions, function(item, i, a){
      recurse(item)
      GET();
      if (i < a.length - 1) {
        POP();
      }
    });
  }

  function SwitchStatement(node){
    control(function(){
      recurse(node.discriminant);
      GET();

      lexical(function(){
        BLOCK(lexicalDecls(node.cases));

        if (node.cases){
          var cases = [];
          each(node.cases, function(item, i){
            if (item.test){
              recurse(item.test);
              GET();
              cases.push(CASE(0));
            } else {
              var defaultFound = i;
              cases.push(0);
            }
          });

          if (defaultFound != null){
            DEFAULT(cases[defaultFound]);
          } else {
            POP();
            var last = JUMP(0);
          }

          each(node.cases, function(item, i){
            adjust(cases[i])
            each(item.consequent, recurse);
          });

          if (last) {
            adjust(last);
          }
        } else {
          POP();
        }

        UPSCOPE();
      });
    });
  }


  function SymbolDeclaration(node){
    // TODO early errors for duplicates
    var symbols = node.AtSymbols = [],
        pub = node.kind === 'symbol';

    each(node.declarations, function(item){
      var init = item.init;
      if (init) {
        recurse(init);
        GET();
      }

      SYMBOL(item.id.name, pub, !!init);
      symbols.push(item.id.name);
    });
  }

  function SymbolDeclarator(node){}

  function TemplateElement(node){}

  function TemplateLiteral(node, tagged){
    each(node.quasis, function(element, i){
      STRING(element.value.raw);
      if (!element.tail) {
        recurse(node.expressions[i]);
        GET();
        BINARY(BINARYOPS['string+']);
      }
      if (i) {
        BINARY(BINARYOPS['string+']);
      }
    });
  }

  function TaggedTemplateExpression(node){
    var template = [];
    each(node.quasi.quasis, function(element){
      template.push(element.value);
    });

    UNDEFINED();
    recurse(node.tag);
    GET();
    ARGS();
    TEMPLATE(template);
    GET();
    ARG();
    each(node.quasi.expressions, function(node){
      recurse(node);
      GET();
      ARG();
    });
    CALL();
  }

  function ThisExpression(node){
    THIS();
  }

  function ThrowStatement(node){
    recurse(node.argument);
    GET();
    THROW();
  }

  function TryStatement(node){
    lexical(ENTRY.TRYCATCH, function(){
      recurse(node.block);
    });

    var tryer = JUMP(0),
        handlers = [];

    for (var i=0, handler; handler = node.handlers[i]; i++) {
      recurse(handler);
      if (i < node.handlers.length - 1) {
        handlers.push(JUMP(0));
      }
    }

    adjust(tryer);
    while (i--) {
      handlers[i] && adjust(handlers[i]);
    }

    if (node.finalizer) {
      recurse(node.finalizer);
    }
  }

  function UnaryExpression(node){
    recurse(node.argument);
    UNARY(UNARYOPS[node.operator]);
  }

  function UpdateExpression(node){
    recurse(node.argument);
    UPDATE(!!node.prefix | ((node.operator === '++') << 1));
  }


  function VariableDeclaration(node, forin){
    var DECLARE = {
      'var': VAR,
      'const': CONST,
      'let': LET
    }[node.kind];


    each(node.declarations, function(item){
      if (node.kind === 'var') {
        pushAll(context.code.varDecls, boundNames(item.id));
      }

      if (item.init) {
        if (item.id && item.id.type === 'Identifier' && isAnonymousFunction(item.init)) {
          var Expr = node.type === 'FunctionExpression' ? FunctionExpression : ArrowFunctionExpression;
          recurse(item.id);
          var code = Expr(item.init, item.id.name);
          code.flags.writableName = true;
        } else {
          recurse(item.init);
          GET();
        }
      } else if (!forin) {
        UNDEFINED();
      }
      if (isPattern(item.id)){
        destructure(item.id, DECLARE);
        POP();
      } else {
        DECLARE(item.id.name);
      }
    });
  }

  function VariableDeclarator(node){}

  function WhileStatement(node){
    control(function(){
      var start = current();
      recurse(node.test);
      GET();
      var op = IFEQ(0, false)
      recurse(node.body);
      JUMP(start);
      adjust(op);
      return start;
    });
  }

  function WithStatement(node){
    recurse(node.object)
    lexical(function(){
      WITH();
      recurse(node.body);
      UPSCOPE();
    });
  }

  function YieldExpression(node){
    if (node.argument){
      recurse(node.argument);
      GET();
    } else {
      UNDEFINED();
    }

    YIELD(node.delegate);
  }

  var handlers = {};

  each([ArrayExpression, ArrayPattern, ArrowFunctionExpression, AssignmentExpression,
    AtSymbol, BinaryExpression, BlockStatement, BreakStatement, CallExpression, CatchClause,
    ClassBody, ClassDeclaration, ClassExpression, ClassHeritage, ConditionalExpression,
    DebuggerStatement, DoWhileStatement, EmptyStatement, ExportDeclaration, ExportSpecifier,
    ExportSpecifierSet, ExpressionStatement, ForInStatement, ForOfStatement, ForStatement,
    FunctionDeclaration, FunctionExpression, Glob, Identifier, IfStatement, ImportDeclaration,
    ImportSpecifier, LabeledStatement, Literal, LogicalExpression, MemberExpression, MethodDefinition,
    ModuleDeclaration, NativeIdentifier, NewExpression, ObjectExpression, ObjectPattern, Path, Program,
    Property, ReturnStatement, SequenceExpression, SwitchStatement, SymbolDeclaration, SymbolDeclarator,
    TaggedTemplateExpression, TemplateElement, TemplateLiteral, ThisExpression, ThrowStatement,
    TryStatement, UnaryExpression, UpdateExpression, VariableDeclaration, VariableDeclarator,
    WhileStatement, WithStatement, YieldExpression],
    function(handler){
    handlers[fname(handler)] = handler;
  });




  var Assembler = exports.Assembler = (function(){
    function annotateParent(node, parent){
      walk(node, function(node){
        if (isObject(node) && parent) {
          define(node, 'parent', parent);
        }
        return walk.RECURSE;
      });
    }

    function reinterpretNatives(node){
      walk(node, function(node){
        if (node.type === 'Identifier' && /^\$__/.test(node.name)) {
          node.type = 'NativeIdentifier';
          node.name = node.name.slice(3);
        } else {
          return walk.RECURSE;
        }
      });
    }


    function AssemblerOptions(o){
      o = Object(o);
      for (var k in this)
        this[k] = k in o ? o[k] : this[k];
    }

    AssemblerOptions.prototype = {
      scope: SCOPE.GLOBAL,
      natives: false,
      filename: null
    };


    function Assembler(options){
      this.options = new AssemblerOptions(options);
      define(this, {
        strings: [],
        hash: new Hash
      });
    }

    define(Assembler.prototype, {
      source: null,
      node: null,
      code: null,
      pending: null,
      jumps: null,
      labels: null
    });

    define(Assembler.prototype, [
      function assemble(node, source){
        context = this;
        this.pending = new Stack;
        this.jumps = new Stack;
        this.labels = null;
        this.source = source;

        if (this.options.scope === SCOPE.FUNCTION) {
          node = node.body[0].expression;
        }

        var code = new Code(node, source, FUNCTYPE.NORMAL, this.options.scope);
        define(code, {
          strings: this.strings,
          hash: this.hash
        });

        code.topLevel = true;

        if (this.options.natives) {
          code.natives = true;
          reinterpretNatives(node);
        }

        annotateParent(node);
        this.queue(code);

        while (this.pending.length) {
          this.process();
        }

        return code;
      },
      function process(){
        var lastCode = this.code;
        this.code = this.pending.pop();
        this.code.filename = this.filename;
        if (lastCode) {
          this.code.derive(lastCode);
        }

        //if (this.code.params && this.code.params.defaults) {
        //}

        recurse(this.code.body);

        if (this.code.scopeType === SCOPE.GLOBAL || this.code.scopeType === SCOPE.EVAL){
          COMPLETE();
        } else {
          if (this.code.lexicalType === FUNCTYPE.ARROW && this.code.body.type !== 'BlockStatement') {
            GET();
          } else {
            UNDEFINED();
          }
          RETURN();
        }
      },
      function queue(code){
        if (this.code) {
          this.code.children.push(code);
        }
        this.pending.push(code);
      },
      function intern(name){
        return name;
        /*if (name === '__proto__') {
          if (!this.hash[proto]) {
            var index = this.hash[proto] = this.strings.length;
            this.strings[index] = '__proto__';
          }
          name = proto;
        }

        if (name in this.hash) {
          return this.hash[name];
        } else {
          var index = this.hash[name] = this.strings.length;
          this.strings[index] = name;
          return index;
        }*/
      },
      function earlyError(node, error){
        this.code.errors || (this.code.errors = []);
        this.code.errors.push(error);
        // TODO handle this
      }
    ]);

    return Assembler;
  })();

  exports.assemble = function assemble(options){
    var assembler = new Assembler(options);
    return assembler.assemble(options.ast, options.source);
  };

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});


exports.operators = (function(exports){
  var ThrowException = require('./errors').ThrowException;

  var SYMBOLS       = require('./constants').SYMBOLS,
      Break         = SYMBOLS.Break,
      Pause         = SYMBOLS.Pause,
      Throw         = SYMBOLS.Throw,
      Empty         = SYMBOLS.Empty,
      Resume        = SYMBOLS.Resume,
      Return        = SYMBOLS.Return,
      Abrupt        = SYMBOLS.Abrupt,
      Builtin        = SYMBOLS.Builtin,
      Continue      = SYMBOLS.Continue,
      Reference     = SYMBOLS.Reference,
      Completion    = SYMBOLS.Completion,
      Uninitialized = SYMBOLS.Uninitialized,
      BuiltinSymbol  = require('./constants').BRANDS.BuiltinSymbol;

  var BOOLEAN   = 'boolean',
      FUNCTION  = 'function',
      NUMBER    = 'number',
      OBJECT    = 'object',
      STRING    = 'string',
      UNDEFINED = 'undefined';



  function HasPrimitiveBase(v){
    var type = typeof v.base;
    return type === STRING || type === NUMBER || type === BOOLEAN;
  }


  // ## GetValue

  function GetValue(v){
    if (v && v.Completion) {
      if (v.Abrupt) {
        return v;
      } else {
        v = v.value;
      }
    }
    if (!v || !v.Reference) {
      return v;
    } else if (v.base === undefined) {
      return ThrowException('not_defined', [v.name]);
    } else {
      var base = v.base;

      if (HasPrimitiveBase(v)) {
        if (typeof base === STRING && v.name === 'length' || v.name >= 0 && v.name < base.length) {
          return base[v.name];
        }
        base = new exports.$PrimitiveBase(base);
      }

      if (exports.IsPropertyReference(v)) {
        if (base.Get) {
          if ('thisValue' in v) {
            return base.GetP(GetThisValue(v), v.name);
          } else {
            return base.Get(v.name);
          }
        }
      } else if (base.GetBindingValue) {
        return base.GetBindingValue(v.name, v.strict);
      }
    }
  }

  exports.GetValue = GetValue;

  // ## PutValue

  function PutValue(v, w){
    if (v && v.Completion) {
      if (v.Abrupt) {
        return v;
      } else {
        v = v.value;
      }
    }
    if (w && w.Completion) {
      if (w.Abrupt) {
        return w;
      } else {
        w = w.value;
      }
    }
    if (!v) {
      return ThrowException('non_object_property_store', ['undefined', 'undefined']);
    } else if (!v.Reference) {
      return ThrowException('non_object_property_store', [v.name, v.base]);
    } else if (v.base === undefined) {
      if (v.strict) {
        return ThrowException('not_defined', [v.name, v.base]);
      } else {
        return exports.global.Put(v.name, w, false);
      }
    } else {
      var base = v.base;

      if (exports.IsPropertyReference(v)) {
        if (HasPrimitiveBase(v)) {
          base = new exports.$PrimitiveBase(base);
        }
        if ('thisValue' in v) {
          return base.SetP(GetThisValue(v), v.name, w, v.strict);
        } else {
          return base.Put(v.name, w, v.strict);
        }
      } else {
        return base.SetMutableBinding(v.name, w, v.strict);
      }
    }
  }
  exports.PutValue = PutValue;

  // ## GetThisValue

  function GetThisValue(v){
    if (v && v.Completion) {
      if (v.Abrupt) {
        return v;
      } else {
        v = v.value;
      }
    }
    if (!v || !v.Reference) {
      return v;
    }

    if (v.base === undefined) {
      return ThrowException('non_object_property_load', [v.name, v.base]);
    }

    if ('thisValue' in v) {
      return v.thisValue;
    }

    return v.base;
  }
  exports.GetThisValue = GetThisValue;



  // ## ToPrimitive

  function ToPrimitive(argument, hint){
    if (typeof argument === OBJECT) {
      if (argument === null) {
        return argument;
      } else if (argument.Completion) {
        if (argument.Abrupt) {
          return argument;
        }
        return ToPrimitive(argument.value, hint);
      }
      return ToPrimitive(argument.DefaultValue(hint), hint);
    } else {
      return argument;
    }
  }
  exports.ToPrimitive = ToPrimitive;

  // ## ToBoolean

  function ToBoolean(argument){
    if (!argument) {
      return false;
    } else if (typeof argument === OBJECT && argument.Completion) {
      if (argument.Abrupt) {
        return argument;
      } else {
        return !!argument.value;
      }
    } else {
      return !!argument;
    }
  }
  exports.ToBoolean = ToBoolean;

  // ## ToNumber

  function ToNumber(argument){
    if (argument !== null && typeof argument === OBJECT) {
      if (argument.Completion) {
        if (argument.Abrupt) {
          return argument;
        }
        return ToNumber(argument.value);
      }
      return ToNumber(ToPrimitive(argument, 'Number'));
    } else {
      return +argument;
    }
  }
  exports.ToNumber = ToNumber;

  // ## ToInteger

  function ToInteger(argument){
    argument = ToNumber(argument);

    if (argument && argument.Completion) {
      if (argument.Abrupt) {
        return argument;
      }
      argument = argument.value;
    }

    if (argument !== argument) {
      return 0;
    }

    if (argument === 0 || argument === Infinity || argument === -Infinity) {
      return argument;
    }

    return argument >> 0;
  }
  exports.ToInteger = ToInteger;

  // ## ToUint32

  function ToUint32(argument){
    argument = ToNumber(argument);
    if (argument && typeof argument === OBJECT && argument.Completion) {
      if (argument.Abrupt) {
        return argument;
      }
      return ToUint32(argument.value);
    }
    return argument >>> 0;
  }
  exports.ToUint32 = ToUint32;

  // ## ToInt32

  function ToInt32(argument){
    argument = ToNumber(argument);
    if (argument && typeof argument === OBJECT && argument.Completion) {
      if (argument.Abrupt) {
        return argument;
      }
      return ToInt32(argument.value);
    }
    return argument >> 0;
  }
  exports.ToInt32 = ToInt32;

  // ## ToUint16

  function ToUint16(argument){
    argument = ToNumber(argument);
    if (argument && typeof argument === OBJECT && argument.Completion) {
      if (argument.Abrupt) {
        return argument;
      }
      return ToUint16(argument.value);
    }
    return (argument >>> 0) % (1 << 16);
  }
  exports.ToUint16 = ToUint16;


  // ## ToPropertyName

  function ToPropertyName(argument){
    if (argument && argument.Completion) {
      if (argument.Abrupt) {
        return argument;
      } else {
        argument = argument.value;
      }
    }
    if (argument && typeof argument === OBJECT && argument.BuiltinBrand === BuiltinSymbol) {
      return argument;
    } else {
      return ToString(argument);
    }
  }
  exports.ToPropertyName = ToPropertyName;

  // ## ToString

  function ToString(argument){
    switch (typeof argument) {
      case STRING: return argument;
      case UNDEFINED:
      case NUMBER:
      case BOOLEAN: return ''+argument;
      case OBJECT:
        if (argument === null) {
          return 'null';
        } else if (argument.Completion) {
          if (argument.Abrupt) {
            return argument;
          }
          return ToString(argument.value);
        }
        return ToString(ToPrimitive(argument, 'String'));
    }
  }
  exports.ToString = ToString;


  var PRE_INC, POST_INC, PRE_DEC, POST_DEC;
  void function(createChanger){
    exports.PRE_INC = PRE_INC = createChanger(true, 1);
    exports.POST_INC = POST_INC = createChanger(false, 1);
    exports.PRE_DEC = PRE_DEC = createChanger(true, -1);
    exports.POST_DEC = POST_DEC = createChanger(false, -1);
  }(function(pre, change){
    return function(ref) {
      var val = ToNumber(GetValue(ref));
      if (val && val.Abrupt) {
        return val;
      }

      var newVal = val + change,
          result = PutValue(ref, newVal);

      if (result && result.Abrupt) {
        return result;
      }
      return pre ? newVal : val;
    };
  });

  function VOID(ref){
    var val = GetValue(ref);
    if (val && val.Abrupt) {
      return val;
    }
    return undefined;
  }
  exports.VOID = VOID;

  function TYPEOF(val) {
    var type = typeof val;
    switch (type) {
      case UNDEFINED:
      case BOOLEAN:
      case NUMBER:
      case STRING: return type;
      case OBJECT:
        if (val === null) {
          return OBJECT;
        }

        if (val.Completion) {
          if (val.Abrupt) {
            return val;
          } else {
            return TYPEOF(val.value);
          }
        }

        if (val.Reference) {
          if (val.base === undefined) {
            return UNDEFINED;
          }
          return TYPEOF(GetValue(val));
        }

        if ('Call' in val) {
          return FUNCTION;
        } else {
          return OBJECT;
        }
      }
  }
  exports.TYPEOF = TYPEOF;


  function POSITIVE(ref){
    return ToNumber(GetValue(ref));
  }
  exports.POSITIVE = POSITIVE;

  var NEGATIVE, BIT_NOT, NOT;
  void function(createUnaryOp){
    exports.NEGATIVE = NEGATIVE = createUnaryOp(ToNumber, function(n){ return -n });
    exports.BIT_NOT  = BIT_NOT  = createUnaryOp(ToInt32, function(n){ return ~n });
    exports.NOT      = NOT      = createUnaryOp(ToBoolean, function(n){ return !n });
  }(function(convert, finalize){
    return function(ref){
      if (!ref || typeof ref !== OBJECT) {
        return finalize(ref);
      }
      var val = convert(GetValue(ref));

      if (val && val.Completion) {
        if (val.Abrupt) {
          return val;
        } else {
          val = val.value;
        }
      }

      return finalize(val);
    }
  });
  var MUL, DIV, MOD, SUB, BIT_OR, BIT_AND;
  void function(makeMathOp){
    exports.MUL = MUL = makeMathOp(function(l, r){ return l * r });
    exports.DIV = DIV = makeMathOp(function(l, r){ return l / r });
    exports.MOD = MOD = makeMathOp(function(l, r){ return l % r });
    exports.SUB = SUB = makeMathOp(function(l, r){ return l - r });
    exports.BIT_AND = BIT_AND = makeMathOp(function(l, r){ return l & r });
    exports.BIT_OR = BIT_OR = makeMathOp(function(l, r){ return l | r });
  }(function(finalize){
    return function(lval, rval) {
      lval = ToNumber(lval);
      if (lval && lval.Completion) {
        if (lval.Abrupt) {
          return lval;
        } else {
          lval = lval.value;
        }
      }
      rval = ToNumber(rval);
      if (rval && rval.Completion) {
        if (rval.Abrupt) {
          return rval;
        } else {
          rval = rval.value;
        }
      }
      return finalize(lval, rval);
    };
  });

  function convertAdd(a, b, type, converter){
    if (typeof a !== type) {
      a = converter(a);
      if (a && a.Completion) {
        if (a.Abrupt) {
          return a;
        } else {
          a = a.value;
        }
      }
    } else if (typeof b !== type) {
      b = converter(b);
      if (b && b.Completion) {
        if (b.Abrupt) {
          return b;
        } else {
          b = b.value;
        }
      }
    }
    return a + b;
  }



  function ADD(lval, rval) {
    lval = ToPrimitive(lval);
    if (lval && lval.Completion) {
      if (lval.Abrupt) {
        return lval;
      } else {
        lval = lval.value;
      }
    }

    rval = ToPrimitive(rval);
    if (rval && rval.Completion) {
      if (rval && rval.Abrupt) {
        return rval;
      } else {
        rval = rval.value;
      }
    }

    if (typeof lval === STRING || typeof rval === STRING) {
      var type = STRING,
          converter = ToString;
    } else {
      var type = NUMBER,
          converter = ToNumber;
    }

    return convertAdd(lval, rval, type, converter);
  }
  exports.ADD = ADD;



  function STRING_ADD(lval, rval){
    return convertAdd(lval, rval, STRING, ToString);
  }
  exports.STRING_ADD = STRING_ADD;



  var SHL, SHR, SAR;
  void function(makeShifter){
    exports.SHL = SHL = makeShifter(function(l, r){ return l << r });
    exports.SHR = SHR = makeShifter(function(l, r){ return l >> r });
    exports.SAR = SAR = makeShifter(function(l, r){ return l >>> r });
  }(function(finalize){
    return function(lval, rval) {
      lval = ToInt32(lval);
      if (lval && lval.Completion) {
        if (lval.Abrupt) {
          return lval;
        } else {
          lval = lval.value;
        }
      }
      rval = ToUint32(rval);
      if (rval && rval.Completion) {
        if (rval.Abrupt) {
          return rval;
        } else {
          rval = rval.value;
        }
      }
      return finalize(lval, rval & 0x1F);
    };
  });



  function COMPARE(x, y, left){
    if (left === false) {
      var lval = x,
          rval = y;
    } else {
      var lval = y,
          rval = x;
    }

    lval = ToPrimitive(lval, 'Number');
    if (lval && lval.Completion) {
      if (lval.Abrupt) {
        return lval;
      } else {
        lval = lval.value;
      }
    }

    rval = ToPrimitive(rval, 'Number');
    if (rval && rval.Completion) {
      if (rval.Abrupt) {
        return rval;
      } else {
        rval = rval.value;
      }
    }

    var ltype = typeof lval,
        rtype = typeof rval;

    if (ltype === STRING || rtype === STRING) {
      if (ltype !== STRING) {
        lval = ToString(lval);
        if (lval && lval.Completion) {
          if (lval.Abrupt) {
            return lval;
          } else {
            lval = lval.value;
          }
        }
      } else if (rtype !== STRING) {
        rval = ToString(rval);
        if (rval && rval.Completion) {
          if (rval.Abrupt) {
            return rval;
          } else {
            rval = rval.value;
          }
        }
      }
      if (typeof lval === STRING && typeof rval === STRING) {
        return lval < rval;
      }
    } else {
      if (ltype !== NUMBER) {
        lval = ToNumber(lval);
        if (lval && lval.Completion) {
          if (lval.Abrupt) {
            return lval;
          } else {
            lval = lval.value;
          }
        }
      }
      if (rtype !== NUMBER) {
        rval = ToNumber(rval);
        if (rval && rval.Completion) {
          if (rval.Abrupt) {
            return rval;
          } else {
            rval = rval.value;
          }
        }
      }
      if (typeof lval === NUMBER && typeof rval === NUMBER) {
        return lval < rval;
      }
    }
  }

  var LT, GT, LTE, GTE;
  void function(creatorComparer){
    exports.LT  = LT  = creatorComparer(true, false);
    exports.GT  = GT  = creatorComparer(false, false);
    exports.LTE = LTE = creatorComparer(true, true);
    exports.GTE = GTE = creatorComparer(false, true);
  }(function(reverse, left){
    return function(lval, rval){
      if (reverse) {
        var temp = lval;
        lval = rval;
        rval = temp;
      }

      var result = COMPARE(rval, lval, left);
      if (result && result.Completion) {
        if (result.Abrupt) {
          return result;
        } else {
          result = result.value;
        }
      }

      if (result === undefined) {
        return false;
      } else if (left) {
        return !result;
      } else {
        return result;
      }
    };
  });


  function INSTANCE_OF(lval, rval) {
    if (rval === null || typeof rval !== OBJECT || !('HasInstance' in rval)) {
      return ThrowException('instanceof_function_expected', lval);
    }

    return rval.HasInstance(lval);
  }
  exports.INSTANCE_OF = INSTANCE_OF;


  function DELETE(ref){
    if (!ref || !ref.Reference) {
      return true;
    }

    if (ref.base === undefined) {
      if (ref.strict) {
        return ThrowException('strict_delete_property', [ref.name, ref.base]);
      } else {
        return true;
      }
    }

    if (exports.IsPropertyReference(ref)) {
      if ('thisValue' in ref) {
        return ThrowException('super_delete_property', ref.name);
      } else {
        var obj = exports.ToObject(ref.base)
        if (obj && obj.Completion) {
          if (obj.Abrupt) {
            return obj;
          } else {
            obj = obj.value;
          }
        }

        return obj.Delete(ref.name, ref.strict);
      }
    } else {
      return ref.base.DeleteBinding(ref.name);
    }
  }
  exports.DELETE = DELETE;


  function IN(lval, rval) {
    if (rval === null || typeof rval !== OBJECT) {
      return ThrowException('invalid_in_operator_use', [lval, rval]);
    }

    lval = ToPropertyName(lval);
    if (lval && lval.Completion) {
      if (lval.Abrupt) {
        return lval;
      } else {
        lval = lval.value;
      }
    }

    return rval.HasProperty(lval);
  }
  exports.IN = IN;




  function STRICT_EQUAL(x, y) {
    if (x && x.Completion) {
      if (x.Abrupt) {
        return x;
      } else {
        x = x.value;
      }
    }
    if (y && y.Completion) {
      if (y.Abrupt) {
        return y;
      } else {
        y = y.value;
      }
    }
    return x === y;
  }
  exports.STRICT_EQUAL = STRICT_EQUAL;


  function EQUAL(x, y){
    if (x && x.Completion) {
      if (x.Abrupt) {
        return x;
      } else {
        x = x.value;
      }
    }
    if (y && y.Completion) {
      if (y.Abrupt) {
        return y;
      } else {
        y = y.value;
      }
    }

    var ltype = typeof x,
        rtype = typeof y;

    if (ltype === rtype) {
      return x === y;
    } else if (x == null && y == null) {
      return true;
    } else if (ltype === NUMBER || rtype === STRING) {
      return EQUAL(x, ToNumber(y));
    } else if (ltype === STRING || rtype === NUMBER) {
      return EQUAL(ToNumber(x), y);
    } else if (rtype === BOOLEAN) {
      return EQUAL(x, ToNumber(y));
    } else if (ltype === BOOLEAN) {
      return EQUAL(ToNumber(x), y);
    } else if (rtype === OBJECT && ltype === NUMBER || ltype === STRING) {
      return EQUAL(x, ToPrimitive(y));
    } else if (ltype === OBJECT && rtype === NUMBER || rtype === OBJECT) {
      return EQUAL(ToPrimitive(x), y);
    }
    return false;
  }

  exports.EQUAL = EQUAL;



  function UnaryOp(operator, val) {
    switch (operator) {
      case 'delete': return DELETE(val);
      case 'void':   return VOID(val);
      case 'typeof': return TYPEOF(val);
      case '+':      return POSITIVE(val);
      case '-':      return NEGATIVE(val);
      case '~':      return BIT_NOT(val);
      case '!':      return NOT(val);
    }
  }
  exports.UnaryOp = UnaryOp;



  function BinaryOp(operator, lval, rval) {
    switch (operator) {
      case 'instanceof': return INSTANCE_OF(lval, rval);
      case 'in':         return IN(lval, rval);
      case '==':         return EQUAL(lval, rval);
      case '!=':         return NOT(EQUAL(lval, rval));
      case '===':        return STRICT_EQUAL(lval, rval);
      case '!==':        return NOT(STRICT_EQUAL(lval, rval));
      case '<':          return LT(lval, rval);
      case '>':          return GT(lval, rval);
      case '<=':         return LTE(lval, rval);
      case '>=':         return GTE(lval, rval);
      case '*':          return MUL(lval, rval);
      case '/':          return DIV(lval, rval);
      case '%':          return MOD(lval, rval);
      case '+':          return ADD(lval, rval);
      case 'string+':    return STRING_ADD(lval, rval);
      case '-':          return SUB(lval, rval);
      case '<<':         return SHL(lval, rval);
      case '>>':         return SHR(lval, rval);
      case '>>>':        return SAR(lval, rval);
      case '|':          return BIT_OR(lval, rval);
      case '&':          return BIT_AND(lval, rval);
      case '^':          return BIT_XOR(lval, rval);
    }
  }
  exports.BinaryOp = BinaryOp;


  return exports;
})(typeof module !== 'undefined' ? module.exports : {});


exports.thunk = (function(exports){
  "use strict";
  var objects   = require('../lib/objects'),
      Emitter   = require('../lib/Emitter');

  var define  = objects.define,
      inherit = objects.inherit;

  var operators    = require('./operators'),
      STRICT_EQUAL = operators.STRICT_EQUAL,
      ToObject     = operators.ToObject,
      UnaryOp      = operators.UnaryOp,
      BinaryOp     = operators.BinaryOp,
      GetValue     = operators.GetValue,
      PutValue     = operators.PutValue,
      PRE_INC      = operators.PRE_INC,
      POST_INC     = operators.POST_INC,
      PRE_DEC      = operators.PRE_DEC,
      POST_DEC     = operators.POST_DEC;

  var constants = require('./constants'),
      BINARYOPS = constants.BINARYOPS.array,
      UNARYOPS  = constants.UNARYOPS.array,
      ENTRY     = constants.ENTRY.hash,
      AST       = constants.AST.array,
      Pause     = constants.SYMBOLS.Pause,
      Empty     = constants.SYMBOLS.Empty,
      Resume    = constants.SYMBOLS.Resume,
      StopIteration = constants.BRANDS.StopIteration;

  var AbruptCompletion = require('./errors').AbruptCompletion;




  function Desc(v){
    this.Value = v;
  }

  Desc.prototype = {
    Configurable: true,
    Enumerable: true,
    Writable: true
  };



  var D = (function(d, i){
    while (i--) {
      d[i] = new Function('return function '+
        ((i & 1) ? 'E' : '_') +
        ((i & 2) ? 'C' : '_') +
        ((i & 4) ? 'W' : '_') +
        '(v){ this.Value = v }')();

      d[i].prototype = {
        Enumerable  : (i & 1) > 0,
        Configurable: (i & 2) > 0,
        Writable    : (i & 4) > 0
      };
    }
    return d;
  })([], 8);


  function DefineProperty(obj, key, val) {
    if (val && val.Completion) {
      if (val.Abrupt) {
        return val;
      } else {
        val = val.value;
      }
    }

    return obj.DefineOwnProperty(key, new Desc(val), false);
  }

  var log = false;



  function instructions(ops, opcodes){
    var out = [];
    for (var i=0; i < ops.length; i++) {
      out[i] = opcodes[+ops[i].op];
      if (out[i].name === 'LOG') {
        out.log = true;
      }
    }
    return out;
  }


  function Thunk(code){
    var opcodes = [ARRAY, ARG, ARGS, ARRAY_DONE, BINARY, BLOCK, CALL, CASE,
      CLASS_DECL, CLASS_EXPR, COMPLETE, CONST, CONSTRUCT, DEBUGGER, DEFAULT, DEFINE,
      DUP, ELEMENT, ENUM, EXTENSIBLE, FLIP, FUNCTION, GET, IFEQ, IFNE, INC, INDEX, ITERATE, JUMP, LET,
      LITERAL, LOG, MEMBER, METHOD, NATIVE_CALL, NATIVE_REF, OBJECT, POP,
      POPN, PROPERTY, PUT, REF, REFSYMBOL, REGEXP, RETURN, ROTATE, SAVE, SPREAD,
      SPREAD_ARG, SPREAD_ARRAY, STRING, SUPER_CALL, SUPER_ELEMENT, SUPER_MEMBER, SYMBOL, TEMPLATE,
      THIS, THROW, UNARY, UNDEFINED, UPDATE, UPSCOPE, VAR, WITH, YIELD];

    var thunk = this,
        ops = code.ops,
        cmds = instructions(ops, opcodes);

    function getKey(v){
      if (typeof v === 'string') {
        return v;
      }
      if (v[0] !== '@') {
        return v[1];
      }

      return context.getSymbol(v[1]);
    }

    function unwind(){
      for (var i = 0, entry; entry = code.transfers[i]; i++) {
        if (entry.begin < ip && ip <= entry.end) {
          if (entry.type === ENTRY.ENV) {
            trace(context.popBlock());
          } else {
            if (entry.type === ENTRY.TRYCATCH) {
              stack[sp++] = error.value;
              ip = entry.end;
              console.log(ops[ip])
              return cmds[ip];
            } else if (entry.type === ENTRY.FOROF) {
              if (error && error.value && error.value.BuiltinBrand === StopIteration) {
                ip = entry.end;
                return cmds[ip];
              }
            }
          }
        }
      }


      if (error) {
        if (error.value && error.value.setCode) {
          var range = code.ops[ip].range,
              loc = code.ops[ip].loc;

          if (!error.value.hasLocation) {
            error.value.hasLocation = true;
            error.value.setCode(loc, code.source);
            error.value.setOrigin(code.filename, code.displayName || code.name);
          }

          if (stacktrace) {
            if (error.value.trace) {
              [].push.apply(error.value.trace, stacktrace);
            } else {
              error.value.trace = stacktrace;
            }
            error.value.context || (error.value.context = context);
          }
        }
      }

      completion = error;
      return false;
    }



    function ARGS(){
      stack[sp++] = [];
      return cmds[++ip];
    }

    function ARG(){
      var arg = stack[--sp];
      stack[sp - 1].push(arg);
      return cmds[++ip];
    }

    function ARRAY(){
      stack[sp++] = context.createArray(0);
      stack[sp++] = 0;
      return cmds[++ip];
    }

    function ARRAY_DONE(){
      var len = stack[--sp];
      stack[sp - 1].set('length', len);
      return cmds[++ip];
    }

    function BINARY(){
      var right  = stack[--sp],
          left   = stack[--sp],
          result = BinaryOp(BINARYOPS[ops[ip][0]], GetValue(left), GetValue(right));

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function BLOCK(){
      context.pushBlock(ops[ip][0]);
      return cmds[++ip];
    }

    function CALL(){
      var args     = stack[--sp],
          receiver = stack[--sp],
          func     = stack[--sp],
          result   = context.callFunction(func, receiver, args, ops[ip][0]);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function CASE(){
      var result = STRICT_EQUAL(stack[--sp], stack[sp - 1]);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      if (result) {
        sp--;
        ip = ops[ip][0];
        return cmds[ip];
      }

      return cmds[++ip];
    }

    function CLASS_DECL(){
      var def  = ops[ip][0],
          sup  = def.superClass ? stack[--sp] : undefined,
          ctor = context.createClass(def, sup);

      if (ctor && ctor.Completion) {
        if (ctor.Abrupt) {
          error = ctor;
          return unwind;
        } else {
          ctor = ctor.value;
        }
      }

      var result = context.initializeBinding(getKey(def.name), ctor);
      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      return cmds[++ip];
    }

    function CLASS_EXPR(){
      var def  = ops[ip][0],
          sup  = def.superClass ? stack[--sp] : undefined,
          ctor = context.createClass(def, sup);

      if (ctor && ctor.Completion) {
        if (ctor.Abrupt) {
          error = ctor;
          return unwind;
        } else {
          ctor = ctor.value;
        }
      }

      stack[sp++] = ctor;
      return cmds[++ip];
    }

    function COMPLETE(){
      return false;
    }

    function CONST(){
      context.initializeBinding(code.lookup(ops[ip][0]), stack[--sp], true);
      return cmds[++ip];
    }

    function CONSTRUCT(){
      var args   = stack[--sp],
          func   = stack[--sp],
          result = context.constructFunction(func, args);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }
      stack[sp++] = result;
      return cmds[++ip];
    }

    function DEBUGGER(){
      cleanup = pauseCleanup;
      ip++;
      console.log(context, thunk);
      return false;
    }

    function DEFAULT(){
      sp--;
      ip = ops[ip][0];
      return cmds[++ip];
    }

    function DEFINE(){
      var attrs  = ops[ip][0],
          val    = stack[--sp],
          key    = stack[sp - 1],
          obj    = stack[sp - 2],
          result = obj.DefineOwnProperty(key, new D[attrs](val));

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function DUP(){
      stack[sp] = stack[sp++ - 1];
      return cmds[++ip];
    }

    function ELEMENT(){
      var obj    = stack[--sp],
          key    = stack[--sp],
          result = context.getPropertyReference(obj, key);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function ENUM(){
      stack[sp - 1] = stack[sp - 1].enumerator();
      return cmds[++ip];
    }

    function EXTENSIBLE(){
      stack[sp - 1].SetExtensible(!!ops[ip][0]);
      return cmds[++ip];
    }

    function FUNCTION(){
      stack[sp++] = context.createFunction(ops[ip][0], ops[ip][1]);
      return cmds[++ip];
    }

    function FLIP(){
      var buffer = [],
          index  = 0,
          count  = ops[ip][0];

      while (index < count) {
        buffer[index] = stack[sp - index++];
      }

      index = 0;
      while (index < count) {
        stack[sp - index] = buffer[count - ++index];
      }

      return cmds[++ip];
    }


    function GET(){
      var result = GetValue(stack[--sp]);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function IFEQ(){
      if (ops[ip][1] === !!stack[--sp]) {
        ip = ops[ip][0];
        return cmds[ip];
      }
      return cmds[++ip];
    }

    function IFNE(){
      if (ops[ip][1] === !!stack[sp - 1]) {
        ip = ops[ip][0];
        return cmds[ip];
      } else {
        sp--;
      }
      return cmds[++ip];
    }

    function INC(){
      stack[sp - 1]++;
      return cmds[++ip];
    }

    function INDEX(){
      var val   = stack[--sp],
          index = stack[--sp] + ops[ip][0],
          array = stack[sp - 1];

      array.DefineOwnProperty(index+'', new Desc(val));
      stack[sp++] = index + 1;

      return cmds[++ip];
    }

    function ITERATE(){
      stack[sp - 1] = stack[sp - 1].Iterate();
      return cmds[++ip];
    }

    function LITERAL(){
      stack[sp++] = ops[ip][0];
      return cmds[++ip];
    }

    function JUMP(){
      ip = ops[ip][0];
      return cmds[ip];
    }

    function LET(){
      context.initializeBinding(code.lookup(ops[ip][0]), stack[--sp], true);
      return cmds[++ip];
    }

    function LOG(){
      context.Realm.emit('debug', [sp, stack]);
      return cmds[++ip];
    }

    function MEMBER(){
      var obj = stack[--sp],
          key = getKey(ops[ip][0]);

      if (key && key.Abrupt) {
        error = key;
        return unwind;
      }

      var result = context.getPropertyReference(key, obj);
      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function METHOD(){
      var kind = ops[ip][0],
          obj  = stack[sp - 1],
          code = ops[ip][1],
          key  = getKey(ops[ip][2]);

      if (key && key.Abrupt) {
        error = key;
        return unwind;
      }

      var status = context.defineMethod(kind, obj, key, code);

      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }
      return cmds[++ip];
    }

    function NATIVE_CALL(){
      return CALL();
    }

    function NATIVE_REF(){
      if (!code.natives) {
        error = 'invalid native reference';
        return unwind;
      }
      stack[sp++] = context.Realm.natives.reference(code.lookup(ops[ip][0]), false);
      return cmds[++ip];
    }

    function PROPERTY(){
      var val    = stack[--sp],
          obj    = stack[sp - 1],
          key    = getKey(ops[ip][0]);

      if (key && key.Abrupt) {
        error = key;
        return unwind;
      }

      var status = DefineProperty(obj, key, val);
      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }

      return cmds[++ip];
    }

    function OBJECT(){
      stack[sp++] = context.createObject();
      return cmds[++ip];
    }

    function POP(){
      sp--;
      return cmds[++ip];
    }

    function POPN(){
      sp -= ops[ip][0];
      return cmds[++ip];
    }

    function PUT(){
      var val    = stack[--sp],
          ref    = stack[--sp],
          status = PutValue(ref, val);

      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }

      stack[sp++] = val;
      return cmds[++ip];
    }

    function REGEXP(){
      stack[sp++] = context.createRegExp(ops[ip][0]);
      return cmds[++ip];
    }

    function REF(){
      var ident = code.lookup(ops[ip][0]);
      stack[sp++] = context.getReference(ident);
      return cmds[++ip];
    }


    function REFSYMBOL(){
      var symbol = code.lookup(ops[ip][0]);
      stack[sp++] = context.getSymbol(symbol);
      return cmds[++ip];
    }

    function RETURN(){
      completion = stack[--sp];
      ip++;
      if (code.generator) {
        context.currentGenerator.ExecutionContext = context;
        context.currentGenerator.State = 'closed';
        error = new AbruptCompletion('throw', context.Realm.intrinsics.StopIteration);
        unwind();
      }
      return false;
    }

    function ROTATE(){
      var buffer = [],
          item   = stack[--sp],
          index  = 0,
          count  = ops[ip][0];

      while (index < count) {
        buffer[index++] = stack[--sp];
      }

      buffer[index++] = item;

      while (index--) {
        stack[sp++] = buffer[index];
      }

      return cmds[++ip];
    }

    function SAVE(){
      completion = stack[--sp];
      return cmds[++ip];
    }

    function SPREAD(){
      var obj    = stack[--sp],
          index  = ops[ip][0],
          result = context.destructureSpread(obj, index);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function SPREAD_ARG(){
      var spread = stack[--sp],
          args   = stack[sp - 1],
          status = context.spreadArguments(args, spread);

      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }

      return cmds[++ip];
    }

    function SPREAD_ARRAY(){
      var val = stack[--sp],
          index = stack[--sp] + ops[ip][0],
          array = stack[sp - 1],
          status = context.spreadArray(array, index, val);

      if (status && status.Abrupt) {
        error = status;
        return unwind;
      }

      stack[sp++] = status;
      return cmds[++ip];
    }


    function STRING(){
      stack[sp++] = code.lookup(ops[ip][0]);
      return cmds[++ip];
    }

    function SUPER_CALL(){
      var result = context.getSuperReference(false);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function SUPER_ELEMENT(){
      var result = context.getSuperReference(stack[--sp]);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function SUPER_MEMBER(){
      var key = getKey(ops[ip][0]);

      if (key && key.Abrupt) {
        error = key;
        return unwind;
      }
      var result = context.getSuperReference(key);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function SYMBOL(){
      var name = ops[ip][0],
          isPublic = ops[ip][1],
          hasInit = ops[ip][2];

      if (hasInit) {
        var init = stack[--sp];
        if (init && init.Completion) {
          if (init.Abrupt) { error = init; return unwind; } else init = init.value;
        }
      } else {
        var init = context.createSymbol(name, isPublic);
      }

      var result = context.initializeSymbolBinding(name, init);

      if (result && result.Abrupt) {
        error = result;
        return unwind;
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function TEMPLATE(){
      stack[sp++] = context.getTemplateCallSite(ops[ip][0]);
      return cmds[++ip];
    }

    function THIS(){
      var result = context.getThis();

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function THROW(){
      error = new AbruptCompletion('throw', stack[--sp]);
      return unwind;
    }

    function UNARY(){
      var result = UnaryOp(UNARYOPS[ops[ip][0]], stack[--sp]);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function UNDEFINED(){
      stack[sp++] = undefined;
      return cmds[++ip];
    }

    var updaters = [POST_DEC, PRE_DEC, POST_INC, PRE_INC];

    function UPDATE(){
      var update = updaters[ops[ip][0]],
          result = update(stack[--sp]);

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      stack[sp++] = result;
      return cmds[++ip];
    }

    function UPSCOPE(){
      context.popBlock();
      return cmds[++ip];
    }

    function VAR(){
      context.initializeBinding(code.lookup(ops[ip][0]), stack[--sp], false);
      return cmds[++ip];
    }

    function WITH(){
      var result = ToObject(GetValue(stack[--sp]));

      if (result && result.Completion) {
        if (result.Abrupt) {
          error = result;
          return unwind;
        } else {
          result = result.value;
        }
      }

      context.pushWith(result);
      return cmds[++ip];
    }

    function YIELD(){
      var generator = context.currentGenerator;
      generator.ExecutionContext = context;
      generator.State = 'suspended';
      context.pop();
      cleanup = yieldCleanup;
      yielded = stack[--sp];
      ip++;
      return false;
    }

    function trace(unwound){
      stacktrace || (stacktrace = []);
      stacktrace.push(unwound);
    }

    function normalPrepare(newContext){
      thunkStack.push({
        ip: ip,
        sp: sp,
        stack: stack,
        error: error,
        prepare: prepare,
        execute: execute,
        cleanup: cleanup,
        history: history,
        completion: completion,
        stacktrace: stacktrace,
        context: context,
        log: log,
        ctx: ctx,
        yielded: yielded
      });
      ip = 0;
      sp = 0;
      stack = [];
      error = completion = stacktrace = yielded = undefined;
      log = log || cmds.log;
      context = newContext;
      history = [];
      execute = context.Realm.quiet ? normalExecute : instrumentedExecute;
    }

    function normalCleanup(){
      var result = GetValue(completion);
      if (thunkStack.length) {
        var v = thunkStack.pop();
        ip = v.ip;
        sp = v.sp;
        stack = v.stack;
        error = v.error;
        prepare = v.prepare;
        execute = v.execute;
        cleanup = v.cleanup;
        history = v.history;
        completion = v.completion;
        stacktrace = v.stacktrace;
        context = v.context;
        log = v.log;
        ctx = v.ctx;
        yielded = v.yielded;
      }
      return result;
    }


    function normalExecute(){
      var f = cmds[ip],
          ips = 0;
      if (log) {
        history = [];
        while (f) {
          history[ips++] = [ip, ops[ip]];
          f = f();
        }
      } else {
        while (f) f = f();
      }
    }

    function instrumentedExecute(){
      var f = cmds[ip],
          ips = 0,
          realm = context.Realm;

      while (f) {
        history[ips++] = [ip, ops[ip]];
        realm.emit('op', [ops[ip], stack[sp - 1]]);
        f = f();
      }
    }

    function resumePrepare(){
      delete thunk.ip;
      delete thunk.stack;
      prepare = normalPrepare;
      context = ctx;
      ctx = undefined;
    }

    function pauseCleanup(){
      thunk.ip = ip;
      thunk.stack = stack;
      stack.length = sp;
      prepare = resumePrepare;
      cleanup = normalCleanup;
      ctx = context;
      return Pause;
    }

    function yieldPrepare(ctx){
      prepare = normalPrepare;
      context = ctx;
    }

    function yieldCleanup(){
      prepare = yieldPrepare;
      cleanup = normalCleanup;
      return yielded;
    }

    function run(ctx){
      prepare(ctx);
      execute();
      return cleanup();
    }

    function send(ctx, value){
      if (stack) {
        stack[sp++] = value;
      }
      return run(ctx);
    }


    var completion, yielded, stack, ip, sp, error, ctx, context, stacktrace, history;

    var executing = false, thunkStack = [];

    var prepare = normalPrepare,
        execute = normalExecute,
        cleanup = normalCleanup;

    this.run = run;
    this.send = send;
    this.code = code;
    Emitter.call(this);
  }

  inherit(Thunk, Emitter, []);

  exports.Thunk = Thunk;
  return exports;
})(typeof module !== 'undefined' ? module.exports : {});



exports.runtime = (function(GLOBAL, exports, undefined){
  "use strict";
  var esprima      = require('../third_party/esprima'),
      objects      = require('../lib/objects'),
      functions    = require('../lib/functions'),
      iteration    = require('../lib/iteration'),
      utility      = require('../lib/utility'),
      errors       = require('./errors'),
      assemble     = require('./assembler').assemble,
      constants    = require('./constants'),
      operators    = require('./operators'),
      Emitter      = require('../lib/Emitter'),
      buffers      = require('../lib/buffers'),
      PropertyList = require('../lib/PropertyList'),
      Thunk        = require('./thunk').Thunk;

  var Hash          = objects.Hash,
      DataView      = buffers.DataView,
      ArrayBuffer   = buffers.ArrayBuffer,
      create        = objects.create,
      isObject      = objects.isObject,
      enumerate     = objects.enumerate,
      ownKeys       = objects.keys,
      assign        = objects.assign,
      define        = objects.define,
      copy          = objects.copy,
      inherit       = objects.inherit,
      ownProperties = objects.properties,
      hide          = objects.hide,
      fname         = functions.fname,
      toArray       = functions.toArray,
      applyNew      = functions.applyNew,
      each          = iteration.each,
      numbers       = utility.numbers,
      nextTick      = utility.nextTick,
      unique        = utility.unique;

  var ThrowException   = errors.ThrowException,
      MakeException    = errors.MakeException,
      Completion       = errors.Completion,
      AbruptCompletion = errors.AbruptCompletion;

  operators.ToObject = ToObject;
  var GetValue         = operators.GetValue,
      PutValue         = operators.PutValue,
      GetThisValue     = operators.GetThisValue,
      ToPrimitive      = operators.ToPrimitive,
      ToBoolean        = operators.ToBoolean,
      ToNumber         = operators.ToNumber,
      ToInteger        = operators.ToInteger,
      ToUint32         = operators.ToUint32,
      ToInt32          = operators.ToInt32,
      ToUint16         = operators.ToUint16,
      ToString         = operators.ToString,
      UnaryOp          = operators.UnaryOp,
      BinaryOp         = operators.BinaryOp,
      ToPropertyName   = operators.ToPropertyName,
      EQUAL            = operators.EQUAL,
      STRICT_EQUAL     = operators.STRICT_EQUAL;


  var SYMBOLS       = constants.SYMBOLS,
      Break         = SYMBOLS.Break,
      Pause         = SYMBOLS.Pause,
      Throw         = SYMBOLS.Throw,
      Empty         = SYMBOLS.Empty,
      Return        = SYMBOLS.Return,
      Normal        = SYMBOLS.Normal,
      Builtin        = SYMBOLS.Builtin,
      Continue      = SYMBOLS.Continue,
      Uninitialized = SYMBOLS.Uninitialized;

  var StopIteration = constants.BRANDS.StopIteration;
  var uid = (Math.random() * (1 << 30)) | 0;

  var BINARYOPS = constants.BINARYOPS.array,
      UNARYOPS  = constants.UNARYOPS.array,
      BRANDS    = constants.BRANDS,
      ENTRY     = constants.ENTRY.hash,
      SCOPE     = constants.SCOPE.hash,
      AST       = constants.AST.array;

  var ARROW  = constants.FUNCTYPE.getIndex('ARROW'),
      METHOD = constants.FUNCTYPE.getIndex('METHOD'),
      NORMAL = constants.FUNCTYPE.getIndex('NORMAL');


  var ATTRS = constants.ATTRIBUTES,
      E = ATTRS.ENUMERABLE,
      C = ATTRS.CONFIGURABLE,
      W = ATTRS.WRITABLE,
      A = ATTRS.ACCESSOR,
      ___ = ATTRS.___,
      E__ = ATTRS.E__,
      _C_ = ATTRS._C_,
      EC_ = ATTRS.EC_,
      __W = ATTRS.__W,
      E_W = ATTRS.E_W,
      _CW = ATTRS._CW,
      ECW = ATTRS.ECW,
      __A = ATTRS.__A,
      E_A = ATTRS.E_A,
      _CA = ATTRS._CA,
      ECA = ATTRS.ECA;


  errors.createError = function(name, type, message){
    return new $Error(name, type, message);
  };

  AbruptCompletion.prototype.Abrupt = SYMBOLS.Abrupt;
  Completion.prototype.Completion   = SYMBOLS.Completion;


  function noop(){}

  // ###############################
  // ###############################
  // ### Specification Functions ###
  // ###############################
  // ###############################


  // ## FromPropertyDescriptor

  function FromPropertyDescriptor(desc){
    var obj = new $Object;
    if (IsDataDescriptor(desc)) {
      obj.set('value', desc.Value);
      obj.set('writable', desc.Writable);
    } else if (IsAccessorDescriptor(desc))  {
      obj.set('get', desc.Get);
      obj.set('set', desc.Set);
    }
    obj.set('enumerable', desc.Enumerable);
    obj.set('configurable', desc.Configurable);
    return obj;
  }


  // ## CheckObjectCoercible

  function CheckObjectCoercible(argument){
    if (argument === null) {
      return ThrowException('null_to_object');
    } else if (argument === undefined) {
      return ThrowException('undefined_to_object');
    } else if (typeof argument === 'object' && argument.Completion) {
      if (argument.Abrupt) {
        return argument;
      }
      return CheckObjectCoercible(argument.value);
    } else {
      return argument;
    }
  }

  // ## ToPropertyDescriptor

  var descFields = ['value', 'writable', 'enumerable', 'configurable', 'get', 'set'];
  var descProps = ['Value', 'Writable', 'Enumerable', 'Configurable', 'Get', 'Set'];
  var standardFields = create(null);

  each(descFields, function(field){
    standardFields[field] = true;
  });


  function ToPropertyDescriptor(obj) {
    if (obj && obj.Completion) {
      if (obj.Abrupt) return obj; else obj = obj.value;
    }

    if (typeof obj !== 'object') {
      return ThrowException('property_desc_object', [typeof obj]);
    }

    var desc = create(null);

    for (var i=0, v; i < 6; i++) {
      if (obj.HasProperty(descFields[i])) {
        v = obj.Get(descFields[i]);
        if (v && v.Completion) {
          if (v.Abrupt) return v; else v = v.value;
        }
        desc[descProps[i]] = v;
      }
    }

    if (desc.Get !== undefined) {
      if (!desc.Get || !desc.Get.Call) {
        return ThrowException('getter_must_be_callable', [typeof desc.Get]);
      }
    }

    if (desc.Set !== undefined) {
      if (!desc.Set || !desc.Set.Call) {
        return ThrowException('setter_must_be_callable', [typeof desc.Set]);
      }
    }

    if (('Get' in desc || 'Set' in desc) && ('Value' in desc || 'Writable' in desc))
      return ThrowException('value_and_accessor', [desc]);

    return desc;
  }

  function CopyAttributes(from, to){
    var props = from.Enumerate(true, false);
    for (var i=0; i < props.length; i++) {
      var field = props[i];
      if (!(field in standardFields)) {
        to.define(field, from.Get(field), ECW);
      }
    }
  }
  // ## IsAccessorDescriptor

  function IsAccessorDescriptor(desc) {
    return desc === undefined ? false : 'Get' in desc || 'Set' in desc;
  }

  // ## IsDataDescriptor

  function IsDataDescriptor(desc) {
    return desc === undefined ? false : 'Value' in desc || 'Writable' in desc;
  }

  // ## IsGenericDescriptor

  function IsGenericDescriptor(desc) {
    return desc === undefined ? false : !(IsAccessorDescriptor(desc) || IsDataDescriptor(desc));
  }

  function FromGenericPropertyDescriptor(desc){
    if (desc === undefined) return;
    var obj = new $Object;
    for (var i=0, v; i < 6; i++) {
      if (descProps[i] in desc) obj.set(descFields[i], desc[descProps[i]]);
    }
    return obj;
  }
  // ## ToCompletePropertyDescriptor

  function ToCompletePropertyDescriptor(obj) {
    var desc = ToPropertyDescriptor(obj);
    if (desc && desc.Completion) {
      if (desc.Abrupt) {
        return desc;
      } else {
        desc = desc.value;
      }
    }

    if (IsGenericDescriptor(desc) || IsDataDescriptor(desc)) {
      'Value' in desc    || (desc.Value = undefined);
      'Writable' in desc || (desc.Writable = false);
    } else {
      'Get' in desc || (desc.Get = undefined);
      'Set' in desc || (desc.Set = undefined);
    }
    'Enumerable' in desc   || (desc.Enumerable = false);
    'Configurable' in desc || (desc.Configurable = false);
    return desc;
  }

  // ## IsEmptyDescriptor

  function IsEmptyDescriptor(desc) {
    return !('Get' in desc
          || 'Set' in desc
          || 'Value' in desc
          || 'Writable' in desc
          || 'Enumerable' in desc
          || 'Configurable' in desc);
  }


  function is(x, y){
    return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
  }

  // ## IsEquivalentDescriptor

  function IsEquivalentDescriptor(a, b) {
    if (a && a.Completion) {
      if (a.Abrupt) return a; else a = a.value;
    }
    if (b && b.Completion) {
      if (b.Abrupt) return b; else b = b.value;
    }
    return is(a.Get, b.Get) &&
           is(a.Set, b.Set) &&
           is(a.Value, b.Value) &&
           is(a.Writable, b.Writable) &&
           is(a.Enumerable, b.Enumerable) &&
           is(a.Configurable, b.Configurable);
  }

  // ## IsCallable

  function IsCallable(argument){
    if (argument && typeof argument === 'object') {
      if (argument.Completion) {
        if (argument.Abrupt) {
          return argument;
        }
        return IsCallable(argument.value);
      }
      return 'Call' in argument;
    } else {
      return false;
    }
  }

  // ## IsConstructor

  function IsConstructor(argument){
    if (argument && typeof argument === 'object') {
      if (argument.Completion) {
        if (argument.Abrupt) {
          return argument;
        }
        return IsConstructor(argument.value);
      }
      return 'Construct' in argument;
    } else {
      return false;
    }
  }

  // ## MakeConstructor

  function MakeConstructor(func, writable, prototype){
    var install = prototype === undefined;
    if (install) {
      prototype = new $Object;
    }
    prototype.IsProto = true;
    if (writable === undefined) {
      writable = true;
    }
    if (install) {
      prototype.define('constructor', func, writable ? _CW : ___);
    }
    func.define('prototype', prototype, writable ? __W : ___);
  }

  // ## IsArrayIndex

  function IsArrayIndex(argument) {
    var n = +argument >>> 0;
    if ('' + n === argument && n !== 0xffffffff) {
      return true;
    }
    return false;
  }


  // ## Invoke
  var emptyArgs = [];

  function Invoke(key, receiver, args){
    var obj = ToObject(receiver);
    if (obj && obj.Completion) {
      if (obj.Abrupt) return obj; else obj = obj.value;
    }

    var func = obj.Get(key);
    if (func && func.Completion) {
      if (func.Abrupt) return func; else func = func.value;
    }

    if (!IsCallable(func))
      return ThrowException('called_non_callable', key);

    return func.Call(obj, args || emptyArgs);
  }

  // ## GetIdentifierReference

  function GetIdentifierReference(lex, name, strict){
    if (lex == null) {
      return new Reference(undefined, name, strict);
    } else if (lex.HasBinding(name)) {
      return new Reference(lex, name, strict);
    } else {
      return GetIdentifierReference(lex.outer, name, strict);
    }
  }

  function GetSymbol(context, name){
    var env = context.LexicalEnvironment;
    while (env) {
      if (env.HasSymbolBinding(name)) {
        return env.GetSymbol(name);
      }
      env = env.outer;
    }
  }

  // ## IsPropertyReference

  function IsPropertyReference(v){
    var type = typeof v.base;
    return type === 'string'
        || type === 'number'
        || type === 'boolean'
        || v.base instanceof $Object;
  }

  operators.IsPropertyReference = IsPropertyReference;

  // ## ToObject

  function ToObject(argument){
    switch (typeof argument) {
      case 'boolean':
        return new $Boolean(argument);
      case 'number':
        return new $Number(argument);
      case 'string':
        return new $String(argument);
      case 'undefined':
        return ThrowException('undefined_to_object', []);
      case 'object':
        if (argument === null) {
          return ThrowException('null_to_object', []);
        } else if (argument.Completion) {
          if (argument.Abrupt) {
            return argument;
          }
          return ToObject(argument.value);
        }
        return argument;
    }
  }


  function ThrowStopIteration(){
    return new AbruptCompletion('throw', intrinsics.StopIteration);
  }

  function IsStopIteration(o){
    return !!(o && o.Abrupt && o.value && o.value.BuiltinBrand === StopIteration);
  }


  var PropertyDefinitionEvaluation = (function(){
    function makeDefiner(constructs, field, desc){
      return function(obj, key, code) {

        var sup = code.flags.usesSuper,
            lex = context.LexicalEnvironment,
            home = sup ? obj : undefined,
            $F = code.flags.generator ? $GeneratorFunction : $Function,
            func = new $F(METHOD, key, code.params, code, lex, code.flags.strict, undefined, home, sup);

        constructs && MakeConstructor(func);
        desc[field] = func;
        var result = obj.DefineOwnProperty(key, desc, false);
        desc[field] = undefined;

        return result && result.Abrupt ? result : func;
      };
    }

    var DefineMethod = makeDefiner(false, 'Value', {
      Value: undefined,
      Writable: true,
      Enumerable: true,
      Configurable: true
    });

    var DefineGetter = makeDefiner(true, 'Get', {
      Get: undefined,
      Enumerable: true,
      Configurable: true
    });

    var DefineSetter = makeDefiner(true, 'Set', {
      Set: undefined,
      Enumerable: true,
      Configurable: true
    });

    return function PropertyDefinitionEvaluation(kind, obj, key, code){
      if (kind === 'get') {
        return DefineGetter(obj, key, code);
      } else if (kind === 'set') {
        return DefineSetter(obj, key, code);
      } else if (kind === 'method') {
        return DefineMethod(obj, key, code);
      }
    };
  })();



  var mutable = {
    Value: undefined,
    Writable: true,
    Enumerable: true,
    Configurable: true
  };

  var immutable = {
    Value: undefined,
    Writable: true,
    Enumerable: true,
    Configurable: false
  };


  function TopLevelDeclarationInstantiation(code){
    var env = context.VariableEnvironment,
        configurable = code.scopeType === SCOPE.EVAL,
        decls = code.lexicalDecls;

    var desc = configurable ? mutable : immutable;

    for (var i=0, decl; decl = decls[i]; i++) {
      if (decl.type === 'FunctionDeclaration') {
        var name = decl.id.name;
        if (env.HasBinding(name)) {
          env.CreateMutableBinding(name, configurable);
        } else if (env === realm.globalEnv) {
          var existing = global.GetOwnProperty(name);
          if (!existing) {
            global.DefineOwnProperty(name, desc, true);
          } else if (IsAccessorDescriptor(existing) || !existing.Writable && !existing.Enumerable) {
            return ThrowException('global invalid define');
          }
        }

        env.SetMutableBinding(name, InstantiateFunctionDeclaration(decl, context.LexicalEnvironment), code.flags.strict);
      }
    }

    for (var i=0; i < code.varDecls.length; i++) {
      var name = code.varDecls[i];
      if (!env.HasBinding(name)) {
        env.CreateMutableBinding(name, configurable);
        env.SetMutableBinding(name, undefined, code.flags.strict);
      } else if (env === realm.globalEnv) {
        var existing = global.GetOwnProperty(name);
        if (!existing) {
          global.DefineOwnProperty(name, desc, true);
        }
      }
    }
  }


  // ## FunctionDeclarationInstantiation

  function FunctionDeclarationInstantiation(func, args, env){
    var formals = func.FormalParameters,
        params = formals.boundNames;

    for (var i=0; i < params.length; i++) {
      if (!env.HasBinding(params[i])) {
        env.CreateMutableBinding(params[i]);
        env.InitializeBinding(params[i], undefined);
      }
    }

    var decls = func.code.lexicalDecls;

    for (var i=0, decl; decl = decls[i]; i++) {
      var names = decl.boundNames;
      for (var j=0; j < names.length; j++) {
        if (!env.HasBinding(names[j])) {
          if (decl.IsConstantDeclaration) {
            env.CreateImmutableBinding(names[j]);
          } else {
            env.CreateMutableBinding(names[j], false);
          }
        }
      }
    }

    if (func.strict) {
      var ao = new $strictArguments(args);
      var status = ArgumentBindingInitialization(formals, ao, env);
    } else {
      var ao = env.arguments = new $MappedArguments(params, env, args, func);
      var status = ArgumentBindingInitialization(formals, ao);
    }

    if (status && status.Abrupt) {
      return status;
    }

    if (!env.HasBinding('arguments')) {
      if (func.strict) {
        env.CreateImmutableBinding('arguments');
      } else {
        env.CreateMutableBinding('arguments');
      }
      env.InitializeBinding('arguments', ao);
    }


    var vardecls = func.code.varDecls;
    for (var i=0; i < vardecls.length; i++) {
      if (!env.HasBinding(vardecls[i])) {
        env.CreateMutableBinding(vardecls[i]);
        env.InitializeBinding(vardecls[i], undefined);
      }
    }

    var funcs = create(null);

    for (var i=0; i < decls.length; i++) {
      if (decls[i].type === 'FunctionDeclaration') {
        var decl = decls[i],
            name = decl.id.name;

        if (!(name in funcs)) {
          funcs[name] = true;
          env.InitializeBinding(name, InstantiateFunctionDeclaration(decl, env));
        }
      }
    }
  }

  function Brand(name){
    this.name = name;
  }

  function getKey(v){
    if (!v || typeof v === 'string') {
      return v;
    }
    if (v[0] !== '@') {
      return v[1];
    }

    return context.getSymbol(v[1]);
  }
  // ## ClassDefinitionEvaluation

  function ClassDefinitionEvaluation(name, superclass, constructorCode, methods, symbols){
    if (superclass === undefined) {
      var superproto = intrinsics.ObjectProto,
          superctor = intrinsics.FunctionProto;
    } else {
      if (superclass && superclass.Completion) {
        if (superclass.Abrupt) return superclass; else superclass = superclass.value;
      }

      if (superclass === null) {
        superproto = null;
        superctor = intrinsics.FunctionProto;
      } else if (typeof superclass !== 'object') {
        return ThrowException('non_object_superclass');
      } else if (!('Construct' in superclass)) {
        superproto = superclass;
        superctor = intrinsics.FunctionProto;
      } else {
        superproto = superclass.Get('prototype');
        if (superproto && superproto.Completion) {
          if (superproto.Abrupt) return superproto; else superproto = superproto.value;
        }

        if (typeof superproto !== 'object') {
          return ThrowException('non_object_superproto');
        }
        superctor = superclass;
      }
    }

    var proto = new $Object(superproto),
        brand = name || '';

    for (var i=0; i < symbols[0].length; i++) {
      var symbol   = symbols[0][i],
          isPublic = symbols[1][i],
          result   = context.initializeSymbolBinding(symbol, context.createSymbol(symbol, isPublic));

      if (result && result.Abrupt) {
        return result;
      }
    }


    if (name) {
      context.LexicalEnvironment.CreateImmutableBinding(name);
    }

    if (!constructorCode) {
      constructorCode = intrinsics.EmptyClass.code;
    }

    var ctor = PropertyDefinitionEvaluation('method', proto, 'constructor', constructorCode);
    if (ctor && ctor.Completion) {
      if (ctor.Abrupt) return ctor; else ctor = ctor.value;
    }

    if (name) {
      context.initializeBinding(name, ctor);
    }

    MakeConstructor(ctor, false, proto);
    ctor.Class = true;
    ctor.SetInheritance(superctor);
    ctor.set('name', brand);
    ctor.define('prototype', proto, ___);
    proto.define('constructor', ctor, _CW);
    proto.IsClassProto = true;
    proto.Brand = new Brand(brand);

    each(methods, function(method){
      PropertyDefinitionEvaluation(method.kind, proto, getKey(method.name), method.code);
    });

    return ctor;
  }

  // ## InstantiateFunctionDeclaration

  function InstantiateFunctionDeclaration(decl, env){
    var code = decl.code;
    var $F = code.generator ? $GeneratorFunction : $Function;
    var func = new $F(NORMAL, decl.id.name, code.params, code, env, code.flags.strict);
    MakeConstructor(func);
    return func;
  }


  // ## BlockDeclarationInstantiation

  function BlockDeclarationInstantiation(decls, env){
    for (var i=0, decl; decl = decls[i]; i++) {
      for (var j=0, name; name = decl.boundNames[j]; j++) {
        if (decl.IsConstantDeclaration) {
          env.CreateImmutableBinding(name);
        } else {
          env.CreateMutableBinding(name, false);
        }
      }
    }

    for (i=0; decl = decls[i]; i++) {
      if (decl.type === 'FunctionDeclaration') {
        env.InitializeBinding(decl.id.name, InstantiateFunctionDeclaration(decl, env));
      }
    }
  }



  // ## IdentifierResolution

  function IdentifierResolution(context, name) {
    return GetIdentifierReference(context.LexicalEnvironment, name, context.strict);
  }

  // ## BindingInitialization

  function BindingInitialization(pattern, value, env){
    if (pattern.type === 'Identifier') {
      if (env) {
        env.InitializeBinding(pattern.name, value);
      } else {
        return PutValue(IdentifierResolution(context, pattern.name), value);
      }
    } else if (pattern.type === 'ArrayPattern') {
      return IndexedBindingInitialization(pattern, value, 0, env);
    } else if (pattern.type === 'ObjectPattern') {
      return ObjectBindingInitialization(pattern, value, env);
    }
  }

  // ## ArgumentBindingInitialization

  function ArgumentBindingInitialization(params, args, env){
    for (var i = 0, arg; arg = params[i]; i++) {
      var value = args.HasProperty(i) ? args.Get(i) : undefined;
      if (value && value.Completion) {
        if (value.Abrupt) {
          return value;
        } else {
          value = value.value;
        }
      }
      BindingInitialization(arg, value, env);
    }
    if (params.Rest) {
      var len = args.get('length') - params.length,
          array = new $Array(0);

      if (len > 0) {
        for (var i=0; i < len; i++) {
          array.define(i, args.get(params.length + i));
        }
        array.define('length', len, 4);
      }
      BindingInitialization(params.Rest, array, env);
    }
  }


  // ## IndexedBindingInitialization

  function IndexedBindingInitialization(pattern, array, i, env){
    for (var element; element = pattern.elements[i]; i++) {
      if (element.type === 'SpreadElement') {
        var value = context.destructureSpread(array, i);
        if (value.Abrupt) {
          return value;
        }
        return BindingInitialization(element.argument, value, env);
      }

      var value = array.HasProperty(i) ? array.Get(i) : undefined;
      if (value && value.Completion) {
        if (value.Abrupt) {
          return value;
        } else {
          value = value.value;
        }
      }
      BindingInitialization(element, value, env);
    }
    return i;
  }

  // ## ObjectBindingInitialization

  function ObjectBindingInitialization(pattern, object, env){
    for (var i=0; property = pattern.properties[i]; i++) {
      var value = object.HasProperty(property.key.name) ? object.Get(property.key.name) : undefined;
      if (value && value.Completion) {
        if (value.Abrupt) {
          return value;
        } else {
          value = value.value;
        }
      }
      BindingInitialization(property.value, value, env);
    }
  }




  function CollectionInitializer(Data, name){
    var data = name + 'Data';
    return function(object, iterable){
      object[data] = new Data;

      if (iterable === undefined) {
        return object;
      }

      iterable = ToObject(iterable);
      if (iterable && iterable.Completion) {
        if (iterable.Abrupt) {
          return iterable;
        } else {
          iterable = iterable.value;
        }
      }

      var iterator = Invoke(intrinsics.iterator, iterable);

      var adder = object.Get('set');
      if (adder && adder.Completion) {
        if (adder.Abrupt) {
          return adder;
        } else {
          adder = adder.value;
        }
      }

      if (!IsCallable(adder)) {
        return ThrowException('called_on_incompatible_object', [name + '.prototype.set']);
      }

      var next;
      while (next = Invoke('next', iterator)) {
        if (IsStopIteration(next)) {
          return object;
        }

        if (next && next.Completion) {
          if (next.Abrupt) return next; else next = next.value;
        }

        next = ToObject(next);

        var k = next.Get(0);
        if (k && k.Completion) {
          if (k.Abrupt) return k; else k = k.value;
        }

        var v = next.Get(1);
        if (v && v.Completion) {
          if (v.Abrupt) return v; else v = v.value;
        }

        var status = adder.Call(object, [k, v]);
        if (status && status.Abrupt) {
          return status;
        }
      }
      return object;
    };
  }


  var MapData = (function(){
    function LinkedItem(key, next){
      this.key = key;
      this.next = next;
      this.previous = next.previous;
      next.previous = next.previous.next = this;
    }

    define(LinkedItem.prototype, [
      function unlink(){
        this.next.previous = this.previous;
        this.previous.next = this.next;
        this.next = this.previous = this.data = this.key = null;
        return this.data;
      }
    ]);


    function MapData(){
      this.id = uid++ + '';
      this.guard = create(LinkedItem.prototype);
      this.guard.key = {};
      this.reset();
    }

    MapData.sigil = create(null);

    define(MapData.prototype, [
      function reset(){
        this.size = 0;
        this.strings = create(null);
        this.numbers = create(null);
        this.others = create(null);
        this.lastLookup = this.guard.next = this.guard.previous = this.guard;
      },
      function clear(){
        var next, item = this.guard.next;

        while (item !== this.guard) {
          next = item.next;
          if (item.key !== null && typeof item.key === 'object') {
            delete item.key.storage[this.id];
          }
          item.next = item.previous = item.data = item.key = null;
          item = next;
        }

        this.reset();
      },
      function add(key){
        this.size++;
        return new LinkedItem(key, this.guard);
      },
      function lookup(key){
        var type = typeof key;
        if (key === this) {
          return this.guard;
        } else if (key !== null && type === 'object') {
          return key.storage[this.id];
        } else {
          return this.getStorage(key)[key];
        }
      },
      function getStorage(key){
        var type = typeof key;
        if (type === 'string') {
          return this.strings;
        } else if (type === 'number') {
          return key === 0 && 1 / key === -Infinity ? this.others : this.numbers;
        } else {
          return this.others;
        }
      },
      function set(key, value){
        var type = typeof key;
        if (key !== null && type === 'object') {
          var item = key.storage[this.id] || (key.storage[this.id] = this.add(key));
          item.value = value;
        } else {
          var container = this.getStorage(key);
          var item = container[key] || (container[key] = this.add(key));
          item.value = value;
        }
      },
      function get(key){
        var item = this.lookup(key);
        if (item) {
          return item.value;
        }
      },
      function has(key){
        return !!this.lookup(key);
      },
      function remove(key){
        var item;
        if (key !== null && typeof key === 'object') {
          item = key.storage[this.id];
          if (item) {
            delete key.storage[this.id];
          }
        } else {
          var container = this.getStorage(key);
          item = container[key];
          if (item) {
            delete container[key];
          }
        }

        if (item) {
          item.unlink();
          this.size--;
          return true;
        }
        return false;
      },
      function after(key){
        if (key === MapData.sigil) {
          var item = this.guard;
        } else if (key === this.lastLookup.key) {
          var item = this.lastLookup;
        } else {
          var item = this.lookup(key);
        }
        if (item && item.next !== this.guard) {
          this.lastLookup = item.next;
          return [item.next.key, item.next.value];
        }
      }
    ]);

    return MapData;
  })();


  var WeakMapData = (function(){
    function WeakMapData(){
      this.id = uid++ + '';
    }

    define(WeakMapData.prototype, [
      function set(key, value){
        if (value === undefined) {
          value = Empty;
        }
        key.storage[this.id] = value;
      },
      function get(key){
        var value = key.storage[this.id];
        if (value !== Empty) {
          return value;
        }
      },
      function has(key){
        return key.storage[this.id] !== undefined;
      },
      function remove(key){
        var item = key.storage[this.id];
        if (item !== undefined) {
          key.storage[this.id] = undefined;
          return true;
        }
        return false;
      }
    ]);

    return WeakMapData;
  })();


  function Element(context, prop, base){
    var result = CheckObjectCoercible(base);
    if (result.Abrupt) {
      return result;
    }

    var name = ToPropertyName(prop);
    if (name && name.Completion) {
      if (name.Abrupt) return name; else name = name.value;
    }

    return new Reference(base, name, context.strict);
  }

  function SuperReference(context, prop){
    var env = context.getThisEnvironment();
    if (!env.HasSuperBinding()) {
      return ThrowException('invalid_super_binding');
    } else if (prop === null) {
      return env;
    }

    var baseValue = env.GetSuperBase(),
        status = CheckObjectCoercible(baseValue);

    if (status.Abrupt) {
      return status;
    }

    if (prop === false) {
      var key = env.GetMethodName();
    } else {
      var key = ToPropertyName(prop);
      if (key && key.Completion) {
        if (key.Abrupt) return key; else return key.value;
      }
    }

    var ref = new Reference(baseValue, key, context.strict);
    ref.thisValue = env.GetThisBinding();
    return ref;
  }

  function GetThisEnvironment(context){
    var env = context.LexicalEnvironment;
    while (env) {
      if (env.HasThisBinding())
        return env;
      env = env.outer;
    }
  }


  function ThisResolution(context){
    return GetThisEnvironment(context).GetThisBinding();
  }

  function EvaluateConstruct(func, args) {
    if (typeof func !== 'object') {
      return ThrowException('not_constructor', func);
    }

    if ('Construct' in func) {
      return func.Construct(args);
    } else {
      return ThrowException('not_constructor', func);
    }
  }

  function EvaluateCall(ref, func, args, tail){
    if (typeof func !== 'object' || !IsCallable(func)) {
      return ThrowException('called_non_callable', [ref && ref.name]);
    }

    if (ref instanceof Reference) {
      var receiver = IsPropertyReference(ref) ? GetThisValue(ref) : ref.base.WithBaseObject();
    }

    // if (tail) {
    //   var leafContext = context;
    //   leafContext.pop();
    // }

    return func.Call(receiver, args);
  }

  function SpreadArguments(precedingArgs, spread){
    if (typeof spread !== 'object') {
      return ThrowException('spread_non_object');
    }

    var offset = precedingArgs.length,
        len = ToUint32(spread.Get('length'));

    if (len && len.Completion) {
      if (len.Abrupt) return len; else return len.value;
    }

    for (var i=0; i < len; i++) {
      var value = spread.Get(i);
      if (value && value.Completion) {
        if (value.Abrupt) return value; else value = value.value;
      }

      precedingArgs[i + offset] = value;
    }
  }

  function SpreadInitialization(array, offset, spread){
    if (typeof spread !== 'object') {
      return ThrowException('spread_non_object');
    }

    var len = ToUint32(spread.Get('length'));

    for (var i = offset; i < len; i++) {
      var value = spread.Get(i);
      if (value && value.Completion) {
        if (value.Abrupt) return value; else value = value.value;
      }

      array.define(offset++, value, ECW);
    }

    array.define('length', offset, _CW);
    return offset;
  }

  function GetTemplateCallSite(context, template){
    if (!('id' in template)) {
      GetTemplateCallSite.count = (GetTemplateCallSite.count || 0) + 1;
      template.id = GetTemplateCallSite.count;
    }
    if (template.id in realm.templates) {
      return context.Realm.templates[template.id];
    }

    var count = template.length,
        site = context.createArray(count),
        raw = context.createArray(count);

    for (var i=0; i < count; i++) {
      site.define(i+'', template[i].cooked, E__);
      raw.define(i+'', template[i].raw, E__);
    }

    site.define('length', count, ___);
    raw.define('length', count, ___);
    site.define('raw', raw, ___);
    site.PreventExtensions(false);
    raw.PreventExtensions(false);
    realm.templates[template.id] = site;
    return site;
  }

  function SpreadDestructuring(context, target, index){
    var array = context.createArray(0);
    if (target == null) {
      return array;
    }
    if (typeof target !== 'object') {
      return ThrowException('spread_non_object', typeof target);
    }

    var len = ToUint32(target.Get('length'));
    if (len && len.Completion) {
      if (len.Abrupt) return len; else len = len.value;
    }

    var count = len - index;
    for (var i=0; i < count; i++) {
      var value = target.Get(index + i);
      if (value && value.Completion) {
        if (value.Abrupt) return value; else value = value.value;
      }
      array.define(i, value, ECW);
    }

    array.define('length', i, _CW);
    return array;
  }


  // ###########################
  // ###########################
  // ### Specification Types ###
  // ###########################
  // ###########################


  // #################
  // ### Reference ###
  // #################


  var Reference = (function(){
    function Reference(base, name, strict){
      this.base = base;
      this.name = name;
      this.strict = strict;
    }
    define(Reference.prototype, {
      Reference: SYMBOLS.Reference
    });

    return Reference;
  })();






  // ##########################
  // ### PropertyDescriptor ###
  // ##########################

  function PropertyDescriptor(attributes){
    this.Enumerable = (attributes & E) > 0;
    this.Configurable = (attributes & C) > 0;
  }

  define(PropertyDescriptor.prototype, {
    Enumerable: undefined,
    Configurable: undefined
  });

  function DataDescriptor(value, attributes){
    this.Value = value;
    this.Writable = (attributes & W) > 0;
    this.Enumerable = (attributes & E) > 0;
    this.Configurable = (attributes & C) > 0;
  }

  inherit(DataDescriptor, PropertyDescriptor, {
    Writable: undefined,
    Value: undefined
  });

  function AccessorDescriptor(accessors, attributes){
    this.Get = accessors.Get;
    this.Set = accessors.Set;
    this.Enumerable = (attributes & E) > 0;
    this.Configurable = (attributes & C) > 0;
  }

  inherit(AccessorDescriptor, PropertyDescriptor, {
    Get: undefined,
    Set: undefined
  });

  function NormalDescriptor(value){
    this.Value = value;
  }

  var emptyValue = NormalDescriptor.prototype = new DataDescriptor(undefined, ECW);

  function StringIndice(value){
    this.Value = value;
  }

  StringIndice.prototype = new DataDescriptor(undefined, E__);


  function Value(value){
    this.Value = value;
  }

  function ArrayBufferIndice(value){
    this.Value = value;
  }

  ArrayBufferIndice.prototype = new DataDescriptor(undefined, E_W);


  function Accessor(get, set){
    this.Get = get;
    this.Set = set;
  }

  define(Accessor.prototype, {
    Get: undefined,
    Set: undefined
  });


  function BuiltinAccessor(get, set){
    if (get) this.Get = { Call: get };
    if (set) this.Set = { Call: set };
  }

  inherit(BuiltinAccessor, Accessor);


  function ArgAccessor(name, env){
    this.name = name;
    define(this, { env: env  });
  }

  inherit(ArgAccessor, Accessor, {
    Get: { Call: function(){ return this.env.GetBindingValue(this.name) } },
    Set: { Call: function(v){ this.env.SetMutableBinding(this.name, v) } }
  });



  // #########################
  // ### EnvironmentRecord ###
  // #########################

  var EnvironmentRecord = (function(){
    function EnvironmentRecord(bindings, outer){
      this.bindings = bindings;
      this.outer = outer;
    }

    define(EnvironmentRecord.prototype, {
      bindings: null,
      withBase: undefined,
      type: 'Environment',
      Environment: true
    });

    define(EnvironmentRecord.prototype, [
      function EnumerateBindings(){},
      function HasBinding(name){},
      function GetBindingValue(name, strict){},
      function SetMutableBinding(name, value, strict){},
      function DeleteBinding(name){},
      function WithBaseObject(){
        return this.withBase;
      },
      function HasThisBinding(){
        return false;
      },
      function HasSuperBinding(){
        return false;
      },
      function GetThisBinding(){},
      function GetSuperBase(){},
      function HasSymbolBinding(name){
        if (this.symbols) {
          return name in this.symbols;
        }
        return false;
      },
      function InitializeSymbolBinding(name, symbol){
        if (!this.symbols) {
          this.symbols = create(null);
        }
        if (name in this.symbols) {
          return ThrowException('symbol_redefine', name);
        }
        this.symbols[name] = symbol;
      },
      function GetSymbol(name){
        if (this.symbols && name in this.symbols) {
          return this.symbols[name];
        } else{
          return ThrowException('symbol_not_defined', name);
        }
      },
      function reference(name, strict){
        return new Reference(this, name, strict);
      }
    ]);

    return EnvironmentRecord;
  })();

  var DeclarativeEnvironmentRecord = (function(){
    function DeclarativeEnvironmentRecord(outer){
      EnvironmentRecord.call(this, new Hash, outer);
      this.consts = new Hash;
      this.deletables = new Hash;
    }

    inherit(DeclarativeEnvironmentRecord, EnvironmentRecord, {
      type: 'Declarative Env'
    }, [
      function EnumerateBindings(){
        return ownKeys(this.bindings);
      },
      function HasBinding(name){
        return name in this.bindings;
      },
      function CreateMutableBinding(name, deletable){
        this.bindings[name] = undefined;
        if (deletable)
          this.deletables[name] = true;
      },
      function InitializeBinding(name, value){
        this.bindings[name] = value;
      },
      function GetBindingValue(name, strict){
        if (name in this.bindings) {
          var value = this.bindings[name];
          if (value === Uninitialized)
            return ThrowException('uninitialized_const', name);
          else
            return value;
        } else if (strict) {
          return ThrowException('not_defined', name);
        } else {
          return false;
        }
      },
      function SetMutableBinding(name, value, strict){
        if (name in this.consts) {
          if (this.bindings[name] === Uninitialized)
            return ThrowException('uninitialized_const', name);
          else if (strict)
            return ThrowException('const_assign', name);
        } else {
          this.bindings[name] = value;
        }
      },
      function CreateImmutableBinding(name){
        this.bindings[name] = Uninitialized;
        this.consts[name] = true;
      },
      function DeleteBinding(name){
        if (name in this.bindings) {
          if (name in this.deletables) {
            delete this.bindings[name];
            delete this.deletables[names];
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    ]);

    return DeclarativeEnvironmentRecord;
  })();


  var ObjectEnvironmentRecord = (function(){
    function ObjectEnvironmentRecord(object, outer){
      EnvironmentRecord.call(this, object, outer);
    }

    inherit(ObjectEnvironmentRecord, EnvironmentRecord, {
      type: 'Object Env'
    }, [
      function EnumerateBindings(){
        return this.bindings.Enumerate(false, false);
      },
      function HasBinding(name){
        return this.bindings.HasProperty(name);
      },
      function CreateMutableBinding(name, deletable){
        return this.bindings.DefineOwnProperty(name, emptyValue, true);
      },
      function InitializeBinding(name, value){
        return this.bindings.DefineOwnProperty(name, new NormalDescriptor(value), true);
      },
      function GetBindingValue(name, strict){
        if (this.bindings.HasProperty(name)) {
          return this.bindings.Get(name);
        } else if (strict) {
          return ThrowException('not_defined', name);
        }
      },
      function SetMutableBinding(name, value, strict){
        return this.bindings.Put(name, value, strict);
      },
      function DeleteBinding(name){
       return this.bindings.Delete(name, false);
      }
    ]);

    return ObjectEnvironmentRecord;
  })();



  var FunctionEnvironmentRecord = (function(){
    function FunctionEnvironmentRecord(receiver, method){
      DeclarativeEnvironmentRecord.call(this, method.Scope);
      this.thisValue = receiver;
      this.HomeObject = method.HomeObject;
      this.MethodName = method.MethodName;
    }

    inherit(FunctionEnvironmentRecord, DeclarativeEnvironmentRecord, {
      HomeObject: undefined,
      MethodName: undefined,
      thisValue: undefined,
      type: 'Function Env'
    }, [
      function HasThisBinding(){
        return true;
      },
      function HasSuperBinding(){
        return this.HomeObject !== undefined;
      },
      function GetThisBinding(){
        return this.thisValue;
      },
      function GetSuperBase(){
        return this.HomeObject ? this.HomeObject.GetInheritance() : undefined;
      },
      function GetMethodName() {
        return this.MethodName;
      }
    ]);

    return FunctionEnvironmentRecord;
  })();



  var GlobalEnvironmentRecord = (function(){
    function GlobalEnvironmentRecord(global){
      ObjectEnvironmentRecord.call(this, global);
      this.thisValue = this.bindings;
      global.env = this;
      hide(global, 'env');
    }

    inherit(GlobalEnvironmentRecord, ObjectEnvironmentRecord, {
      outer: null,
      type: 'Global Env'
    }, [
      function GetThisBinding(){
        return this.bindings;
      },
      function HasThisBinding(){
        return true;
      },
      function inspect(){
        return '[GlobalEnvironmentRecord]';
      }
    ]);

    return GlobalEnvironmentRecord;
  })();



  // ###############
  // ### $Object ###
  // ###############

  var $Object = (function(){
    var Proto = {
      Get: {
        Call: function(receiver){
          return receiver.GetInheritance();
        }
      },
      Set: {
        Call: function(receiver, args){
          return receiver.SetInheritance(args[0]);
        }
      }
    };


    function $Object(proto){
      if (proto === undefined) {
        proto = intrinsics.ObjectProto;
      }
      this.Realm = realm;
      this.Prototype = proto;
      this.properties = new PropertyList;
      this.storage = create(null);
      $Object.tag(this);
      if (proto === null) {
        this.properties.setProperty(['__proto__', null, 6, Proto]);
      }

      hide(this, 'storage');
      hide(this, 'Prototype');
      hide(this, 'Realm');
    }

    var counter = 0;
    define($Object, function tag(object){
      if (object.id === undefined) {
        object.id = counter++;
        hide(object, 'id');
      }
    });

    define($Object.prototype, {
      Extensible: true,
      BuiltinBrand: BRANDS.BuiltinObject
    });

    void function(){
      define($Object.prototype, [
        function has(key){
          return this.properties.has(key);
        },
        function remove(key){
          return this.properties.remove(key);
        },
        function describe(key){
          return this.properties.getProperty(key);
        },
        (function(){
          return function define(key, value, attrs){
            return this.properties.set(key, value, attrs);
          };
        })(),
        function get(key){
          return this.properties.get(key);
        },
        function set(key, value){
          if (this.properties.has(key)) {
            this.properties.set(key, value);
          } else {
            this.properties.set(key, value, ECW);
          }
        },
        function query(key){
          return this.properties.getAttribute(key);
        },
        function update(key, attr){
          this.properties.setAttribute(key, attr);
        },
        function each(callback){
          this.properties.forEach(callback, this);
        }
      ]);
    }();


    define($Object.prototype, [
      function GetInheritance(){
        return this.Prototype;
      },
      function SetInheritance(value){
        if (typeof value === 'object' && this.IsExtensible()) {
          var proto = value;
          while (proto) {
            if (proto === this) {
              return ThrowException('cyclic_proto');
            }
            proto = proto.GetInheritance();
          }
          this.BuiltinBrand = this.BuiltinBrand;
          this.Prototype = value;
          return true;
        } else {
          return false;
        }
      },
      function IsExtensible(){
        return this.Extensible;
      },
      function PreventExtensions(v){
        v = !!v;
        if (this.Extensible) {
          this.Extensible = v;
        }
        return this.Extensible === v;
      },
      function GetOwnProperty(key){
        if (key === '__proto__') {
          var val = this.GetP(this, '__proto__');
          return typeof val === 'object' ? new DataDescriptor(val, _CW) : undefined;
        }

        var prop = this.describe(key);
        if (prop) {
          if (prop[2] & A) {
            var Descriptor = AccessorDescriptor,
                val = prop[1];
          } else {
            var val = prop[3] ? prop[3].Get.Call(this, []) : prop[1],
                Descriptor = DataDescriptor;
          }
          return new Descriptor(val, prop[2]);
        }
      },
      function GetProperty(key){
        var desc = this.GetOwnProperty(key);
        if (desc) {
          return desc;
        } else {
          var proto = this.GetInheritence();
          if (proto) {
            return proto.GetProperty(key);
          }
        }
      },
      function Get(key){
        return this.GetP(this, key);
      },
      function Put(key, value, strict){
        if (!this.SetP(this, key, value) && strict) {
          return ThrowException('strict_cannot_assign', [key]);
        }
      },
      function GetP(receiver, key){
        var prop = this.describe(key);
        if (!prop) {
          var proto = this.GetInheritance();
          if (proto) {
            return proto.GetP(receiver, key);
          }
        } else if (prop[3]) {
          var getter = prop[3].Get;
          return getter.Call(receiver, []);
        } else if (prop[2] & A) {
          var getter = prop[1].Get;
          if (IsCallable(getter)) {
            return getter.Call(receiver, []);
          }
        } else {
          return prop[1];
        }
      },
      function SetP(receiver, key, value) {
        var prop = this.describe(key);
        if (prop) {
          if (prop[3]) {
            var setter = prop[3].Set;
            setter.Call(receiver, [value]);
            return true;
          } else if (prop[2] & A) {
            var setter = prop[1].Set;
            if (IsCallable(setter)) {
              setter.Call(receiver, [value]);
              return true;
            } else {
              return false;
            }
          } else if (prop[2] & W) {
            if (this === receiver) {
              return this.DefineOwnProperty(key, new Value(value), false);
            } else if (!receiver.IsExtensible()) {
              return false;
            } else {
              return receiver.DefineOwnProperty(key, new DataDescriptor(value, ECW), false);
            }
          } else {
            return false;
          }
        } else {
          var proto = this.GetInheritance();
          if (!proto) {
            if (!receiver.IsExtensible()) {
              return false;
            } else {
              return receiver.DefineOwnProperty(key, new DataDescriptor(value, ECW), false);
            }
          } else {
            return proto.SetP(receiver, key, value);
          }
        }
      },
      function DefineOwnProperty(key, desc, strict){
        var reject = strict
            ? function(e, a){ return ThrowException(e, a) }
            : function(e, a){ return false };

        var current = this.GetOwnProperty(key);

        if (current === undefined) {
          if (!this.IsExtensible()) {
            return reject('define_disallowed', []);
          } else {
            if (IsGenericDescriptor(desc) || IsDataDescriptor(desc)) {
              this.define(key, desc.Value, desc.Enumerable | (desc.Configurable << 1) | (desc.Writable << 2));
            } else {
              this.define(key, new Accessor(desc.Get, desc.Set), desc.Enumerable | (desc.Configurable << 1) | A);
            }
            return true;
          }
        } else {
          var rejected = false;
          if (IsEmptyDescriptor(desc) || IsEquivalentDescriptor(desc, current)) {
            return;
          }

          if (!current.Configurable) {
            if (desc.Configurable || desc.Enumerable === !current.Enumerable) {
              return reject('redefine_disallowed', []);
            } else {
              var currentIsData = IsDataDescriptor(current),
                  descIsData = IsDataDescriptor(desc);

              if (currentIsData !== descIsData)
                return reject('redefine_disallowed', []);
              else if (currentIsData && descIsData)
                if (!current.Writable && 'Value' in desc && desc.Value !== current.Value)
                  return reject('redefine_disallowed', []);
              else if ('Set' in desc && desc.Set !== current.Set)
                return reject('redefine_disallowed', []);
              else if ('Get' in desc && desc.Get !== current.Get)
                return reject('redefine_disallowed', []);
            }
          }

          'Configurable' in desc || (desc.Configurable = current.Configurable);
          'Enumerable' in desc || (desc.Enumerable = current.Enumerable);

          var prop = this.describe(key);

          if (IsAccessorDescriptor(desc)) {
            this.update(key, desc.Enumerable | (desc.Configurable << 1) | A);
            if (IsDataDescriptor(current)) {
              this.set(key, new Accessor(desc.Get, desc.Set));
            } else {
              var accessor = prop[1],
                  setter = 'Set' in desc,
                  getter = 'Get' in desc;

              if (setter) {
                accessor.Set = desc.Set;
              }
              if (getter) {
                accessor.Get = desc.Get;
              }
              if (setter || getter) {
                this.set(key, accessor)
              }
            }
          } else {
            if (IsAccessorDescriptor(current)) {
              current.Writable = true;
            }
            'Writable' in desc || (desc.Writable = current.Writable);
            if ('Value' in desc) {
              this.set(key, desc.Value)
            }
            this.update(key, desc.Enumerable | (desc.Configurable << 1) | (desc.Writable << 2));
          }

          return true;
        }
      },
      function HasOwnProperty(key){
        return this.has(key);
      },
      function HasProperty(key){
        if (this.has(key)) {
          return true;
        } else {
          var proto = this.GetInheritance();
          if (proto) {
            return proto.HasProperty(key);
          } else {
            return false;
          }
        }
      },
      function Delete(key, strict){
        if (!this.has(key)) {
          return true;
        } else if (this.query(key) & C) {
          this.remove(key);
          return true;
        } else if (strict) {
          return ThrowException('strict_delete', []);
        } else {
          return false;
        }
      },
      function Iterate(){
        return Invoke(intrinsics.iterator, this, []);
      },
      function enumerator(){
        return new $Enumerator(this.Enumerate(true, true));
      },
      function Enumerate(includePrototype, onlyEnumerable){
        var props = [],
            seen = create(null);

        if (onlyEnumerable) {
          this.each(function(prop){
            var key = prop[0];
            if (typeof key === 'string' && !(key in seen) && (prop[2] & E)) {
              props.push(key);
              seen[key] = true;
            }
          });
        } else {
          this.each(function(prop){
            var key = prop[0];
            if (!(key in seen) && !key.Private) {
              props.push(key);
              seen[key] = true;
            }
          });
        }

        if (includePrototype) {
          var proto = this.GetInheritance();
          if (proto) {
            var inherited = proto.Enumerate(includePrototype, onlyEnumerable);
            for (var i=0; i < inherited.length; i++) {
              var key = inherited[i][0];
              if (!(key in seen)) {
                props.push(key);
                seen[key] = true;
              }
            }
          }
        }

        return props;
      },
      function DefaultValue(hint){
        var order = hint === 'String' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];

        for (var i=0; i < 2; i++) {
          var method = this.Get(order[i]);
          if (method && method.Completion) {
            if (method.Abrupt) return method; else method = method.value;
          }

          if (IsCallable(method)) {
            var value = method.Call(this, []);
            if (value && value.Completion) {
              if (value.Abrupt) return value; else value = value.value;
            }
            if (value === null || typeof value !== 'object') {
              return value;
            }
          }
        }

        return ThrowException('cannot_convert_to_primitive', []);
      }
      // function Keys(){

      // },
      // function OwnPropertyKeys(){

      // },
      // function Freeze(){

      // },
      // function Seal(){

      // },
      // function IsFrozen(){

      // },
      // function IsSealed(){

      // }
    ]);


    return $Object;
  })();

  var $Enumerator = (function(){
    function next(keys){
      this.keys = keys;
      this.index = 0;
      this.count = keys.length;
      this.depleted = false;
    }
    next.prototype.Call = function(obj){
      if (this.depleted || this.index >= this.count) {
        this.depleted = true;
        this.keys = null;
        return ThrowStopIteration();
      } else {
        return this.keys[this.index++];
      }
    }

    function $Enumerator(keys){
      this.next = ['next', new next(keys), 7];
    }

    inherit($Enumerator, $Object, [
      function has(key){
        return key === 'next';
      },
      function describe(key){
        if (key === 'next') {
          return this.next;
        }
      },
      function get(key){
        if (key === 'next') {
          return this.next[1];
        }
      },
      function Get(key){
        return this.next[1];
      }
    ]);

    return $Enumerator;
  })();

  var DefineOwn = $Object.prototype.DefineOwnProperty;

  // #################
  // ### $Function ###
  // #################

  var $Function = (function(){
    function $Function(kind, name, params, code, scope, strict, proto, holder, method){
      if (proto === undefined) {
        proto = intrinsics.FunctionProto;
      }

      $Object.call(this, proto);
      this.FormalParameters = params;
      this.ThisMode = kind === ARROW ? 'lexical' : strict ? 'strict' : 'global';
      this.strict = !!strict;
      this.Realm = realm;
      this.Scope = scope;
      this.code = code;
      if (holder !== undefined) {
        this.HomeObject = holder;
      }
      if (method) {
        this.MethodName = getKey(name);
      }

      if (strict) {
        this.define('arguments', intrinsics.ThrowTypeError, __A);
        this.define('caller', intrinsics.ThrowTypeError, __A);
      } else {
        this.define('arguments', null, ___);
        this.define('caller', null, ___);
      }

      this.define('length', params ? params.ExpectedArgumentCount : 0, ___);
      this.define('name', getKey(code.name), code.name && !code.flags.writableName ? ___ : __W);
    }

    inherit($Function, $Object, {
      BuiltinBrand: BRANDS.BuiltinFunction,
      FormalParameters: null,
      Code: null,
      Scope: null,
      strict: false,
      ThisMode: 'global',
      Realm: null
    }, [
      function Call(receiver, args, isConstruct){
        if (realm !== this.Realm) {
          activate(this.Realm);
        }
        if (this.ThisMode === 'lexical') {
          var local = new DeclarativeEnvironmentRecord(this.Scope);
        } else {
          if (this.ThisMode !== 'strict') {
            if (receiver == null) {
              receiver = this.Realm.global;
            } else if (typeof receiver !== 'object') {
              receiver = ToObject(receiver);
              if (receiver.Completion) {
                if (receiver.Abrupt) return receiver; else receiver = receiver.value;
              }
            }
          }
          var local = new FunctionEnvironmentRecord(receiver, this);
        }

        var caller = context ? context.callee : null;

        ExecutionContext.push(new ExecutionContext(context, local, realm, this.code, this, isConstruct));
        var status = FunctionDeclarationInstantiation(this, args, local);
        if (status && status.Abrupt) {
          ExecutionContext.pop();
          return status;
        }

        if (!this.thunk) {
          this.thunk = new Thunk(this.code);
          hide(this, 'thunk');
        }

        if (!this.strict) {
          this.define('arguments', local.arguments, ___);
          this.define('caller', caller, ___);
          local.arguments = null;
        }

        var result = this.thunk.run(context);

        if (!this.strict) {
          this.define('arguments', null, ___);
          this.define('caller', null, ___);
        }

        ExecutionContext.pop();
        return result && result.type === Return ? result.value : result;
      },
      function Construct(args){
        if (this.ThisMode === 'lexical') {
          return ThrowException('construct_arrow_function');
        }
        var prototype = this.Get('prototype');
        if (prototype && prototype.Completion) {
          if (prototype.Abrupt) return prototype; else prototype = prototype.value;
        }

        var instance = typeof prototype === 'object' ? new $Object(prototype) : new $Object;
        if (this.BuiltinConstructor) {
          instance.BuiltinBrand = prototype.BuiltinBrand;
        } else if (this.Class) {
          instance.Brand = prototype.Brand;
        }
        instance.ConstructorName = this.get('name');

        var result = this.Call(instance, args, true);
        if (result && result.Completion) {
          if (result.Abrupt) return result; else result = result.value;
        }
        return typeof result === 'object' ? result : instance;
      },
      function HasInstance(arg){
        if (typeof arg !== 'object' || arg === null) {
          return false;
        }

        var prototype = this.Get('prototype');
        if (prototype.Completion) {
          if (prototype.Abrupt) return prototype; else prototype = prototype.value;
        }

        if (typeof prototype !== 'object') {
          return ThrowException('instanceof_nonobject_proto');
        }

        while (arg) {
          arg = arg.GetInheritance();
          if (prototype === arg) {
            return true;
          }
        }
        return false;
      }
    ]);

    return $Function;
  })();


  var $BoundFunction = (function(){
    function $BoundFunction(target, boundThis, boundArgs){
      $Object.call(this, intrinsics.FunctionProto);
      this.ProxyTargetFunction = target;
      this.BoundThis = boundThis;
      this.BoundArgs = boundArgs;
      this.define('arguments', intrinsics.ThrowTypeError, __A);
      this.define('caller', intrinsics.ThrowTypeError, __A);
      this.define('length', target.get('length'), ___);
    }

    inherit($BoundFunction, $Function, {
      ProxyTargetFunction: null,
      BoundThis: null,
      BoundArguments: null
    }, [
      function Call(_, newArgs){
        return this.ProxyTargetFunction.Call(this.BoundThis, this.BoundArgs.concat(newArgs));
      },
      function Construct(newArgs){
        if (!this.ProxyTargetFunction.Construct) {
          return ThrowException('not_constructor', this.ProxyTargetFunction.name);
        }
        return this.ProxyTargetFunction.Construct(this.BoundArgs.concat(newArgs));
      },
      function HasInstance(arg){
        if (!this.ProxyTargetFunction.HasInstance) {
          return ThrowException('instanceof_function_expected', this.ProxyTargetFunction.name);
        }
        return This.ProxyTargetFunction.HasInstance(arg);
      }
    ]);

    return $BoundFunction;
  })();

  var $GeneratorFunction = (function(){
    function $GeneratorFunction(){
      $Function.apply(this, arguments);
    }

    inherit($GeneratorFunction, $Function, [
      function Call(receiver, args){
        if (realm !== this.Realm) {
          activate(this.Realm);
        }
        if (this.ThisMode === 'lexical') {
          var local = new DeclarativeEnvironmentRecord(this.Scope);
        } else {
          if (this.ThisMode !== 'strict') {
            if (receiver == null) {
              receiver = this.Realm.global;
            } else if (typeof receiver !== 'object') {
              receiver = ToObject(receiver);
              if (receiver.Completion) {
                if (receiver.Abrupt) return receiver; else receiver = receiver.value;
              }
            }
          }
          var local = new FunctionEnvironmentRecord(receiver, this);
        }

        var ctx = new ExecutionContext(context, local, this.Realm, this.code, this);
        ExecutionContext.push(ctx);

        var status = FunctionDeclarationInstantiation(this, args, local);
        if (status && status.Abrupt) {
          ExecutionContext.pop();
          return status;
        }

        if (!this.thunk) {
          this.thunk = new Thunk(this.code);
          hide(this, 'thunk');
        }

        var result = new $Generator(this.Realm, local, ctx, this.thunk);
        ExecutionContext.pop();
        return result;
      }
    ]);

    return $GeneratorFunction;
  })();


  var $Generator = (function(){
    var EXECUTING = 'executing',
        CLOSED    = 'closed',
        NEWBORN   = 'newborn';

    function setFunction(obj, name, func){
      obj.set(name, new $NativeFunction({
        name: name,
        length: func.length,
        call: func
      }));
    }

    function $Generator(realm, scope, ctx, thunk){
      $Object.call(this);
      this.Realm = realm;
      this.Scope = scope;
      this.code = thunk.code;
      this.ExecutionContext = ctx;
      this.State = NEWBORN;
      this.thunk = thunk;

      var self = this;
      setFunction(this, intrinsics.iterator, function(){ return self });
      setFunction(this, 'next',     function(){ return self.Send() });
      setFunction(this, 'close',    function(){ return self.Close() });
      setFunction(this, 'send',     function(v){ return self.Send(v) });
      setFunction(this, 'throw',    function(v){ return self.Throw(v) });
    }

    inherit($Generator, $Object, {
      Code: null,
      ExecutionContext: null,
      Scope: null,
      Handler: null,
      State: null
    }, [
      function Send(value){
        if (this.State === EXECUTING) {
          return ThrowException('generator_executing', 'send');
        } else if (this.State === CLOSED) {
          return ThrowException('generator_closed', 'send');
        }
        if (this.State === NEWBORN) {
          if (value !== undefined) {
            return ThrowException('generator_send_newborn');
          }
          this.ExecutionContext.currentGenerator = this;
          this.State = EXECUTING;
          ExecutionContext.push(this.ExecutionContext);
          return this.thunk.run(this.ExecutionContext);
        }

        this.State = EXECUTING;
        return Resume(this.ExecutionContext, Normal, value);
      },
      function Throw(value){
        if (this.State === EXECUTING) {
          return ThrowException('generator_executing', 'throw');
        } else if (this.State === CLOSED) {
          return ThrowException('generator_closed', 'throw');
        }
        if (this.State === NEWBORN) {
          this.State = CLOSED;
          this.code = null;
          return new AbruptCompletion(Throw, value);
        }

        this.State = EXECUTING;
        return Resume(this.ExecutionContext, Throw, value);
      },
      function Close(value){
        if (this.State === EXECUTING) {
          return ThrowException('generator_executing', 'close');
        } else if (this.State === CLOSED) {
          return;
        }

        if (state === NEWBORN) {
          this.State = CLOSED;
          this.code = null;
          return;
        }

        this.State = EXECUTING;
        var result = Resume(this.ExecutionContext, Return, value);
        this.State = CLOSED;
        return result;
      }
    ]);


    function Resume(ctx, completionType, value){
      ExecutionContext.push(ctx);
      if (completionType !== Normal) {
        value = new AbruptCompletion(completionType, value);
      }
      return ctx.currentGenerator.thunk.send(ctx, value);
    }

    return $Generator;
  })();





  // #############
  // ### $Date ###
  // #############

  var $Date = (function(){
    function $Date(value){
      $Object.call(this, intrinsics.DateProto);
      this.PrimitiveValue = value;
    }

    inherit($Date, $Object, {
      BuiltinBrand: BRANDS.BuiltinDate
    });

    return $Date;
  })();



  // ###############
  // ### $String ###
  // ###############

  var $String = (function(){
    function $String(value){
      $Object.call(this, intrinsics.StringProto);
      this.PrimitiveValue = value;
      this.define('length', value.length, ___);
    }

    inherit($String, $Object, {
      BuiltinBrand: BRANDS.StringWrapper,
      PrimitiveValue: undefined
    }, [
      function GetOwnProperty(key){
        var desc = $Object.prototype.GetOwnProperty.call(this, key);
        if (desc) {
          return desc;
        }

        var str = this.PrimitiveValue;
        if (key < str.length && key >= 0) {
          return new StringIndice(str[key]);
        }
      },
      function Get(key){
        var str = this.PrimitiveValue;
        if (key < str.length && key >= 0) {
          return str[key];
        }
        return this.GetP(this, key);
      },
      function HasOwnProperty(key){
        key = ToPropertyName(key);
        if (key && key.Completion) {
          if (key.Abrupt) return key; else key = key.value;
        }
        if (typeof key === 'string') {
          if (key < this.get('length') && key >= 0) {
            return true;
          }
        }
        return $Object.prototype.HasOwnProperty.call(this, key);
      },
      function HasProperty(key){
        var ret = this.HasOwnProperty(key);
        if (ret && ret.Completion) {
          if (ret.Abrupt) return ret; else ret = ret.value;
        }
        if (ret === true) {
          return true;
        } else {
          return $Object.prototype.HasProperty.call(this, key);
        }
      },
      function Enumerate(includePrototype, onlyEnumerable){
        var props = $Object.prototype.Enumerate.call(this, includePrototype, onlyEnumerable);
        return unique(numbers(this.PrimitiveValue.length).concat(props));
      }
    ]);

    return $String;
  })();


  // ###############
  // ### $Number ###
  // ###############

  var $Number = (function(){
    function $Number(value){
      $Object.call(this, intrinsics.NumberProto);
      this.PrimitiveValue = value;
    }

    inherit($Number, $Object, {
      BuiltinBrand: BRANDS.NumberWrapper,
      PrimitiveValue: undefined
    });

    return $Number;
  })();


  // ################
  // ### $Boolean ###
  // ################

  var $Boolean = (function(){
    function $Boolean(value){
      $Object.call(this, intrinsics.BooleanProto);
      this.PrimitiveValue = value;
    }

    inherit($Boolean, $Object, {
      BuiltinBrand: BRANDS.BooleanWrapper,
      PrimitiveValue: undefined
    });

    return $Boolean;
  })();



  // ############
  // ### $Map ###
  // ############

  var $Map = (function(){
    function $Map(){
      $Object.call(this, intrinsics.MapProto);
    }

    inherit($Map, $Object, {
      BuiltinBrand: BRANDS.BuiltinMap
    });

    return $Map;
  })();


  // ############
  // ### $Set ###
  // ############

  var $Set = (function(){
    function $Set(){
      $Object.call(this, intrinsics.SetProto);
    }

    inherit($Set, $Object, {
      BuiltinBrand: BRANDS.BuiltinSet
    });

    return $Set;
  })();



  // ################
  // ### $WeakMap ###
  // ################

  var $WeakMap = (function(){
    function $WeakMap(){
      $Object.call(this, intrinsics.WeakMapProto);
    }

    inherit($WeakMap, $Object, {
      BuiltinBrand: BRANDS.BuiltinWeakMap
    });

    return $WeakMap;
  })();



  // ##############
  // ### $Array ###
  // ##############

  var $Array = (function(){
    function $Array(items){
      $Object.call(this, intrinsics.ArrayProto);
      if (items instanceof Array) {
        var len = items.length;
        for (var i=0; i < len; i++) {
          this.set(i, items[i]);
        }
      } else {
        var len = 0;
      }
      this.define('length', len, __W);
    }

    inherit($Array, $Object, {
      BuiltinBrand: BRANDS.BuiltinArray
    }, [
      function DefineOwnProperty(key, desc, strict){
        var oldLenDesc = this.GetOwnProperty('length'),
            oldLen = oldLenDesc.Value,
            reject = strict ? function(e, a){ return ThrowException(e, a) }
                            : function(e, a){ return false };


        if (key === 'length') {
          if (!('Value' in desc)) {
            return DefineOwn.call(this, 'length', desc, strict);
          }

          var newLenDesc = copy(desc),
              newLen = ToUint32(desc.Value);

          if (newLen.Completion) {
            if (newLen.Abrupt) return newLen; else newLen = newLen.value;
          }

          var value = ToNumber(desc.Value);
          if (value.Completion) {
            if (value.Abrupt) return value; else value = value.value;
          }

          if (newLen !== value) {
            return reject('invalid_array_length');
          }

          newLen = newLenDesc.Value;
          if (newLen >= oldLen) {
            return DefineOwn.call(this, 'length', newLenDesc, strict);
          }

          if (oldLenDesc.Writable === false) {
            return reject('strict_cannot_assign')
          }

          if (!('Writable' in newLenDesc) || newLenDesc.Writable) {
            var newWritable = true;
          } else {
            newWritable = false;
            newLenDesc.Writable = true;
          }

          var success = DefineOwn.call(this, 'length', newLenDesc, strict);
          if (success.Completion) {
            if (success.Abrupt) return success; else success = success.value;
          }
          if (success === false) {
            return false;
          }

          while (newLen < oldLen) {
            oldLen = oldLen - 1;
            var deleted = this.Delete(''+oldLen, false);
            if (deleted.Completion) {
              if (deleted.Abrupt) return deleted; else deleted = deleted.value;
            }

            if (!deleted) {
              newLenDesc.Value = oldLen + 1;
              if (!newWritable) {
                newLenDesc.Writable = false;
              }
              DefineOwn.call(this, 'length', newLenDesc, false);
              return reject('strict_delete_property');
            }
          }
          if (!newWritable) {
            DefineOwn.call(this, 'length', { Writable: false }, false);
          }

          return true;
        }  else if (IsArrayIndex(key)) {
          var index = ToUint32(key);

          if (index.Completion) {
            if (index.Abrupt) return index; else index = index.value;
          }

          if (index >= oldLen && oldLenDesc.Writable === false) {
            return reject('strict_cannot_assign');
          }

          success = DefineOwn.call(this, key, desc, false);
          if (success.Completion) {
            if (success.Abrupt) return success; else success = success.value;
          }

          if (success === false) {
            return reject('strict_cannot_assign');
          }

          if (index >= oldLen) {
            oldLenDesc.Value = index + 1;
            DefineOwn.call(this, 'length', oldLenDesc, false);
          }
          return true;
        }

        return DefineOwn.call(this, key, desc, key);
      }
    ]);

    return $Array;
  })();


  // ###############
  // ### $RegExp ###
  // ###############

  var $RegExp = (function(){
    function $RegExp(primitive){
      if (!this.properties) {
        $Object.call(this, intrinsics.RegExpProto);
      }
      this.PrimitiveValue = primitive;
      this.define('global', primitive.global, ___);
      this.define('ignoreCase', primitive.ignoreCase, ___);
      this.define('lastIndex', primitive.lastIndex, __W);
      this.define('multiline', primitive.multiline, ___);
      this.define('source', primitive.source, ___);
    }

    inherit($RegExp, $Object, {
      BuiltinBrand: BRANDS.BuiltinRegExp,
      Match: null
    });

    return $RegExp;
  })();


  // ###############
  // ### $Symbol ###
  // ###############

  var $Symbol = (function(){
    var seed = Math.random() * 4294967296 | 0;


    var iterator = new $Enumerator([]);

    function $Symbol(name, isPublic){
      $Object.call(this, intrinsics.SymbolProto);
      this.Symbol = seed++;
      this.Name = name;
      this.Private = !isPublic;
    }

    inherit($Symbol, $Object, {
      BuiltinBrand: BRANDS.BuiltinSymbol,
      Extensible: false
    }, [
      function toString(){
        return this.Symbol;
      },
      function GetInheritance(){
        return null;
      },
      function SetInheritance(v){
        return false;
      },
      function IsExtensible(){
        return false;
      },
      function PreventExtensions(){},
      function HasOwnProperty(){
        return false;
      },
      function GetOwnProperty(){},
      function GetP(receiver, key){
        if (key === 'toString') {
          return intrinsics.ObjectToString;
        }
      },
      function SetP(receiver, key, value){
        return false;
      },
      function Delete(key){
        return true;
      },
      function DefineOwnProperty(key, desc){
        return false;
      },
      function enumerator(){
        return iterator;
      },
      function Keys(){
        return [];
      },
      function OwnPropertyKeys(){
        return [];
      },
      function Enumerate(){
        return []
      },
      function Freeze(){
        return true;
      },
      function Seal(){
        return true;
      },
      function IsFrozen(){
        return true;
      },
      function IsSealed(){
        return true;
      }
    ]);

    return $Symbol;
  })();


  // ##################
  // ### $Arguments ###
  // ##################

  var $Arguments = (function(){
    function $Arguments(length){
      $Object.call(this);
      this.define('length', length, _CW);
    }

    inherit($Arguments, $Object, {
      BuiltinBrand: BRANDS.BuiltinArguments,
      ParameterMap: null
    });

    return $Arguments;
  })();


  var $strictArguments = (function(){
    function $strictArguments(args){
      $Arguments.call(this, args.length);
      for (var i=0; i < args.length; i++) {
        this.define(i+'', args[i], ECW);
      }

      this.define('arguments', intrinsics.ThrowTypeError, __A);
      this.define('caller', intrinsics.ThrowTypeError, __A);
    }

    inherit($strictArguments, $Arguments);

    return $strictArguments;
  })();



  var $MappedArguments = (function(){
    function $MappedArguments(names, env, args, func){
      var mapped = create(null);
      $Arguments.call(this, args.length);

      this.ParameterMap = new $Object;
      this.isMapped = false;

      for (var i=0; i < args.length; i++) {
        this.define(i+'', args[i], ECW);
        var name = names[i];
        if (i < names.length && !(name in mapped)) {
          this.isMapped = true;
          mapped[name] = true;
          this.ParameterMap.define(name, new ArgAccessor(name, env), _CA);
        }
      }

      this.define('callee', func, _CW);
    }

    inherit($MappedArguments, $Arguments, {
      ParameterMap: null
    }, [
      function Get(key){
        if (this.isMapped && this.ParameterMap.has(key)) {
          return this.ParameterMap.Get(key);
        } else {
          var val = this.GetP(this, key);
          if (key === 'caller' && IsCallable(val) && val.strict) {
            return ThrowException('strict_poison_pill');
          }
          return val;
        }
      },
      function GetOwnProperty(key){
        var desc = $Object.prototype.GetOwnProperty.call(this, key);
        if (desc === undefined) {
          return desc;
        }
        if (this.isMapped && this.ParameterMap.has(key)) {
          desc.Value = this.ParameterMap.Get(key);
        }
        return desc;
      },
      function DefineOwnProperty(key, desc, strict){
        if (!DefineOwn.call(this, key, desc, false) && strict) {
          return ThrowException('strict_lhs_assignment');
        }

        if (this.isMapped && this.ParameterMap.has(key)) {
          if (IsAccessorDescriptor(desc)) {
            this.ParameterMap.Delete(key, false);
          } else {
            if ('Value' in desc) {
              this.ParameterMap.Put(key, desc.Value, strict);
            }
            if ('Writable' in desc) {
              this.ParameterMap.Delete(key, false);
            }
          }
        }

        return true;
      },
      function Delete(key, strict){
        var result = $Object.prototype.Delete.call(this, key, strict);
        if (result.Abrupt) {
          return result;
        }

        if (result && this.isMapped && this.ParameterMap.has(key)) {
          this.ParameterMap.Delete(key, false);
        }

        return result;
      }
    ]);

    return $MappedArguments;
  })();

  var $Module = (function(){
    function ModuleGetter(ref){
      var getter = this.Get = {
        Call: function(){
          var value = GetValue(ref);
          ref = null;
          getter.Call = function(){ return value };
          return value;
        }
      };
    }

    inherit(ModuleGetter, Accessor);


    function $Module(object, names){
      if (object instanceof $Module) {
        return object;
      }

      $Object.call(this, null);
      this.remove('__proto__');
      var self = this;

      each(names, function(name){
        self.define(name, new ModuleGetter(new Reference(object, name)), E_A);
      });
    }

    inherit($Module, $Object, {
      BuiltinBrand: BRANDS.BuiltinModule,
      Extensible: false
    });

    return $Module;
  })();


  var $Error = (function(){
    function $Error(name, type, message){
      $Object.call(this, intrinsics[name+'Proto']);
      this.define('message', message, ECW);
      if (type !== undefined) {
        this.define('type', type, _CW);
      }
    }

    inherit($Error, $Object, {
      BuiltinBrand: BRANDS.BuiltinError
    }, [
      function setOrigin(filename, kind){
        if (filename) {
          this.set('filename', filename);
        }
        if (kind) {
          this.set('kind', kind);
        }
      },
      function setCode(loc, code){
        var line = code.split('\n')[loc.start.line - 1];
        var pad = new Array(loc.start.column).join('-') + '^';
        this.set('line', loc.start.line);
        this.set('column', loc.start.column);
        this.set('code', line + '\n' + pad);
      }
    ]);

    return $Error;
  })();


  var $Proxy = (function(){
    function IsCompatibleDescriptor(){
      return true;
    }

    function GetMethod(handler, trap){
      var result = handler.Get(trap);
      if (result !== undefined && !IsCallable(result)) {
        return ThrowException('non_callable_proxy_trap');
      }
      return result;
    }

    function TrapDefineOwnProperty(proxy, key, descObj, strict){
      var handler = proxy.ProxyHandler,
          target = proxy.ProxyTarget,
          trap = GetMethod(handler, 'defineProperty'),
          normalizedDesc = ToPropertyDescriptor(descObj);

      if (trap === undefined) {
        return target.DefineOwnProperty(key, normalizedDesc, strict);
      } else {
        var normalizedDescObj = FromGenericPropertyDescriptor(normalizedDesc);
        CopyAttributes(descObj, normalizedDescObj);

        var trapResult = trap.Call(handler, [target, key, normalizedDescObj]),
            success = ToBoolean(trapResult),
            targetDesc = target.GetOwnProperty(key),
            extensible = target.IsExtensible();

        if (!extensible && targetDesc === undefined) {
          return ThrowException('proxy_configurability_non_extensible_inconsistent');
        } else if (targetDesc !== undefined && !IsCompatibleDescriptor(extensible, targetDesc, ToPropertyDescriptor(normalizedDesc))) {
          return ThrowException('proxy_incompatible_descriptor');
        } else if (!normalizedDesc.Configurable) {
          if (targetDesc === undefined || targetDesc.Configurable) {
            return ThrowException('proxy_configurability_inconsistent')
          }
        } else if (strict) {
          return ThrowException('strict_property_redefinition');
        }
        return false;
      }
    }

    function TrapGetOwnProperty(proxy, key){
      var handler = proxy.ProxyHandler,
          target = proxy.ProxyTarget,
          trap = GetMethod(handler, 'getOwnPropertyDescriptor');

      if (trap === undefined) {
        return target.GetOwnProperty(key);
      } else {
        var trapResult = trap.Call(handler, [target, key]),
            desc = NormalizeAndCompletePropertyDescriptor(trapResult),
            targetDesc = target.GetOwnProperty(key);

        if (desc === undefined) {
          if (targetDesc !== undefined) {
            if (!targetDesc.Configurable) {
              return ThrowException('proxy_configurability_inconsistent');
            } else if (!target.IsExtensible()) {
              return ThrowException('proxy_configurability_non_extensible_inconsistent');
            }
            return undefined;
          }
        }
        var extensible = target.IsExtensible();
        if (!extensible && targetDesc === undefined) {
          return ThrowException('proxy_configurability_non_extensible_inconsistent');
        } else if (targetDesc !== undefined && !IsCompatibleDescriptor(extensible, targetDesc, ToPropertyDescriptor(desc))) {
          return ThrowException('proxy_incompatible_descriptor');
        } else if (!ToBoolean(desc.Get('configurable'))) {
          if (targetDesc === undefined || targetDesc.Configurable) {
            return ThrowException('proxy_configurability_inconsistent')
          }
        }
        return desc;
      }
    }



    function $Proxy(target, handler){
      this.ProxyHandler = handler;
      this.ProxyTarget = target;
      this.BuiltinBrand = target.BuiltinBrand;
      if ('Call' in target) {
        this.HasInstance = $Function.prototype.HasInstance;
        this.Call = ProxyCall;
        this.Construct = ProxyConstruct;
      }
      if ('PrimitiveValue' in target) {
        this.PrimitiveValue = target.PrimitiveValue;
      }
    }

    inherit($Proxy, $Object, {
      Proxy: true
    }, [
      function GetInheritance(){
        var trap = GetMethod(this.ProxyHandler, 'GetInheritenceOf');
        if (trap === undefined) {
          return this.ProxyTarget.GetInheritance();
        } else {
          var result = trap.Call(this.ProxyHandler, [this.ProxyTarget]),
              targetProto = this.ProxyTarget.GetInheritance();

          if (result !== targetProto) {
            return ThrowException('proxy_prototype_inconsistent');
          } else {
            return targetProto;
          }
        }
      },
      function IsExtensible(){
        var trap = GetMethod(this.ProxyHandler, 'isExtensible');
        if (trap === undefined) {
          return this.ProxyTarget.IsExtensible();
        }
        var proxyIsExtensible = ToBoolean(trap.Call(this.ProxyHandler, [this.ProxyTarget])),
            targetIsExtensible  = this.ProxyTarget.IsExtensible();

        if (proxyIsExtensible !== targetIsExtensible) {
          return ThrowException('proxy_extensibility_inconsistent');
        }
        return targetIsExtensible;
      },
      function GetP(receiver, key){
        var trap = GetMethod(this.ProxyHandler, 'get');
        if (trap === undefined) {
          return this.ProxyTarget.GetP(receiver, key);
        }

        var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key, receiver]),
            desc = this.ProxyTarget.GetOwnProperty(key);

        if (desc !== undefined) {
          if (IsDataDescriptor(desc) && desc.Configurable === false && desc.Writable === false) {
            if (!is(trapResult, desc.Value)) {
              return ThrowException('proxy_get_inconsistent');
            }
          } else if (IsAccessorDescriptor(desc) && desc.Configurable === false && desc.Get === undefined) {
            if (trapResult !== undefined) {
              return ThrowException('proxy_get_inconsistent');
            }
          }
        }

        return trapResult;
      },
      function SetP(receiver, key, value){
        var trap = GetMethod(this.ProxyHandler, 'set');
        if (trap === undefined) {
          return this.ProxyTarget.SetP(receiver, key, value);
        }

        var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key, value, receiver]),
            success = ToBoolean(trapResult);

        if (success) {
          var desc = this.ProxyTarget.GetOwnProperty(key);
          if (desc !== undefined) {
            if (IsDataDescriptor(desc) && desc.Configurable === false && desc.Writable === false) {
              if (!is(value, desc.Value)) {
                return ThrowException('proxy_set_inconsistent');
              }
            }
          } else if (IsAccessorDescriptor(desc) && desc.Configurable === false) {
            if (desc.Set !== undefined) {
              return ThrowException('proxy_set_inconsistent');
            }
          }
        }

        return success;
      },
      function GetOwnProperty(key){
        var desc = TrapGetOwnProperty(this, key);
        if (desc !== undefined) {
          return desc;
        }
      },
      function DefineOwnProperty(key, desc, strict){
        var descObj = FromGenericPropertyDescriptor(desc);
        return TrapDefineOwnProperty(this, key, descObj, strict);
      },
      function HasOwnProperty(key){
        var trap = GetMethod(this.ProxyHandler, 'hasOwn');
        if (trap === undefined) {
          return this.ProxyTarget.HasOwnProperty(key);
        }

        var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key]),
            success = ToBoolean(trapResult);

        if (success === false) {
          var targetDesc = this.ProxyTarget.GetOwnProperty(key);
          if (desc !== undefined && targetDesc.Configurable === false) {
            return ThrowException('proxy_hasown_inconsistent');
          } else if (!this.ProxyTarget.IsExtensible() && targetDesc !== undefined) {
            return ThrowException('proxy_hasown_inconsistent');
          }
        }
        return success;
      },
      function HasProperty(key){
        var trap = GetMethod(this.ProxyHandler, 'has');
        if (trap === undefined) {
          return this.ProxyTarget.HasProperty(key);
        }

        var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key]),
            success = ToBoolean(trapResult);

        if (success === false) {
          var targetDesc = this.ProxyTarget.GetOwnProperty(key);
          if (desc !== undefined && targetDesc.Configurable === false) {
            return ThrowException('proxy_has_inconsistent');
          } else if (!this.ProxyTarget.IsExtensible() && targetDesc !== undefined) {
            return ThrowException('proxy_has_inconsistent');
          }
        }
        return success;
      },
      function Delete(key, strict){
        var trap = GetMethod(this.ProxyHandler, 'deleteProperty');
        if (trap === undefined) {
          return this.ProxyTarget.Delete(key, strict);
        }
        var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key]),
            success = ToBoolean(trapResult);

        if (success === true) {
          var targetDesc = this.ProxyTarget.GetOwnProperty(key);
          if (desc !== undefined && targetDesc.Configurable === false) {
            return ThrowException('proxy_delete_inconsistent');
          } else if (!this.ProxyTarget.IsExtensible() && targetDesc !== undefined) {
            return ThrowException('proxy_delete_inconsistent');
          }
          return true;
        } else if (strict) {
          return ThrowException('strict_delete_failure');
        } else {
          return false;
        }
      },
      function Enumerate(includePrototype, onlyEnumerable){
        if (onlyEnumerable) {
          var trap = includePrototype ? 'enumerate' : 'keys';
        } else {
          var trap = 'getOwnPropertyNames',
              recurse = includePrototype;
        }
        var trap = GetMethod(this.ProxyHandler, trap);
        if (trap === undefined) {
          return this.ProxyTarget.Enumerate(includePrototype, onlyEnumerable);
        }

        var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key]);

        if (Type(trapResult) !== 'Object') {
          return ThrowException(trap+'_trap_non_object');
        }

        var len = ToUint32(trapResult.Get('length')),
            array = [],
            seen = create(null);

        for (var i = 0; i < len; i++) {
          var element = ToString(trapResult.Get(''+i));
          if (element in seen) {
            return ThrowException('trap_returned_duplicate', trap);
          }
          seen[element] = true;
          if (!includePrototype && !this.ProxyTarget.IsExtensible() && !this.ProxyTarget.HasOwnProperty(element)) {
            return ThrowException('proxy_'+trap+'_inconsistent');
          }
          array[i] = element;
        }

        var props = this.ProxyTarget.Enumerate(includePrototype, onlyEnumerable),
            len = props.length;

        for (var i=0; i < len; i++) {
          if (!(props[i] in seen)) {
            var targetDesc = this.ProxyTarget.GetOwnProperty(props[i]);
            if (targetDesc && !targetDesc.Configurable) {
              return ThrowException('proxy_'+trap+'_inconsistent');
            }
            if (targetDesc && !this.ProxyTarget.IsExtensible()) {
              return ThrowException('proxy_'+trap+'_inconsistent');
            }
          }
        }

        return array;
      }
    ]);

    function ProxyCall(thisValue, args){
      var trap = GetMethod(this.ProxyHandler, 'apply');
      if (trap === undefined) {
        return this.ProxyTarget.Call(thisValue, args);
      }

      return trap.Call(this.ProxyHandler, [this.ProxyTarget, thisValue, fromInternalArray(args)]);
    }

    function ProxyConstruct(args){
      var trap = GetMethod(this.ProxyHandler, 'construct');
      if (trap === undefined) {
        return this.ProxyTarget.Construct(args);
      }

      return trap.Call(this.ProxyHandler, [this.ProxyTarget, fromInternalArray(args)]);
    }

    return $Proxy;
  })();


  var $TypedArray = (function(){

    var types = create(null);

    function Type(options){
      this.name = options.name
      this.size = options.size;
      this.cast = options.cast;
      this.set = options.set;
      this.get = options.get;
      this.brand = BRANDS['Builtin'+this.name+'Array'];
      types[this.name+'Array'] = this;
    }

    var Int8 = new Type({
      name: 'Int8',
      size: 1,
      cast: function(x){
        return (x &= 0xff) & 0x80 ? x - 0x100 : x & 0x7f;
      },
      set: DataView.prototype.setInt8,
      get: DataView.prototype.getInt8
    });

    var Int16 = new Type({
      name: 'Int16',
      size: 2,
      cast: function(x){
        return (x &= 0xffff) & 0x8000 ? x - 0x10000 : x & 0x7fff;
      },
      set: DataView.prototype.setInt16,
      get: DataView.prototype.getInt16
    });

    var Int32 = new Type({
      name: 'Int32',
      size: 4,
      cast: function(x){
        return x >> 0;
      },
      set: DataView.prototype.setInt32,
      get: DataView.prototype.getInt32
    });

    var Uint8 = new Type({
      name: 'Uint8',
      size: 1,
      cast: function(x){
        return x & 0xff;
      },
      set: DataView.prototype.setUint8,
      get: DataView.prototype.getUint8
    });

    var Uint16 = new Type({
      name: 'Uint16',
      size: 2,
      cast: function(x){
        return x & 0xffff;
      },
      set: DataView.prototype.setUint16,
      get: DataView.prototype.getUint16
    });

    var Uint32 = new Type({
      name: 'Uint32',
      size: 4,
      cast: function(x){
        return x >>> 0;
      },
      set: DataView.prototype.setUint32,
      get: DataView.prototype.getUint32
    });

    var Float32 = new Type({
      name: 'Float32',
      size: 4,
      cast: function(x){
        return +x || 0;
      },
      set: DataView.prototype.setFloat32,
      get: DataView.prototype.getFloat32
    });

    var Float64 = new Type({
      name: 'Float64',
      size: 8,
      cast: function(x){
        return +x || 0;
      },
      set: DataView.prototype.setFloat64,
      get: DataView.prototype.getFloat64
    });

    function hasIndex(key, max){
      var index = +key;
      return index >= 0 && index < max && (index | 0) === index;
    }


    function $TypedArray(type, buffer, byteLength, byteOffset){
      $Object.call(this, intrinsics[type+'Proto']);
      this.Buffer = buffer;
      this.ByteOffset = byteOffset;
      this.ByteLength = byteLength;
      this.Type = types[type];
      this.BuiltinBrand = this.Type.brand;
      this.Length = byteLength / this.Type.size;
      this.define('buffer', buffer, ___);
      this.define('byteLength', byteLength, ___);
      this.define('byteOffset', byteOffset, ___);
      this.define('length', this.Length, ___);
      this.init();
    }

    inherit($TypedArray, $Object);

    if (typeof Uint8Array !== 'undefined') {
      void function(){
        Uint8.Array = Uint8Array;
        Uint16.Array = Uint16Array;
        Uint32.Array = Uint32Array;
        Int8.Array = Int8Array;
        Int16.Array = Int16Array;
        Int32.Array = Int32Array;
        Float32.Array = Float32Array;
        Float64.Array = Float64Array;

        define($TypedArray.prototype, [
          function init(){
            this.data = new this.Type.Array(this.Buffer.NativeBuffer, this.ByteOffset, this.Length);
          },
          function each(callback){
            for (var i=0; i < this.Length; i++) {
              callback([i+'', this.data[i], 5]);
            }
            $Object.prototype.each.call(this, callback);
          },
          function get(key){
            if (hasIndex(key, this.Length)) {
              return this.data[+key];
            } else {
              return $Object.prototype.get.call(this, key);
            }
          },
          function describe(key){
            if (hasIndex(key, this.Length)) {
              return [key, this.data[+key], 5];
            } else {
              return $Object.prototype.describe.call(this, key);
            }
          },
          function set(key, value){
            if (hasIndex(key, this.Length)) {
              this.data[+key] = value;
            } else {
              return $Object.prototype.set.call(this, key, value);
            }
          },
          (function(){
            return function define(key, value, attr){
              if (hasIndex(key, this.Length)) {
                this.data[+key] = value;
              } else {
                return $Object.prototype.define.call(this, key, value, attr);
              }
            };
          })()
        ]);
      }();
    } else {
      void function(){
        define($TypedArray.prototype, [
          function init(){
            this.data = new DataView(this.Buffer.NativeBuffer, this.ByteOffset, this.ByteLength);
            this.data.get = this.Type.get;
            this.data.set = this.Type.set;
            this.bytesPer = this.Type.size;
          },
          function each(callback){
            for (var i=0; i < this.Length; i++) {
              callback([i+'', this.data.get(i * this.bytesPer, true), 5]);
            }
            $Object.prototype.each.call(this, callback);
          },
          function get(key){
            if (hasIndex(key, this.Length)) {
              return this.data.get(key * this.bytesPer, true);
            } else {
              return $Object.prototype.get.call(this, key);
            }
          },
          function describe(key){
            if (hasIndex(key, this.Length)) {
              return [key, this.data.get(key * this.bytesPer, true), 5];
            } else {
              return $Object.prototype.describe.call(this, key);
            }
          },
          function set(key, value){
            if (hasIndex(key, this.Length)) {
              this.data.set(key * this.bytesPer, value, true);
            } else {
              return $Object.prototype.set.call(this, key, value);
            }
          },
          (function(){
            return function define(key, value, attr){
              if (hasIndex(key, this.Length)) {
                this.data.set(key * this.bytesPer, value, true);
              } else {
                return $Object.prototype.define.call(this, key, value, attr);
              }
            };
          })()
        ]);
      }();
    }


    define($TypedArray.prototype [
      function has(key){
        if (hasIndex(key, this.Length)) {
          return true;
        }

        return $Object.prototype.has.call(this, key);
      },
      function GetOwnProperty(key){
        if (hasIndex(key, this.Length)) {
          return new ArrayBufferIndice(this.get(key));
        }

        return $Object.prototype.GetOwnProperty.call(this, key);
      },
      function DefineOwnProperty(key, desc, strict){
        if (hasIndex(key, this.Length)) {
          if ('Value' in desc) {
            this.set(key, desc.Value);
            return true;
          }
          return false;
        }

        return DefineOwn.call(this, key, desc, strict);
      }
    ]);


    return $TypedArray;
  })();


  var $DataView = (function(){
    function $DataView(buffer){
      $Object.call(this, intrinsics.DataViewProto);
      this.view = new DataView(buffer.NativeBuffer);
    }
  })();

  var $PrimitiveBase = (function(){
    function $PrimitiveBase(value){
      this.PrimitiveValue = value;
      switch (typeof value) {
        case 'string':
          $Object.call(this, intrinsics.StringProto);
          this.BuiltinBrand = BRANDS.StringWrapper;
          break;
        case 'number':
          $Object.call(this, intrinsics.NumberProto);
          this.BuiltinBrand = BRANDS.NumberWrapper;
          break;
        case 'boolean':
          $Object.call(this, intrinsics.BooleanProto);
          this.BuiltinBrand = BRANDS.BooleanWrapper;
          break;
      }
    }

    operators.$PrimitiveBase = $PrimitiveBase;

    inherit($PrimitiveBase, $Object, [
      function SetP(receiver, key, value, strict){
        var object = this;
        while (object && !object.has(key)) {
          object = object.GetInheritance();
        }
        if (object) {
          var prop = object.describe(key);
          if (prop[2] & A) {
            var setter = prop[1].Set;
            if (IsCallable(setter)) {
              return setter.Call(receiver, [value]);
            }
          }
        }
      },
      function GetP(receiver, key) {
        var object = this;
        while (object && !object.has(key)) {
          object = object.GetInheritance();
        }
        if (object) {
          var prop = object.describe(key);
          if (prop[2] & A) {
            var getter = prop[1].Get;
            if (IsCallable(getter)) {
              return getter.Call(receiver, []);
            }
          } else {
            return prop[1];
          }
        }
      }
    ]);

    return $PrimitiveBase;
  })();




  var $NativeFunction = (function(){
    function $NativeFunction(options){
      if (options.proto === undefined) {
        options.proto = intrinsics.FunctionProto;
      }
      $Object.call(this, options.proto);

      this.define('arguments', null, ___);
      this.define('caller', null, ___);
      this.define('length', options.length, ___);
      this.define('name', options.name, ___);

      this.call = options.call;
      if (options.construct) {
        this.construct = options.construct;
      }

      this.Realm = realm;
      hide(this, 'Realm');
      hide(this, 'call');
    }

    inherit($NativeFunction, $Function, {
      Builtin: true
    }, [
      function Call(receiver, args){
        var result = this.call.apply(receiver, [].concat(args));
        return result && result.type === Return ? result.value : result;
      },
      function Construct(args){
        if (this.construct) {
          var instance = this.has('prototype') ? new $Object(this.get('prototype')) : new $Object;
          instance.ConstructorName = this.get('name');
          var result = this.construct.apply(instance, args);
        } else {
          var result = this.call.apply(undefined, args);
        }
        return result && result.type === Return ? result.value : result;
      }
    ]);

    return $NativeFunction;
  })();



  var ExecutionContext = (function(){
    function ExecutionContext(caller, local, realm, code, func, isConstruct){
      this.caller = caller;
      this.Realm = realm;
      this.code = code;
      this.LexicalEnvironment = local;
      this.VariableEnvironment = local;
      this.strict = code.flags.strict;
      this.isConstruct = !!isConstruct;
      this.callee = func && !func.Builtin ? func : caller ? caller.callee : null;
    }

    define(ExecutionContext, [
      function push(newContext){
        context = newContext;
        context.Realm.active || activate(context.Realm);
      },
      function pop(){
        if (context) {
          var oldContext = context;
          context = context.caller;
          return oldContext;
        }
      },
      function reset(){
        var stack = [];
        while (context) {
          stack.push(ExecutionContext.pop());
        }
        return stack;
      }
    ]);

    define(ExecutionContext.prototype, {
      isGlobal: false,
      strict: false,
      isEval: false,
      constructFunction: EvaluateConstruct,
      callFunction: EvaluateCall,
      spreadArguments: SpreadArguments,
      spreadArray: SpreadInitialization,
      defineMethod: PropertyDefinitionEvaluation
    });

    define(ExecutionContext.prototype, [
      function pop(){
        if (this === context) {
          context = this.caller;
          return this;
        }
      },
      function initializeBinding(name, value, strict){
        return this.LexicalEnvironment.InitializeBinding(name, value, strict);
      },
      function popBlock(){
        var block = this.LexicalEnvironment;
        this.LexicalEnvironment = this.LexicalEnvironment.outer;
        return block;
      },
      function pushBlock(decls){
        this.LexicalEnvironment = new DeclarativeEnvironmentRecord(this.LexicalEnvironment);
        return BlockDeclarationInstantiation(decls, this.LexicalEnvironment);
      },
      function pushWith(obj){
        this.LexicalEnvironment = new ObjectEnvironmentRecord(obj, this.LexicalEnvironment);
        this.LexicalEnvironment.withEnvironment = true;
        return obj;
      },
      function createClass(def, superclass){
        this.LexicalEnvironment = new DeclarativeEnvironmentRecord(this.LexicalEnvironment);
        var ctor = ClassDefinitionEvaluation(def.name, superclass, def.ctor, def.methods, def.symbols);
        this.LexicalEnvironment = this.LexicalEnvironment.outer;
        return ctor;
      },
      function createFunction(name, code){
        var $F = code.generator ? $GeneratorFunction : $Function,
            env = this.LexicalEnvironment;

        if (name) {
          env = new DeclarativeEnvironmentRecord(env);
          env.CreateImmutableBinding(name);
        }

        var func = new $F(code.lexicalType, name, code.params, code, env, code.flags.strict);

        if (code.lexicalType !== ARROW) {
          MakeConstructor(func);
          name && env.InitializeBinding(name, func);
        }

        return func;
      },
      function createArray(len){
        return new $Array(len);
      },
      function createObject(proto){
        return new $Object(proto);
      },
      function createRegExp(regex){
        return new $RegExp(regex);
      },
      function getPropertyReference(name, obj){
        return Element(this, name, obj);
      },
      function getReference(name){
        return IdentifierResolution(this, name);
      },
      function getSuperReference(name){
        return SuperReference(this, name);
      },
      function getThisEnvironment(){
        return GetThisEnvironment(this);
      },
      function getThis(){
        return ThisResolution(this);
      },
      function destructureSpread(target, index){
        return SpreadDestructuring(this, target, index);
      },
      function getTemplateCallSite(template){
        return GetTemplateCallSite(this, template);
      },
      function getSymbol(name){
        return GetSymbol(this, name) || ThrowException('undefined_symbol', name);
      },
      function createSymbol(name, isPublic){
        return new $Symbol(name, isPublic);
      },
      function initializeSymbolBinding(name, symbol){
        return this.LexicalEnvironment.InitializeSymbolBinding(name, symbol);
      }
    ]);

    return ExecutionContext;
  })();


  var Intrinsics = (function(){
    var $errors = ['EvalError', 'RangeError', 'ReferenceError',
                   'SyntaxError', 'TypeError', 'URIError'];

    var $builtins = {
      Array   : $Array,
      Boolean : $Boolean,
      Date    : $Date,
      Error   : $Error,
      Function: $Function,
      Map     : $Map,
      Number  : $Number,
      RegExp  : $RegExp,
      Set     : $Set,
      String  : $String,
      Symbol  : $Symbol,
      WeakMap : $WeakMap
    };

    exports.builtins = {
      $Array   : $Array,
      $Boolean : $Boolean,
      $Date    : $Date,
      $Error   : $Error,
      $Function: $Function,
      $Map     : $Map,
      $Number  : $Number,
      $Object  : $Object,
      $Proxy   : $Proxy,
      $RegExp  : $RegExp,
      $Set     : $Set,
      $Symbol  : $Symbol,
      $String  : $String,
      $WeakMap : $WeakMap
    };

    var primitives = {
      Date   : Date.prototype,
      RegExp : RegExp.prototype,
      String : '',
      Number : 0,
      Boolean: false
    };

    function Intrinsics(realm){
      DeclarativeEnvironmentRecord.call(this, null);
      this.Realm = realm;
      var bindings = this.bindings;
      bindings.ObjectProto = new $Object(null);

      for (var k in $builtins) {
        var prototype = bindings[k + 'Proto'] = create($builtins[k].prototype);
        $Object.call(prototype, bindings.ObjectProto);
        if (k in primitives) {
          prototype.PrimitiveValue = primitives[k];
        }
      }

      bindings.StopIteration = new $Object(bindings.ObjectProto);
      bindings.StopIteration.BuiltinBrand = StopIteration;

      for (var i=0; i < 6; i++) {
        var prototype = bindings[$errors[i] + 'Proto'] = create($Error.prototype);
        $Object.call(prototype, bindings.ErrorProto);
        prototype.define('name', $errors[i], _CW);
      }

      bindings.FunctionProto.FormalParameters = [];
      bindings.ArrayProto.define('length', 0, __W);
      bindings.ErrorProto.define('name', 'Error', _CW);
      bindings.ErrorProto.define('message', '', _CW);
    }

    inherit(Intrinsics, DeclarativeEnvironmentRecord, [
      function binding(options){
        if (typeof options === 'function') {
          options = {
            call: options,
            name: options.name,
            length: options.length
          }
        }

        if (!options.name) {
          if (!options.call.name) {
            options.name = arguments[1];
          } else {
            options.name = options.call.name;
          }
        }

        if (typeof options.length !== 'number') {
          options.length = options.call.length;
        }

        if (realm !== this.Realm) {
          var activeRealm = realm;
          activate(this.Realm);
        }

        this.bindings[options.name] = new $NativeFunction(options);

        if (activeRealm) {
          activate(activeRealm);
        }
      }
    ]);

    return Intrinsics;
  })();



  function fromInternalArray(array){
    var $array = new $Array,
        len = array.length;

    for (var i=0; i < len; i++) {
      $array.define(i+'', array[i], ECW);
    }
    $array.define('length', array.length, __W);
    return $array;
  }

  function toInternalArray($array){
    var array = [],
        len = $array.get('length');

    for (var i=0; i < len; i++) {
      array[i] = $array.get(i+'');
    }
    return array;
  }

  var Script = (function(){
    var parseOptions = {
      loc    : true,
      range  : true,
      raw    : false,
      tokens : false,
      comment: false
    }

    function parse(src, origin, type, options){
      try {
        return esprima.parse(src, options || parseOptions);
      } catch (e) {
        var err = new $Error('SyntaxError', undefined, e.message);
        err.setCode({ start: { line: e.lineNumber, column: e.column } }, src);
        err.setOrigin(origin, type);
        return new AbruptCompletion('throw', err);
      }
    }

    var load = (function(){
      if (typeof process !== 'undefined') {
        var fs = require('fs');
        return function load(source){
          if (!~source.indexOf('\n') && fs.existsSync(source)) {
            return { scope: SCOPE.GLOBAL, source: fs.readFileSync(source, 'utf8'), filename: source };
          } else {
            return { scope: SCOPE.GLOBAL, source: source, filename: '' };
          }
        };
      }
      return function load(source){
        return { scope: SCOPE.GLOBAL, source: source, filename: '' };
      };
    })();

    function Script(options){
      if (options instanceof Script)
        return options;

      this.type = 'script';

      if (typeof options === 'function') {
        this.type = 'recompiled function';
        if (!fname(options)) {
          options = {
            scope: SCOPE.FUNCTION,
            filename: '',
            source: '('+options+')()'
          }
        } else {
          options = {
            scope: SCOPE.FUNCTION,
            filename: fname(options),
            source: options+''
          };
        }
      } else if (typeof options === 'string') {
        options = load(options);
      }

      if (options.natives) {
        this.natives = true;
        this.type = 'native';
      }
      if (options.eval || options.scope === SCOPE.EVAL) {
        this.eval = true;
        this.type = 'eval';
      }
      this.scope = options.scope;

      if (!isObject(options.ast) && typeof options.source === 'string') {
        this.source = options.source;
        this.ast = parse(options.source, options.filename, this.type);
        if (this.ast.Abrupt) {
          this.error = this.ast;
          this.ast = null;
        }
      }

      this.filename = options.filename || '';
      if (this.ast) {
        this.bytecode = assemble(this);
        this.thunk = new Thunk(this.bytecode);
      }
      return this;
    }

    return Script;
  })();


  var Realm = (function(){

    function CreateThrowTypeError(realm){
      var thrower = create($NativeFunction.prototype);
      $Object.call(thrower, realm.intrinsics.FunctionProto);
      thrower.call = function(){ return ThrowException('strict_poison_pill') };
      thrower.define('length', 0, ___);
      thrower.define('name', 'ThrowTypeError', ___);
      thrower.Realm = realm;
      thrower.Extensible = false;
      thrower.strict = true;
      hide(thrower, 'Realm');
      return new Accessor(thrower);
    }


    var natives = (function(){
      var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

      function wrapFunction(f){
        if (f._wrapper) {
          return f._wrapper;
        }
        return f._wrapper = function(){
          var receiver = this;
          if (isObject(receiver) && !(receiver instanceof $Object)) {
            receiver = undefined
          }
          return f.Call(receiver, arguments);
        };
      }

      function wrapBuiltins(source, target){
        each(ownProperties(source), function(key){
          if (typeof source[key] === 'function'
                          && key !== 'constructor'
                          && key !== 'toString'
                          && key !== 'valueOf') {
            var func = new $NativeFunction({
              name: key,
              length: source[key].length,
              call: function(a, b, c, d){
                var v = this;
                if (v == null) {
                  try { v = source.constructor(v) }
                  catch (e) { v = new source.constructor }
                }
                if (v instanceof source.constructor || typeof v !== 'object') {
                  var result =  v[key](a, b, c, d);
                } else if (v.PrimitiveValue) {
                  var result = v.PrimitiveValue[key](a, b, c, d);
                }
                if (!isObject(result)) {
                  return result;
                }
                if (result instanceof Array) {
                  return fromInternalArray(result);
                }
              }
            });
            target.define(key, func, _CW);
          }
        });
      }

      var timers = {};

      var nativeCode = ['function ', '() { [native code] }'];

      return {
        has: function(o, key){
          return o.has(key);
        },
        remove: function(o, key){
          o.remove(key);
        },
        set: function(o, key, value){
          return o.set(key, value);
        },
        get: function(o, key){
          return o.get(key);
        },
        define: function(o, key, value, attrs){
          o.define(key, value, attrs);
        },
        query: function(o, key){
          return o.query(key);
        },
        update: function(obj, key, attr){
          var prop = obj.describe(key);
          if (prop) {
            prop[2] = attr;
            return true;
          }
          return false;
        },
        CheckObjectCoercible: CheckObjectCoercible,
        ToObject: ToObject,
        ToString: ToString,
        ToNumber: ToNumber,
        ToBoolean: ToBoolean,
        ToPropertyName: ToPropertyName,
        ToInteger: ToInteger,
        ToInt32: ToInt32,
        ToUint32: ToUint32,
        ToUint16: ToUint16,
        ToModule: function(obj){
          if (obj.BuiltinBrand === BRANDS.BuiltinModule) {
            return obj;
          }
          return new $Module(obj, obj.Enumerate(false, false));
        },
        IsConstructCall: function(){
          return context.isConstruct;
        },
        GetBuiltinBrand: function(object){
          return object.BuiltinBrand.name;
        },
        SetBuiltinBrand: function(object, name){
          var brand = BRANDS[name];
          if (brand) {
            object.BuiltinBrand = brand;
          } else {
            var err = new $Error('ReferenceError', undefined, 'Unknown BuiltinBrand "'+name+'"');
            return new AbruptCompletion('throw', err);
          }
          return object.BuiltinBrand.name;
        },
        GetBrand: function(object){
          return object.Brand || object.BuiltinBrand.name;
        },
        GetPrimitiveValue: function(object){
          return object ? object.PrimitiveValue : undefined;
        },
        IsObject: function(object){
          return object instanceof $Object;
        },
        SetInternal: function(object, key, value){
          object[key] = value;
          hide(object, key);
        },
        GetInternal: function(object, key){
          if (object) {
            return object[key];
          }
        },
        HasInternal: function(object, key){
          if (object) {
            return key in object;
          }
        },
        Type: function(o){
          if (o === null) {
            return 'Null';
          } else {
            switch (typeof o) {
              case 'undefined': return 'Undefined';
              case 'number':    return 'Number';
              case 'string':    return 'String';
              case 'boolean':   return 'Boolean';
              case 'object':    return 'Object';
            }
          }
        },
        Exception: function(type, args){
          return MakeException(type, toInternalArray(args));
        },
        Signal: function(name, value){
          if (isObject(value)) {
            if (value instanceof $Array) {
              value = toInternalArray(value);
            } else {
              throw new Error('NYI');
            }
          }
          realm.emit(name, value);
        },
        wrapDateMethods: function(target){
          wrapBuiltins(Date.prototype, target);
        },
        wrapRegExpMethods: function(target){
          wrapBuiltins(RegExp.prototype, target);
        },
        now: Date.now || function(){ return +new Date },


        CallFunction: function(func, receiver, args){
          return func.Call(receiver, toInternalArray(args));
        },

        Fetch: function(name, callback){
          var result = require('../modules')[name];
          if (!result) {
            result = new $Error('Error', undefined, 'Unable to locate module "'+name+'"');
          }
          callback.Call(undefined, [result]);
        },

        EvaluateModule: function(source, global, name, callback, errback){
          if (!callback && !errback) {
            var result, thrown;

            realm.evaluateModule(source, global, name,
              function(module){ result = module },
              function(error){ result = error; thrown = true; }
            );

            return thrown ? new AbruptCompletion('throw', result) : result;
          } else {
            realm.evaluateModule(source, global, name, wrapFunction(callback), wrapFunction(errback));
          }
        },
        eval: function(code){
          if (typeof code !== 'string') {
            return code;
          }
          var script = new Script({
            scope: SCOPE.EVAL,
            natives: false,
            source: code
          });
          if (script.error) {
            return script.error;
          } else if (script.thunk) {
            return script.thunk.run(context);
          }
        },
        FunctionCreate: function(args){
          args = toInternalArray(args);
          var body = args.pop();

          var script = new Script({
            scope: SCOPE.GLOBAL,
            natives: false,
            source: '(function anonymous('+args.join(', ')+') {\n'+body+'\n})'
          });

          if (script.error) {
            return script.error;
          }

          var ctx = new ExecutionContext(context, new DeclarativeEnvironmentRecord(realm.globalEnv), realm, script.bytecode);
          ExecutionContext.push(ctx);
          var func = script.thunk.run(ctx);
          ExecutionContext.pop();
          return func;
        },
        BoundFunctionCreate: function(func, receiver, args){
          return new $BoundFunction(func, receiver, toInternalArray(args));
        },
        BooleanCreate: function(v){
          return new $Boolean(v);
        },
        DateCreate: function(args){
          return new $Date(applyNew(Date, toInternalArray(args)));
        },
        NumberCreate: function(v){
          return new $Number(v);
        },
        ObjectCreate: function(proto){
          return new $Object(proto);
        },
        RegExpCreate: function(pattern, flags){
          if (typeof pattern === 'object') {
            pattern = pattern.PrimitiveValue;
          }
          try {
            var result = new RegExp(pattern, flags);
          } catch (e) {
            return ThrowException('invalid_regexp', [pattern+'']);
          }
          return new $RegExp(result);
        },
        ProxyCreate: function(target, handler){
          return new $Proxy(target, handler);
        },
        SymbolCreate: function(name, isPublic){
          return new $Symbol(name, isPublic);
        },
        StringCreate: function(v){
          return new $String(v);
        },
        TypedArrayCreate: function(type, buffer, byteLength, byteOffset){
          return new $TypedArray(type, buffer, byteLength, byteOffset);
        },
        NativeBufferCreate: function(size){
          return new ArrayBuffer(size);
        },
        NativeDataViewCreate: function(buffer){
          return new DataView(buffer.NativeBuffer);
        },
        NativeBufferSlice: function(buffer, begin, end){
          return buffer.slice(begin, end);
        },
        DataViewSet: function(type, offset, value, isLE){
          offset >>>= 0;

          if (offset >= this.ByteLength) {
            return ThrowException('buffer_out_of_bounds')
          }

          return this.View['set'+type](offset, value, !!isLE);
        },
        DataViewGet: function(type, offset, isLE){
          offset >>>= 0;

          if (offset >= this.ByteLength) {
            return ThrowException('buffer_out_of_bounds')
          }

          return this.View['get'+type](offset, !!isLE);
        },

        FunctionToString: function(func){
          if (func.Proxy) {
            func = func.ProxyTarget;
          }
          var code = func.code;
          if (func.Builtin || !code) {
            return nativeCode[0] + func.get('name') + nativeCode[1];
          } else {
            return code.source.slice(code.range[0], code.range[1]);
          }
        },
        NumberToString: function(object, radix){
          return object.PrimitiveValue.toString(radix);
        },
        RegExpToString: function(object){
          return ''+object.PrimitiveValue;
        },
        DateToNumber: function(object){
          return +object.PrimitiveValue;
        },
        DateToString: function(object){
          return ''+object.PrimitiveValue;
        },
        CallBuiltin: function(target, name, args){
          if (args) {
            return target[name].apply(target, toInternalArray(args));
          } else {
            return target[name]();
          }
        },

        CodeUnit: function(v){
          return v.charCodeAt(0);
        },
        StringReplace: function(str, search, replace){
          if (typeof search !== 'string') {
            search = search.PrimitiveValue;
          }
          return str.replace(search, replace);
        },
        StringSplit: function(str, separator, limit){
          if (typeof separator !== 'string') {
            separator = separator.PrimitiveValue;
          }
          return fromInternalArray(str.split(separator, limit));
        },
        StringSearch: function(str, regexp){
          return str.search(regexp);
        },
        StringSlice: function(str, start, end){
          return end === undefined ? str.slice(start) : str.slice(start, end);
        },
        FromCharCode: String.fromCharCode,
        StringTrim: String.prototype.trim
          ? function(str){ return str.trim() }
          : (function(trimmer){
            return function(str){
              return str.replace(trimmer, '');
            };
          })(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/),
        IsExtensible: function(obj){
          return obj.IsExtensible();
        },
        PreventExtensions: function(obj, value){
          return obj.PreventExtensions(value);
        },
        GetInheritance: function(obj){
          return obj.GetInheritance();
        },
        SetInheritance: function(obj, proto){
          return obj.SetInheritance(proto);
        },
        DefineOwnProperty: function(obj, key, desc){
          return obj.DefineOwnProperty(key, ToPropertyDescriptor(desc), false);
        },
        Enumerate: function(obj, includePrototype, onlyEnumerable){
          return fromInternalArray(obj.Enumerate(includePrototype, onlyEnumerable));
        },
        GetProperty: function(obj, key){
          var desc = obj.GetProperty(key);
          if (desc) {
            return FromPropertyDescriptor(desc);
          }
        },
        GetOwnProperty: function(obj, key){
          var desc = obj.GetOwnProperty(key);
          if (desc) {
            return FromPropertyDescriptor(desc);
          }
        },
        GetPropertyAttributes: function(obj, key){
          return obj.properties.getAttribute(key);
        },
        HasOwnProperty: function(obj, key){
          return obj.HasOwnProperty(key);
        },
        SetP: function(obj, key, value, receiver){
          return obj.SetP(receiver, key, value);
        },
        GetP: function(obj, key, receiver){
          return obj.GetP(receiver, key);
        },

        parseInt: parseInt,
        parseFloat: parseFloat,
        decodeURI: decodeURI,
        decodeURIComponent: decodeURIComponent,
        encodeURI: encodeURI,
        encodeURIComponent: encodeURIComponent,
        escape: escape,
        unescape: unescape,
        SetTimer: function(f, time, repeating){
          if (typeof f === 'string') {
            f = natives.FunctionCreate(f);
          }
          var id = Math.random() * 1000000 << 10;
          timers[id] = setTimeout(function trigger(){
            if (timers[id]) {
              f.Call(global, []);
              if (repeating) {
                timers[id] = setTimeout(trigger, time);
              } else {
                timers[id] = f = null;
              }
            } else {
              f = null;
            }
          }, time);
          return id;
        },
        ClearTimer: function(id){
          if (timers[id]) {
            timers[id] = null;
          }
        },
        Quote: (function(){
          var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
              meta = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\' };

          function escaper(a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u'+('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          }

          return function(string){
            escapable.lastIndex = 0;
            return '"'+string.replace(escapable, escaper)+'"';
          };
        })(),
        JSONParse: function parse(source, reviver){
          function walk(holder, key){
            var value = holder.get(key);
            if (value && typeof value === 'object') {
              value.each(function(prop){
                if (prop[2] & E) {
                  v = walk(prop[1], prop[0]);
                  if (v !== undefined) {
                    prop[1] = v;
                  } else {
                    value.remove(prop[0]);
                  }
                }
              });
            }
            return reviver.Call(holder, [key, value]);
          }

          source = ToString(source);
          cx.lastIndex = 0;

          if (cx.test(source)) {
            source = source.replace(cx, function(a){
              return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            });
          }

          var test = source.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                           .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                           .replace(/(?:^|:|,)(?:\s*\[)+/g, '');

          if (/^[\],:{}\s]*$/.test(test)) {
            var json = realm.evaluate('('+source+')');
            var wrapper = new $Object;
            wrapper.set('', json);
            return IsCallable(reviver) ? walk(wrapper, '') : json;
          }

          return ThrowException('invalid_json', source);
        },
        acos: Math.acos,
        asin: Math.asin,
        atan: Math.atan,
        atan2: Math.atan2,
        cos: Math.acos,
        exp: Math.exp,
        log: Math.log,
        pow: Math.pow,
        random: Math.random,
        sin: Math.sin,
        sqrt: Math.sqrt,
        tan: Math.tan,
        MapInitialization: CollectionInitializer(MapData, 'Map'),
        MapSigil: function(){
          return MapData.sigil;
        },
        MapSize: function(map){
          return map.MapData ? map.MapData.size : 0;
        },
        MapClear: function(map){
          return map.MapData.clear();
        },
        MapGet: function(map, key){
          return map.MapData.get(key);
        },
        MapSet: function(map, key, val){
          return map.MapData.set(key, val);
        },
        MapDelete: function(map, key){
          return map.MapData.remove(key);
        },
        MapHas: function(map, key){
          return map.MapData.has(key);
        },
        MapNext: function(map, key){
          var result = map.MapData.after(key);
          return result instanceof Array ? fromInternalArray(result) : result;
        },

        WeakMapInitialization: CollectionInitializer(WeakMapData, 'WeakMap'),
        WeakMapGet: function(map, key){
          return map.WeakMapData.get(key);
        },
        WeakMapSet: function(map, key, val){
          return map.WeakMapData.set(key, val);
        },
        WeakMapDelete: function(map, key){
          return map.WeakMapData.remove(key);
        },
        WeakMapHas: function(map, key){
          return map.WeakMapData.has(key);
        },
        readFile: function(path, callback){
          require('fs').readFile(path, 'utf8', function(err, file){
            callback.Call(undefined, [file]);
          });
        },
        resolve: module
          ? require('path').resolve
          : function(base, to){
              to = to.split('/');
              base = base.split('/');
              base.length--;

              for (var i=0; i < to.length; i++) {
                if (to[i] === '..') {
                  base.length--;
                } else if (to[i] !== '.') {
                  base[base.length] = to[i];
                }
              }

              return base.join('/');
            },
        baseURL: module ? function(){ return module.parent.parent.dirname }
                        : function(){ return location.origin + location.pathname }
      };
    })();


    var initGlobals = new Script({
      scope: SCOPE.GLOBAL,
      natives: true,
      filename: 'module-init.js',
      source: 'import * from "@std"; $__hideEverything(this); $__update(this, "undefined", 0);'
    });

    var mutationScopeInit = new Script('void 0');

    function initialize(realm, Ω, ƒ){
      if (realm.initialized) Ω();
      realm.state = 'initializing';
      realm.initialized = true;
      realm.mutationScope = new ExecutionContext(null, realm.globalEnv, realm, mutationScopeInit.bytecode);
      resolveModule(require('../modules')['@system'], realm.global, '@system', function(){
        realm.evaluateAsync(initGlobals, function(){
          realm.state = 'idle';
          Ω();
        }, ƒ);
      }, ƒ);
    }

    function prepareToRun(bytecode, scope){
      if (!scope) {
        var realm = createSandbox(realm.global);
        scope = realm.globalEnv;
      } else {
        var realm = scope.Realm;
      }
      ExecutionContext.push(new ExecutionContext(null, scope, realm, bytecode));
      var status = TopLevelDeclarationInstantiation(bytecode);
      if (status && status.Abrupt) {
        realm.emit(status.type, status);
        return status;
      }
    }

    function run(realm, thunk, bytecode){
      realm.executing = thunk;
      realm.state = 'executing';
      realm.emit('executing', thunk);

      var result = thunk.run(context);

      if (result === Pause) {
        var resume = function(){
          resume = function(){};
          delete realm.resume;
          realm.emit('resume');
          return run(realm, thunk, bytecode);
        };

        realm.resume = function(){ return resume() };
        realm.state = 'paused';
        realm.emit('pause', realm.resume);
      } else {
        realm.executing = null;
        realm.state = 'idle';
        return result;
      }
    }


    function mutationContext(realm, toggle){
      if (toggle === undefined) {
        toggle = !realm.mutating;
      } else {
        toggle = !!toggle;
      }

      if (toggle !== realm.mutating) {
        realm.mutating = toggle;
        if (toggle) {
          ExecutionContext.push(realm.mutationScope);
        } else {
          ExecutionContext.pop();
        }
      }
      return toggle;
    }

    function resolveImports(code, Ω, ƒ){
      var modules = create(null);
      if (code.imports && code.imports.length) {
        var load = intrinsics.System.Get('load'),
            count = code.imports.length,
            errors = [];

        var callback = {
          Call: function(receiver, args){
            var result = args[0];

            if (result instanceof $Module) {
              modules[result.mrl] = result;
            } else {}

            if (!--count) {
              if (errors.length) {
                ƒ(errors);
              }
              Ω(modules);
            }
          }
        };

        var errback = {
          Call: function(receiver, args){
            errors.push(args[0]);
            if (!--count) {
              ƒ(errors);
              Ω(modules);
            }
          }
        };

        each(code.imports, function(imported){
          if (imported.specifiers && imported.specifiers.code) {
            var code = imported.specifiers.code,
                sandbox = createSandbox(global);

            runScript({ bytecode: code }, sandbox, errback.Call, function(){
              var module = new $Module(sandbox.globalEnv, code.exportedNames);
              module.mrl = code.name;
              callback.Call(null, [module]);
            });
          } else {
            var origin = imported.origin;
            if (typeof origin !== 'string' && origin instanceof Array) {

            } else {
              load.Call(intrinsics.System, [imported.origin, callback, errback]);
            }
          }
        });
      } else {
        Ω(modules);
      }
    }

    function createSandbox(object){
      var outerRealm = object.Realm || object.Prototype.Realm,
          bindings = new $Object,
          scope = new GlobalEnvironmentRecord(bindings),
          realm = scope.Realm = bindings.Realm = create(outerRealm);

      bindings.BuiltinBrand = BRANDS.GlobalObject;
      scope.outer = outerRealm.globalEnv;
      realm.global = bindings;
      realm.globalEnv = scope;
      return realm;
    }


    function runScript(script, realm, Ω, ƒ){
      var scope = realm.globalEnv,
          ctx = new ExecutionContext(context, scope, realm, script.bytecode);

      if (!script.thunk) {
        script.thunk = new Thunk(script.bytecode);
      }

      ExecutionContext.push(ctx);
      var status = TopLevelDeclarationInstantiation(script.bytecode);
      context === ctx && ExecutionContext.pop();

      if (status && status.Abrupt) {
        return ƒ(status);
      }


      resolveImports(script.bytecode, function(modules){
        each(script.bytecode.imports, function(imported){
          var module = modules[imported.origin];

          if (imported.name) {
            scope.SetMutableBinding(imported.name, module);
          } else if (imported.specifiers) {
            each(imported.specifiers, function(path, name){
              if (name === '*') {
                module.each(function(prop){
                  scope.SetMutableBinding(prop[0], module.Get(prop[0]));
                });
              } else {
                var obj = module;

                each(path, function(part){
                  var o = obj;
                  obj = obj.Get(part);
                });

                scope.SetMutableBinding(name, obj);
              }
            });
          }
        });

        ExecutionContext.push(ctx);
        var result = run(realm, script.thunk, script.bytecode);
        context === ctx && ExecutionContext.pop();

        if (result && result.Abrupt) {
          ƒ(result);
        } else {
          Ω(result);
        }
      }, ƒ);
    }

    function resolveModule(source, global, name, Ω, ƒ){
      var script = new Script({
        name: name,
        natives: true,
        source: source,
        scope: SCOPE.MODULE
      });

      if (script.error) {
        return ƒ(script.error);
      }

      var sandbox = createSandbox(global);

      runScript(script, sandbox, function(){
        Ω(new $Module(sandbox.globalEnv, script.bytecode.exportedNames));
      }, ƒ);
    }


    function Realm(oncomplete){
      var self = this;

      Emitter.call(this);
      realms.push(this);
      this.active = false;
      this.quiet = false;
      this.initialized = false;
      this.mutationScope = null;
      this.scripts = [];
      this.templates = {};
      this.state = 'bootstrapping';

      activate(this);
      this.natives = new Intrinsics(this);
      intrinsics = this.intrinsics = this.natives.bindings;
      intrinsics.global = global = operators.global = this.global = new $Object(new $Object(this.intrinsics.ObjectProto));
      this.global.BuiltinBrand = BRANDS.GlobalObject;
      this.globalEnv = new GlobalEnvironmentRecord(this.global);
      this.globalEnv.Realm = this;

      this.intrinsics.FunctionProto.Scope = this.globalEnv;
      this.intrinsics.FunctionProto.Realm = this;
      this.intrinsics.ThrowTypeError = CreateThrowTypeError(this);
      hide(this.intrinsics.FunctionProto, 'Scope');
      hide(this, 'intrinsics');
      hide(this, 'natives');
      hide(this, 'active');
      hide(this, 'templates');
      hide(this, 'scripts');
      hide(this, 'globalEnv');
      hide(this, 'initialized');
      hide(this, 'quiet');
      hide(this, 'mutationScope');

      for (var k in natives) {
        this.natives.binding({ name: k, call: natives[k] });
      }

      function init(){
        initialize(self, function(){
          deactivate(self);
          self.scripts = [];
          self.state = 'idle';
          self.emit('ready');
          if (typeof oncomplete === 'function') {
            oncomplete(self);
          }
        }, function(error){
          self.state = 'error';
          self.emit('throw', error);
          if (typeof oncomplete === 'function') {
            oncomplete(error);
          }
        });
      }

      this.state = 'initializing';
      if (oncomplete === true) {
        setTimeout(init, 10);
      } else {
        init();
      }
    }

    inherit(Realm, Emitter, [
      function enterMutationContext(){
        mutationContext(this, true);
      },
      function exitMutationContext(){
        mutationContext(this, false);
      },
      function evaluateModule(source, global, name, callback, errback){
        if (typeof callback !== 'function') {
          if (typeof name === 'function') {
            callback = name;
            name = '';
          } else {
            callback = noop;
          }
        }
        if (typeof errback !== 'function') {
          errback = noop;
        }
        resolveModule(source, global, name, callback, errback);
      },
      function evaluateAsync(subject, callback, errback){
        var script = new Script(subject),
            self = this;

        callback || (callback = noop);
        errback || (errback = callback);

        if (script.error) {
          nextTick(function(){
            self.emit(script.error.type, script.error);
            errback(script.error);
          });
        } else {
          this.scripts.push(script);
          runScript(script, this, function(result){
            self.emit('complete', result);
            callback(result);
          }, function(error){
            self.emit('throw', error);
            errback(error);
          });
        }
      },
      function evaluate(subject){
        activate(this);
        var script = new Script(subject);

        if (script.error) {
          this.emit('throw', script.error);
          return script.error;
        }

        this.scripts.push(script);

        var result = prepareToRun(script.bytecode, this.globalEnv)
                  || run(this, script.thunk, script.bytecode);

        if (result && result.Abrupt) {
          this.emit('throw', result);
        } else {
          this.emit('complete', result);
        }
        return result;
      }
    ]);

    return Realm;
  })();


  function activate(target){
    if (realm !== target) {
      if (realm) {
        realm.active = false;
        realm.emit('deactivate');
      }
      realmStack.push(realm);
      realm = target;
      global = operators.global = target.global;
      intrinsics = target.intrinsics;
      target.active = true;
      target.emit('activate');
    }
  }

  function deactivate(target){
    if (realm === target && realmStack.length) {
      target.active = false;
      realm = realmStack.pop();
      target.emit('dectivate');
    }
  }

  var realms = [],
      realmStack = [],
      realm = null,
      global = null,
      context = null,
      intrinsics = null;



  exports.Realm = Realm;
  exports.Script = Script;
  exports.$NativeFunction = $NativeFunction;

  exports.activeRealm = function activeRealm(){
    if (!realm && realms.length) {
      activate(realms[realms.length - 1]);
    }
    return realm;
  };

  exports.activeContext = function activeContext(){
    return context;
  };

  return exports;
})((0,eval)('this'), typeof module !== 'undefined' ? module.exports : {});






exports.debug = (function(exports){
  "use strict";
  var objects   = require('../lib/objects'),
      iteration = require('../lib/iteration'),
      utility   = require('../lib/utility'),
      runtime   = require('./runtime');

  var isObject   = objects.isObject,
      inherit    = objects.inherit,
      create     = objects.create,
      define     = objects.define,
      assign     = objects.assign,
      getBrandOf = objects.getBrandOf,
      Hash       = objects.Hash,
      each       = iteration.each,
      quotes     = utility.quotes,
      uid        = utility.uid,
      realm      = runtime.activeRealm;

  var ENUMERABLE   = 0x01,
      CONFIGURABLE = 0x02,
      WRITABLE     = 0x04,
      ACCESSOR     = 0x08;

  function always(value){
    return function(){ return value };
  }

  function alwaysCall(func, args){
    args || (args = []);
    return function(){ return func.apply(null, args) }
  }

  function isNegativeZero(n){
    return n === 0 && 1 / n === -Infinity;
  }


  function Mirror(){}

  define(Mirror.prototype, {
    type: null,
    getPrototype: function(){
      return _Null;
    },
    get: function(){
      return _Undefined;
    },
    getValue: function(){
      return _Undefined;
    },
    kind: 'Unknown',
    label: always(''),
    hasOwn: always(null),
    has: always(null),
    list: alwaysCall(Array),
    inheritedAttrs: alwaysCall(create, [null]),
    ownAttrs: alwaysCall(create, [null]),
    getterAttrs: alwaysCall(create, [null]),
    isPropExtensible: always(null),
    isPropEnumerable: always(null),
    isPropConfigurable: always(null),
    getOwnDescriptor: always(null),
    getDescriptor: always(null),
    getProperty: always(null),
    isPropAccessor: always(null),
    isPropWritable: always(null),
    propAttributes: always(null)
  });

  function MirrorValue(subject, label){
    this.subject = subject;
    this.type = typeof subject;
    this.kind = getBrandOf(subject)+'Value';
    if (this.type === 'number' && isNegativeZero(subject)) {
      label = '-0';
    }
    this.label = always(label);
  }

  inherit(MirrorValue, Mirror);

  function MirrorStringValue(subject){
    this.subject = subject;
  }

  inherit(MirrorStringValue, MirrorValue, {
    label: always('string'),
    kind: 'StringValue',
    type: 'string'
  });

  function MirrorNumberValue(subject){
    this.subject = subject;
  }

  inherit(MirrorNumberValue, MirrorValue, {
    label: always('number'),
    kind: 'NumberValue',
    type: 'number'
  });


  var MirrorAccessor = (function(){
    function MirrorAccessor(holder, accessor, key){
      this.holder = holder;
      this.accessor = accessor;
      this.key = key;
      realm().enterMutationContext();
      this.subject = accessor.Get.Call(holder, []);
      if (this.subject && this.subject.__introspected) {
        this.introspected = this.subject.__introspected;
      } else {
        this.introspected = introspect(this.subject);
      }
      this.kind = this.introspected.kind;
      this.type = this.introspected.type;
      realm().exitMutationContext();
    }


    inherit(MirrorAccessor, Mirror, {
      accessor: true
    }, [
      function label(){
        return this.introspected.label();
      },
      function getName(){
        return this.subject.get('name');
      },
      function getParams(){
        var params = this.subject.FormalParameters;
        if (params && params.ArgNames) {
          var names = params.ArgNames.slice();
          if (params.Rest) {
            names.rest = true;
          }
          return names;
        } else {
          return [];
        }
      }
    ]);

    return MirrorAccessor;
  })();

  var proto = uid();


  var MirrorPrototypeAccessor = (function(){
    function MirrorPrototypeAccessor(holder, accessor, key){
      this.holder = holder;
      this.subject = accessor;
      this.key = key;
    }


    inherit(MirrorPrototypeAccessor, Mirror, {
      accessor: true,
      kind: 'Accessor'
    }, [
      function label(){
        var label = [];
        if ('Get' in this.subject) label.push('Getter');
        if ('Set' in this.subject) label.push('Setter');
        return label.join('/');
      },
      function getName(){
        return (this.subject.Get || this.subject.Set).get('name');
      }
    ]);

    return MirrorPrototypeAccessor;
  })();




  var MirrorObject = (function(){
    function MirrorObject(subject){
      subject.__introspected = this;
      this.subject = subject;
      this.props = subject.properties;
      this.accessors = new Hash;
    }

    inherit(MirrorObject, Mirror, {
      kind: 'Object',
      type: 'object',
      parentLabel: '[[proto]]',
      attrs: null,
      props: null
    }, [
      function get(key){
        if (this.isPropAccessor(key)) {
          var prop = this.getProperty(key),
              accessor = prop[1] || prop[3];

          if (!this.accessors[key]) {
            if (this.subject.IsProto) {
              this.accessors[key] = new MirrorPrototypeAccessor(this.subject, accessor, key);
            } else {
              this.accessors[key] = new MirrorAccessor(this.subject, accessor, key);
            }
          }
          return this.accessors[key];
        } else {
          var prop = this.subject.describe(key);
          if (prop) {
            return introspect(prop[1]);
          } else {
            return this.getPrototype().get(key);
          }
        }
      },
      function getProperty(key){
        return this.subject.describe(key) || this.getPrototype().getProperty(key);
      },
      function isClass(){
        return !!this.subject.Class;
      },
      function getBrand(){
        return this.subject.Brand || this.subject.BuiltinBrand;
      },
      function getValue(key){
        return this.get(key).subject;
      },
      function getPrototype(){
        return introspect(this.subject.GetInheritance());
      },
      function setPrototype(value){
        realm().enterMutationContext();
        var ret = this.subject.SetInheritance(value);
        realm().exitMutationContext();
        return ret;
      },
      function set(key, value){
        var ret;
        realm().enterMutationContext();
        ret = this.subject.Put(key, value, false);
        realm().exitMutationContext();
        return ret;
      },
      function setAttribute(key, attr){
        var prop = this.subject.describe(key);
        if (prop) {
          prop[2] = attr;
          return true;
        }
        return false;
      },
      function defineProperty(key, desc){
        desc = Object(desc);
        var Desc = {};
        if ('value' in desc) {
          Desc.Value = desc.value;
        }
        if ('get' in desc) {
          Desc.Get = desc.get;
        }
        if ('set' in desc) {
          Desc.Set = desc.set;
        }
        if ('enumerable' in desc) {
          Desc.Enumerable = desc.enumerable;
        }
        if ('configurable' in desc) {
          Desc.Configurable = desc.configurable;
        }
        if ('writable' in desc) {
          Desc.Writable = desc.writable;
        }
        realm().enterMutationContext();
        var ret = this.subject.DefineOwnProperty(key, Desc, false);
        realm().exitMutationContext();
        return ret;
      },
      function hasOwn(key){
        if (this.subject) {
          return this.subject.has(key);
        } else {
          return false;
        }
      },
      function has(key){
        return this.hasOwn(key) || this.getPrototype().has(key);
      },
      function isExtensible(key){
        return this.subject.IsExtensible();
      },
      function getDescriptor(key){
        return this.getOwnDescriptor(key) || this.getPrototype().getDescriptor(key);
      },
      function getOwnDescriptor(key){
        var prop = this.subject.describe(key);
        if (prop) {
          if (prop[2] & ACCESSOR) {
            return {
              name: key,
              get: prop[1].Get,
              set: prop[1].Set,
              enumerable: (prop[2] & ENUMERABLE) > 0,
              configurable: (prop[2] & CONFIGURABLE) > 0
            }
          } else {
            return {
              name: key,
              value: prop[1],
              writable: (prop[2] & WRITABLE) > 0,
              enumerable: (prop[2] & ENUMERABLE) > 0,
              configurable: (prop[2] & CONFIGURABLE) > 0
            }
          }
        }
      },
      function getInternal(name){
        return this.subject[name];
      },
      function isPropEnumerable(key){
        return (this.propAttributes(key) & ENUMERABLE) > 0;
      },
      function isPropConfigurable(key){
        return (this.propAttributes(key) & CONFIGURABLE) > 0;
      },
      function isPropAccessor(key){
        return (this.propAttributes(key) & ACCESSOR) > 0;
      },
      function isPropWritable(key){
        var prop = this.subject.get(key);
        if (prop) {
          return !!(prop[2] & ACCESSOR ? prop[1].Set : prop[2] & WRITABLE);
        } else {
          return this.subject.IsExtensible();
        }
      },
      function propAttributes(key){
        var prop = this.subject.describe(key);
        return prop ? prop[2] : this.getPrototype().propAttributes(key);
      },
      function label(){
        var brand = this.subject.Brand || this.subject.BuiltinBrand;
        if (brand && brand.name !== 'Object') {
          return brand.name;
        }

        if (this.subject.ConstructorName) {
          return this.subject.ConstructorName;
        } else if (this.has('constructor')) {
          var ctorName = this.get('constructor').get('name');
          if (ctorName.subject && typeof ctorName.subject === 'string') {
            return ctorName.subject;
          }
        }

        return 'Object';
      },
      function inheritedAttrs(){
        return this.ownAttrs(this.getPrototype().inheritedAttrs());
      },
      function ownAttrs(props){
        props || (props = new Hash);
        this.subject.each(function(prop){
          var key = prop[0] === '__proto__' ? proto : prop[0];
          props[key] = prop;
        });
        return props;
      },
      function getterAttrs(own){
        var inherited = this.getPrototype().getterAttrs(),
            props = this.ownAttrs();

        for (var k in props) {
          if (own || (props[k][2] & ACCESSOR)) {
            inherited[k] = props[k];
          }
        }
        return inherited;
      },
      function list(hidden, own){
        var keys = [],
            props = own
              ? this.ownAttrs()
              : own === false
                ? this.inheritedAttrs()
                : this.getterAttrs(true);

        for (var k in props) {
          var prop = props[k];
          if (hidden || !prop[0].Private && (prop[2] & ENUMERABLE)) {
            keys.push(prop[0]);
          }
        }

        return keys.sort();
      }
    ]);

    return MirrorObject;
  })();


  var MirrorArguments = (function(){
    function MirrorArguments(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorArguments, MirrorObject, {
      kind: 'Arguments'
    });

    return MirrorArguments;
  })();


  var MirrorArray = (function(){

    function MirrorArray(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorArray, MirrorObject, {
      kind: 'Array'
    }, [
      function list(hidden, own){
        var keys = [],
            indexes = [],
            len = this.getValue('length'),
            props = own
              ? this.ownAttrs()
              : own === false
                ? this.inheritedAttrs()
                : this.getterAttrs(true);


        for (var k in props) {
          var prop = props[k];
          if (hidden || !prop[0].Private && (prop[2] & ENUMERABLE)) {
            if (prop[0] >= 0 && prop[0] < len) {
              indexes.push(prop[0]);
            } else {
              keys.push(prop[0]);
            }
          }
        }

        return indexes.sort(function(a, b){ return +a > +b }).concat(keys.sort());
      }
    ]);

    return MirrorArray;
  })();

  var MirrorArrayBufferView = (function(){
    function MirrorArrayBufferView(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorArrayBufferView, MirrorArray, {
      kind: 'ArrayBuffer'
    }, [
      function label(){
        return this.subject.BuiltinBrand.name;
      }
    ]);
    return MirrorArrayBufferView;
  })();


  var MirrorBoolean = (function(){
    function MirrorBoolean(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorBoolean, MirrorObject, {
      kind: 'Boolean'
    }, [
      function label(){
        return 'Boolean('+this.subject.PrimitiveValue+')';
      }
    ]);

    return MirrorBoolean;
  })();




  var MirrorDate = (function(){
    function MirrorDate(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorDate, MirrorObject, {
      kind: 'Date'
    }, [
      function label(){
        var date = this.subject.PrimitiveValue;
        if (!date || date === Date.prototype || ''+date === 'Invalid Date') {
          return 'Invalid Date';
        } else {
          var json = date.toJSON();
          return json.slice(0, 10) + ' ' + json.slice(11, 19);
        }
      }
    ]);

    return MirrorDate;
  })();


  var MirrorError = (function(){
    function MirrorError(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorError, MirrorObject, {
      kind: 'Error'
    });

    return MirrorError;
  })();


  var MirrorThrown = (function(){
    function MirrorThrown(subject){
      if (isObject(subject)) {
        MirrorError.call(this, subject);
      } else {
        return introspect(subject);
      }
    }

    inherit(MirrorThrown, MirrorError, {
      kind: 'Thrown'
    }, [
      function getError(){
        if (this.subject.BuiltinBrand.name === 'StopIteration') {
          return 'StopIteration';
        }
        return this.getValue('name') + ': ' + this.getValue('message');
      },
      function origin(){
        var file = this.getValue('filename') || '',
            type = this.getValue('kind') || '';

        return file && type ? type + ' ' + file : type + file;
      },
      function trace(){
        return this.subject.trace;
      },
      function context(){
        return this.subject.context;
      }
    ]);

    return MirrorThrown;
  })();


  var MirrorFunction = (function(){
    function MirrorFunction(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorFunction, MirrorObject, {
      type: 'function',
      kind: 'Function'
    }, [
      function getName(){
        return this.subject.get('name');
      },
      function getParams(){
        var params = this.subject.FormalParameters;
        if (params && params.boundNames) {
          var names = params.boundNames.slice();
          if (params.Rest) {
            names.rest = true;
          }
          return names;
        } else {
          return [];
        }
      },
      function apply(receiver, args){
        if (receiver.subject) {
          receiver = receiver.subject;
        }
        realm().enterMutationContext();
        var ret = this.subject.Call(receiver, args);
        realm().exitMutationContext();
        return introspect(ret);
      },
      function construct(args){
        if (this.subject.Construct) {
          realm().enterMutationContext();
          var ret = this.subject.Construct(args);
          realm().exitMutationContext();
          return introspect(ret);
        } else {
          return false;
        }
      },
      function getScope(){
        return introspect(this.subject.Scope);
      },
      function isStrict(){
        return !!this.subject.strict;
      },
      function ownAttrs(props){
        var strict = this.isStrict();
        props || (props = new Hash);
        this.subject.each(function(prop){
          if (!prop[0].Private && !strict || prop[0] !== 'arguments' && prop[0] !== 'caller' && prop[0] !== 'callee') {
            var key = prop[0] === '__proto__' ? proto : prop[0];
            props[key] = prop;
          }
        });
        return props;
      }
    ]);

    return MirrorFunction;
  })();



  var MirrorGlobal = (function(){
    function MirrorGlobal(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorGlobal, MirrorObject, {
      kind: 'Global'
    }, [
      function getEnvironment(){
        return introspect(this.subject.env);
      }
    ]);

    return MirrorGlobal;
  })();


  var MirrorJSON = (function(){
    function MirrorJSON(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorJSON, MirrorObject, {
      kind: 'JSON'
    });

    return MirrorJSON;
  })();


  var MirrorMath = (function(){
    function MirrorMath(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorMath, MirrorObject, {
      kind: 'Math'
    });

    return MirrorMath;
  })();


  var MirrorModule = (function(){
    function MirrorModule(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorModule, MirrorObject, {
      kind: 'Module'
    }, [
      function get(key){
        if (this.isPropAccessor(key)) {
          if (!this.accessors[key]) {
            var prop = this.getProperty(key),
                accessor = prop[1] || prop[3];

            realm().enterMutationContext();
            this.accessors[key] = introspect(accessor.Get.Call(this.subject, []));
            realm().exitMutationContext();
          }

          return this.accessors[key];
        } else {
          var prop = this.subject.describe(key);
          if (prop) {
            return introspect(prop[1]);
          } else {
            return this.getPrototype().get(key);
          }
        }
      }
    ]);

    return MirrorModule;
  })();

  var MirrorNumber = (function(){
    function MirrorNumber(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorNumber, MirrorObject, {
      kind: 'Number'
    }, [
      function label(){
        var value = this.subject.PrimitiveValue;
        if (isNegativeZero(value)) {
          value = '-0';
        } else {
          value += '';
        }
        return value;
      }
    ]);

    return MirrorNumber;
  })();


  var MirrorRegExp = (function(){
    function MirrorRegExp(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorRegExp, MirrorObject, {
      kind: 'RegExp'
    }, [
      function label(){
        return this.subject.PrimitiveValue+'';
      }
    ]);

    return MirrorRegExp;
  })();



  var MirrorString = (function(){
    function MirrorString(subject){
      MirrorObject.call(this, subject);
      this.primitive = this.subject.PrimitiveValue;
    }

    inherit(MirrorString, MirrorObject,{
      kind: 'String'
    }, [
      function get(key){
        if (key < this.subject.get('length') && key >= 0) {
          return this.primitive[key];
        } else {
          return MirrorObject.prototype.get.call(this, key);
        }
      },
      function ownAttrs(props){
        var len = this.primitive.length;
        props || (props = new Hash);

        for (var i=0; i < len; i++) {
          props[i] = [i+'', this.primitive[i], 1];
        }

        this.subject.each(function(prop){
          var key = prop[0] === '__proto__' ? proto : prop[0];
          props[key] = prop;
        });

        return props;
      },
      function propAttributes(key){
        if (key < this.subject.get('length') && key >= 0) {
          return 1;
        } else {
          return MirrorObject.prototype.propAttributes.call(this, key);
        }
      },
      function label(){
        return 'String('+quotes(this.primitive)+')';
      }
    ]);


    return MirrorString;
  })();


  var MirrorSymbol = (function(){
    function MirrorSymbol(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorSymbol, MirrorObject, {
      kind: 'Symbol'
    }, [
      function label(){
        return '@' + (this.subject.Name || 'Symbol');
      },
      function isPrivate(){
        return this.subject.Private;
      }
    ]);

    return MirrorSymbol;
  })();



  var MirrorCollection = (function(){
    function CollectionIterator(data){
      this.guard = this.current = data.guard;
      this.index = 0;
    }

    define(CollectionIterator.prototype, [
      function next(){
        if (!this.current || this.current.next === this.guard) {
          this.guard = this.current = null;
          throw StopIteration;
        }
        this.index++;
        return this.current = this.current.next;
      }
    ]);

    function MirrorCollection(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorCollection, MirrorObject, [
      function count(){
        return this.data.size;
      },
      function __iterator__(){
        return new CollectionIterator(this.data);
      }
    ]);

    return MirrorCollection;
  })();


  var MirrorSet = (function(){
    function MirrorSet(subject){
      MirrorCollection.call(this, subject);
      var map = this.subject.SetData;
      if (map) {
        this.data = map.MapData;
      }
    }

    inherit(MirrorSet, MirrorCollection, {
      kind: 'Set'
    }, [
    ]);

    return MirrorSet;
  })();

  var MirrorMap = (function(){
    function MirrorMap(subject){
      MirrorCollection.call(this, subject);
      this.data = this.subject.MapData;
    }

    inherit(MirrorMap, MirrorCollection, {
      kind: 'Map'
    }, [
    ]);

    return MirrorMap;
  })();


  var MirrorWeakMap = (function(){
    function MirrorWeakMap(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorWeakMap, MirrorObject, {
      kind: 'WeakMap'
    });

    return MirrorWeakMap;
  })();






  var MirrorProxy = (function(){
    function MirrorProxy(subject){
      this.subject = subject;
      if ('Call' in subject) {
        this.type = 'function';
      }
      this.attrs = new Hash;
      this.props = new Hash;
      this.kind = introspect(subject.Target).kind;
    }

    function descToAttrs(desc){
      if (desc) {
        if ('Value' in desc) {
          return desc.Enumerable | (desc.Configurable << 1) | (desc.Writable << 2);
        }
        return desc.Enumerable | (desc.Configurable << 1) | ACCESSOR;
      }
    }

    inherit(MirrorProxy, Mirror, {
      type: 'object'
    }, [
      MirrorObject.prototype.isExtensible,
      MirrorObject.prototype.getPrototype,
      MirrorObject.prototype.list,
      MirrorObject.prototype.inheritedAttrs,
      MirrorObject.prototype.getterAttrs,
      function getOwnDescriptor(key){
        var desc = this.subject.GetOwnProperty(key);
        var out =  {};
        for (var k in desc) {
          out[k.toLowerCase()] = desc[k];
        }
        return out;
      },
      function label(){
        return 'Proxy' + MirrorObject.prototype.label.call(this);
      },
      function get(key){
        return introspect(this.subject.Get(key));
      },
      function getValue(key){
        return this.subject.Get(key);
      },
      function hasOwn(key){
        return this.subject.HasOwnProperty(key);
      },
      function has(key){
        return this.subject.HasProperty(key);
      },
      function isPropEnumerable(key){
        var desc = this.subject.GetOwnProperty(key);
        return !!(desc && desc.Enumerable);
      },
      function isPropConfigurable(key){
        var desc = this.subject.GetOwnProperty(key);
        return !!(desc && desc.Configurable);
      },
      function isPropAccessor(key){
        var desc = this.subject.GetOwnProperty(key);
        return !!(desc && desc.Get || desc.Set);
      },
      function isPropWritable(key){
        var desc = this.subject.GetOwnProperty(key);
        return !!(desc && desc.Writable);
      },
      function propAttributes(key){
        var desc = this.subject.GetOwnProperty(key);
        if (desc) {
          return descToAttrs(desc);
        }
      },
      function ownAttrs(props){
        var key, keys = this.subject.Enumerate(false, true);

        props || (props = new Hash);
        this.props = new Hash;
        this.attrs = new Hash;

        for (var i=0; i < keys.length; i++) {
          var desc = this.subject.GetOwnProperty(key);
          if (desc) {
            props[keys[i]] = [keys[i], desc.Value, descToAttrs(desc)];
          }
        }

        return props;
      }
    ]);

    return MirrorProxy;
  })();



  var MirrorScope = (function(){
    function MirrorScope(subject){
      if (subject.type === 'Global Env') {
        return new MirrorGlobalScope(subject);
      }
      subject.__introspected = this;
      this.subject = subject;
    }

    inherit(MirrorScope, Mirror, {
      kind: 'Scope',
      type: 'scope',
      parentLabel: '[[outer]]',
      isExtensible: always(true),
      isPropEnumerable: always(true),
      isPropAccessor: always(false)
    }, [
      function isPropAccessor(key){
        return this.getPrototype().isPropAccessor(key) || false;
      },
      function getPrototype(){
        return introspect(this.subject.outer);
      },
      function getValue(key){
        return this.subject.GetBindingValue(key);
      },
      function get(key){
        return introspect(this.subject.GetBindingValue(key));
      },
      function getOwn(key){
        if (this.hasOwn(key)) {
          return introspect(this.subject.GetBindingValue(key));
        }
      },
      function label(){
        return this.subject.type;
      },
      function hasOwn(key){
        return this.subject.HasBinding(key);
      },
      function has(key){
        return this.subject.HasBinding(key) || this.getPrototype().has(key);
      },
      function inheritedAttrs(){
        return this.ownAttrs(this.getPrototype().inheritedAttrs());
      },
      function ownAttrs(props){
        props || (props = new Hash);

        each(this.subject.EnumerateBindings(), function(key){
          key = key === '__proto__' ? proto : key;
          props[key] = [key, null, 7]
        });
        return props;
      },
      function isClass(){
        return !!this.subject.Class;
      },
      function list(hidden, own){
        own = true;
        var props = own ? this.ownAttrs() : this.inheritedAttrs(),
            keys = [];

        for (var k in props) {
          keys.push(props[k][0]);
        }

        return keys.sort();
      },
      function isPropConfigurable(key){
        return !(this.subject.deletables && key in this.subject.deletables);
      },
      function isPropWritable(key){
        return !(this.subject.consts && key in this.subject.consts);
      },
      function getOwnDescriptor(key){
        if (this.hasOwn(key)) {
          return { configurable: this.isPropConfigurable(key),
                   enumerable: true,
                   writable: this.isPropWritable(key),
                   value: this.get(key)   };
        }
      },
      function getDescriptor(key){
        return this.getOwnDescriptor(key) || this.getPrototype().getDescriptor(key);
      },
      function getProperty(key){
        return [this.subject.GetBindingValue(key), value, this.propAttributes(key)];
      },
      function propAttributes(key){
        return 1 | (this.isPropConfigurable(key) << 1) | (this.isPropWritable(key) << 2);
      }
    ]);

    return MirrorScope;
  })();

  var MirrorGlobalScope = (function(){
    function MirrorGlobalScope(subject){
      subject.__introspected = this;
      this.subject = subject;
      this.global = introspect(subject.bindings);
    }

    inherit(MirrorGlobalScope, MirrorScope, {
    }, [
      function isExtensible(){
        return this.global.isExtensible();
      },
      function isPropEnumerable(key){
        return this.global.isPropEnumerable(key);
      },
      function isPropConfigurable(key){
        return this.global.isPropConfigurable(key);
      },
      function isPropWritable(key){
        return this.global.isPropWritable(key);
      },
      function isPropAccessor(key){
        return this.global.isPropAccessor(key);
      },
      function propAttributes(key){
        return this.global.propAttributes(key);
      },
      function getProperty(key){
        return this.global.getProperty(key);
      },
      function getDescriptor(key){
        return this.global.getDescriptor(key);
      },
      function getOwnDescriptor(key){
        return this.global.getOwnDescriptor(key);
      },
      function inheritedAttrs(){
        return this.global.inheritedAttrs();
      },
      function ownAttrs(props){
        return this.global.ownAttrs(props);
      },
      function list(hidden, own){
        return this.global.list(hidden, own);
      }
    ]);

    return MirrorGlobalScope;
  })();




  var brands = {
    Arguments   : MirrorArguments,
    Array       : MirrorArray,
    Boolean     : MirrorBoolean,
    Date        : MirrorDate,
    Error       : MirrorError,
    Function    : MirrorFunction,
    global      : MirrorGlobal,
    JSON        : MirrorJSON,
    Map         : MirrorMap,
    Math        : MirrorMath,
    Module      : MirrorModule,
    Number      : MirrorNumber,
    RegExp      : MirrorRegExp,
    Set         : MirrorSet,
    String      : MirrorString,
    Symbol      : MirrorSymbol,
    WeakMap     : MirrorWeakMap,
    Int8Array   : MirrorArrayBufferView,
    Uint8Array  : MirrorArrayBufferView,
    Int16Array  : MirrorArrayBufferView,
    Uint16Array : MirrorArrayBufferView,
    Int32Array  : MirrorArrayBufferView,
    Uint32Array : MirrorArrayBufferView,
    Float32Array: MirrorArrayBufferView,
    Float64Array: MirrorArrayBufferView
  };

  var _Null        = new MirrorValue(null, 'null'),
      _Undefined   = new MirrorValue(undefined, 'undefined'),
      _True        = new MirrorValue(true, 'true'),
      _False       = new MirrorValue(false, 'false'),
      _NaN         = new MirrorValue(NaN, 'NaN'),
      _Infinity    = new MirrorValue(Infinity, 'Infinity'),
      _NegInfinity = new MirrorValue(-Infinity, '-Infinity'),
      _Zero        = new MirrorValue(0, '0'),
      _NegZero     = new MirrorValue(-0, '-0'),
      _One         = new MirrorValue(1, '1'),
      _NegOne      = new MirrorValue(-1, '-1'),
      _Empty       = new MirrorValue('', "''");

  var numbers = new Hash,
      strings = new Hash;


  function introspect(subject){
    switch (typeof subject) {
      case 'undefined': return _Undefined;
      case 'boolean': return subject ? _True : _False;
      case 'string':
        if (subject === '') {
          return _Empty
        } else if (subject.length < 20) {
          if (subject in strings) {
            return strings[subject];
          } else {
            return strings[subject] = new MirrorStringValue(subject);
          }
        } else {
          return new MirrorStringValue(subject);
        }
      case 'number':
        if (subject !== subject) {
          return _NaN;
        }
        switch (subject) {
          case Infinity: return _Infinity;
          case -Infinity: return _NegInfinity;
          case 0: return 1 / subject === -Infinity ? _NegZero : _Zero;
          case 1: return _One;
          case -1: return _NegOne;
        }
        if (subject in numbers) {
          return numbers[subject];
        } else {
          return numbers[subject] = new MirrorNumberValue(subject);
        }
      case 'object':
        if (subject == null) {
          return _Null;
        } else if (subject instanceof Mirror) {
          return subject;
        } else if (subject.__introspected) {
          return subject.__introspected;
        } else if (subject.Environment) {
          return new MirrorScope(subject);
        } else if (subject.Completion) {
          return new MirrorThrown(subject.value);
        } else if (subject.BuiltinBrand) {
          if (subject.Proxy) {
            return new MirrorProxy(subject);
          } else if ('Call' in subject) {
            return new MirrorFunction(subject);
          } else if (subject.BuiltinBrand.name in brands) {
            return new brands[subject.BuiltinBrand.name](subject);
          } else {
            return new MirrorObject(subject);
          }
        } else {
          return _Undefined
        }
    }
  }


  var Renderer = (function(){

    function alwaysLabel(mirror){
      return mirror.label();
    }


    function Renderer(handlers){
      if (handlers) {
        for (var k in this) {
          if (k in handlers) {
            this[k] = handlers[k];
          }
        }
      }
    }

    define(Renderer.prototype, [
      function render(subject){
        var mirror = introspect(subject);
        return this[mirror.kind](mirror);
      }
    ]);

    assign(Renderer.prototype, {
      Unknown: alwaysLabel,
      BooleanValue: alwaysLabel,
      StringValue: function(mirror){
        return quotes(mirror.subject);
      },
      NumberValue: function(mirror){
        var label = mirror.label();
        return label === 'number' ? mirror.subject : label;
      },
      UndefinedValue: alwaysLabel,
      NullValue: alwaysLabel,
      Thrown: function(mirror){
        return mirror.getError();
      },
      Accessor: alwaysLabel,
      Arguments: alwaysLabel,
      Array: alwaysLabel,
      ArrayBuffer: alwaysLabel,
      Boolean: alwaysLabel,
      Date: alwaysLabel,
      Error: function(mirror){
        return mirror.getValue('name') + ': ' + mirror.getValue('message');
      },
      Function: alwaysLabel,
      Global: alwaysLabel,
      JSON: alwaysLabel,
      Map: alwaysLabel,
      Math: alwaysLabel,
      Module: alwaysLabel,
      Object: alwaysLabel,
      Number: alwaysLabel,
      RegExp: alwaysLabel,
      Scope: alwaysLabel,
      Set: alwaysLabel,
      Symbol: alwaysLabel,
      String: alwaysLabel,
      WeakMap: alwaysLabel
    });

    return Renderer;
  })();


  var renderer = new Renderer;

  define(exports, [
    function basicRender(o){
      return renderer.render(o);
    },
    function createRenderer(handlers){
      return new Renderer(handlers);
    },
    function isMirror(o){
      return o instanceof Mirror;
    },
    introspect,
    Renderer
  ]);

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});


exports.index = (function(exports){
  var objects   = require('../lib/objects'),
      iteration = require('../lib/iteration'),
      runtime   = require('./runtime'),
      assembler = require('./assembler'),
      debug     = require('./debug'),
      constants = require('./constants'),
      errors    = require('./errors');

  var assign          = objects.assign,
      assignAll       = objects.assignAll,
      define          = objects.define,
      inherit         = objects.inherit,
      Realm           = runtime.Realm,
      Script          = runtime.Script,
      Renderer        = debug.Renderer,
      ThrowException  = errors.ThrowException,
      $NativeFunction = runtime.$NativeFunction,
      builtins        = runtime.builtins;


  var exoticTemplates = {
    Array: function(){
      return function $ExoticArray(len){
        builtins.$Array.call(this, +len || 0);
        this.init.apply(this, arguments);
      };
    },
    Function: function(){
      return function $ExoticFunction(call, construct){
        builtins.$Object.call(this);
        this.call = call;
        if (construct) {
          this.construct = construct;
        }
        this.init.apply(this, arguments);
      }
    },
    Object: function(){
      return function $ExoticObject(){
        builtins.$Object.call(this);
        this.init.apply(this, arguments);
      }
    }
  };


  assign(exports, [
    function createRealm(listener){
      return new Realm(listener);
    },
    function createRealmAsync(){
      return new Realm(true);
    },
    function createScript(options){
      return new Script(options);
    },
    function createCode(options){
      return new Script(options).bytecode;
    },
    function createRenderer(handlers){
      return new Renderer(handlers);
    },
    function createFunction(options){
      return new $NativeFunction(options);
    },
    function createExotic(inherits, handlers){
      if (typeof inherits === 'string') {
        if (!(inherits in exoticTemplates)) {
          inherits = 'Object';
        }
        var $Exotic = exoticTemplates[inherits]();
      } else if (!handlers) {
        handlers = inherits;
      }

      if (!$Exotic) {
        $Exotic = exoticTemplates.Object();
        inherits = 'Object';
      }

      var Super = builtins['$'+inherits];


      inherit($Exotic, Super, {
        Native: true
      }, [
        function init(){},
        function remove(key){
          this.update(key, undefined);
        },
        function describe(key){
          return [key, this.get(key), this.query(key)];
        },
        (function(){
          return function define(key, value, attrs){
            this.set(key, value);
            this.update(key, attrs);
          };
        })(),
        function has(key){
          return this.query(key) !== undefined;
        },
        function each(callback){
          return ThrowException('missing_fundamental_handler', 'each');
        },
        function get(key){
          return ThrowException('missing_fundamental_handler', 'get');
        },
        function set(key, value){
          return ThrowException('missing_fundamental_handler', 'set');
        },
        function query(key){
          return ThrowException('missing_fundamental_handler', 'query');
        },
        function update(key, attr){
          return ThrowException('missing_fundamental_handler', 'update');
        }
      ]);

      if (Super.prototype.Call) {
        define($Exotic.prototype, [
          function call(){},
          function construct(){},
          $NativeFunction.prototype.Call,
          $NativeFunction.prototype.Construct,
          $NativeFunction.prototype.HasInstance
        ]);
      }

      if (handlers) {
        define($Exotic.prototype, handlers);
      }

      return $Exotic;
    }
  ]);


  function createInterceptor(name, construct){
    if (!construct && typeof name === 'function') {
      construct = name;
      name = fname(construct);
    }

    var Ctor = new $NativeFunction({
      name: name || '',
      length: construct.length,
      call: function(){
        var obj = new $IndexedInterceptor(construct.apply(null, arguments));
        obj.Prototype = Ctor.get('prototype');
        return obj;
      },
      construct: function(){
        var obj = new $IndexedInterceptor(construct.apply(null, arguments));
        obj.Prototype = Ctor.get('prototype');
        return obj;
      }
    });

    var proto = new builtins.$Object;
    proto.ConstructorName = name;
    proto.define('constructor', Ctor, 6);
    Ctor.define('prototype', proto, 4);

    return Ctor;
  }

  function $IndexedInterceptor(target){
    builtins.$Object.call(this);
    this.target = target;
    this.length = target.length;
    this.properties.set('length', target.length, 0);
  }

  inherit($IndexedInterceptor, builtins.$Object, {
    indexAttribute: 5
  }, [
    function remove(key){
      var index = +key;
      if (index >= 0 && index < this.target.length) {
        return delete this.target[index];
      }

      if (this.properties.has(key)) {
        return this.properties.remove(key);
      }
    },
    function describe(key){
      var index = +key;
      if (index >= 0 && index < this.target.length) {
        return [index+'', this.target[index], this.indexAttribute];
      }

      if (this.properties.has(key)) {
        return this.properties.getProperty(key);
      }
    },
    function define(key, value, attrs){
      var index = +key;
      if (index >= 0 && index < this.target.length) {
        return this.target[index] = value;
      }

      if (this.properties.has(key)) {
        return this.properties.set(key, value, attrs);
      }
    },
    function has(key){
      var index = +key;
      if (index >= 0 && index < this.target.length) {
        return true;
      }

      return this.properties.has(key);
    },
    function each(callback){
      var len = this.target.length;

      for (var i=0; i < len; i++) {
        callback([i+'', this.target[i], this.indexAttribute]);
      }


      this.properties.forEach(callback);
    },
    function get(key){
      var index = +key;
      if (index >= 0 && index < this.target.length) {
       return this.target[index];
      }

      if (this.properties.has(key)) {
        return this.properties.get(key);
      }
    },
    function set(key, value){
      var index = +key;
      if (index >= 0 && index < this.target.length) {
       return this.target[index] = value;
      }

      if (this.properties.has(key)) {
        return this.properties.set(key, value);
      }
    },
    function query(key){
      var index = +key;
      if (index >= 0 && index < this.target.length) {
        return this.indexAttribute;
      }

      if (this.properties.has(key)) {
        return this.properties.getAttribute(key);
      }
    },
    function update(key, attr){
      var index = +key;
      if (index >= 0 && index < this.target.length) {
        return false;
      }

      if (this.properties.has(key)) {
        return this.properties.setAttribute(key, attr);
      }
    }
  ]);

  function brainTransplant(func, call, construct){
    if (!(func instanceof $NativeFunction)) {
      func.Call = $NativeFunction.prototype.Call;
      func.Construct = $NativeFunction.prototype.Construct;
      if (call instanceof $NativeFunction) {
        construct = call.construct;
        call = call.call;
      }
      func.call = call;
      func.construct = construct;
    }
    return func;
  }


  define(exports, {
    Assembler : assembler.Assembler,
    Code      : assembler.Code,
    Realm     : Realm,
    Renderer  : Renderer,
    Script    : Script,
    constants : constants,
    iterate   : iteration.iterate,
    introspect: debug.introspect,
    createInterceptor: createInterceptor,
    brainTransplant: brainTransplant,
    utility: assignAll({}, [
      require('../lib/functions'),
      require('../lib/iteration'),
      require('../lib/objects'),
      require('../lib/traversal'),
      require('../lib/utility'),
      require('../lib/DoublyLinkedList'),
      require('../lib/Emitter'),
      require('../lib/Feeder'),
      require('../lib/HashMap'),
      require('../lib/HashSet'),
      require('../lib/LinkedList'),
      require('../lib/PropertyList'),
      require('../lib/Queue'),
      require('../lib/Stack')
    ])
  });

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});



exports.modules["@@internal"] = "export { ToString: $__ToString,\n         ToNumber: $__ToNumber,\n         ToInteger: $__ToInteger,\n         ToInt32: $__ToInt32,\n         ToUint32: $__ToUint32,\n         ToUint16: $__ToUint16,\n         ToObject: $__ToObject,\n         ToPrimitive: $__ToPrimitive };\n";

exports.modules["@array"] = "module iter = '@iter';\nsymbol @iterator = iter.iterator;\n\nexport function Array(...values){\n  if (values.length === 1 && typeof values[0] === 'number') {\n    var out = [];\n    out.length = values[0];\n    return out;\n  } else {\n    return values;\n  }\n}\n\n$__setupConstructor(Array, $__ArrayProto);\n\n\nexport function isArray(array){\n  return $__GetBuiltinBrand(array) === 'Array';\n}\n\nexport function from(iterable){\n  var out = [];\n  iterable = $__ToObject(iterable);\n\n  for (var i = 0, len = iterable.length >>> 0; i < len; i++) {\n    if (i in iterable) {\n      out[i] = iterable[i];\n    }\n  }\n\n  return out;\n}\n\n$__defineMethods(Array, [isArray, from]);\n\n\n{\n$__defineProps(Array.prototype, {\n  every(callback, context){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length),\n        result = [];\n\n    if (typeof callback !== 'function') {\n      throw $__Exception('callback_must_be_callable', ['Array.prototype.every']);\n    }\n\n    for (var i = 0; i < len; i++) {\n      if (i in array && !$__CallFunction(callback, context, [array[i], i, array])) {\n        return false;\n      }\n    }\n\n    return true;\n  },\n  filter(callback, context){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length),\n        result = [],\n        count = 0;\n\n    if (typeof callback !== 'function') {\n      throw $__Exception('callback_must_be_callable', ['Array.prototype.filter']);\n    }\n\n    for (var i = 0; i < len; i++) {\n      if (i in array) {\n        var element = array[i];\n        if ($__CallFunction(callback, context, [element, i, array])) {\n          result[count++] = element;\n        }\n      }\n    }\n\n    return result;\n  },\n  forEach(callback, context){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length);\n\n    if (typeof callback !== 'function') {\n      throw $__Exception('callback_must_be_callable', ['Array.prototype.forEach']);\n    }\n\n    for (var i=0; i < len; i++) {\n      if (i in array) {\n        $__CallFunction(callback, context, [array[i], i, this]);\n      }\n    }\n  },\n  indexOf(search, fromIndex){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length);\n\n    if (len === 0) {\n      return -1;\n    }\n\n    fromIndex = $__ToInteger(fromIndex);\n    if (fromIndex > len) {\n      return -1;\n    }\n\n    for (var i=fromIndex; i < len; i++) {\n      if (i in array && array[i] === search) {\n        return i;\n      }\n    }\n\n    return -1;\n  },\n  items(){\n    return new ArrayIterator(this, 'key+value');\n  },\n  join(separator){\n    return joinArray(this, arguments.length ? separator : ',');\n  },\n  keys(){\n    return new ArrayIterator(this, 'key');\n  },\n  lastIndexOf(search, fromIndex){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length);\n\n    if (len === 0) {\n      return -1;\n    }\n\n    fromIndex = arguments.length > 1 ? $__ToInteger(fromIndex) : len - 1;\n\n    if (fromIndex >= len) {\n      fromIndex = len - 1;\n    } else if (fromIndex < 0) {\n      fromIndex += fromIndex;\n    }\n\n    for (var i=fromIndex; i >= 0; i--) {\n      if (i in array && array[i] === search) {\n        return i;\n      }\n    }\n\n    return -1;\n  },\n  map(callback, context){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length),\n        result = [];\n\n    if (typeof callback !== 'function') {\n      throw $__Exception('callback_must_be_callable', ['Array.prototype.map']);\n    }\n\n    for (var i=0; i < len; i++) {\n      if (i in array) {\n        result[i] = $__CallFunction(callback, context, [array[i], i, this]);\n      }\n    }\n    return result;\n  },\n  pop(){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length),\n        result = array[len - 1];\n\n    array.length = len - 1;\n    return result;\n  },\n  push(...values){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length),\n        valuesLen = values.length;\n\n    for (var i=0; i < valuesLen; i++) {\n      array[len++] = values[i];\n    }\n    return len;\n  },\n  reduce(callback, initial){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length),\n        result = [];\n\n    if (typeof callback !== 'function') {\n      throw $__Exception('callback_must_be_callable', ['Array.prototype.reduce']);\n    }\n\n    var i = 0;\n    if (arguments.length === 1) {\n      initial = array[0];\n      i = 1;\n    }\n\n    for (; i < len; i++) {\n      if (i in array) {\n        initial = $__CallFunction(callback, this, [initial, array[i], array]);\n      }\n    }\n    return initial;\n  },\n  reduceRight(callback, initial){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length),\n        result = [];\n\n    if (typeof callback !== 'function') {\n      throw $__Exception('callback_must_be_callable', ['Array.prototype.reduceRight']);\n    }\n\n    var i = len - 1;\n    if (arguments.length === 1) {\n      initial = array[i];\n      i--;\n    }\n\n    for (; i >= 0; i--) {\n      if (i in array) {\n        initial = $__CallFunction(callback, this, [initial, array[i], array]);\n      }\n    }\n    return initial;\n  },\n  slice(start, end){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length),\n        result = [];\n\n    start = start === undefined ? 0 : +start || 0;\n    end = end === undefined ? len - 1 : +end || 0;\n\n    if (start < 0) {\n      start += len;\n    }\n\n    if (end < 0) {\n      end += len;\n    } else if (end >= len) {\n      end = len - 1;\n    }\n\n    if (start > end || end < start || start === end) {\n      return [];\n    }\n\n    for (var i=0, count = start - end; i < count; i++) {\n      result[i] = array[i + start];\n    }\n\n    return result;\n  },\n  some(callback, context){\n    var array = $__ToObject(this),\n        len = $__ToUint32(array.length),\n        result = [];\n\n    if (typeof callback !== 'function') {\n      throw $__Exception('callback_must_be_callable', ['Array.prototype.some']);\n    }\n\n    for (var i = 0; i < len; i++) {\n      if (i in array && $__CallFunction(callback, context, [array[i], i, array])) {\n        return true;\n      }\n    }\n\n    return false;\n  },\n  toString(){\n    return joinArray(this, ',');\n  },\n  values(){\n    return new ArrayIterator(this, 'value');\n  },\n  @iterator(){\n    return new ArrayIterator(this, 'key+value');\n  }\n});\n\n$__setLength(Array.prototype, {\n  every: 1,\n  filter: 1,\n  forEach: 1,\n  indexOf: 1,\n  lastIndexOf: 1,\n  map: 1,\n  reduce: 1,\n  reduceRight: 1,\n  some: 1,\n  reduce: 1\n});\n\nfunction joinArray(array, separator){\n  array = $__ToObject(array);\n\n  var result = '',\n      len = $__ToUint32(array.length);\n\n  if (len === 0) {\n    return result;\n  }\n\n  if (typeof separator !== 'string') {\n    separator = $__ToString(separator);\n  }\n\n  for (var i=0; i < len; i++) {\n    if (i) result += separator;\n    result += $__ToString(array[i]);\n  }\n\n  return result;\n}\n\n\n\nlet K = 0x01,\n    V = 0x02,\n    S = 0x04;\n\nlet kinds = {\n  'key': 1,\n  'value': 2,\n  'key+value': 3,\n  'sparse:key': 5,\n  'sparse:value': 6,\n  'sparse:key+value': 7\n};\n\nclass ArrayIterator extends iter.Iterator {\n  private @array, @index, @kind;\n  // @array = IteratedObject\n  // @index = ArrayIteratorNextIndex\n  // @kind  = ArrayIterationKind\n\n  constructor(array, kind){\n    this.@array = $__ToObject(array);\n    this.@index = 0;\n    this.@kind = kinds[kind];\n  }\n\n  next(){\n    if (!$__IsObject(this)) {\n      throw $__Exception('called_on_non_object', ['ArrayIterator.prototype.next']);\n    }\n    if (!(@array in this && @index in this && @kind in this)) {\n      throw $__Exception('incompatible_array_iterator', ['ArrayIterator.prototype.next']);\n    }\n\n    var array = this.@array,\n        index = this.@index,\n        kind = this.@kind,\n        len = $__ToUint32(array.length),\n        key = $__ToString(index);\n\n    if (kind & S) {\n      var found = false;\n      while (!found && index < len) {\n        found = index in array;\n        if (!found) {\n          index++;\n        }\n      }\n    }\n\n    if (index >= len) {\n      this.@index = Infinity;\n      throw $__StopIteration;\n    }\n\n    this.@index = index + 1;\n\n    if (kind & V) {\n      var value = array[key];\n      if (kind & K) {\n        return [key, value];\n      }\n      return value;\n    }\n    return key;\n  }\n}\n\n$__hideEverything(ArrayIterator);\n}\n";

exports.modules["@boolean"] = "export function Boolean(value){\n  value = $__ToBoolean(value);\n  if ($__IsConstructCall()) {\n    return $__BooleanCreate(value);\n  } else {\n    return value;\n  }\n}\n\n$__setupConstructor(Boolean, $__BooleanProto);\n\n$__defineProps(Boolean.prototype, {\n  toString(){\n    if ($__GetBuiltinBrand(this) === 'Boolean') {\n      return $__GetPrimitiveValue(this) ? 'true' : 'false';\n    } else {\n      throw $__Exception('not_generic', ['Boolean.prototype.toString']);\n    }\n  },\n  valueOf(){\n    if ($__GetBuiltinBrand(this) === 'Boolean') {\n      return $__GetPrimitiveValue(this);\n    } else {\n      throw $__Exception('not_generic', ['Boolean.prototype.valueOf']);\n    }\n  }\n});\n";

exports.modules["@console"] = "\nexport class Console {\n  private @output, @timers, @write, @writeln;\n\n  constructor(output){\n    this.@output = output;\n    this.@timers = $__ObjectCreate(null);\n  }\n\n  @write(value, color){\n    color || (color = '#fff');\n    this.@output.signal('write', ['' + value, '' + color]);\n  }\n\n  @writeln(value, color){\n    color || (color = '#fff');\n    this.@output.signal('write', [value + '\\n', '' + color]);\n  }\n\n  assert(expression, ...values){\n    if (!expression) {\n      values = join(values);\n      this.@writeln(values);\n      throw new Error('Assertion failed: '+values);\n    }\n  }\n\n  clear(){\n    this.@output.signal('clear');\n  }\n\n  count(title){\n    // TODO\n  }\n\n  debug(){\n    this.@writeln(join(values));\n  }\n\n  dir(){\n    // TODO\n  }\n\n  dirxml(){\n    // TODO\n  }\n\n  error(...values){\n    this.@writeln('× '+join(values), '#f04');\n  }\n\n  group(...values){\n    this.@writeln('» '+join(values));\n    this.@output.signal('group');\n  }\n\n  groupCollapsed(...values){\n    this.@writeln('» '+join(values));\n    this.@output.signal('group-collapsed');\n  }\n\n  groupEnd(){\n    this.@output.signal('group-end');\n  }\n\n  info(...values){\n    this.@writeln('† '+join(values), '#09f');\n  }\n\n  log(...values){\n    this.@writeln('» '+join(values));\n  }\n\n  profile(){\n    // TODO\n  }\n\n  profileEnd(){\n    // TODO\n  }\n\n  table(data, columns){\n    // TODO\n  }\n\n  time(name){\n    this.@timers[name] = $__now();\n  }\n\n  timeEnd(name){\n    if (name in this.@timers) {\n      var duration = $__now() - this.@timers[name];\n      this.@writeln(name + ': ' + duration + 'ms');\n    }\n  }\n\n  timeStamp(name){\n    this.@writeln(name + ': ' + $__now());\n  }\n\n  trace(error){\n    // TODO\n  }\n\n  warn(...values){\n    this.@writeln('! '+join(values), '#ff6');\n  }\n}\n\nfunction join(values){\n  var text = '';\n  for (var i=0; i < values.length; i++) {\n    text += values[i];\n  }\n  return text;\n}\n\n\nexport let console = new Console({ signal: $__Signal });\n";

exports.modules["@date"] = "export function Date(...values){\n  return $__DateCreate(values);\n}\n\n$__setupConstructor(Date, $__DateProto);\n\nexport let now = $__now;\n\n$__defineMethods(Date, [now]);\n\n$__defineProps(Date.prototype, {\n  toString(){\n    if ($__GetBuiltinBrand(this) === 'Date') {\n      return $__DateToString(this);\n    } else {\n      throw $__Exception('not_generic', ['Date.prototype.toString']);\n    }\n  },\n  valueOf(){\n    if ($__GetBuiltinBrand(this) === 'Date') {\n      return $__DateToNumber(this);\n    } else {\n      throw $__Exception('not_generic', ['Date.prototype.valueOf']);\n    }\n  }\n});\n\n$__wrapDateMethods(Date.prototype);\n\n\n";

exports.modules["@error"] = "export function Error(message){\n  this.message = message;\n}\n\nexport function EvalError(message){\n  this.message = message;\n}\n\nexport function RangeError(message){\n  this.message = message;\n}\n\nexport function ReferenceError(message){\n  this.message = message;\n}\n\nexport function SyntaxError(message){\n  this.message = message;\n}\n\nexport function TypeError(message){\n  this.message = message;\n}\n\nexport function URIError(message){\n  this.message = message;\n}\n\n\n$__defineProps(Error.prototype, {\n  toString(){\n    return this.name + ': '+this.message;\n  }\n});\n\n$__setupConstructor(Error, $__ErrorProto);\n$__setupConstructor(EvalError, $__EvalErrorProto);\n$__setupConstructor(RangeError, $__RangeErrorProto);\n$__setupConstructor(ReferenceError, $__ReferenceErrorProto);\n$__setupConstructor(SyntaxError, $__SyntaxErrorProto);\n$__setupConstructor(TypeError, $__TypeErrorProto);\n$__setupConstructor(URIError, $__URIErrorProto);\n";

exports.modules["@function"] = "export function Function(...args){\n  return $__FunctionCreate(args);\n}\n\n$__setupConstructor(Function, $__FunctionProto);\n$__define(Function.prototype, 'name', '', 0);\n\n\nexport function apply(func, receiver, args){\n  ensureFunction(func, '@function.apply');\n  return $__CallFunction(func, receiver, ensureArgs(args));\n}\n\nexport function bind(func, receiver, ...args){\n  ensureFunction(func, '@function.bind');\n  return $__BoundFunctionCreate(func, receiver, args);\n}\n\nexport function call(func, receiver, ...args){\n  ensureFunction(func, '@function.call');\n  return $__CallFunction(func, receiver, args);\n}\n\n$__setupFunctions(apply, bind, call);\n\n\n$__defineProps(Function.prototype, {\n  apply(receiver, args){\n    ensureFunction(this, 'Function.prototype.apply');\n    return $__CallFunction(this, receiver, ensureArgs(args));\n  },\n  bind(receiver, ...args){\n    ensureFunction(this, 'Function.prototype.bind');\n    return $__BoundFunctionCreate(this, receiver, args);\n  },\n  call(receiver, ...args){\n    ensureFunction(this, 'Function.prototype.call');\n    return $__CallFunction(this, receiver, args);\n  },\n  toString(){\n    ensureFunction(this, 'Function.prototype.toString');\n    return $__FunctionToString(this);\n  }\n});\n\n\nfunction ensureArgs(o, name){\n  if (o == null || typeof o !== 'object' || typeof $__get(o, 'length') !== 'number') {\n    throw $__Exception('apply_wrong_args', []);\n  }\n\n  var brand = $__GetBuiltinBrand(o);\n  return brand === 'Array' || brand === 'Arguments' ? o : [...o];\n}\n\nfunction ensureFunction(o, name){\n  if (typeof o !== 'function') {\n    throw $__Exception('called_on_non_function', [name]);\n  }\n}\n";

exports.modules["@globals"] = "let Infinity = 1 / 0;\n\nexport function decodeURI(value){\n  return $__decodeURI('' + value);\n}\n\nexport function decodeURIComponent(value){\n  return $__decodeURIComponent('' + value);\n}\n\nexport function encodeURI(value){\n  return $__encodeURI('' + value);\n}\n\nexport function encodeURIComponent(value){\n  return $__encodeURIComponent('' + value);\n}\n\nexport function escape(value){\n  return $__escape('' + value);\n}\n\nexport let eval = $__eval;\n\nexport function unescape(value){\n  return $__unescape('' + value);\n}\n\nexport function isFinite(number){\n  number = +number;\n  return number === number && number !== Infinity && number !== -Infinity;\n}\n\nexport function isNaN(number){\n  number = +number;\n  return number !== number;\n}\nexport function parseFloat(value){\n  return $__parseFloat($__ToPrimitive(value));\n}\n\nexport function parseInt(value, radix){\n  return $__parseInt($__ToPrimitive(value), +radix);\n}\n\n\n$__setupFunctions(decodeURI, decodeURIComponent, encodeURI, encodeURIComponent,\n                  escape, isFinite, isNaN, parseInt, parseFloat, unescape);\n\n";

exports.modules["@iter"] = "import hasOwn from '@reflect';\n\nsymbol @iterator = $__iterator;\nexport let iterator = @iterator;\n\nexport function Iterator(){}\n\n$__define(Iterator, 'prototype', Iterator.prototype, 0);\n$__define(Iterator.prototype, @iterator, function iterator(){ return this }, 0);\n$__SetBuiltinBrand(Iterator.prototype, 'BuiltinIterator');\n\n\nexport function keys(obj){\n  return {\n    @iterator: ()=> (function*(){\n      for (let x in obj) {\n        if (hasOwn(obj, x)) {\n          yield x;\n        }\n      }\n    })()\n  };\n}\n\nexport function values(obj){\n  return {\n    @iterator: ()=> (function*(){\n      for (let x in obj) {\n        if (hasOwn(obj, x)) {\n          yield obj[x];\n        }\n      }\n    })()\n  };\n}\n\nexport function items(obj){\n  return {\n    @iterator: ()=> (function*(){\n      for (let x in obj) {\n        if (hasOwn(obj, x)) {\n          yield [x, obj[x]];\n        }\n      }\n    })()\n  };\n}\n\nexport function allKeys(obj){\n  return {\n    @iterator: ()=> (function*(){\n      for (let x in obj) {\n        yield x;\n      }\n    })()\n  };\n}\n\nexport function allValues(obj){\n  return {\n    @iterator: ()=> (function*(){\n      for (let x in obj) {\n        yield obj[x];\n      }\n    })()\n  };\n}\n\nexport function allItems(obj){\n  return {\n    @iterator: ()=> (function*(){\n      for (let x in obj) {\n        yield [x, obj[x]];\n      }\n    })()\n  };\n}\n";

exports.modules["@json"] = "export let JSON = {};\n\n$__SetBuiltinBrand(JSON, 'BuiltinJSON');\n\nlet ReplacerFunction,\n    PropertyList,\n    stack,\n    indent,\n    gap;\n\nfunction J(value){\n  if (stack.has(value)) {\n    throw $__Exception('circular_structure', []);\n  }\n\n  var stepback = indent,\n      partial = [],\n      brackets;\n\n  indent += gap;\n  stack.add(value);\n\n  if ($__GetBuiltinBrand(value) === 'Array') {\n    brackets = ['[', ']'];\n\n    for (var i=0, len = value.length; i < len; i++) {\n      var prop = Str(i, value);\n      partial[i] = prop === undefined ? 'null' : prop;\n    }\n  } else {\n    var keys = PropertyList || $__Enumerate(value, false, true),\n        colon = gap ? ': ' : ':';\n\n    brackets = ['{', '}'];\n\n    for (var i=0, len=keys.length; i < len; i++) {\n      var prop = Str(keys[i], value);\n      if (prop !== undefined) {\n        partial.push($__Quote(keys[i]) + colon + prop);\n      }\n    }\n  }\n\n  if (!partial.length) {\n    stack.delete(value);\n    indent = stepback;\n    return brackets[0]+brackets[1];\n  } else if (!gap) {\n    stack.delete(value);\n    indent = stepback;\n    return brackets[0]+partial.join(',')+brackets[1];\n  } else {\n    var final = '\\n' + indent + partial.join(',\\n' + indent) + '\\n' + stepback;\n    stack.delete(value);\n    indent = stepback;\n    return brackets[0]+final+brackets[1];\n  }\n}\n\n\nfunction Str(key, holder){\n  var v = holder[key];\n  if ($__Type(v) === 'Object') {\n    var toJSON = v.toJSON;\n    if (typeof toJSON === 'function') {\n      v = $__CallFunction(toJSON, v, [key]);\n    }\n  }\n\n  if (ReplacerFunction) {\n    v = $__CallFunction(ReplacerFunction, holder, [key, v]);\n  }\n\n  if ($__Type(v) === 'Object') {\n    var brand = $__GetBuiltinBrand(v);\n    if (brand === 'Number') {\n      v = $__ToNumber(v);\n    } else if (brand === 'String') {\n      v = $__ToString(v);\n    } else if (brand === 'Boolean') {\n      v = $__GetPrimitiveValue(v);\n    }\n  }\n\n\n  if (v === null) {\n    return 'null';\n  } else if (v === true) {\n    return 'true';\n  } else if (v === false) {\n    return 'false';\n  }\n\n  var type = typeof v;\n  if (type === 'string') {\n    return $__Quote(v);\n  } else if (type === 'number') {\n    return v !== v || v === Infinity || v === -Infinity ? 'null' : '' + v;\n  } else if (type === 'object') {\n    return J(v);\n  }\n\n}\n\n\nexport function stringify(value, replacer, space){\n  ReplacerFunction = undefined;\n  PropertyList = undefined;\n  stack = new Set;\n  indent = '';\n\n  if ($__Type(replacer) === 'Object') {\n    if (typeof replacer === 'function') {\n      ReplacerFunction = replacer;\n    } else if ($__GetBuiltinBrand(replacer) === 'Array') {\n      let props = new Set;\n\n      for (let v of replacer) {\n        var item,\n            type = $__Type(v);\n\n        if (type === 'String') {\n          item = v;\n        } else if (type === 'Number') {\n          item = v + '';\n        } else if (type === 'Object') {\n          let brand = $__GetBuiltinBrand(v);\n          if (brand === 'String' || brand === 'Number') {\n            item = $__ToString(v);\n          }\n        }\n\n        if (item !== undefined) {\n          props.add(item);\n        }\n      }\n\n      PropertyList = [...props];\n    }\n  }\n\n  if ($__Type(space) === 'Object') {\n    space = $__GetPrimitiveValue(space);\n  }\n\n  if ($__Type(space) === 'String') {\n    gap = $__StringSlice(space, 0, 10);\n  } else if ($__Type(space) === 'Number') {\n    space |= 0;\n    space = space > 10 ? 10 : space < 1 ? 0 : space\n    gap = ' '.repeat(space);\n  } else {\n    gap = '';\n  }\n\n  return Str('', { '': value });\n}\n\nexport function parse(source, reviver){\n  return $__JSONParse(source, reviver);\n}\n\n$__defineMethods(JSON, [stringify, parse]);\n";

exports.modules["@map"] = "import Iterator from '@iter';\nsymbol @iterator = $__iterator;\n\n\nexport function Map(iterable){\n  var map;\n  if ($__IsConstructCall()) {\n    map = this;\n  } else {\n    if (this == null || this === $__MapProto) {\n      map = $__ObjectCreate($__MapProto) ;\n    } else {\n      map = $__ToObject(this);\n    }\n  }\n\n  if ($__HasInternal(map, 'MapData')) {\n    throw $__Exception('double_initialization', ['Map'])\n  }\n\n  $__MapInitialization(map, iterable);\n  return map;\n}\n\n\n$__setupConstructor(Map, $__MapProto);\n\n\n$__defineProps(Map.prototype, {\n  clear(){\n    ensureMap(this, 'clear');\n    return $__MapClear(this, key);\n  },\n  set(key, value){\n    ensureMap(this, 'set');\n    return $__MapSet(this, key, value);\n  },\n  get(key){\n    ensureMap(this, 'get');\n    return $__MapGet(this, key);\n  },\n  has(key){\n    ensureMap(this, 'has');\n    return $__MapHas(this, key);\n  },\n  delete: function(key){\n    ensureMap(this, 'delete');\n    return $__MapDelete(this, key);\n  },\n  items(){\n    ensureMap(this, 'items');\n    return new MapIterator(this, 'key+value');\n  },\n  keys(){\n    ensureMap(this, 'keys');\n    return new MapIterator(this, 'key');\n  },\n  values(){\n    ensureMap(this, 'values');\n    return new MapIterator(this, 'value');\n  },\n  @iterator(){\n    ensureMap(this, '@iterator');\n    return new MapIterator(this, 'key+value');\n  }\n});\n\n$__set(Map.prototype.delete, 'name', 'delete');\n\n$__DefineOwnProperty(Map.prototype, 'size', {\n  configurable: true,\n  enumerable: false,\n  get(){\n    return this === $__MapProto ? 0 : $__MapSize(this);\n  },\n  set: void 0\n});\n\n\nclass MapIterator extends Iterator {\n  private @data, @key, @kind;\n\n  constructor(map, kind){\n    this.@data = $__ToObject(map);\n    this.@key = $__MapSigil();\n    this.@kind = kind;\n  }\n\n  next(){\n    if (!$__IsObject(this)) {\n      throw $__Exception('called_on_non_object', ['MapIterator.prototype.next']);\n    }\n    if (!($__has(this, @data) && $__has(this, @key) && $__has(this, @kind))) {\n      throw $__Exception('called_on_incompatible_object', ['MapIterator.prototype.next']);\n    }\n\n    var kind = this.@kind,\n        item = $__MapNext(this.@data, this.@key);\n\n    if (!item) {\n      throw $__StopIteration;\n    }\n\n    this.@key = item[0];\n\n    if (kind === 'key+value') {\n      return item;\n    } else if (kind === 'key') {\n      return item[0];\n    } else {\n      return item[1];\n    }\n  }\n}\n\n$__hideEverything(MapIterator);\n\nfunction ensureMap(o, name){\n  if (!o || typeof o !== 'object' || !$__HasInternal(o, 'MapData')) {\n    throw Exception('called_on_incompatible_object', ['Map.prototype.'+name]);\n  }\n}\n\n";

exports.modules["@math"] = "const Infinity = 1 / 0,\n      NaN = +'NaN';\n\nexport const\n  E       = 2.718281828459045,\n  LN10    = 2.302585092994046,\n  LN2     = 0.6931471805599453,\n  LOG10E  = 0.4342944819032518,\n  LOG2E   = 1.4426950408889634,\n  PI      = 3.141592653589793,\n  SQRT1_2 = 0.7071067811865476,\n  SQRT2   = 1.4142135623730951;\n\n\n\nexport function abs(x){\n  x = +x;\n  return x === 0 ? 0 : x < 0 ? -x : x;\n}\n\nexport function acos(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__acos(x);\n}\n\nexport function acosh(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__log(x + $__sqrt(x * x - 1));\n}\n\nexport function asinh(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__log(x + $__sqrt(x * x + 1));\n}\n\nexport function atan(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__atan(x);\n}\n\nexport function asin(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__asin(x);\n}\n\nexport function atanh(x) {\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return .5 * $__log((1 + x) / (1 - x));\n}\n\nexport function atan2(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__atan2(x);\n}\n\n\nexport function ceil(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return x + 1 >> 0;\n}\n\nexport function acos(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__acos(x);\n}\n\nexport function cos(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__cos(x);\n}\n\nexport function cosh(x) {\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  if (x < 0) {\n    x = -x;\n  }\n  if (x > 21) {\n    return $__exp(x) / 2;\n  } else {\n    return ($__exp(x) + $__exp(-x)) / 2;\n  }\n}\n\nexport function exp(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__exp(x);\n}\n\nfunction factorial(x){\n  var i = 2,\n      o = 1;\n\n  if (i <= x) {\n    do {\n      o *= i;\n    } while (++i <= x)\n  }\n  return o;\n}\n\nexport function expm1(x) {\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n\n  var o = 0,\n      n = 50;\n\n  for (var i = 1; i < n; i++) {\n    o += $__pow(x, i) / factorial(i);\n  }\n  return o;\n}\n\nexport function floor(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return x >> 0;\n}\n\nexport function hypot(x, y) {\n  x = +x;\n  y = +y;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  if (y === 0 || y !== y || y === Infinity || y === -Infinity) {\n    return y;\n  }\n  return $__sqrt(x * x + y * y);\n}\n\nexport function log(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__log(x);\n}\n\nexport function log2(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__log(x) * LOG2E;\n}\n\nexport function log10(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__log(x) * LOG10E;\n}\n\nexport function log1p(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  var o = 0,\n      n = 50;\n\n  if (x <= -1) {\n    return -Infinity;\n  } else if (x < 0 || x > 1) {\n    return $__log(1 + x);\n  } else {\n    for (var i = 1; i < n; i++) {\n      if ((i % 2) === 0) {\n        o -= $__pow(x, i) / i;\n      } else {\n        o += $__pow(x, i) / i;\n      }\n    }\n    return o;\n  }\n}\n\nexport function max(...values){\n  var i = values.length,\n      maximum = -Infinity,\n      current;\n\n  while (i--) {\n    current = +values[i];\n    if (current !== current) {\n      return NaN;\n    }\n    if (current > maximum) {\n      maximum = current;\n    }\n  }\n\n  return maximum;\n}\n\nexport function min(...values){\n  var i = values.length,\n      minimum = Infinity,\n      current;\n\n  while (i--) {\n    current = +values[i];\n    if (current !== current) {\n      return NaN;\n    }\n    if (current < minimum) {\n      minimum = current;\n    }\n  }\n\n  return minimum;\n}\n\nexport function pow(x, y){\n  return $__pow(+x, +y);\n}\n\nexport let random = $__random;\n\nexport function round(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return x + .5 | 0;\n}\n\nexport function sign(x){\n  x = +x;\n  return x === 0 || x !== x ? x : x < 0 ? -1 : 1;\n}\n\nexport function sinh(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return ($__exp(x) - $__exp(-x)) / 2;\n}\n\nexport function sin(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__sin(x);\n}\n\nexport function sqrt(x, y){\n  return $__sqrt(+x, +y);\n}\n\nexport function tan(x){\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return $__tan(x);\n}\n\nexport function tanh(x) {\n  x = +x;\n  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {\n    return x;\n  }\n  return ($__exp(x) - $__exp(-x)) / ($__exp(x) + $__exp(-x));\n}\n\nexport function trunc(x){\n  x = +x;\n  return x === 0 || x !== x || x === Infinity || x === -Infinity ? x : ~~x;\n}\n\nexport var Math = {\n  E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2,\n  abs, acos, acosh, asinh, asin, atan, atanh, atan2, ceil, cos,\n  cosh, exp, expm1, floor, hypot, log, log2, log10, log1p, max,\n  min, pow, random, round, sign, sinh, sin, sqrt, tan, tanh, trunc\n};\n\n$__set(min, 'length', 2);\n$__set(max, 'length', 2);\n$__hideEverything(Math);\n$__SetBuiltinBrand(Math, 'BuiltinMath');\n";

exports.modules["@number"] = "export function Number(value){\n  value = $__ToNumber(value);\n  if ($__IsConstructCall()) {\n    return $__NumberCreate(value);\n  } else {\n    return value;\n  }\n}\n\n$__setupConstructor(Number, $__NumberProto);\n\n\nexport function isNaN(number){\n  return number !== number;\n}\n\nexport function isFinite(number){\n  return typeof value === 'number'\n      && value === value\n      && value < POSITIVE_INFINITY\n      && value > NEGATIVE_INFINITY;\n}\n\nexport function isInteger(value) {\n  return typeof value === 'number'\n      && value === value\n      && value > -MAX_INTEGER\n      && value < MAX_INTEGER\n      && value | 0 === value;\n}\n\nexport function toInteger(value){\n  return (value / 1 || 0) | 0;\n}\n\n$__defineMethods(Number, [isNaN, isFinite, isInteger, toInteger]);\n\n\nexport let\n  EPSILON           = 2.220446049250313e-16,\n  MAX_INTEGER       = 9007199254740992,\n  MAX_VALUE         = 1.7976931348623157e+308,\n  MIN_VALUE         = 5e-324,\n  NaN               = +'NaN',\n  NEGATIVE_INFINITY = 1 / 0,\n  POSITIVE_INFINITY = 1 / -0;\n\n$__defineConstants(Number, {\n  EPSILON          : EPSILON,\n  MAX_INTEGER      : MAX_INTEGER,\n  MAX_VALUE        : MAX_VALUE,\n  MIN_VALUE        : MIN_VALUE,\n  NaN              : NaN,\n  NEGATIVE_INFINITY: NEGATIVE_INFINITY,\n  POSITIVE_INFINITY: POSITIVE_INFINITY\n});\n\n\n\n$__defineProps(Number.prototype, {\n  toString(radix){\n    if ($__GetBuiltinBrand(this) === 'Number') {\n      var number = $__GetPrimitiveValue(this);\n      radix = $__ToInteger(radix);\n      return $__NumberToString(number, radix);\n    } else {\n      throw $__Exception('not_generic', ['Number.prototype.toString']);\n    }\n  },\n  valueOf(){\n    if ($__GetBuiltinBrand(this) === 'Number') {\n      return $__GetPrimitiveValue(this);\n    } else {\n      throw $__Exception('not_generic', ['Number.prototype.valueOf']);\n    }\n  },\n  clz() {\n    var x = $__ToNumber(this);\n    if (!x || !isFinite(x)) {\n      return 32;\n    } else {\n      x = x < 0 ? x + 1 | 0 : x | 0;\n      x -= (x / 0x100000000 | 0) * 0x100000000;\n      return 32 - $__NumberToString(x, 2).length;\n    }\n  }\n});\n";

exports.modules["@object"] = "export function Object(value){\n  if ($__IsConstructCall()) {\n    return {};\n  } else if (value == null) {\n    return {};\n  } else {\n    return $__ToObject(value);\n  }\n}\n\n$__setupConstructor(Object, $__ObjectProto);\n\n\n\nexport function assign(target, source){\n  ensureObject(target, 'Object.assign');\n  source = $__ToObject(source);\n  for (let [i, key] of $__Enumerate(source, false, true)) {\n    let prop = source[key];\n    if (typeof prop === 'function' && $__GetInternal(prop, 'HomeObject')) {\n      // TODO\n    }\n    target[key] = prop;\n  }\n  return target;\n}\n\nexport function create(prototype, properties){\n  if (typeof prototype !== 'object') {\n    throw $__Exception('proto_object_or_null', [])\n  }\n\n  var object = $__ObjectCreate(prototype);\n\n  if (properties !== undefined) {\n    ensureDescriptor(properties);\n\n    for (var k in properties) {\n      var desc = properties[k];\n      ensureDescriptor(desc);\n      $__DefineOwnProperty(object, key, desc);\n    }\n  }\n\n  return object;\n}\n\nexport function defineProperty(object, key, property){\n  ensureObject(object, 'Object.defineProperty');\n  ensureDescriptor(property);\n  key = $__ToPropertyName(key);\n  $__DefineOwnProperty(object, key, property);\n  return object;\n}\n\nexport function defineProperties(object, properties){\n  ensureObject(object, 'Object.defineProperties');\n  ensureDescriptor(properties);\n\n  for (var key in properties) {\n    var desc = properties[key];\n    ensureDescriptor(desc);\n    $__DefineOwnProperty(object, key, desc);\n  }\n\n  return object;\n}\n\nexport function freeze(object){\n  ensureObject(object, 'Object.freeze');\n  var props = $__Enumerate(object, false, false);\n\n  for (var i=0; i < props.length; i++) {\n    var desc = $__GetOwnProperty(object, props[i]);\n    if (desc.configurable) {\n      desc.configurable = false;\n      if ('writable' in desc) {\n        desc.writable = false;\n      }\n      $__DefineOwnProperty(object, props[i], desc);\n    }\n  }\n\n  $__PreventExtensions(object, false);\n  return object;\n}\n\nexport function getOwnPropertyDescriptor(object, key){\n  ensureObject(object, 'Object.getOwnPropertyDescriptor');\n  key = $__ToPropertyName(key);\n  return $__GetOwnProperty(object, key);\n}\n\nexport function getOwnPropertyNames(object){\n  ensureObject(object, 'Object.getOwnPropertyNames');\n  return $__Enumerate(object, false, false);\n}\n\nexport function getPropertyDescriptor(object, key){\n  ensureObject(object, 'Object.getPropertyDescriptor');\n  key = $__ToPropertyName(key);\n  return $__GetProperty(object, key);\n}\n\nexport function getPropertyNames(object){\n  ensureObject(object, 'Object.getPropertyNames');\n  return $__Enumerate(object, true, false);\n}\n\nexport function getPrototypeOf(object){\n  ensureObject(object, 'Object.getPrototypeOf');\n  return $__GetInheritence(object);\n}\n\nexport function is(x, y){\n  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;\n}\n\nexport function isnt(x, y){\n  return x === y ? x === 0 && 1 / x !== 1 / y : x === x || y === y;\n}\n\nexport function isExtensible(object){\n  ensureObject(object, 'Object.isExtensible');\n  return $__IsExtensible(object);\n}\n\nexport function isFrozen(object){\n  ensureObject(object, 'Object.isFrozen');\n  if ($__IsExtensible(object)) {\n    return false;\n  }\n\n  var props = $__Enumerate(object, false, false);\n\n  for (var i=0; i < props.length; i++) {\n    var desc = $__GetOwnProperty(object, props[i]);\n    if (desc) {\n      if (desc.configurable || 'writable' in desc && desc.writable) {\n        return false;\n      }\n    }\n  }\n\n  return true;\n}\n\nexport function isSealed(object){\n  ensureObject(object, 'Object.isSealed');\n  if ($__IsExtensible(object)) {\n    return false;\n  }\n\n  var props = $__Enumerate(object, false, false);\n\n  for (var i=0; i < props.length; i++) {\n    var desc = $__GetOwnProperty(object, props[i]);\n    if (desc && desc.configurable) {\n      return false;\n    }\n  }\n\n  return true;\n}\n\nexport function keys(object){\n  ensureObject(object, 'Object.keys');\n  return $__Enumerate(object, false, true);\n}\n\nexport function preventExtensions(object){\n  ensureObject(object, 'Object.preventExtensions');\n  $__PreventExtensions(object, false);\n  return object;\n}\n\nexport function seal(object){\n  ensureObject(object, 'Object.seal');\n\n  var desc = { configurable: false },\n      props = $__Enumerate(object, false, false);\n\n  for (var i=0; i < props.length; i++) {\n    $__DefineOwnProperty(object, props[i], desc);\n  }\n\n  $__PreventExtensions(object, false);\n  return object;\n}\n\n\n$__defineProps(Object, { assign, create, defineProperty, defineProperties, freeze,\n  getOwnPropertyDescriptor, getOwnPropertyNames, getPropertyDescriptor, getPropertyNames,\n  getPrototypeOf, is, isnt, isExtensible, isFrozen, isSealed, keys, preventExtensions, seal });\n\n\nexport function isPrototypeOf(object, prototype){\n  while (prototype) {\n    prototype = $__GetPrototype(prototype);\n    if (prototype === object) {\n      return true;\n    }\n  }\n  return false;\n}\n\nexport function hasOwnProperty(object, key){\n  var object = $__ToObject(object);\n  return $__HasOwnProperty(object, key);\n}\n\nexport function propertyIsEnumerable(object, key){\n  var object = $__ToObject(object);\n  return ($__GetPropertyAttributes(object, key) & 0x01) !== 0;\n}\n\n$__setupFunctions(isPrototypeOf, hasOwnProperty, propertyIsEnumerable);\n\n\n\n$__defineProps(Object.prototype, {\n  toString(){\n    if (this === undefined) {\n      return '[object Undefined]';\n    } else if (this === null) {\n      return '[object Null]';\n    } else {\n      return '[object '+$__GetBrand($__ToObject(this))+']';\n    }\n  },\n  isPrototypeOf(object){\n    while (object) {\n      object = $__GetPrototype(object);\n      if (object === this) {\n        return true;\n      }\n    }\n    return false;\n  },\n  toLocaleString(){\n    return this.toString();\n  },\n  valueOf(){\n    return $__ToObject(this);\n  },\n  hasOwnProperty(key){\n    var object = $__ToObject(this);\n    return $__HasOwnProperty(object, key);\n  },\n  propertyIsEnumerable(key){\n    var object = $__ToObject(this);\n    return ($__GetPropertyAttributes(this, key) & 0x01) !== 0;\n  }\n});\n\n$__ObjectToString = Object.prototype.toString;\n\nfunction ensureObject(o, name){\n  var type = typeof o;\n  if (type === 'object' ? o === null : type !== 'function') {\n    throw $__Exception('called_on_non_object', [name]);\n  }\n}\n\nfunction ensureDescriptor(o){\n  if (o === null || typeof o !== 'object') {\n    throw $__Exception('property_desc_object', [typeof o])\n  }\n}\n";

exports.modules["@reflect"] = "\nexport function Proxy(target, handler){\n  ensureObject(target, 'Proxy');\n  ensureObject(handler, 'Proxy');\n  return $__ProxyCreate(target, handler);\n}\n\n$__remove(Proxy, 'prototype');\n\nfunction makeDefiner(desc){\n  return (object, key, value) => {\n    desc.value = value;\n    $__DefineOwnProperty(object, key, desc);\n    desc.value = undefined;\n    return object;\n  };\n}\n\n\nlet ___ = 0b0000,\n    E__ = 0b0001,\n    _C_ = 0b0010,\n    EC_ = 0b0011,\n    __W = 0b0100,\n    E_W = 0b0101,\n    _CW = 0b0110,\n    ECW = 0b0111,\n    __A = 0b1000,\n    E_A = 0b1001,\n    _CA = 0b1010,\n    ECA = 0b1011;\n\nlet defineNormal = makeDefiner({ writable: true,\n                                 enumerable: true,\n                                 configurable: true });\nlet sealer = { configurable: false },\n    freezer = { configurable: false, writable: false };\n\n\nexport class Handler {\n  constructor(){}\n\n  getOwnPropertyDescriptor(target, name){\n    throw $__Exception('missing_fundamental_trap', ['getOwnPropertyDescriptor']);\n  }\n\n  getOwnPropertyNames(target){\n    throw $__Exception('missing_fundamental_trap', ['getOwnPropertyNames']);\n  }\n\n  getPrototypeOf(target){\n    throw $__Exception('missing_fundamental_trap', ['getPrototypeOf']);\n  }\n\n  defineProperty(target, name, desc){\n    throw $__Exception('missing_fundamental_trap', ['defineProperty']);\n  }\n\n  deleteProperty(target, name){\n    throw $__Exception('missing_fundamental_trap', ['deleteProperty']);\n  }\n\n  preventExtensions(target){\n    throw $__Exception('missing_fundamental_trap', ['preventExtensions']);\n  }\n\n  isExtensible(target){\n    throw $__Exception('missing_fundamental_trap', ['isExtensible']);\n  }\n\n  apply(target, thisArg, args){\n    throw $__Exception('missing_fundamental_trap', ['apply']);\n  }\n\n  seal(target) {\n    if (!this.preventExtensions(target)) return false;\n\n    var props = this.getOwnPropertyNames(target),\n        len = +props.length;\n\n    for (var i = 0; i < len; i++) {\n      success = success && this.defineProperty(target, props[i], sealer);\n    }\n    return success;\n  }\n\n  freeze(target){\n    if (!this.preventExtensions(target)) return false;\n\n    var props = this.getOwnPropertyNames(target),\n        len = +props.length;\n\n    for (var i = 0; i < len; i++) {\n      var name = props[i],\n          desc = this.getOwnPropertyDescriptor(target, name);\n\n      if (desc) {\n        success = success && this.defineProperty(target, name, 'writable' in desc || 'value' in desc ? freezer : sealer);\n      }\n    }\n\n    return success;\n  }\n\n  isSealed(target){\n    var props = this.getOwnPropertyNames(target),\n        len = +props.length;\n\n    for (var i = 0; i < len; i++) {\n      var desc = this.getOwnPropertyDescriptor(target, props[i]);\n\n      if (desc && desc.configurable) {\n        return false;\n      }\n    }\n    return !this.isExtensible(target);\n  }\n\n  isFrozen(target){\n    var props = this.getOwnPropertyNames(target),\n        len = +props.length;\n\n    for (var i = 0; i < len; i++) {\n      var desc = this.getOwnPropertyDescriptor(target, props[i]);\n\n      if (desc.configurable || ('writable' in desc || 'value' in desc) && desc.writable) {\n        return false;\n      }\n    }\n    return !this.isExtensible(target);\n  }\n\n  has(target, name){\n    var desc = this.getOwnPropertyDescriptor(target, name);\n    if (desc !== undefined) {\n      return true;\n    }\n    var proto = $__GetInheritance(target);\n    return proto === null ? false : has(proto, name);\n  }\n\n  hasOwn(target, name){\n    return this.getOwnPropertyDescriptor(target, name) !== undefined;\n  }\n\n  get(target, name, receiver){\n    receiver = receiver || target;\n\n    var desc = this.getOwnPropertyDescriptor(target, name);\n    if (desc === undefined) {\n      var proto = $__GetInheritance(target);\n      return proto === null ? undefined : this.get(proto, name, receiver);\n    }\n    if ('writable' in desc || 'value' in desc) {\n      return desc.value;\n    }\n    var getter = desc.get;\n    return getter === undefined ? undefined : $__CallFunction(getter, receiver, []);\n  }\n\n  set(target, name, value, receiver){\n    var ownDesc = this.getOwnPropertyDescriptor(target, name);\n\n    if (ownDesc !== undefined) {\n      if ('get' in ownDesc || 'set' in ownDesc) {\n        var setter = ownDesc.set;\n        if (setter === undefined) return false;\n        $__CallFunction(setter, receiver, [value]);\n        return true;\n      }\n\n      if (ownDesc.writable === false) {\n        return false;\n      } else if (receiver === target) {\n        $__DefineOwnProperty(receiver, name, { value: value });\n        return true;\n      } else {\n        $__DefineOwnProperty(receiver, name, newDesc);\n        var extensible = $__IsExtensible(receiver);\n        extensible && defineNormal(receiver, name, value);\n        return extensible;\n      }\n    }\n\n    var proto = $__GetInheritance(target);\n    if (proto === null) {\n      var extensible = $__IsExtensible(receiver);\n      extensible && defineNormal(receiver, name, value);\n      return extensible;\n    }\n\n    return this.set(proto, name, value, receiver);\n  }\n\n  enumerate(target){\n    var result = this.getOwnPropertyNames(target),\n        len = +result.length,\n        out = [];\n\n    for (var i = 0; i < len; i++) {\n      var name = $__ToString(result[i]),\n          desc = this.getOwnPropertyDescriptor(name);\n\n      if (desc != null && !desc.enumerable) {\n        out.push(name);\n      }\n    }\n\n    var proto = $__GetInheritance(target);\n    return proto === null ? out : out.concat(enumerate(proto));\n  }\n\n  keys(target){\n    var result = this.getOwnPropertyNames(target),\n        len = +result.length,\n        result = [];\n\n    for (var i = 0; i < len; i++) {\n      var name = $__ToString(result[i]),\n          desc = this.getOwnPropertyDescriptor(name);\n\n      if (desc != null && desc.enumerable) {\n        result.push(name);\n      }\n    }\n    return result;\n  }\n\n  construct(target, args) {\n    var proto = this.get(target, 'prototype', target),\n        instance = $__Type(proto) === 'Object' ? $__ObjectCreate(proto) : {},\n        result = this.apply(target, instance, args);\n\n    return $__Type(result) === 'Object' ? result : instance;\n  }\n}\n\n\nexport function apply(target, thisArg, args){\n  ensureFunction(target, '@Reflect.apply');\n  return $__CallFunction(target, thisArg, ensureArgs(args));\n}\n\nexport function construct(target, args){\n  ensureFunction(target, '@Reflect.construct');\n  return $__Construct(target, ensureArgs(args));\n}\n\nexport function defineProperty(target, name, desc){\n  ensureObject(target, '@Reflect.defineProperty');\n  ensureDescriptor(desc);\n  name = $__ToPropertyName(name);\n  $__DefineOwnProperty(target, name, desc);\n  return object;\n}\n\nexport function deleteProperty(target, name){\n  ensureObject(target, '@Reflect.deleteProperty');\n  name = $__ToPropertyName(name);\n  return $__Delete(target, name, false);\n}\n\nexport function enumerate(target){\n  return $__Enumerate($__ToObject(target), false, false);\n}\n\nexport function freeze(target){\n  if (Type(target) !== 'Object') return false;\n  var success = $__PreventExtensions(target, false);\n  if (!success) return success;\n\n  var props = $__Enumerate(target, false, false);\n      len = props.length;\n\n  for (var i = 0; i < len; i++) {\n    var desc = $__GetOwnProperty(target, props[i]),\n        attrs = 'writable' in desc || 'value' in desc ? freezer : desc !== undefined ? sealer : null;\n\n    if (attrs !== null) {\n      success = success && $__DefineOwnProperty(target, props[i], attrs);\n    }\n  }\n  return success;\n}\n\nexport function get(target, name, receiver){\n  target = $__ToObject(target);\n  name = $__ToPropertyName(name);\n  receiver = receiver === undefined ? undefined : $__ToObject(receiver);\n  return $__GetP(target, name, receiver);\n}\n\nexport function getOwnPropertyDescriptor(target, name){\n  ensureObject(target, '@Reflect.getOwnPropertyDescriptor');\n  name = $__ToPropertyName(name);\n  return $__GetOwnProperty(target, name);\n}\n\nexport function getOwnPropertyNames(target){\n  ensureObject(target, '@Reflect.getOwnPropertyNames');\n  return $__Enumerate(target, false, false);\n}\n\nexport function getPrototypeOf(target){\n  ensureObject(target, '@Reflect.getPrototypeOf');\n  return $__GetInheritance(target);\n}\n\nexport function has(target, name){\n  target = $__ToObject(target);\n  name = $__ToPropertyName(name);\n  return name in target;\n}\n\nexport function hasOwn(target, name){\n  target = $__ToObject(target);\n  name = $__ToPropertyName(name);\n  return $__HasOwnProperty(target, name);\n}\n\nexport function isFrozen(target){\n  ensureObject(target, '@Reflect.isFrozen');\n  if ($__IsExtensible(target)) {\n    return false;\n  }\n\n  var props = $__Enumerate(target, false, false);\n\n  for (var i=0; i < props.length; i++) {\n    var desc = $__GetOwnProperty(target, props[i]);\n    if (desc) {\n      if (desc.configurable || 'writable' in desc && desc.writable) {\n        return false;\n      }\n    }\n  }\n\n  return true;\n}\n\nexport function isSealed(target){\n  ensureObject(target, '@Reflect.isSealed');\n  if ($__IsExtensible(target)) {\n    return false;\n  }\n\n  var props = $__Enumerate(target, false, false);\n\n  for (var i=0; i < props.length; i++) {\n    var desc = $__GetOwnProperty(target, props[i]);\n    if (desc && desc.configurable) {\n      return false;\n    }\n  }\n\n  return true;\n}\n\nexport function isExtensible(target){\n  ensureObject(target, '@Reflect.isExtensible');\n  return $__IsExtensible(target);\n}\n\nexport function keys(target){\n  ensureObject(target, '@Reflect.keys');\n  return $__Enumerate(target, false, true);\n}\n\nexport function preventExtensions(target){\n  if (Type(target) !== 'Object') return false;\n  return $__PreventExtensions(target, false);\n}\n\nexport function seal(target){\n  if (Type(target) !== 'Object') return false;\n  var success = $__PreventExtensions(target, false);\n  if (!success) return success;\n\n  var props = $__Enumerate(target, false, false),\n      len = props.length;\n\n  for (var i = 0; i < len; i++) {\n    success = success && $__DefineOwnProperty(target, props[i], sealer);\n  }\n  return success;\n}\n\nexport function set(target, name, value, receiver){\n  target = $__ToObject(target);\n  name = $__ToPropertyName(name);\n  receiver = receiver === undefined ? undefined : $__ToObject(receiver);\n  return $__SetP(target, name, value, receiver);\n}\n\n\n\n$__setupFunctions(getOwnPropertyDescriptor, getOwnPropertyNames, getPrototypeOf,\n  defineProperty, deleteProperty, preventExtensions, isExtensible, apply, enumerate,\n  freeze, seal, isFrozen, isSealed, has, hasOwn, keys, get, set, construct);\n\n\n\nfunction ensureObject(o, name){\n  var type = typeof o;\n  if (type === 'object' ? o === null : type !== 'function') {\n    throw $__Exception('called_on_non_object', [name]);\n  }\n}\n\nfunction ensureDescriptor(o){\n  if (o === null || typeof o !== 'object') {\n    throw $__Exception('property_desc_object', [typeof o])\n  }\n}\n\n\nfunction ensureArgs(o, name){\n  if (o == null || typeof o !== 'object' || typeof $__get(o, 'length') !== 'number') {\n    throw $__Exception('apply_wrong_args', []);\n  }\n\n  var brand = $__GetBuiltinBrand(o);\n  return brand === 'Array' || brand === 'Arguments' ? o : [...o];\n}\n\nfunction ensureFunction(o, name){\n  if (typeof o !== 'function') {\n    throw $__Exception('called_on_non_function', [name]);\n  }\n}\n";

exports.modules["@regexp"] = "export function RegExp(pattern, flags){\n  if ($__IsConstructCall()) {\n    if (pattern === undefined) {\n      pattern = '';\n    } else if (typeof pattern === 'string') {\n    } else if (typeof pattern === 'object' && $__GetBuiltinBrand(pattern) === 'RegExp') {\n      if (flags !== undefined) {\n        throw $__Exception('regexp_flags', []);\n      }\n    } else {\n      pattern = $__ToString(pattern);\n    }\n    return $__RegExpCreate(pattern, flags);\n  } else {\n    if (flags === undefined && pattern) {\n      if (typeof pattern === 'object' && $__GetBuiltinBrand(pattern) === 'RegExp') {\n        return pattern;\n      }\n    }\n    return $__RegExpCreate(pattern, flags);\n  }\n}\n\n$__setupConstructor(RegExp, $__RegExpProto);\n$__wrapRegExpMethods(RegExp.prototype);\n\n$__defineProps(RegExp.prototype, {\n  toString(){\n    if ($__GetBuiltinBrand(this) === 'RegExp') {\n      return $__RegExpToString(this);\n    } else {\n      throw $__Exception('not_generic', ['RegExp.prototype.toString']);\n    }\n  }\n});\n";

exports.modules["@set"] = "import Map from '@map';\nimport Iterator from '@iter';\nsymbol @iterator = $__iterator;\n\n\nexport function Set(iterable){\n  var set;\n  if ($__IsConstructCall()) {\n    set = this;\n  } else {\n    if (this == null || this === $__SetProto) {\n      set = $__ObjectCreate($__SetProto) ;\n    } else {\n      set = $__ToObject(this);\n    }\n  }\n  if ($__HasInternal(set, 'SetData')) {\n    throw $__Exception('double_initialization', ['Set']);\n  }\n\n  var data = new Map;\n  $__SetInternal(set, 'SetData', data);\n\n  if (iterable !== undefined) {\n    iterable = $__ToObject(iterable);\n    for (var [key, value] of iterable) {\n      $__MapSet(data, value, value);\n    }\n  }\n  return set;\n}\n\n\n$__setupConstructor(Set, $__SetProto);\n{\n$__defineProps(Set.prototype, {\n  clear(){\n    return $__MapClear(ensureSet(this));\n  },\n  add(key){\n    return $__MapSet(ensureSet(this), key, key);\n  },\n  has(key){\n    return $__MapHas(ensureSet(this), key);\n  },\n  delete: function(key){\n    return $__MapDelete(ensureSet(this), key);\n  },\n  items(){\n    return new SetIterator(this, 'key+value');\n  },\n  keys(){\n    return new SetIterator(this, 'key');\n  },\n  values(){\n    return new SetIterator(this, 'value');\n  },\n  @iterator(){\n    return new SetIterator(this, 'value');\n  }\n});\n\n$__define(Set.prototype.delete, 'name', 'delete', 0);\n\n$__DefineOwnProperty(Set.prototype, 'size', {\n  configurable: true,\n  enumerable: false,\n  get: function size(){\n    if (this === $__SetProto) {\n      return 0;\n    }\n    return $__MapSize(ensureSet(this));\n  },\n  set: void 0\n});\n\nlet SET = 'Set',\n    KEY  = 'SetNextKey',\n    KIND  = 'SetIterationKind';\n\nlet K = 0x01,\n    V = 0x02,\n    KV = 0x03;\n\nlet kinds = {\n  'key': 1,\n  'value': 2,\n  'key+value': 3\n};\n\n\nclass SetIterator extends Iterator {\n  private @data, @key, @kind;\n\n  constructor(set, kind){\n    this.@data = ensureSet($__ToObject(set));\n    this.@key = $__MapSigil();\n    this.@kind = kinds[kind];\n  }\n\n  next(){\n    if (!$__IsObject(this)) {\n      throw $__Exception('called_on_non_object', ['SetIterator.prototype.next']);\n    }\n    if (!(@data in this && @key in this && @kind in this)) {\n      throw $__Exception('called_on_incompatible_object', ['SetIterator.prototype.next']);\n    }\n\n    var data = this.@data,\n        key  = this.@key,\n        kind = this.@kind;\n\n    var item = $__MapNext(data, key);\n    this.@key = item[0];\n    return kind === KV ? [item[1], item[1]] : item[1];\n  }\n}\n\n\nfunction ensureSet(o, name){\n  var type = typeof o;\n  if (type === 'object' ? o === null : type !== 'function') {\n    throw $__Exception('called_on_non_object', [name]);\n  }\n  var data = $__GetInternal(o, 'SetData');\n  if (!data) {\n    throw $__Exception('called_on_incompatible_object', [name]);\n  }\n  return data;\n}\n\n\n$__hideEverything(SetIterator);\n}\n";

exports.modules["@std"] = "// standard constants\nconst NaN       = +'NaN';\nconst Infinity  = 1 / 0;\nconst undefined = void 0;\n\n// standard functions\nimport { decodeURI,\n         decodeURIComponent,\n         encodeURI,\n         encodeURIComponent,\n         eval,\n         isFinite,\n         isNaN,\n         parseFloat,\n         parseInt } from '@globals';\n\n\nimport { clearInterval,\n         clearTimeout,\n         setInterval,\n         setTimeout } from '@timers';\n\n// standard types\nimport Array    from '@array';\nimport Boolean  from '@boolean';\nimport Date     from '@date';\nimport Function from '@function';\nimport Map      from '@map';\nimport Number   from '@number';\nimport Object   from '@object';\nimport Proxy    from '@reflect';\nimport RegExp   from '@regexp';\nimport Set      from '@set';\nimport String   from '@string';\nimport WeakMap  from '@weakmap';\n\n\n\n// standard errors\nimport { Error,\n         EvalError,\n         RangeError,\n         ReferenceError,\n         SyntaxError,\n         TypeError,\n         URIError } from '@error';\n\n\n// standard pseudo-modules\nimport JSON from '@json';\nimport Math from '@math';\n\nimport Symbol from '@symbol';\nimport Iterator from '@iter';\n\nimport console from '@console';\n\nlet StopIteration = $__StopIteration\n\n\nexport Array, Boolean, Date, Function, Map, Number, Object, Proxy, RegExp, Set, String, WeakMap,\n       Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError,\n       decodeURI, decodeURIComponent, encodeURI, encodeURIComponent, eval, isFinite, isNaN,\n       parseFloat, parseInt, clearInterval, clearTimeout, setInterval, setTimeout,\n       console, StopIteration, JSON, Math, NaN, Infinity, undefined;\n\n\n";

exports.modules["@string"] = "import MAX_INTEGER from '@number';\nimport RegExp from '@regexp';\n\n\nexport function String(string){\n  string = arguments.length ? $__ToString(string) : '';\n  if ($__IsConstructCall()) {\n    return $__StringCreate(string);\n  } else {\n    return string;\n  }\n}\n\n$__setupConstructor(String, $__StringProto);\n\nexport function fromCharCode(...codeUnits){\n  var length = codeUnits.length,\n      str = '';\n  for (var i=0; i < length; i++) {\n    str += $__FromCharCode($__ToUint16(codeUnits[i]));\n  }\n  return str;\n}\n\nexport function trim(str){\n  return $__StringTrim(ensureCoercible(string, 'trim'));\n}\n\n$__defineMethods(String, [fromCharCode]);\n\n\n{\n$__defineProps(String.prototype, {\n  anchor(name){\n    var string = ensureCoercible(this, 'anchor');\n    return ToHTML('a', string, 'name', name);\n  },\n  big(){\n    var string = ensureCoercible(this, 'big');\n    return ToHTML('big', string);\n  },\n  blink(){\n    var string = ensureCoercible(this, 'blink');\n    return ToHTML('blink', string);\n  },\n  bold(){\n    var string = ensureCoercible(this, 'bold');\n    return ToHTML('b', string);\n  },\n  fixed(){\n    var string = ensureCoercible(this, 'fixed');\n    return ToHTML('fixed', string);\n  },\n  fontcolor(color){\n    var string = ensureCoercible(this, 'fontcolor');\n    return ToHTML('font', string, 'color', color);\n  },\n  fontsize(size){\n    var string = ensureCoercible(this, 'fontsize');\n    return ToHTML('font', string, 'size', size);\n  },\n  italics(){\n    var string = ensureCoercible(this, 'italics');\n    return ToHTML('i', string);\n  },\n  link(href){\n    var string = ensureCoercible(this, 'link');\n    return ToHTML('a', string, 'href', href);\n  },\n  small(){\n    var string = ensureCoercible(this, 'small');\n    return ToHTML('small', string);\n  },\n  strike(){\n    var string = ensureCoercible(this, 'strike');\n    return ToHTML('s', string);\n  },\n  sub(){\n    var string = ensureCoercible(this, 'sub');\n    return ToHTML('sub', string);\n  },\n  sup(){\n    var string = ensureCoercible(this, 'sup');\n    return ToHTML('sup', string);\n  },\n  charAt(position){\n    var string = ensureCoercible(this, 'charAt');\n    position = $__ToInteger(position);\n    return position < 0 || position >= string.length ? '' : string[position];\n  },\n  charCodeAt(position){\n    var string = ensureCoercible(this, 'charCodeAt');\n    position = $__ToInteger(position);\n    return position < 0 || position >= string.length ? NaN : $__CodeUnit(string[position]);\n  },\n  concat(...args){\n    var string = ensureCoercible(this, 'concat');\n    for (var i=0; i < args.length; i++) {\n      string += $__ToString(args[i]);\n    }\n    return string;\n  },\n  indexOf(search){\n    var string = ensureCoercible(this, 'indexOf');\n    return stringIndexOf(string, search, arguments[1]);\n  },\n  lastIndexOf(search){\n    var string = ensureCoercible(this, 'lastIndexOf'),\n        len = string.length,\n        position = $__ToNumber(arguments[1]);\n\n    search = $__ToString(search);\n    var searchLen = search.length;\n\n    position = position !== position ? Infinity : $__ToInteger(position);\n    position -= searchLen;\n\n    var i = position > 0 ? position < len ? position : len : 0;\n\n    while (i--) {\n      var j = 0;\n      while (j < searchLen && search[j] === string[i + j]) {\n        if (j++ === searchLen - 1) {\n          return i;\n        }\n      }\n    }\n    return -1;\n  },\n  localeCompare(){\n    var string = ensureCoercible(this, 'localeCompare');\n  },\n  match(regexp){\n    var string = ensureCoercible(this, 'match');\n    return stringMatch(string, regexp);\n  },\n  repeat(count){\n    var string = ensureCoercible(this, 'repeat'),\n        n = $__ToInteger(count),\n        o = '';\n\n    if (n <= 1 || n === Infinity || n === -Infinity) {\n      throw $__Exception('invalid_repeat_count', []);\n    }\n\n    while (n > 0) {\n      n & 1 && (o += string);\n      n >>= 1;\n      string += string;\n    }\n\n    return o;\n  },\n  replace(search, replace){\n    var string = ensureCoercible(this, 'replace');\n\n    if (typeof replace === 'function') {\n      var match, count;\n      if (isRegExp(search)) {\n        match = stringMatch(string, search);\n        count = matches.length;\n      } else {\n        match = stringIndexOf(string, $__ToString(search));\n        count = 1;\n      }\n      //TODO\n    } else {\n      replace = $__ToString(replace);\n      if (!isRegExp(search)) {\n        search = $__ToString(search);\n      }\n      return $__StringReplace(string, search, replace);\n    }\n  },\n  search(regexp){\n    var string = ensureCoercible(this, 'search');\n    if (!isRegExp(regexp)) {\n      regexp = new RegExp(regexp);\n    }\n    return $__StringSearch(string, regexp);\n  },\n  slice(start, end){\n    var string = ensureCoercible(this, 'slice');\n    start = $__ToInteger(start);\n    if (end === undefined) {\n      return $__StringSlice(string, start);\n    } else {\n      return $__StringSlice(string, start, $__ToInteger(end));\n    }\n  },\n  split(separator, limit){\n    var string = ensureCoercible(this, 'split');\n    limit = limit === undefined ? MAX_INTEGER - 1 : $__ToInteger(limit);\n    separator = isRegExp(separator) ? separator : $__ToString(separator);\n    return $__StringSplit(string, separator, limit);\n  },\n  substr(start, length){\n    var string = ensureCoercible(this, 'substr'),\n        start = $__ToInteger(start),\n        chars = string.length;\n\n    length = length === undefined ? Infinity : $__ToInteger(length);\n\n    if (start < 0) {\n      start += chars;\n      if (start < 0) start = 0;\n    }\n    if (length < 0) {\n      length = 0;\n    }\n    if (length > chars - start) {\n      length = chars - start;\n    }\n\n    return length <= 0 ? '' : $__StringSlice(string, start, start + length);\n  },\n  substring(start, end){\n    var string = ensureCoercible(this, 'substring'),\n        start = $__ToInteger(start),\n        len = string.length;\n\n    end = end === undefined ? len : $__ToInteger(end);\n\n    start = start > 0 ? start < len ? start : len : 0;\n    end = end > 0 ? end < len ? end : len : 0;\n\n    var from = start < end ? start : end,\n        to = start > end ? start : end;\n\n    return $__StringSlice(string, from, to);\n  },\n  toLowerCase(){\n    var string = ensureCoercible(this, 'toLowerCase');\n    return $__CallNative(string, 'toLowerCase');\n  },\n  toLocaleLowerCase(){\n    var string = ensureCoercible(this, 'toLocaleLowerCase');\n    return $__CallNative(string, 'toLocaleLowerCase');\n  },\n  toUpperCase(){\n    var string = ensureCoercible(this, 'toUpperCase');\n    return $__CallNative(string, 'toUpperCase');\n  },\n  toLocaleUpperCase(){\n    var string = ensureCoercible(this, 'toLocaleUpperCase');\n    return $__CallNative(string, 'toLocaleUpperCase');\n  },\n  toString(){\n    if ($__GetBuiltinBrand(this) === 'String') {\n      return $__GetPrimitiveValue(this);\n    } else {\n      throw $__exception('not_generic', ['String.prototype.toString']);\n    }\n  },\n  trim(){\n    var string = ensureCoercible(this, 'trim');\n    return $__StringTrim(string);\n  },\n  valueOf(){\n    if ($__GetBuiltinBrand(this) === 'String') {\n      return $__GetPrimitiveValue(this);\n    } else {\n      throw $__Exception('not_generic', ['String.prototype.valueOf']);\n    }\n  }\n});\n\nfunction ensureCoercible(target, method){\n  if (target === null || target === undefined) {\n    throw $__Exception('object_not_coercible', ['String.prototype.'+method, target]);\n  }\n  return $__ToString(target);\n}\n\nfunction ToHTML(tag, content, attrName, attrVal){\n  attrVal = $__ToString(attrVal);\n  var attr = attrName === undefined ? '' : ' '+attrName+'=\"'+$__StringReplace(attrVal, '\"', '&quot;')+'\"';\n  return '<'+tag+attr+'>'+content+'</'+tag+'>';\n}\n\n\nfunction isRegExp(subject){\n  return subject != null && typeof subject === 'object' && $__GetBuiltinBrand(subject) === 'RegExp';\n}\n\nfunction stringIndexOf(string, search, position){\n  search = $__ToString(search);\n  position = $__ToInteger(position);\n\n  var len = string.length,\n      searchLen = search.length,\n      i = position > 0 ? position < len ? position : len : 0,\n      maxLen = len - searchLen;\n\n  while (i < maxLen) {\n    var j = 0;\n    while (j < searchLen && search[j] === string[i + j]) {\n      if (j++ === searchLen - 1) {\n        return i;\n      }\n    }\n  }\n  return -1;\n}\n\nfunction stringMatch(string, regexp){\n  if (!isRegExp(regexp)) {\n    regexp = new RegExp(regexp);\n  }\n  if (!regexp.global) {\n    return regexp.exec(string);\n  }\n  regexp.lastIndex = 0;\n  var array = [],\n      previous = 0,\n      lastMatch = true,\n      n = 0;\n\n  while (lastMatch) {\n    var result = regexp.exec(string);\n    if (result === null) {\n      lastMatch = false;\n    } else {\n      var thisIndex = regexp.lastIndex;\n      if (thisIndex === lastIndex) {\n        previous = regexp.lastIndex = thisIndex + 1;\n      } else {\n        previous = thisIndex;\n      }\n      array[n++] = result[0];\n    }\n  }\n\n  return n === 0 ? null : array;\n}\n}\n";

exports.modules["@symbol"] = "export function Symbol(name, isPublic){\n  if (name == null) {\n    throw $__Exception('unnamed_symbol', []);\n  }\n  return $__SymbolCreate(name, !!isPublic);\n}\n\n$__setupConstructor(Symbol, $__SymbolProto);\n\n$__defineProps(Symbol.prototype, {\n  valueOf(){\n    if ($__GetBuiltinBrand(this) === 'Symbol') {\n      return $__GetInternal(this, 'Label');\n    } else {\n      throw $__Exception('not_generic', ['Symbol.prototype.toString']);\n    }\n  },\n  toString(){\n    if ($__GetBuiltinBrand(this) === 'Symbol') {\n      return $__GetInternal(this, 'Label');\n    } else {\n      throw $__Exception('not_generic', ['Symbol.prototype.toString']);\n    }\n  }\n});\n\n$__DefineOwnProperty(Symbol.prototype, 'constructor', { configurable: false, writable: false });\n$__PreventExtensions(Symbol.prototype, false);\n";

exports.modules["@system"] = "{\n  let HIDDEN = 6,\n      FROZEN = 0;\n\n  $__defineMethods = function defineMethods(obj, props){\n    for (var i=0; i < props.length; i++) {\n      $__SetInternal(props[i], 'Native', true);\n      $__define(obj, props[i].name, props[i], HIDDEN);\n      $__remove(props[i], 'prototype');\n    }\n    return obj;\n  };\n\n  $__defineProps = function defineProps(obj, props){\n    var keys = $__Enumerate(props, false, false);\n    for (var i=0; i < keys.length; i++) {\n      var name = keys[i],\n          prop = props[name];\n\n      $__define(obj, name, prop, HIDDEN);\n\n      if (typeof prop === 'function') {\n        $__SetInternal(prop, 'Native', true);\n        $__define(prop, 'name', name, FROZEN);\n        $__remove(prop, 'prototype');\n      }\n    }\n    return obj;\n  };\n\n  $__setupFunctions = function setupFunctions(...funcs){\n    var len = funcs.length;\n    for (var i=0; i < len; i++) {\n      $__SetInternal(funcs[i], 'Native', true);\n      $__remove(funcs[i], 'prototype');\n    }\n  };\n\n  $__defineConstants = function defineConstants(obj, props){\n    var keys = $__Enumerate(props, false, false);\n    for (var i=0; i < keys.length; i++) {\n      $__define(obj, keys[i], props[keys[i]], FROZEN);\n    }\n  };\n\n  $__setupConstructor = function setupConstructor(ctor, proto){\n    if (proto) {\n      $__define(ctor, 'prototype', proto, FROZEN);\n    }\n    $__define(ctor, 'length', 1, FROZEN);\n    $__define(ctor.prototype, 'constructor', ctor, HIDDEN);\n    $__SetInternal(ctor, 'Native', true);\n    $__SetInternal(ctor, 'NativeConstructor', true);\n  };\n\n\n  $__setLength = function setLength(f, length){\n    if (typeof length === 'string') {\n      $__set(f, 'length', length);\n    } else {\n      var keys = $__Enumerate(length, false, false);\n      for (var i=0; i < keys.length; i++) {\n        var key = keys[i];\n        $__set(f[key], 'length', length[key]);\n      }\n    }\n  };\n\n  $__setProperty = function setProperty(key, object, values){\n    var keys = $__Enumerate(values, false, false),\n        i = keys.length;\n\n    while (i--) {\n      $__define(object[keys[i]], key, values[keys[i]], FROZEN);\n    }\n  };\n\n  $__hideEverything = function hideEverything(o){\n    var type = typeof o;\n    if (type === 'object' ? o === null : type !== 'function') {\n      return o;\n    }\n\n    var keys = $__Enumerate(o, false, true),\n        i = keys.length;\n\n    while (i--) {\n      if (typeof o[keys[i]] === 'number') {\n        $__update(o, keys[i], 0);\n      } else {\n        $__update(o, keys[i], 6);\n      }\n    }\n\n    if (typeof o === 'function') {\n      hideEverything(o.prototype);\n    }\n\n    return o;\n  };\n\n  symbol @toStringTag, @iterator;\n  $__toStringTag = @toStringTag;\n  $__iterator = @iterator;\n\n  $__EmptyClass = function(...args){ super(...args) };\n  $__define($__EmptyClass, 'name', '', FROZEN);\n}\n\n\n\nclass Request {\n  private @loader, @callback, @errback, @mrl, @resolved;\n\n  constructor(loader, mrl, resolved, callback, errback){\n    this.@loader = loader;\n    this.@mrl = mrl;\n    this.@resolved = resolved;\n    this.@callback = callback;\n    this.@errback = errback;\n  }\n\n  fulfill(src){\n    var loader = this.@loader;\n\n    var translated = (loader.@translate)(src, this.@mrl, loader.@baseURL, this.@resolved);\n    if (loader.@strict) {\n      translated = '\"use strict\";\\n'+translated;\n    }\n\n    $__EvaluateModule(translated, loader.@global, this.@resolved, module => {\n      $__SetInternal(module, 'loader', loader);\n      $__SetInternal(module, 'resolved', this.@resolved);\n      $__SetInternal(module, 'mrl', this.@mrl);\n      loader.@modules[this.@resolved] = module;\n      (this.@callback)(module);\n    }, msg => this.reject(msg));\n  }\n\n  redirect(mrl, baseURL){\n    var loader = this.@loader,\n        resolved = this.@resolved = (loader.@resolve)(mrl, baseURL);\n\n    this.@mrl = mrl;\n\n    var module = loader.get(resolved);\n    if (module) {\n      (this.@callback)(module);\n    } else {\n      (loader.@fetch)(mrl, baseURL, this, resolved);\n    }\n  }\n\n  reject(msg){\n    (this.@errback)(msg);\n  }\n}\n\nprivate @translate, @resolve, @fetch, @strict, @global, @baseURL, @modules;\n\nexport class Loader {\n  constructor(parent, options){\n    options = options || {};\n    this.linkedTo   = options.linkedTo  || null;\n    this.@strict    = true;\n    this.@modules   = $__ObjectCreate(null);\n    this.@translate = options.translate || parent.translate;\n    this.@resolve   = options.resolve   || parent.resolve;\n    this.@fetch     = options.fetch     || parent.fetch;\n    this.@global    = options.global    || $__global;\n    this.@baseURL   = options.baseURL   || (parent ? parent.@baseURL : '');\n  }\n\n  get global(){\n    return this.@global;\n  }\n\n  get baseURL(){\n    return this.@baseURL;\n  }\n\n  load(mrl, callback, errback){\n    var key = (this.@resolve)(mrl, this.@baseURL),\n        module = this.@modules[key];\n\n    if (module) {\n      callback(module);\n    } else {\n      (this.@fetch)(mrl, this.@baseURL, new Request(this, mrl, key, callback, errback), key);\n    }\n  }\n\n  eval(src){\n    return $__EvaluateModule(src, this.@global, this.@baseURL);\n  }\n\n  evalAsync(src, callback, errback){\n    $__EvaluateModule(src, this.@global, this.@baseURL, callback, errback);\n  }\n\n  get(mrl){\n    var canonical = (this.@resolve)(mrl, this.@baseURL);\n    return this.@modules[canonical];\n  }\n\n  set(mrl, mod){\n    var canonical = (this.@resolve)(mrl, this.@baseURL);\n\n    if (typeof canonical === 'string') {\n      this.@modules[canonical] = mod;\n    } else {\n      for (var k in canonical) {\n        this.@modules[k] = canonical[k];\n      }\n    }\n  }\n\n  defineBuiltins(object){\n    var desc = { configurable: true,\n                 enumerable: false,\n                 writable: true,\n                 value: undefined };\n\n    object || (object = this.@global);\n    for (var k in std) {\n      desc.value = std[k];\n      $__DefineOwnProperty(object, k, desc);\n    }\n\n    return object;\n  }\n}\n\n\nexport function Module(object){\n  if ($__GetBuiltinBrand(object) === 'Module') {\n    return object;\n  }\n  return $__ToModule($__ToObject(object));\n}\n\n$__remove(Module, 'prototype');\n\n\nlet System = $__System = new Loader(null, {\n  fetch(relURL, baseURL, request, resolved) {\n    var fetcher = resolved[0] === '@' ? $__Fetch : $__readFile;\n\n    fetcher(resolved, src => {\n      if (typeof src === 'string') {\n        request.fulfill(src);\n      } else {\n        request.reject(src);\n      }\n    });\n  },\n  resolve(relURL, baseURL){\n    return relURL[0] === '@' ? relURL : $__resolve(baseURL, relURL);\n  },\n  translate(src, relURL, baseURL, resolved) {\n    return src;\n  }\n});\n\nexport System;\n\n\nSystem.@strict = false;\nlet std = System.eval(`\n  module std = '@std';\n  export std;\n`).std;\nSystem.@strict = true;\n";

exports.modules["@timers"] = "export function clearInterval(id){\n  id = $__ToInteger(id);\n  $__ClearTimer(id);\n}\n\nexport function clearTimeout(id){\n  id = $__ToInteger(id);\n  $__ClearTimer(id);\n}\n\nexport function setInterval(callback, milliseconds){\n  milliseconds = $__ToInteger(milliseconds);\n  if (typeof callback !== 'function') {\n    callback = $__ToString(callback);\n  }\n  return $__SetTimer(callback, milliseconds, true);\n}\n\nexport function setTimeout(callback, milliseconds){\n  milliseconds = $__ToInteger(milliseconds);\n  if (typeof callback !== 'function') {\n    callback = $__ToString(callback);\n  }\n  return $__SetTimer(callback, milliseconds, false);\n}\n\n$__setupFunctions(clearInterval, clearTimeout, setInterval, setTimeout);\n";

exports.modules["@typed-arrays"] = "private @get, @set;\n\nvar indexDesc = { configurable: false,\n                  enumerable: true,\n                  writable: true,\n                  value: void 1337 };\n\n\n\nexport class ArrayBuffer {\n  constructor(len){\n    if (!$__IsConstructCall()) {\n      return new ArrayBuffer(len);\n    }\n    $__define(this, 'byteLength', len >>> 0, 0);\n    $__SetInternal(this, 'NativeBuffer', $__NativeBufferCreate(len));\n    $__SetBuiltinBrand(this, 'BuiltinArrayBuffer');\n  }\n  slice(begin, end){\n    var sourceBuffer = $__ToObject(this),\n        origin = $__GetInternal(this, 'NativeBuffer');\n\n    if (!origin) {\n      throw $__Exception('called_on_incompatible_object', ['ArrayBuffer.prototype.slice']);\n    }\n\n    var byteLength = this.byteLength;\n\n    begin >>= 0;\n    if (begin < 0) {\n      begin += byteLength;\n      if (begin < 0) begin = 0;\n    } else if (begin >= byteLength) {\n      begin = byteLength;\n    }\n\n\n    if (end == null) {\n      end = byteLength;\n    } else {\n      end >>= 0;\n      if (end < 0) {\n        end += byteLength;\n        if (end < 0) end = 0;\n      } else if (end >= byteLength) {\n        end = byteLength;\n      }\n    }\n\n    var buffer = $__ObjectCreate($__ArrayBufferProto);\n    $__define(buffer, 'byteLength', end - begin, 0);\n    $__SetInternal(buffer, 'NativeBuffer', $__NativeBufferSlice(origin, begin, end));\n    $__SetBuiltinBrand(buffer, 'BuiltinArrayBuffer');\n    return buffer;\n  }\n}\n\n\nexport class DataView {\n  constructor(buffer, byteOffset, byteLength){\n    buffer = $__ToObject(buffer);\n    if ($__GetBuiltinBrand(buffer) !== 'ArrayBuffer') {\n      throw $__Exception('bad_argument', ['DataView', 'ArrayBuffer']);\n    }\n\n    byteOffset >>>= 0;\n    var bufferLength = buffer.byteLength,\n        byteLength = byteLength === undefined ? bufferLength - byteOffset : byteLength >>> 0;\n\n    if (byteOffset + byteLength > bufferLength) {\n      throw $__Exception('buffer_out_of_bounds', ['DataView']);\n    }\n\n    $__define(this, 'byteLength', byteLength, 1);\n    $__define(this, 'byteOffset', byteOffset, 1);\n    $__define(this, 'buffer', buffer, 1);\n    $__SetInternal(this, 'View', $__NativeDataViewCreate(buffer, byteOffset, byteLength));\n    $__SetBuiltinBrand(this, 'BuiltinDataView');\n  }\n  getUint8(byteOffset){\n    return this.@get('Uint8', byteOffset);\n  }\n  getUint16(byteOffset, littleEndian){\n    return this.@get('Uint16', byteOffset, littleEndian);\n  }\n  getUint32(byteOffset, littleEndian){\n    return this.@get('Uint32', byteOffset, littleEndian);\n  }\n  getInt8(byteOffset){\n    return this.@get('Int8', byteOffset);\n  }\n  getInt16(byteOffset, littleEndian){\n    return this.@get('Int16', byteOffset, littleEndian);\n  }\n  getInt32(byteOffset, littleEndian){\n    return this.@get('Int32', byteOffset, littleEndian);\n  }\n  getFloat32(byteOffset, littleEndian){\n    return this.@get('Float32', byteOffset, littleEndian);\n  }\n  getFloat64(byteOffset, littleEndian){\n    return this.@get('Float64', byteOffset, littleEndian);\n  }\n  setUint8(byteOffset, value){\n    return this.@set('Uint8', byteOffset, value);\n  }\n  setUint16(byteOffset, value, littleEndian){\n    return this.@set('Uint16', byteOffset, value, littleEndian);\n  }\n  setUint32(byteOffset, value, littleEndian){\n    return this.@set('Uint32', byteOffset, value, littleEndian);\n  }\n  setInt8(byteOffset, value){\n    return this.@set('Int8', byteOffset, value);\n  }\n  setInt16(byteOffset, value, littleEndian){\n    return this.@set('Int16', byteOffset, value, littleEndian);\n  }\n  setInt32(byteOffset, value, littleEndian){\n    return this.@set('Int32', byteOffset, value, littleEndian);\n  }\n  setFloat32(byteOffset, value, littleEndian){\n    return this.@set('Float32', byteOffset, value, littleEndian);\n  }\n  setFloat64(byteOffset, value, littleEndian){\n    return this.@set('Float64', byteOffset, value, littleEndian);\n  }\n}\n\nDataView.prototype.@get = $__DataViewGet\nDataView.prototype.@set = $__DataViewSet\n\n\n\n\nexport class Float64Array {\n  constructor(buffer, byteOffset, length) {\n    return createTypedArray(Float64Array, buffer, byteOffset, length);\n  }\n  set(array, offset) {\n    return set(Float64Array, this, array, offset);\n  }\n  subarray(begin, end) {\n    return subarray(Float64Array, this, begin, end);\n  }\n}\n\nexport class Float32Array {\n  constructor(buffer, byteOffset, length) {\n    return createTypedArray(Float32Array, buffer, byteOffset, length);\n  }\n  set(array, offset) {\n    return set(Float32Array, this, array, offset);\n  }\n  subarray(begin, end) {\n    return subarray(Float32Array, this, begin, end);\n  }\n}\n\nexport class Int32Array {\n  constructor(buffer, byteOffset, length) {\n    return createTypedArray(Int32Array, buffer, byteOffset, length);\n  }\n  set(array, offset) {\n    return set(Int32Array, this, array, offset);\n  }\n  subarray(begin, end) {\n    return subarray(Int32Array, this, begin, end);\n  }\n}\n\nexport class Int16Array {\n  constructor(buffer, byteOffset, length) {\n    return createTypedArray(Int16Array, buffer, byteOffset, length);\n  }\n  set(array, offset) {\n    return set(Int16Array, this, array, offset);\n  }\n  subarray(begin, end) {\n    return subarray(Int16Array, this, begin, end);\n  }\n}\n\nexport class Int8Array {\n  constructor(buffer, byteOffset, length) {\n    return createTypedArray(Int8Array, buffer, byteOffset, length);\n  }\n  set(array, offset) {\n    return set(Int8Array, this, array, offset);\n  }\n  subarray(begin, end) {\n    return subarray(Int8Array, this, begin, end);\n  }\n}\n\nexport class Uint32Array {\n  constructor(buffer, byteOffset, length) {\n    return createTypedArray(Uint32Array, buffer, byteOffset, length);\n  }\n  set(array, offset) {\n    return set(Uint32Array, this, array, offset);\n  }\n  subarray(begin, end) {\n    return subarray(Uint32Array, this, begin, end);\n  }\n}\n\nexport class Uint16Array {\n  constructor(buffer, byteOffset, length) {\n    return createTypedArray(Uint16Array, buffer, byteOffset, length);\n  }\n  set(array, offset) {\n    return set(Uint16Array, this, array, offset);\n  }\n  subarray(begin, end) {\n    return subarray(Uint16Array, this, begin, end);\n  }\n}\n\nexport class Uint8Array {\n  constructor(buffer, byteOffset, length) {\n    return createTypedArray(Uint8Array, buffer, byteOffset, length);\n  }\n  set(array, offset) {\n    return set(Uint8Array, this, array, offset);\n  }\n  subarray(begin, end) {\n    return subarray(Uint8Array, this, begin, end);\n  }\n}\n\n\nfunction createTypedArray(Type, buffer, byteOffset, length){\n  var byteLength;\n  if (typeof buffer === 'number') {\n\n    length = buffer >>> 0;\n    byteLength = length * Type.BYTES_PER_ELEMENT;\n    byteOffset = 0;\n    buffer = new ArrayBuffer(byteLength);\n\n    return $__TypedArrayCreate(Type.name, buffer, byteLength, byteOffset)\n  } else {\n    buffer = $__ToObject(buffer);\n\n    if ($__GetBuiltinBrand(buffer) === 'ArrayBuffer') {\n\n      byteOffset >>>= 0;\n      if (byteOffset % Type.BYTES_PER_ELEMENT) {\n        throw $__Exception('buffer_unaligned_offset', [Type.name]);\n      }\n\n      var bufferLength = buffer.byteLength,\n          byteLength = length === undefined ? bufferLength - byteOffset : (length >>> 0) * Type.BYTES_PER_ELEMENT;\n\n      if (byteOffset + byteLength > bufferLength) {\n        throw $__Exception('buffer_out_of_bounds', [Type.name]);\n      }\n\n      length = byteLength / Type.BYTES_PER_ELEMENT;\n\n      if ((length >>> 0) !== length) {\n        throw $__Exception('buffer_unaligned_length', [Type.name]);\n      }\n\n      return $__TypedArrayCreate(Type.name, buffer, byteLength, byteOffset)\n    } else {\n\n      length = buffer.length >>> 0;\n      byteLength = length * Type.BYTES_PER_ELEMENT;\n      byteOffset = 0;\n      buffer = new ArrayBuffer(length);\n\n      var object = $__TypedArrayCreate(Type.name, buffer, byteLength, byteOffset);\n\n      for (var i=0; i < length; i++) {\n        object[i] = buffer[i];\n      }\n\n      return object;\n    }\n  }\n}\n\nfunction set(Type, instance, array, offset){\n  if ($__GetBuiltinBrand(instance) !== Type.name) {\n    throw $__Exception('called_on_incompatible_object', [Type.name+'.prototype.set']);\n  }\n\n  offset >>>= 0;\n  array = $__ToObject(array);\n  var srcLength = array.length,\n      targetLength = instance.length;\n\n  if (srcLength + offset > targetLength) {\n    throw $__Exception('buffer_out_of_bounds', [Type.name+'.prototype.set']);\n  }\n\n  var temp = new Type(srcLength),\n      k = 0;\n\n  while (k < srcLength) {\n    temp[k] = array[k];\n  }\n  k = offset;\n  while (k < targetLength) {\n    instance[k] = temp[k - offset];\n  }\n}\n\nfunction subarray(Type, instance, begin, end){\n  if ($__GetBuiltinBrand(instance) !== Type.name) {\n    throw $__Exception('called_on_incompatible_object', [Type.name+'.prototype.subarray']);\n  }\n\n  var srcLength = instance.length;\n\n  begin >>= 0;\n  if (begin < 0) begin += srcLength;\n  end = end === undefined ? srcLength : end >> 0;\n  if (end < 0) end += srcLength;\n\n  if (begin < 0) begin = 0;\n  if (end < 0) end = 0;\n  if (begin >= srcLength) begin = srcLength;\n  if (end >= srcLength) end = srcLength;\n  if (end < begin) [begin, end] = [end, begin];\n\n\n  return new Type(instance.buffer, instance.byteOffset + begin * Type.BYTES_PER_ELEMENT, end - begin);\n}\n\n\n\n{\n  function setupClass(Ctor, bytes){\n    if (bytes) {\n      $__defineConstants(Ctor, { BYTES_PER_ELEMENT: bytes });\n    }\n    $__hideEverything(Ctor);\n    $__setupConstructor(Ctor, Ctor.prototype);\n    $__SetBuiltinBrand(Ctor.prototype, 'Builtin'+Ctor.name);\n  }\n\n  setupClass(ArrayBuffer);\n  setupClass(DataView);\n  setupClass(Int8Array, 1);\n  setupClass(Uint8Array, 1);\n  setupClass(Int16Array, 2);\n  setupClass(Uint16Array, 2);\n  setupClass(Int32Array, 4);\n  setupClass(Uint32Array, 4);\n  setupClass(Float32Array, 4);\n  setupClass(Float64Array, 8);\n}\n\n$__ArrayBufferProto = ArrayBuffer.prototype;\n$__DataViewProto = DataView.prototype;\n$__Float32ArrayProto = Float32Array.prototype;\n$__Float64ArrayProto = Float64Array.prototype;\n$__Float64ArrayProto = Float64Array.prototype;\n$__Int16ArrayProto = Int16Array.prototype;\n$__Int32ArrayProto = Int32Array.prototype;\n$__Int8ArrayProto = Int8Array.prototype;\n$__Uint16ArrayProto = Uint16Array.prototype;\n$__Uint32ArrayProto = Uint32Array.prototype;\n$__Uint8ArrayProto = Uint8Array.prototype;\n";

exports.modules["@weakmap"] = "export function WeakMap(iterable){\n  var weakmap;\n  if ($__IsConstructCall()) {\n    weakmap = this;\n  } else {\n    if (this === undefined || this === $__WeakMapProto) {\n      weakmap = $__ObjectCreate($__WeakMapProto) ;\n    } else {\n      weakmap = $__ToObject(this);\n    }\n  }\n\n  if ($__HasInternal(weakmap, 'WeakMapData')) {\n    throw $__Exception('double_initialization', ['WeakMap']);\n  }\n\n  $__WeakMapInitialization(weakmap, iterable);\n  return weakmap;\n}\n\n$__setupConstructor(WeakMap, $__WeakMapProto);\n{\n$__defineProps(WeakMap.prototype, {\n  set(key, value){\n    ensureWeakMap(this, key, 'set');\n    return $__WeakMapSet(this, key, value);\n  },\n  get(key){\n    ensureWeakMap(this, key, 'get');\n    return $__WeakMapGet(this, key);\n  },\n  has(key){\n    ensureWeakMap(this, key, 'has');\n    return $__WeakMapHas(this, key);\n  },\n  delete: function(key){\n    ensureWeakMap(this, key, 'delete');\n    return $__WeakMapDelete(this, key);\n  }\n});\n\n$__define(WeakMap.prototype.delete, 'name', 'delete', 0);\n\n\nfunction ensureWeakMap(o, p, name){\n  if (!o || typeof o !== 'object' || !$__HasInternal(o, 'WeakMapData')) {\n    throw $__Exception('called_on_incompatible_object', ['WeakMap.prototype.'+name]);\n  }\n  if (typeof p === 'object' ? p === null : typeof p !== 'function') {\n    throw $__Exception('invalid_weakmap_key', []);\n  }\n}\n}\n";



  return exports.index;
}).apply(this, function(){
  var exports = {
    builtins: {},
    modules: {},
    fs: {
      readFile: function(path, encoding, callback){
        var xhr = new XMLHttpRequest;
        xhr.onerror = xhr.onload = function(evt){
          if (xhr.readyState === 4) {
            xhr.onload = xhr.onerror = null;
            callback(null, xhr.responseText);
          }
        }

        xhr.open('GET', path);
        xhr.send();
      }
    }
  };

  function require(request){
    request = request.slice(request.lastIndexOf('/') + 1);
    return exports[request];
  }

  return [this, exports, require];
}());
