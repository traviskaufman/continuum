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
  ASTNode: { fields: { type: { types: [ 'string' ] } } },
  ASTNodeList: { fields: { nodes: { indexed: true, types: [ 'ASTNode' ] } } },
  Expression: { kind: 'ASTNode' }, Pattern: { kind: 'ASTNode' },
  Statement: { kind: 'ASTNode' },
  Declaration: { kind: 'Statement' },
  ArrayExpression: {
    kind: 'Expression',
    fields: {
      elements: {
        list: true, holes: true,
        types: [ 'Expression', 'SpreadElement' ]
      }
    }
  },
  ArrayPattern: {
    kind: 'Pattern',
    fields: {
      elements: { list: true, holes: true, types: [ 'Identifier', 'Pattern' ] }
    }
  },
  ArrowFunctionExpression: {
    kind: 'Expression',
    fields: {
      params: { list: true, types: [ 'Identifier', 'Pattern' ] },
      body: { types: [ 'Expression', 'BlockStatement' ] },
      defaults: { list: true, types: [ 'Expression' ] },
      rest: { optional: true, types: [ 'Identifier', 'Pattern' ] },
      generator: { types: [ 'boolean' ] }
    }
  },
  AssignmentExpression: {
    kind: 'Expression',
    fields: {
      left: { types: [ 'Expression' ] },
      right: { types: [ 'Expression' ] },
      operator: {
        types: [ 'enum' ],
        values: [ '=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '>>>=', '&=', '^=', '|=' ]
      }
    }
  },
  AtSymbol: {
    kind: 'Expression',
    fields: {
      name: { types: [ 'string' ] },
      internal: { types: [ 'boolean' ] }
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
        types: [ 'enum' ],
        values: [
          '+', '-', '/', '*', '%', '^', '&', '|', '>>', '<<', '>>>', '===', '==', '>', '<', '!==',
          '!=', '>=', '<=', 'in', 'delete', 'instanceof'
        ]
      }
    }
  },
  BreakStatement: {
    kind: 'Statement',
    fields: { label: { optional: true, types: [ 'string' ] } }
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
    fields: { label: { optional: true, types: [ 'string' ] } }
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
      generator: { types: [ 'boolean' ] }
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
      generator: { types: [ 'boolean' ] }
    }
  },
  Glob: { kind: 'ASTNode' },
  Identifier: { kind: 'Expression', fields: { name: { types: [ 'string' ] } } },
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
        optional: true,
        types: [ 'string', 'boolean', 'number', 'undefined' ]
      }
    }
  },
  LabeledStatement: {
    kind: 'Statement',
    fields: {
      label: { types: [ 'string' ] },
      body: { types: [ 'Statement' ] }
    }
  },
  LogicalExpression: {
    kind: 'Expression',
    fields: {
      left: { types: [ 'Expression' ] },
      right: { types: [ 'Expression' ] },
      operator: { types: [ 'enum' ], values: [ '||', '&&' ] }
    }
  },
  MemberExpression: {
    kind: 'Expression',
    fields: {
      object: { types: [ 'Expression' ] },
      property: { types: [ 'Expression' ] },
      computed: { types: [ 'boolean' ] }
    }
  },
  MethodDefinition: {
    kind: 'ASTNode',
    fields: {
      key: { types: [ 'AtSymbol', 'Identifier' ] },
      value: { types: [ 'FunctionExpression' ] },
      kind: { types: [ 'enum' ], values: [ 'get', 'set', '' ] }
    }
  },
  ModuleDeclaration: {
    kind: 'Declaration',
    fields: {
      id: { types: [ 'Identifier' ] },
      body: { optional: true, types: [ 'BlockStatement' ] },
      from: { optional: true, types: [ 'Identifier', 'Literal', 'Path' ] }
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
    fields: { properties: { list: true, types: [ 'Property' ] } }
  },
  ObjectPattern: {
    kind: 'Pattern',
    fields: { properties: { list: true, types: [ 'Property' ] } }
  },
  Path: {
    kind: 'ASTNode',
    fields: { body: { list: true, types: [ 'Identifier' ] } }
  },
  Program: {
    kind: 'ASTNode',
    fields: { body: { list: true, types: [ 'Statement' ] } }
  },
  Property: {
    kind: 'ASTNode',
    fields: {
      key: { types: [ 'AtSymbol', 'Identifier', 'Literal' ] },
      value: { types: [ 'Expression' ] },
      kind: { types: [ 'enum' ], values: [ 'get', 'set', 'init' ] },
      method: { types: [ 'boolean' ] },
      shorthand: { types: [ 'boolean' ] }
    }
  },
  ReturnStatement: {
    kind: 'Statement',
    fields: { arg: { optional: true, types: [ 'Expression' ] } }
  },
  SequenceExpression: {
    kind: 'Expression',
    fields: { expressions: { list: true, types: [ 'Expression' ] } }
  },
  SpreadElement: { kind: 'ASTNode', fields: { arg: { types: [ 'Expression' ] } } },
  SwitchStatement: {
    kind: 'Statement',
    fields: {
      descriminant: { types: [ 'Expression' ] },
      cases: { list: true, types: [ 'SwitchCase' ] }
    }
  },
  SwitchCase: {
    kind: 'ASTNode',
    fields: {
      test: { optional: true, types: [ 'Expression' ] },
      consequent: { list: true, types: [ 'Statement' ] }
    }
  },
  SymbolDeclaration: {
    kind: 'Declaration',
    fields: {
      declarations: { list: true, types: [ 'SymbolDeclarator' ] },
      kind: { types: [ 'enum' ], values: [ 'symbol', 'private' ] }
    }
  },
  SymbolDeclarator: {
    kind: 'ASTNode',
    fields: {
      id: { types: [ 'AtSymbol' ] },
      init: { optional: true, types: [ 'Expression' ] }
    }
  },
  TaggedTemplateExpression: {
    kind: 'Expression',
    fields: {
      tag: { types: [ 'Identifier' ] },
      template: { types: [ 'TemplateLiteral' ] }
    }
  },
  TemplateElement: {
    kind: 'ASTNode',
    fields: { value: { types: [ 'object' ] }, tail: { types: [ 'boolean' ] } }
  },
  TemplateLiteral: {
    kind: 'Expression',
    fields: {
      elements: { list: true, types: [ 'TemplateElement' ] },
      expressions: { list: true, types: [ 'Expression' ] }
    }
  },
  ThisExpression: { kind: 'Expression' },
  ThrowStatement: {
    kind: 'Statement',
    fields: { arg: { types: [ 'Expression' ] } }
  },
  TryStatement: {
    kind: 'Statement',
    fields: {
      block: { types: [ 'BlockStatement' ] },
      handlers: { list: true, types: [ 'CatchClause' ] },
      finalizer: { types: [ 'BlockStatement' ] }
    }
  },
  UnaryExpression: {
    kind: 'Expression',
    fields: {
      arg: { types: [ 'Expression' ] },
      operator: {
        types: [ 'enum' ],
        values: [ '!', '~', '+', '-', 'void', 'typeof' ]
      }
    }
  },
  UpdateExpression: {
    kind: 'Expression',
    fields: {
      arg: { types: [ 'Expression' ] },
      operator: { types: [ 'enum' ], values: [ '--', '++' ] },
      prefix: { types: [ 'boolean' ] }
    }
  },
  VariableDeclaration: {
    kind: 'Declaration',
    fields: {
      declarations: { list: true, types: [ 'VariableDeclarator' ] },
      kind: { types: [ 'enum' ], values: [ 'var', 'const', 'let' ] }
    }
  },
  VariableDeclarator: {
    kind: 'ASTNode',
    fields: {
      id: { types: [ 'Identifier', 'Pattern' ] },
      init: { optional: true, types: [ 'Expression' ] }
    }
  },
  WhileStatement: {
    kind: 'Statement',
    fields: {
      test: { types: [ 'Expression' ] },
      body: { optional: true, types: [ 'Statement' ] }
    }
  },
  WithStatement: {
    kind: 'Statement',
    fields: {
      object: { types: [ 'Expression' ] },
      body: { optional: true, types: [ 'Statement' ] }
    }
  },
  YieldExpression: {
    kind: 'Expression',
    fields: { arg: { optional: true, types: [ 'Expression' ] } }
  }
};


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

