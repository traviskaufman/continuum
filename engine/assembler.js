var assembler = (function(exports){
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


  var Code = exports.Code = (function(){
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
          this.BoundNames = BoundNames(node.params);
        } else {
          this.BoundNames = [];
        }
        this.Rest = rest;
        this.ExpectedArgumentCount = this.BoundNames.length;
        if (node.rest) {
          this.BoundNames.push(node.rest.name);
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

      if (node.type === 'Program') {
        this.topLevel = true;
        this.imports = getImports(node);
      } else {
        this.topLevel = false;
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
      this.LexicalDeclarations = LexicalDeclarations(body);


      if (node.id) {
        this.name = node.id.name;
      }

      if (node.generator) {
        this.generator = true;
      }


      this.transfers = [];
      this.ScopeType = scope;
      this.Type = type || FUNCTYPE.NORMAL;
      this.VarDeclaredNames = [];
      this.NeedsSuperBinding = ReferencesSuper(this.body);
      this.Strict = strict || (context.code && context.code.strict) || isStrict(this.body);
      if (scope === SCOPE.MODULE) {
        this.ExportedNames = getExports(this.body);
        this.Strict = true;
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
        var code = new Code(node.value, context.source, FUNCTYPE.METHOD, SCOPE.CLASS, context.code.Strict),
            name = code.name = node.key.name;

        context.queue(code);
        code.displayName = this.name ? this.name+'#'+name : name;
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

  function isUseStrictDirective(node){
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

  function isStrict(node){
    if (isFunction(node)) {
      node = node.body.body;
    } else if (node.type === 'Program') {
      node = node.body;
    }
    if (node instanceof Array) {
      for (var i=0, element; element = node[i]; i++) {
        if (isUseStrictDirective(element)) {
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
/*
  function LexicallyDeclaredNames(){
    LinkedHashMap.call(this);
  }

  inherit(LexicallyDeclaredNames, LinkedHashMap, [
    function add()
  ]);


  function StaticScope(node){
    this.node = node;
  }



  function GlobalScope(){
    this.LexicallyDeclaredNames = new LinkedHashMap;
    this.VarDeclaredNames = new LinkedHashMap;
    this.VarScopedDeclarations = new LinkedHashMap;
  }

  inherit(GlobalScope, StaticScope, [
    function enqueue(node){

    }
  ]);

  function FunctionScope(node){
    this.node = node;
    this.
  }

  inherit(FunctionScope, StaticScope, [
    function enqueue(node){

    }
  ]);

*/
  function BoundNames(node){
    return boundNamesCollector(node);
  }


  var LexicalDeclarations = (function(lexical){
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
      node.BoundNames || (node.BoundNames = BoundNames(node));
      if (node.kind !== 'var') {
        return node;
      }
    };
  });



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


    var getExportedNames = collector({
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
      return getExportedNames(getExportedDecls(collectExportDecls(node)));
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
    return context.code.ScopeType === SCOPE.EVAL || context.code.ScopeType === SCOPE.GLOBAL;
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
        BLOCK(LexicalDeclarations(node.body));
        each(node.body, recurse);
        UPSCOPE();
      });
    });
  }

  function CallExpression(node){
    if (isSuperReference(node.callee)) {
      if (context.code.ScopeType !== SCOPE.FUNCTION) {
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
      var decls = LexicalDeclarations(node.body);
      decls.push({
        type: 'VariableDeclaration',
        kind: 'let',
        IsConstantDeclaration: false,
        BoundNames: [node.param.name],
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
            scope[0] = BoundNames(decl);
            var lexicalDecl = {
              type: 'VariableDeclaration',
              kind: init.kind,
              declarations: [{
                type: 'VariableDeclarator',
                id: decl,
                init: null
              }]
            };
            lexicalDecl.BoundNames = BoundNames(lexicalDecl);
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
              var lexicals = LexicalDeclarations(node.body.body);
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
              BLOCK(LexicalDeclarations(node.left));
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
    node.Code = new Code(node, null, FUNCTYPE.NORMAL, SCOPE.FUNCTION);
    context.queue(node.Code);
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
      if (context.code.ScopeType !== SCOPE.FUNCTION) {
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
      node.Code = new Code(node, null, FUNCTYPE.NORMAL, SCOPE.MODULE);
      node.Code.path = context.code.path.concat(node.id.name);
      context.queue(node.Code);
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
        code.writableName = true;
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
        BLOCK(LexicalDeclarations(node.cases));

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
        pushAll(context.code.VarDeclaredNames, BoundNames(item.id));
      }

      if (item.init) {
        if (item.id && item.id.type === 'Identifier' && isAnonymousFunction(item.init)) {
          var Expr = node.type === 'FunctionExpression' ? FunctionExpression : ArrowFunctionExpression;
          recurse(item.id);
          var code = Expr(item.init, item.id.name);
          code.writableName = true;
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

        if (this.code.ScopeType === SCOPE.GLOBAL || this.code.ScopeType === SCOPE.EVAL){
          COMPLETE();
        } else {
          if (this.code.Type === FUNCTYPE.ARROW && this.code.body.type !== 'BlockStatement') {
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
