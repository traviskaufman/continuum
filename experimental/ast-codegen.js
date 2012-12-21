var continuum = require('continuum'),
    astify    = require('astify'),
    each      = continuum.utility.each,
    map       = continuum.utility.map,
    ownKeys   = continuum.utility.keys,
    Hash      = continuum.utility.Hash,
    ASTNode   = astify.ASTNode,
    ASTArray  = astify.ASTArray,
    _         = astify.createNode;


var types = {
  SourcePosition: {
    fields: {
      line: { content: ['Number'] },
      column: { content: ['Number'] }
    }
  },
  SourceLocation: {
    fields: {
      start: { types: [ 'SourcePosition' ] },
      end: { types: [ 'SourcePosition' ] }
    }
  },
  SourceRange: {
    fields: {
      0: {
        content: [ 'Number' ]
      },
      1: {
        content: [ 'Number' ]
      }
    }
  },
  ASTNode: {
    fields: {
      loc: {
        optional: true,
        types: [ 'SourceLocation' ]
      },
      range: {
        optional: true,
        types: [ 'SourceRange' ]
      }
    }
  },
  ASTNodeList: {
    fields: {
      nodes: {
        indexed: true,
        types: [ 'ASTNode' ]
      }
    }
  },
  Expression: { kind: 'ASTNode' },
  Pattern: { kind: 'ASTNode' },
  Statement: { kind: 'ASTNode' },
  Declaration: { kind: 'Statement' },
  ArrayExpression: {
    kind: 'Expression',
    fields: {
      elements: {
        list: true,
        holes: true,
        types: [ 'Expression', 'SpreadElement' ]
      }
    }
  },
  ArrayPattern: {
    kind: 'Pattern',
    fields: {
      elements: {
        list: true,
        holes: true,
        types: [ 'Identifier', 'Pattern' ]
      }
    }
  },
  ArrowFunctionExpression: {
    kind: 'Expression',
    fields: {
      params: {
        list: true,
        types: [ 'Identifier', 'Pattern' ]
      },
      body: {
        types: [ 'Expression', 'BlockStatement' ]
      },
      defaults: {
        list: true,
        types: [ 'Expression' ]
      },
      rest: {
        optional: true,
        types: [ 'Identifier', 'Pattern' ]
      },
      generator: {
        values: [ false, true ]
      }
    }
  },
  AssignmentExpression: {
    kind: 'Expression',
    fields: {
      left: { types: [ 'Expression' ] },
      right: { types: [ 'Expression' ] },
      operator: {
        values: [ '=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '>>>=', '&=', '^=', '|=' ]
      }
    }
  },
  AtSymbol: {
    kind: 'Expression',
    fields: {
      name: { content: [ 'String' ] },
      internal: { values: [ false, true ] }
    }
  },
  BlockStatement: {
    kind: 'Statement',
    fields: { body: { list: true, types: [ 'Statement' ] } }
  },
  BinaryExpression: {
    kind: 'Expression',
    fields: {
      left: { types: [ 'Expression' ] },
      right: { types: [ 'Expression' ] },
      operator: {
        values: [ '+', '-', '/', '*', '%', '^', '&', '|', '>>', '<<', '>>>', '===',
                  '==', '>', '<', '!==', '!=', '>=', '<=', 'in', 'delete', 'instanceof' ]
      }
    }
  },
  BreakStatement: {
    kind: 'Statement',
    fields: {
      label: {
        optional: true,
        content: [ 'String' ]
      }

    }
  },
  CallExpression: {
    kind: 'Expression',
    fields: {
      callee: { types: [ 'Expression' ] },
      args: { list: true, types: [ 'Expression', 'SpreadElement' ] }
    }
  },
  CatchClause: {
    kind: 'ASTNode',
    fields: {
      param: { types: [ 'Identifier' ] },
      body: { types: [ 'BlockStatement' ] }
    }
  },
  ConditionalExpression: {
    kind: 'Expression',
    fields: {
      test: { types: [ 'Expression' ] },
      consequent: { types: [ 'Expression' ] },
      alternate: { types: [ 'Expression' ] }
    }
  },
  ClassBody: {
    kind: 'ASTNode',
    fields: {
      body: { list: true, types: [ 'MethodDefinition', 'SymbolDeclaration' ] }
    }
  },
  ClassDeclaration: {
    kind: 'Declaration',
    fields: {
      id: { types: [ 'Identifier' ] },
      body: { types: [ 'ClassBody' ] },
      superClass: { optional: true, types: [ 'Expression' ] }
    }
  },
  ClassExpression: {
    kind: 'Expression',
    fields: {
      id: { optional: true, types: [ 'Identifier' ] },
      body: { types: [ 'ClassBody' ] },
      superClass: { optional: true, types: [ 'Expression' ] }
    }
  },
  ContinueStatement: {
    kind: 'Statement',
    fields: {
      label: { optional: true, content: [ 'String' ] }
    }
  },
  ComprehensionBlock: {
    kind: 'ASTNode',
    fields: {
      left: { types: [ 'Expression' ] },
      right: { types: [ 'Expression' ] },
      body: { optional: true, types: [ 'Statement' ] }
    }
  },
  ComprehensionExpression: {
    kind: 'Expression',
    fields: {
      filter: { types: [ 'Expression' ] },
      blocks: { list: true, types: [ 'ComprehensionBlock' ] },
      body: { types: [ 'Statement' ] }
    }
  },
  DoWhileStatement: {
    kind: 'Statement',
    fields: {
      body: { optional: true, types: [ 'Statement' ] },
      test: { types: [ 'Expression' ] }
    }
  },
  DebuggerStatement: { kind: 'Statement' },
  EmptyStatement: { kind: 'Statement' },
  ExportDeclaration: {
    kind: 'Statement',
    fields: {
      specifiers: {
        list: true,
        types: [ 'ExportSpecifier', 'ExportSpecifierSet', 'Glob' ]
      },
      declaration: { types: [ 'Declaration' ] }
    }
  },
  ExportSpecifier: {
    kind: 'ASTNode',
    fields: {
      id: { types: [ 'Identifier' ] },
      from: { optional: true, types: [ 'Identifier', 'Path' ] }
    }
  },
  ExportSpecifierSet: {
    kind: 'ASTNode',
    fields: { specifiers: { types: [ 'ExportSpecifier' ] } }
  },
  ExpressionStatement: {
    kind: 'Statement',
    fields: { expression: { types: [ 'Expression' ] } }
  },
  ForStatement: {
    kind: 'Statement',
    fields: {
      init: { optional: true, types: [ 'Expression', 'VariableDeclaration' ] },
      test: { optional: true, types: [ 'Expression' ] },
      update: { optional: true, types: [ 'Expression' ] },
      body: { optional: true, types: [ 'Statement' ] }
    }
  },
  ForInStatement: {
    kind: 'Statement',
    fields: {
      left: { types: [ 'Expression', 'VariableDeclaration' ] },
      right: { types: [ 'Expression' ] },
      body: { optional: true, types: [ 'Statement' ] }
    }
  },
  ForOfStatement: {
    kind: 'Statement',
    fields: {
      left: { types: [ 'Expression', 'VariableDeclaration' ] },
      right: { types: [ 'Expression' ] },
      body: { optional: true, types: [ 'Statement' ] }
    }
  },
  FunctionDeclaration: {
    kind: 'Declaration',
    fields: {
      id: { types: [ 'Identifier' ] },
      params: { list: true, types: [ 'Identifier', 'Pattern' ] },
      body: { types: [ 'BlockStatement' ] },
      defaults: { list: true, types: [ 'Expression' ] },
      rest: { optional: true, types: [ 'Identifier', 'Pattern' ] },
      generator: { values: [ false, true ] }
    }
  },
  FunctionExpression: {
    kind: 'Expression',
    fields: {
      id: { optional: true, types: [ 'Identifier' ] },
      params: { list: true, types: [ 'Identifier', 'Pattern' ] },
      body: { types: [ 'BlockStatement' ] },
      defaults: { list: true, types: [ 'Expression' ] },
      rest: { optional: true, types: [ 'Identifier', 'Pattern' ] },
      generator: { values: [ false, true ]  }
    }
  },
  Glob: {
    kind: 'ASTNode'
  },
  Identifier: {
    kind: 'Expression',
    fields: {
      name: { content: [ 'String' ] }
    }
  },
  IfStatement: {
    kind: 'Statement',
    fields: {
      test: { types: [ 'Expression' ] },
      consequent: { types: [ 'Expression', 'Statement' ] },
      alternate: { optional: true, types: [ 'Expression', 'Statement' ] }
    }
  },
  ImportDeclaration: {
    kind: 'Statement',
    fields: {
      specifiers: { list: true, types: [ 'ImportSpecifier', 'Glob' ] },
      from: { types: [ 'Identifier', 'Literal', 'Path' ] }
    }
  },
  ImportSpecifier: {
    kind: 'ASTNode',
    fields: {
      id: { types: [ 'Identifier' ] },
      from: { optional: true, types: [ 'Identifier', 'Path' ] }
    }
  },
  Literal: {
    kind: 'Expression',
    fields: {
      value: {
        content: [ 'String', 'Boolean', 'Number' ]
      }
    }
  },
  LabeledStatement: {
    kind: 'Statement',
    fields: {
      label: { content: [ 'String' ] },
      body: { types: [ 'Statement' ] }
    }
  },
  LogicalExpression: {
    kind: 'Expression',
    fields: {
      left: { types: [ 'Expression' ] },
      right: { types: [ 'Expression' ] },
      operator: { values: [ '||', '&&' ] }
    }
  },
  MemberExpression: {
    kind: 'Expression',
    fields: {
      object: { types: [ 'Expression' ] },
      property: { types: [ 'Expression' ] },
      computed: { values: [ false, true ] }
    }
  },
  MethodDefinition: {
    kind: 'ASTNode',
    fields: {
      key: { types: [ 'AtSymbol', 'Identifier' ] },
      value: { types: [ 'FunctionExpression' ] },
      kind: { values: [ '', 'get', 'set' ] }
    }
  },
  ModuleDeclaration: {
    kind: 'Declaration',
    fields: {
      id: {
        types: [ 'Identifier' ]
      },
      body: {
        optional: true,
        types: [ 'BlockStatement' ]
      },
      from: {
        optional: true,
        types: [ 'Identifier', 'Literal', 'Path' ]
      }
    }
  },
  NewExpression: {
    kind: 'Expression',
    fields: {
      callee: { types: [ 'Expression' ] },
      args: { list: true, types: [ 'Expression', 'SpreadElement' ] }
    }
  },
  ObjectExpression: {
    kind: 'Expression',
    fields: {
      properties: {
        list: true,
        types: [ 'Property' ]
      }
    }
  },
  ObjectPattern: {
    kind: 'Pattern',
    fields: {
      properties: {
        list: true,
        types: [ 'Property' ]
      }
    }
  },
  Path: {
    kind: 'ASTNode',
    fields: {
      body: {
        list: true,
        types: [ 'Identifier' ]
      }
    }
  },
  Program: {
    kind: 'ASTNode',
    fields: {
      body: {
        list: true,
        types: [ 'Statement' ]
      }
    }
  },
  Property: {
    kind: 'ASTNode',
    fields: {
      key: {
        types: [ 'AtSymbol', 'Identifier', 'Literal' ]
      },
      value: {
        types: [ 'Expression' ]
      },
      kind: {
        values: [ 'get', 'set', 'init' ]
      },
      method: {
        values: [ false, true ]
      },
      shorthand: {
        values: [ false, true ]
      }
    }
  },
  ReturnStatement: {
    kind: 'Statement',
    fields: {
      argument: {
        optional: true,
        types: [ 'Expression' ]
      }
    }
  },
  SequenceExpression: {
    kind: 'Expression',
    fields: {
      expressions: {
        list: true,
        types: [ 'Expression' ]
      }
    }
  },
  SpreadElement: {
    kind: 'ASTNode',
    fields: {
      argument: {
        types: [ 'Expression' ]
      }
    }
  },
  SwitchStatement: {
    kind: 'Statement',
    fields: {
      descriminant: {
        types: [ 'Expression' ]
      },
      cases: {
        list: true,
        types: [ 'SwitchCase' ]
      }
    }
  },
  SwitchCase: {
    kind: 'ASTNode',
    fields: {
      test: {
        optional: true,
        types: [ 'Expression' ]
      },
      consequent: {
        list: true,
        types: [ 'Statement' ]
      }
    }
  },
  SymbolDeclaration: {
    kind: 'Declaration',
    fields: {
      kind: {
        values: [ 'symbol', 'private' ]
      },
      declarations: {
        list: true,
        types: [ 'SymbolDeclarator' ]
      }
    }
  },
  SymbolDeclarator: {
    kind: 'ASTNode',
    fields: {
      id: {
        types: [ 'AtSymbol' ]
      },
      init: {
        optional: true,
        types: [ 'Expression' ]
      }
    }
  },
  TaggedTemplateExpression: {
    kind: 'Expression',
    fields: {
      tag: {
        types: [ 'Identifier' ]
      },
      template: {
        types: [ 'TemplateLiteral' ]
      }
    }
  },
  TemplateElement: {
    kind: 'ASTNode',
    fields: {
      value: {
        content: [ 'Object' ]
      },
      tail: {
        values: [ false, true ]
      }
    }
  },
  TemplateLiteral: {
    kind: 'Expression',
    fields: {
      elements: {
        list: true,
        types: [ 'TemplateElement' ]
      },
      expressions: {
        list: true,
        types: [ 'Expression' ]
      }
    }
  },
  ThisExpression: {
    kind: 'Expression'
  },
  ThrowStatement: {
    kind: 'Statement',
    fields: {
      argument: {
        types: [ 'Expression' ]
      }
    }
  },
  TryStatement: {
    kind: 'Statement',
    fields: {
      block: {
        types: [ 'BlockStatement' ]
      },
      handlers: {
        list: true,
        types: [ 'CatchClause' ]
      },
      finalizer: {
        types: [ 'BlockStatement' ]
      }
    }
  },
  UnaryExpression: {
    kind: 'Expression',
    fields: {
      argument: {
        types: [ 'Expression' ]
      },
      operator: {
        values: [ '!', '~', '+', '-', 'void', 'typeof' ]
      }
    }
  },
  UpdateExpression: {
    kind: 'Expression',
    fields: {
      argument: {
        types: [ 'Expression' ]
      },
      operator: {
        values: [ '--', '++' ]
      },
      prefix: {
        values: [ false, true ]
      }
    }
  },
  VariableDeclaration: {
    kind: 'Declaration',
    fields: {
      kind: {
        values: [ 'var', 'const', 'let' ]
      },
      declarations: {
        list: true,
        types: [ 'VariableDeclarator' ]
      }
    }
  },
  VariableDeclarator: {
    kind: 'ASTNode',
    fields: {
      id: {
        types: [ 'Identifier', 'Pattern' ]
      },
      init: {
        optional: true,
        types: [ 'Expression' ]
      }
    }
  },
  WhileStatement: {
    kind: 'Statement',
    fields: {
      test: {
        types: [ 'Expression' ]
      },
      body: {
        optional: true,
        types: [ 'Statement' ]
      }
    }
  },
  WithStatement: {
    kind: 'Statement',
    fields: {
      object: {
        types: [ 'Expression' ]
      },
      body: {
        optional: true,
        types: [ 'Statement' ]
      }
    }
  },
  YieldExpression: {
    kind: 'Expression',
    fields: {
      argument: {
        optional: true,
        types: [ 'Expression' ]
      }
    }
  }
};




function classes(){
  function METHOD(name, type, body, args, rest){
    if (type === 'get') {
      args = [];
    } else if (type === 'set') {
      args = args ? args : ['val'];
    } else if (!args) {
      args = [];
    }
    if (!body) {
      body = [];
    } else if (!(body instanceof Array)) {
      body = [body];
    }
    return _('#method', name, _('#functionexpr', name, args, body, rest), type);
  }


  function GETTER(name){
    return METHOD(name, 'get', _('#return', _('#this').get(_('#at', name))));
  }

  function SETTER(name, param){
    param = _(param || 'val');
    return METHOD(name, 'set', _('#this').set(_('#at', name), param), [param]);
  }


  function CLASS(name, inherits, args, methods){
    var ctor = METHOD('constructor', '', map(args, function(arg){
      return _('#this').set(arg, _('#call', _(arg)));
    }), args);
    methods = methods || [];
    methods.push(ctor);
    return _('#class', name, _('#classbody', methods), inherits);
  }

  var out = _('#module', 'AST', []);
  each(types, function(def, name){
    var args = [];
    var methods = [];
    var rest;
    var decl = _('#symbol', 'private');

    var ctorBody = map(def.fields, function(details, name){
      details.name = name;
      decl.declare(name);
      if (details.indexed) {
        rest = name;
        return _('#return', _('#call', 'index', [
          _('#this'),
          _(name),
          _('#at', name),
          _('#array', details.types.map(_))
        ]));
      } else {
        args.push(name);
        return _('#this').set(name, _(name));
      }
    });

    var ctor = METHOD('constructor', '', ctorBody, args, rest);

    if (decl.declarations.length) {
      methods.push(decl);
    }

    if (args.length || rest) {
      methods.push(ctor);
    }

    each(args, function(arg){
      var field = def.fields[arg];
      methods.push(GETTER(arg));
      if (/[A-Z]/.test(field.types[0][0])) {
        methods.push(SETTER(arg, field.list ? 'nodelist' : 'node'));
      } else {
        methods.push(SETTER(arg));
      }
    });


    out.append(_('#export', _('#class', name, _('#classbody', methods), def.kind)));
  });
  console.log(out.toSource());
}

var replace = _('replace'),
    thisDotEl = _('#this').get('el'),
    children = _('#this').get('el').get('children'),
    loc = _('#this').set('location', _('location'));


function funcs(){
  function PROPERTY(name, type, body, args){
    if (type === 'get') {
      args = [];
    } else if (type === 'set') {
      args = args ? args : ['val'];
    } else if (!args) {
      args = [];
    }
    if (!body) {
      body = [];
    } else if (!(body instanceof Array)) {
      body = [body];
    }
    return _('#property', type, name, _('#functionexpr', name, args, body));
  }



  function GETTER(details, index){
    var get = children.get(index);
    return PROPERTY(details.name, 'get', _('#return', get.get('ast')));
  }


  function SETTER(details, param, index, callback){
    param = _(param || 'val');
    var set = _('#call', replace, [
      details.name,
      thisDotEl,
      children.get(index),
      callback ? _('#call', callback, [param]) : param
    ]);
    return PROPERTY(details.name, 'set', set, [param]);
  }

  function CONTENT(details, param, index, callback){
    param = _(param || 'val');
    var set = _('#call', replace, [
      details.name,
      thisDotEl,
      children.get(index),
      callback ? _('#call', callback, [_(param)]) : _(param)
    ]);
    return PROPERTY(details.name, 'set', set, [_(param)]);
  }

  function SETATTR(details, param, callback){
    var set = _('#call', thisDotEl.get('setAttribute'), [details.name, _('#call', callback, [_(param)])]);
    return PROPERTY(details.name, 'set', set, [_(param)]);
  }

  function GETATTR(details){
    var get = _('#call', thisDotEl.get('getAttribute'), [details.name]);
    return PROPERTY(details.name, 'get', _('#return', get), []);
  }

  function LITERAL(value){
    return _('#literal', value);
  }

  var out = [];
  var hash = _('#object');

  each(types, function(def, name){
    var args = [];
    var methodsNames = [];
    var methods = [_('#property', 'init', 'type', name)];

    var ctorBody = map(def.fields, function(details, name){
      details.name = name;
      args.push(+name === +name ? '$'+name : name);
      methodsNames.push(name);
      if (details.indexed) {
        return _('#return', _('#call', 'index', [_('#this'), _(name), name,
          details.types.length === 1 ? _(details.types[0]) : _('#array', details.types.map(_))
        ]));
      } else {
        return _('#this').set(name, _('node').get(name));
      }
    }) || [];

    var propTypes = _('#object');
    methods.push(_('#property', 'init', 'fields', propTypes));
    var enumerations = [];

    var i = 0;
    each(methodsNames, function(arg){
      var field = def.fields[arg];
      if ('values' in field) {
        var options = _('#array', field.values.map(LITERAL));
        enumerations.push(_('#call', _('enumeration'), [_(name), field.name, options]));
        methods.push(GETATTR(field));
        return methods.push(SETATTR(field, 'setting', _(name).get(field.name)));
      } else if ('content' in field && field.content !== undefined) {
        methods.push(GETTER(field, i));
        return methods.push(SETTER(field, 'content', i++, _(field.content[0])));
      }

      var fieldTypes = field.types;

      methods.push(GETTER(field, i));
      propTypes.set(field.name, fieldTypes.length === 1 ? _(fieldTypes[0]) : _('#array', fieldTypes));
      if (/[A-Z]/.test(field.types[0][0])) {
        methods.push(SETTER(field, field.list ? 'nodelist' : 'node', i));
      } else {
        methods.push(SETTER(field, 'node', i));
      }
      i++;
    });
    if (ctorBody) {
      var inheritance = [name],
          kind = def;

      while (kind && kind.kind) {
        inheritance.push(kind.kind);
        kind = types[kind.kind];
      }
      ctorBody.unshift(_('#this').get('el').set('ast', _('#this')));
      ctorBody.unshift(_('#this').get('el').set('className', LITERAL(inheritance.join(' '))));
      ctorBody.unshift(_('#call', _('define'), [_('#this'), 'el', _('#call', _('createElement'), ['span'])]));
    }
    var ctor = _('#functiondecl', name, ['node'], ctorBody);


    out.push(ctor);
    out.push(_('#call', _('define'), [_(name), 'fields', _('#array', methodsNames.map(LITERAL))]));
    if (enumerations.length) out.push.apply(out, enumerations);
    if (def.kind) {
      out.push(_('#call', _('inherit'), [_(name), _(def.kind), _('#object', methods)]));
    } else {
      out.push(_('#call', _('define'), [_(name).get('prototype'), _('#object', methods)]));
    }
    hash.set(name, _(name));
  });
  out.push(_('#var').declare('types', hash));
  console.log(_('#program', out).toSource());
}


funcs();

// console.log(Object.keys(types).map(function(type){
//   return '.'+type + '\n{}\n\n';
// }).join(''));
