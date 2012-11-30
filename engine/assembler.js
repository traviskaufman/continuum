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

  var walk          = traversal.walk,
      collector     = traversal.collector,
      Visitor       = traversal.Visitor,
      fname         = functions.fname,
      define        = objects.define,
      assign        = objects.assign,
      create        = objects.create,
      copy          = objects.copy,
      inherit       = objects.inherit,
      ownKeys       = objects.keys,
      hasOwn        = objects.hasOwn,
      isObject      = objects.isObject,
      Hash          = objects.Hash,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration,
      each          = iteration.each,
      repeat        = iteration.repeat,
      map           = iteration.map,
      fold          = iteration.fold,
      generate      = iteration.generate,
      quotes        = utility.quotes,
      uid           = utility.uid,
      pushAll       = utility.pushAll;

  var constants = require('./constants'),
      BINARYOPS = constants.BINARYOPS.hash,
      UNARYOPS  = constants.UNARYOPS.hash,
      ENTRY     = constants.ENTRY.hash,
      SCOPE     = constants.SCOPE.hash,
      AST       = constants.AST,
      FUNCTYPE  = constants.FUNCTYPE.hash;

  var CONTINUE = walk.CONTINUE,
      RECURSE  = walk.RECURSE,
      BREAK    = walk.BREAK;

  var proto = Math.random().toString(36).slice(2),
      context,
      _push = [].push,
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
    function save(serializer){
      var out = [this.name];
      for (var i=0; i < this.params; i++) {
        out[i+1] = serializer.serialize(this.params[i]);
      }
      return out;
    },
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



  var AND              = new StandardOpCode(1, 'AND'),
      ARRAY            = new StandardOpCode(0, 'ARRAY'),
      ARG              = new StandardOpCode(0, 'ARG'),
      ARGS             = new StandardOpCode(0, 'ARGS'),
      ARRAY_DONE       = new StandardOpCode(0, 'ARRAY_DONE'),
      BINARY           = new StandardOpCode(1, 'BINARY'),
      BINDING          = new StandardOpCode(2, 'BINDING'),
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
      FUNCTION         = new StandardOpCode(3, 'FUNCTION'),
      GET              = new StandardOpCode(0, 'GET'),
      INC              = new StandardOpCode(0, 'INC'),
      INDEX            = new StandardOpCode(1, 'INDEX'),
      ITERATE          = new StandardOpCode(0, 'ITERATE'),
      JUMP             = new StandardOpCode(1, 'JUMP'),
      JEQ_NULL         = new StandardOpCode(1, 'JEQ_NULL'),
      JFALSE           = new StandardOpCode(1, 'JFALSE'),
      JLT              = new StandardOpCode(2, 'JLT'),
      JLTE             = new StandardOpCode(2, 'JLTE'),
      JGT              = new StandardOpCode(2, 'JGT'),
      JGTE             = new StandardOpCode(2, 'JGTE'),
      JNEQ_NULL        = new StandardOpCode(1, 'JNEQ_NULL'),
      JTRUE            = new StandardOpCode(1, 'JTRUE'),
      LET              = new StandardOpCode(1, 'LET'),
      LITERAL          = new StandardOpCode(1, 'LITERAL'),
      LOG              = new StandardOpCode(0, 'LOG'),
      MEMBER           = new InternedOpCode(1, 'MEMBER'),
      METHOD           = new StandardOpCode(3, 'METHOD'),
      NATIVE_CALL      = new StandardOpCode(1, 'NATIVE_CALL'),
      NATIVE_REF       = new InternedOpCode(1, 'NATIVE_REF'),
      OBJECT           = new StandardOpCode(0, 'OBJECT'),
      OR               = new StandardOpCode(1, 'OR'),
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

  function serializeLocation(loc){
    if (loc) {
      if (loc.start) {
        if (loc.start.line === loc.end.line) {
          return [loc.start.line, loc.start.column, loc.end.column];
        } else {
          return [loc.start.line, loc.start.column, loc.end.line, loc.end.column];
        }
      } else if (loc.line) {
        return [loc.line, loc.column];
      }
    }
    return [];
  }

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
        function save(serializer){
          var serialized = [this.op.name]//, serializeLocation(this.loc)];
          if (this.op.params) {
            var params = serialized[2] = [];
            for (var i=0; i < this.op.params; i++) {
              if (this[i] && this[i].id) {
                serializer.add(this[i]);
                params[i] = this[i].id;
              } else if (this[i] instanceof Code) {
                serializer.ident(this[i]);
                serializer.add(this[i]);
                params[i] = this[i].id;
              } else {
                params[i] = serializer.serialize(this[i]);
              }
            }
          }
          return serialized;
        },
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

    var Parameters = (function(){
      function ParametersIterator(params){
        this.params = params;
        this.index = 0;
      }

      inherit(ParametersIterator, Iterator, [
        function next(){
          if (this.index >= this.params.length) {
            throw StopIteration;
          }
          return this.params[this.index++];
        }
      ]);

      function Parameters(node){
        this.length = 0;
        if (node.params) {
          pushAll(this, node.params);
          this.boundNames = boundNames(node.params);
          this.reduced = reducer(node);
        } else {
          this.reduced = [];
          this.boundNames = [];
        }
        this.Rest = node.rest;
        this.ExpectedArgumentCount = this.boundNames.length;
        if (node.rest) {
          this.boundNames.push(node.rest.name);
        }
        this.defaults = node.defaults || [];
      }

      define(Parameters.prototype, [
        function save(serializer){
          var serialized = {
            formals: this.reduced,
            count: this.ExpectedArgumentCount
          };
          if (this.Rest) {
            serialized.rest = reducer(this.Rest);
          }
          return serialized;
        },
        function __iterator__(){
          return new ParametersIterator(this);
        }
      ]);

      return Parameters;
    })();


    function Code(node, source, lexicalType, scopeType, strict){
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
        this.scope = scope.create('global');
      } else {
        this.flags.topLevel = false;
        body = body.body;
        if (node.type === 'ModuleDeclaration') {
          this.imports = getImports(body);
          this.scope = scope.create('module', context.currentScope)
          body = body.body;
        } else {
          this.scope = scope.create('normal', context.currentScope);
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
      this.scopeType = scopeType;
      this.lexicalType = lexicalType || FUNCTYPE.NORMAL;
      this.varDecls = [];
      this.flags.usesSuper = ReferencesSuper(this.body);
      this.flags.strict = strict || (context.code && context.code.flags.strict) || isstrict(this.body);
      if (scopeType === SCOPE.MODULE) {
        this.exportedNames = getExports(this.body);
        this.flags.strict = true;
      }
      this.ops = [];
      if (node.params) {
        this.params = new Parameters(node);
        this.scope.varDeclare('arguments', 'arguments');
        each(this.params.boundNames, function(name){
          this.varDeclare(name, 'param');
        }, this.scope);
      }
    }


    define(Code.prototype, [
      function save(serializer){
        if (serializer.has(this.id)) {
          return this.id;
        }

        var serialized = serializer.set(this.id, {
          type: 'Code',
          varDecls: this.varDecls,
          flags: this.flags,
          range: this.range,
          loc: serializeLocation(this.loc)
        });
        if (this.classDefinition) {
          if (!this.classDefinition.id) {
            serializer.ident(this.classDefinition);
          }
          serializer.add(this.classDefinition);
          this.classDefinition = this.classDefinition.id;
        }
        if (this.scopeType !== undefined) {
          serialized.scopeType = constants.SCOPE.array[this.scopeType].toLowerCase();
        }
        if (this.lexicalType !== undefined) {
          serialized.lexicalType = constants.FUNCTYPE.array[this.lexicalType].toLowerCase();
        }

        if (this.transfers.length) {
          serialized.transfers = [];
          each(this.transfers, function(transfer){
            serialized.transfers.push(serializer.serialize(transfer));
          })
        }

        if (this.exportedNames) {
          serialized.exports = this.exportedNames;
        }

        if (this.imports) {
          serialized.imports = this.imports;
        }

        if (this.params) {
          serialized.params = serializer.serialize(this.params);
        }

        serialized.ops = map(this.ops, serializer.serialize, serializer);

        return serialized;
      },
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
      this.scope = scope.create('normal', context.currentScope);
      this.name && this.scope.varDeclare(this.name);

      each(node.body.body, function(node){
        if (node.type === 'SymbolDeclaration') {
          self.defineSymbols(node);
        } else {
          self.defineMethod(node);
        }
      });

      this.hasSuper = !!node.superClass;
      if (this.hasSuper) {
        recurse(node.superClass);
        GET();
      }
    }

    define(ClassDefinition.prototype, [
      function save(serializer){
        if (serializer.has(this.id)) {
          return this.id;
        }
        var serialized = serializer.set(this.id, {
          type: 'ClassDefinition',
        });

        if (this.name) {
          serialized.name = serializer.serialize(this.name);
        }
        if (this.hasSuper) {
          serializer.hasSuper = true;
        }
        var methods = {
          method: [],
          get: [],
          set: []
        };

        each(this.methods, function(method){
          serializer.add(method.code);
          methods[method.kind].push([serializer.serialize(method.name), method.code.id]);
        });
        if (methods.method.length) {
          serialized.methods = methods.method;
        }
        if (methods.get.length) {
          serialized.getters = methods.get;
        }
        if (methods.set.length) {
          serialized.setters = methods.set;
        }
        if (this.symbols[0].length) {
          var privates = [],
              publics = [];
          each(this.symbols[0], function(symbol, i){
            if (this.symbols[1][i]) {
              publics.push(symbol);
            } else {
              privates.push(symbol);
            }
          }, this);
          if (privates.length) {
            serialized.privateSymbols = privates;
          }
          if (publics.length) {
            serialized.publicSymbols = publics;
          }
        }

        return serialized;
      },
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
        code.scope.outer = this.scope;

        context.queue(code);
        code.displayName = this.name ? this.name+'#'+name.join('') : name.join('');
        if (!name[0]) name = name[1];
        node.kind = node.kind || 'method';

        if (name === 'constructor') {
          this.ctor = code;
          code.classDefinition = this;
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
      function save(serializer){
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


  var scope = (function(){
    var types = create(null);

    var Scope = types.normal = (function(){
      function Scope(outer){
        this.varNames = create(null);
        this.lexNames = create(null);
        this.outer = outer;
      }

      define(Scope.prototype, [
        function varDeclare(name, type){
          this.varNames[name] = type;
        },
        function lexDeclare(name, type){
          if (type === 'function') {
            this.varNames[name] = type;
          } else {
            this.lexNames[name] = type;
          }
        },
        function has(name){
          return name in this.varNames || name in this.lexNames;
        },
        function pop(){
          if (this === context.currentScope) {
            context.currentScope = this.outer;
          }
        }
      ]);

      return Scope;
    })();


    var BlockScope = types.block = (function(){
      function BlockScope(outer){
        this.lexNames = create(null);
        this.outer = outer;
      }

      inherit(BlockScope, Scope, [
        function varDeclare(name, type){
          this.outer.varDeclare(name, type);
        },
        function lexDeclare(name, type){
          this.lexNames[name] = type;
        },
        function has(name){
          return name in this.lexNames;
        }
      ]);

      return BlockScope;
    })();


    var GlobalScope = types.global = (function(){
      function GlobalScope(){
        this.varNames = create(null);
        this.lexNames = create(null);
      }

      inherit(GlobalScope, Scope, [

      ]);

      return GlobalScope;
    })();

    var ModuleScope = types.module = (function(){
      function ModuleScope(outer){
        this.outer = outer;
        this.varNames = create(null);
        this.lexNames = create(null);
      }

      inherit(ModuleScope, GlobalScope, [

      ]);

      return ModuleScope;
    })();


    var EvalScope = types.eval = (function(){
      function EvalScope(outer){
        this.outer = outer;
        this.varNames = create(null);
        this.lexNames = create(null);
      }

      inherit(EvalScope, Scope, [

      ]);

      return EvalScope;
    })();

    return define({}, [
      function resolve(scope, name){
        while (scope) {
          if (scope.has(name)) {
            return scope;
          }
          scope = scope.outer;
        }
      },
      (function(){
        return function create(type, outer){
          return new types[type](outer);
        };
      })()
    ]);
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
    BlockStatement     : RECURSE,
    Program            : RECURSE,
    ForStatement       : RECURSE,
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
      ExportDeclaration: RECURSE,
      SwitchCase: RECURSE,
      Program: RECURSE,
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
    BlockStatement: RECURSE,
    IfStatement: RECURSE,
    ForStatement: RECURSE,
    ForOfStatement: RECURSE,
    ForInStatement: RECURSE,
    DoWhileStatement: RECURSE,
    WhileStatement: RECURSE,
    ExportDeclaration: RECURSE,
    CatchClause: RECURSE,
    SwitchCase: RECURSE,
    SwitchStatement: RECURSE,
    TryStatement: RECURSE,
    WithStatement: RECURSE
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

    RESET(A);

    while (len--) {
      var decl = varDeclarations[len];
      if (decl.type === 'FunctionDeclaration') {
        decl.boundNames || (decl.boundNames = boundNames(decl));
        var name = decl.boundNames[0];
        if (name === 'arguments') {
          argumentsObjectNotNeeded = true;
        }
        HAS_BINDING(name);
        var jump = JTRUE(0);
        CREATE_BINDING(name, false);
        ACCUM(A, name);
        adjust(jump);
      }
    }

    each(code.params.boundNames, function(name){
      if (name === 'arguments') {
        argumentsObjectNotNeeded = true;
      }
      HAS_BINDING(name);
      var jump = JTRUE(0);
      CREATE_BINDING(name, false);
      UNDEFINED();
      VAR(name);
      adjust(jump);
    });

    if (!argumentsObjectNotNeeded) {
      CREATE_BINDING('arguments', code.strict);
    }

    each(code.varNames, function(name){
      HAS_BINDING(name);
      var jump = JTRUE(0);
      CREATE_BINDING(name, false);
      adjust(jump);
    });

    each(lexicalDecls(code.body), function(decl){
      each(decl.boundNames, function(name){
        CREATE_BINDING(name, decl.IsConstantDeclaration);
      });
    });

    each(varDeclarations, function(decl){
      if (decl.type === 'FunctionDeclaration') {

      }
    });
  }

  var getExports = (function(){
    var collectExportDecls = collector({
      Program          : RECURSE,
      BlockStatement   : RECURSE,
      ExportDeclaration: true
    });

    var getExportedDecls = collector({
      ClassDeclaration   : true,
      ExportDeclaration  : RECURSE,
      ExportSpecifier    : true,
      ExportSpecifierSet : RECURSE,
      FunctionDeclaration: true,
      ModuleDeclaration  : true,
      VariableDeclaration: RECURSE,
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
      Program          : RECURSE,
      BlockStatement   : RECURSE,
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
      FunctionExpression: function(node){
        return map(node.params, convert);
      },
      ArrowFunctionExpression: function(node){
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
      function ArrowFunctionExpression(node){
        isntWrapped(node.body);
        this.push(node.body);
      },
      function BlockStatement(node){
        each(node.body, wrap(node.wrapped));
        return RECURSE;
      },
      function CatchClause(node){
        copyWrap(node, node.body);
        return RECURSE;
      },
      function ConditionalExpression(node){
        each(node, tail(node.tail));
        each(node, wrap(node.wrapped));
        return RECURSE;
      },
      function DoWhileStatement(node){
        each(node, isntTail);
        copyWrap(node, node.body);
        return RECURSE;
      },
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
      },      function IfStatement(node){
        copyWrap(node, node.consequent);
        copyWrap(node, node.alternate);
        return RECURSE;
      },
      function LabeledStatement(node){
        copyWrap(node, node.statement);
        return RECURSE;
      },
      function ModuleDeclaration(node){
        node.body && each(node.body, isntWrapped);
        return RECURSE;
      },
      function Program(node){
        each(node.body, isntWrapped);
        return RECURSE;
      },
      function ReturnStatement(node){
        tail(!node.wrapped)(node.argument);
        return RECURSE;
      },
      function SequenceExpression(node){
        each(node.expression, wrap(node.wrapped));
        copyTail(node, node.expressions[node.expressions.length - 1]);
        return RECURSE;
      },
      function SwitchCase(node){
        each(node.consequent, wrap(node.wrapped))
        return RECURSE;
      },
      function SwitchStatement(node){
        each(node.cases, wrap(node.wrapped));
        return RECURSE;
      },
      function TryStatement(node){
        isWrapped(node.block);
        each(node.handlers, wrap(node.finalizer || node.wrapped));
        isntWrapped(node.finalizer);
        return RECURSE;
      },
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


  var ReferencesSuper = (function(){
    var found;

    function nodeReferencesSuper(node){
      if (node.type === 'MemberExpression') {
        if (isSuperReference(node.object)) {
          found = true;
          return BREAK;
        }
        return RECURSE;
      } else if (node.type === 'CallExpression') {
        if (isSuperReference(node.callee)) {
          found = true;
          return BREAK;
        }
        return RECURSE;
      } else if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
        return CONTINUE;
      } else {
        return RECURSE;
      }
    }

    return function ReferencesSuper(node){
      found = false;
      walk(node, nodeReferencesSuper);
      return found;
    };
  })()



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

  var symbol = (function(){
    function Symbol(node){
      if (node.type === 'AtSymbol') {
        this[0] = '@';
        this[1] = node.name;
      } else if (node.type === 'Literal') {
        this[0] = '';
        this[1] = node.value;
      } else {
        this[0] = '';
        this[1] = node.name;
      }
    }

    define(Symbol.prototype, 'length', 2);
    define(Symbol.prototype, [
      Array.prototype.join,
      function save(serializer){
        if (this[0] === '@') {
          return ['@', this[1]];
        }
        return this[1];
      }
    ]);

    return function symbol(node){
      return new Symbol(node);
    };
  })();


  function block(callback){
      var entry = new ControlTransfer(context.labels);
      context.jumps.push(entry);
      context.labels = new Hash;
      context.currentScope = scope.create('block', context.currentScope);
      callback();
      entry.updateBreaks(current());
      context.currentScope.pop();
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
    FUNCTION(false, null, code);
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
        var lexicals = lexicalDecls(node.body),
            funcs = [];
        if (lexicals.length) {
          BLOCK([]);
          each(lexicals, function(decl){
            each(decl.boundNames, function(name){
              BINDING(name, decl.IsConstantDeclaration);
              if (decl.type === 'FunctionDeclaration') {
                funcs.push(decl);
              }
            });
          });

          each(funcs, function(decl){
            FunctionDeclaration(decl);
            FUNCTION(false, decl.id.name, decl.code);
            LET(decl.id.name);
          });

          each(node.body, recurse);
          UPSCOPE();
        } else {
          each(node.body, recurse);
        }
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
      context.currentScope = scope.create('block', context.currentScope);
      context.currentScope.lexDeclare(node.param.name, 'catch');
      recurse(node.param);
      PUT();
      each(node.body.body, recurse);
      context.currentScope.pop();
      UPSCOPE();
    });
  }

  function ClassBody(node){}

  function ClassDeclaration(node){
    context.currentScope.lexDeclare(node.id.name, 'class');
    CLASS_DECL(new ClassDefinition(node));
  }

  function ClassExpression(node){
    CLASS_EXPR(new ClassDefinition(node));
  }

  function ClassHeritage(node){}

  function ConditionalExpression(node){
    recurse(node.test);
    GET();
    var test = JFALSE(0);
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
      JTRUE(start);
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
            var scoped = BLOCK([]);
            context.currentScope = scope.create('block', context.currentScope);
            recurse(init);
            var decl = init.declarations[init.declarations.length - 1].id;
            scoped[0] = boundNames(decl);
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
          var op = JFALSE(0);
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
        if (isLexical) {
          context.currentScope.pop();
          UPSCOPE();
        }
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
    if (!node.code) {
      context.currentScope.lexDeclare(node.id.name, 'function');
      node.code = new Code(node, null, FUNCTYPE.NORMAL, SCOPE.FUNCTION);
      context.queue(node.code);
    }
    return node.code;
  }

  function FunctionExpression(node, methodName){
    var code = new Code(node, null, FUNCTYPE.NORMAL, SCOPE.FUNCTION);
    if (node.id) {
      code.scope.varDeclare(node.id.name, 'funcname');
    }
    if (methodName) {
      code.name = methodName.name || methodName;
    }
    context.queue(code);
    FUNCTION(true, intern(node.id ? node.id.name : ''), code);
    return code;
  }

  function Glob(node){}

  var nativeMatch = /^\$__/;

  function Identifier(node){
    if (context.code.natives && nativeMatch.test(node.name)) {
      node.type = 'NativeIdentifier';
      node.name = node.name.slice(3);
      NATIVE_REF(node.name);
    } else {
      REF(node.name);
    }
  }

  function IfStatement(node){
    recurse(node.test);
    GET();
    var test = JFALSE(0);
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
    var op = node.operator === '||' ? OR(0) : AND(0);
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
    if (node.kind === 'var') {
      var DECLARE = function(name){
        context.currentScope.varDeclare(name, 'var');
        VAR(name);
      };
    } else {
      var OP = node.kind === 'const' ? CONST : LET;
      var DECLARE = function(name){
        context.currentScope.lexDeclare(name, node.kind);
        OP(name);
      };
    }


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
      var op = JFALSE(0)
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
        return RECURSE;
      });
    }

    function reinterpretNatives(node){
      walk(node, function(node){
        if (node.type === 'Identifier' && /^\$__/.test(node.name)) {
          node.type = 'NativeIdentifier';
          node.name = node.name.slice(3);
        } else {
          return RECURSE;
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
        }

        this.queue(code);

        while (this.pending.length) {
          this.process(this.pending.pop(), this.code);
        }

        return code;
      },
      function process(code, parent){
        this.code = code;
        this.code.filename = this.filename;
        parent && code.derive(parent);
        this.currentScope = code.scope;

        if (code.params) {

        }

        recurse(code.body);

        var lastOp = last();

        if (code.scopeType === SCOPE.GLOBAL || code.scopeType === SCOPE.EVAL){
          COMPLETE();
        } else {
          if (lastOp && lastOp.op.name !== 'RETURN') {
            if (code.lexicalType === FUNCTYPE.ARROW && code.body.type !== 'BlockStatement') {
              GET();
              RETURN();
            } else {
              UNDEFINED();
              RETURN();
            }
          }
        }
        this.currentScope = this.currentScope.outer;
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
