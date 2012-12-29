var runtime = (function(GLOBAL, exports, undefined){
  "use strict";
  var esprima      = require('../third_party/esprima'),
      objects      = require('./lib/objects'),
      functions    = require('./lib/functions'),
      iteration    = require('./lib/iteration'),
      utility      = require('./lib/utility'),
      errors       = require('./errors'),
      assemble     = require('./assembler').assemble,
      constants    = require('./constants'),
      collections  = require('./object-model/collections'),
      operators    = require('./object-model/operators'),
      environments = require('./object-model/environments'),
      operations   = require('./object-model/operations'),
      descriptors  = require('./object-model/descriptors'),
      $Object      = require('./object-model/$Object').$Object,
      $Array       = require('./object-model/$Array'),
      $Proxy       = require('./object-model/$Proxy'),
      $TypedArray  = require('./object-model/$TypedArray'),
      natives      = require('./natives'),
      Emitter      = require('./lib/Emitter'),
      PropertyList = require('./lib/PropertyList'),
      Thunk        = require('./thunk').Thunk,
      Stack        = require('./lib/Stack');


  var Hash        = objects.Hash,
      create      = objects.create,
      hasOwn      = objects.hasOwn,
      isObject    = objects.isObject,
      assign      = objects.assign,
      define      = objects.define,
      inherit     = objects.inherit,
      hide        = objects.hide,
      fname       = functions.fname,
      applyNew    = functions.applyNew,
      iterate     = iteration.iterate,
      each        = iteration.each,
      map         = iteration.map,
      numbers     = utility.numbers,
      uid         = utility.uid,
      nextTick    = utility.nextTick,
      tag         = utility.tag,
      unique      = utility.unique,
      MapData     = collections.MapData,
      WeakMapData = collections.WeakMapData;

  var $$ThrowException = errors.$$ThrowException,
      $$MakeException  = errors.$$MakeException,
      Completion       = errors.Completion,
      AbruptCompletion = errors.AbruptCompletion;

  var $$GetValue = operators.$$GetValue,
      $$ToObject = operators.$$ToObject;

  var Reference                 = operations.Reference,
      $$IsCallable              = operations.$$IsCallable,
      $$Invoke                  = operations.$$Invoke,
      $$EnqueueChangeRecord     = operations.$$EnqueueChangeRecord,
      $$DeliverAllChangeRecords = operations.$$DeliverAllChangeRecords,
      $$CreateListFromArray     = operations.$$CreateListFromArray,
      $$IsStopIteration         = operations.$$IsStopIteration;

  var StringIndex              = descriptors.StringIndex,
      Value                    = descriptors.Value,
      Accessor                 = descriptors.Accessor,
      ArgAccessor              = descriptors.ArgAccessor,
      $$IsAccessorDescriptor   = descriptors.$$IsAccessorDescriptor,
      $$FromPropertyDescriptor = descriptors.$$FromPropertyDescriptor,
      $$ToPropertyDescriptor   = descriptors.$$ToPropertyDescriptor;

  var DeclarativeEnv = environments.DeclarativeEnvironmentRecord,
      ObjectEnv      = environments.ObjectEnvironmentRecord,
      FunctionEnv    = environments.FunctionEnvironmentRecord,
      GlobalEnv      = environments.GlobalEnvironmentRecord;

  var SYMBOLS       = constants.SYMBOLS,
      Break         = SYMBOLS.Break,
      Pause         = SYMBOLS.Pause,
      Throw         = SYMBOLS.Throw,
      Empty         = SYMBOLS.Empty,
      Return        = SYMBOLS.Return,
      Normal        = SYMBOLS.Normal,
      Builtin       = SYMBOLS.Builtin,
      Continue      = SYMBOLS.Continue,
      Uninitialized = SYMBOLS.Uninitialized;

  AbruptCompletion.prototype.Abrupt = SYMBOLS.Abrupt;
  Completion.prototype.Completion   = SYMBOLS.Completion;

  var BRANDS = constants.BRANDS;

  var E = 0x1,
      C = 0x2,
      W = 0x4,
      A = 0x8,
      ___ = 0,
      E__ = 1,
      _C_ = 2,
      EC_ = 3,
      __W = 4,
      E_W = 5,
      _CW = 6,
      ECW = 7,
      __A = 8,
      E_A = 9,
      _CA = 10,
      ECA = 11;


  errors.createError = function(name, type, message){
    return new $Error(name, type, message);
  };


  function noop(){}

  // ###############################
  // ###############################
  // ### Specification Functions ###
  // ###############################
  // ###############################


  function $$MakeConstructor(func, writable, prototype){
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





  var $$PropertyDefinitionEvaluation = (function(){
    function makeDefiner(constructs, field, desc){
      return function(obj, key, code) {

        var sup = code.flags.usesSuper,
            lex = context.LexicalEnvironment,
            home = sup ? obj : undefined,
            $F = code.flags.generator ? $GeneratorFunction : $Function,
            func = new $F('method', key, code.params, code, lex, code.flags.strict, undefined, home, sup);

        constructs && $$MakeConstructor(func);
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

    return function $$PropertyDefinitionEvaluation(kind, obj, key, code){
      if (kind === 'get') {
        return DefineGetter(obj, key, code);
      } else if (kind === 'set') {
        return DefineSetter(obj, key, code);
      } else if (kind === 'method') {
        return DefineMethod(obj, key, code);
      }
    };
  })();


  var mutable = { Value: undefined,
                  Writable: true,
                  Enumerable: true,
                  Configurable: true };

  var immutable = { Value: undefined,
                    Writable: true,
                    Enumerable: true,
                    Configurable: false };

  function $$TopLevelDeclarationInstantiation(code){
    var env = context.VariableEnvironment,
        configurable = code.scopeType === 'eval',
        decls = code.lexDecls;

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
          } else if ($$IsAccessorDescriptor(existing) || !existing.Writable && !existing.Enumerable) {
            return $$ThrowException('global invalid define');
          }
        }

        env.SetMutableBinding(name, $$InstantiateFunctionDeclaration(decl, context.LexicalEnvironment), code.flags.strict);
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


  function getKey(v){
    if (!v || typeof v === 'string') {
      return v;
    }
    if (v[0] !== '@') {
      return v[1];
    }

    return context.getSymbol(v[1]);
  }
  // ## $$ClassDefinitionEvaluation

  function $$ClassDefinitionEvaluation(name, superclass, constructorCode, methods, symbols){
    if (superclass === undefined) {
      var superproto = intrinsics.ObjectProto,
          superctor = intrinsics.FunctionProto;
    } else {
      if (superclass && superclass.Abrupt) return superclass;

      if (superclass === null) {
        superproto = null;
        superctor = intrinsics.FunctionProto;
      } else if (typeof superclass !== 'object') {
        return $$ThrowException('non_object_superclass');
      } else if (!('Construct' in superclass)) {
        superproto = superclass;
        superctor = intrinsics.FunctionProto;
      } else {
        superproto = superclass.Get('prototype');
        if (superproto && superproto.Abrupt) return superproto;

        if (typeof superproto !== 'object') {
          return $$ThrowException('non_object_superproto');
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

      if (result && result.Abrupt) return result;
    }


    if (name) {
      context.LexicalEnvironment.CreateImmutableBinding(name);
    }

    var ctor = $$PropertyDefinitionEvaluation('method', proto, 'constructor', constructorCode);
    if (ctor && ctor.Abrupt) return ctor;

    if (name) {
      context.initializeBinding(name, ctor);
      proto.define(intrinsics.toStringTag, brand);
    }

    $$MakeConstructor(ctor, false, proto);
    ctor.IsClass = true;
    ctor.IsConstructor = true;
    ctor.SetInheritance(superctor);
    ctor.set('name', brand);
    ctor.define('prototype', proto, ___);
    proto.define('constructor', ctor, _CW);
    proto.IsClassProto = true;

    each(methods, function(method){
      $$PropertyDefinitionEvaluation(method.kind, proto, getKey(method.name), method.code);
    });

    return ctor;
  }

  // ## $$InstantiateFunctionDeclaration

  function $$InstantiateFunctionDeclaration(decl, env){
    var code = decl.code,
        $F = code.flags.generator ? $GeneratorFunction : $Function,
        func = new $F('normal', decl.id.name, code.params, code, env, code.flags.strict);

    $$MakeConstructor(func);
    return func;
  }




  function CollectionInitializer(Data, name){
    var data = name + 'Data';
    return function(_, args){
      var object = args[0],
          iterable = args[1];

      object[data] = new Data;

      if (iterable === undefined) {
        return object;
      }

      iterable = $$ToObject(iterable);
      if (iterable && iterable.Abrupt) return iterable;

      var iterator = $$Invoke(intrinsics.iterator, iterable);
      if (iterator && iterator.Abrupt) return iterator;

      var adder = object.Get('set');
      if (adder && adder.Abrupt) return adder;

      if (!$$IsCallable(adder)) {
        return $$ThrowException('called_on_incompatible_object', [name + '.prototype.set']);
      }

      var next;
      while (next = $$ToObject($$Invoke('next', iterator))) {
        if ($$IsStopIteration(next)) {
          return object;
        }

        if (next && next.Abrupt) return next;

        var key = next.Get(0);
        if (key && key.Abrupt) return key;

        var value = next.Get(1);
        if (value && value.Abrupt) return value;

        var status = adder.Call(object, [key, value]);
        if (status && status.Abrupt) return status;
      }
      return object;
    };
  }





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
      this.ThisMode = kind === 'arrow' ? 'lexical' : strict ? 'strict' : 'global';
      this.strict = !!strict;
      this.Realm = realm;
      this.Scope = scope;
      this.code = code;
      tag(code);
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
      code: null,
      Scope: null,
      strict: false,
      ThisMode: 'global',
      Realm: null,
      type: '$Function'
    }, [
      function Call(receiver, args, isConstruct){

        if (realm !== this.Realm) {
          activate(this.Realm);
        }
        if (this.ThisMode === 'lexical') {
          var local = new DeclarativeEnv(this.Scope);
        } else {
          if (this.ThisMode !== 'strict') {
            if (receiver == null) {
              receiver = this.Realm.global;
            } else if (typeof receiver !== 'object') {
              receiver = $$ToObject(receiver);
              if (receiver.Abrupt) return receiver;
            }
          }
          var local = new FunctionEnv(receiver, this);
        }

        var caller = context ? context.callee : null;
        ExecutionContext.push(new ExecutionContext(context, local, realm, this.code, this, args, isConstruct));

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
          return $$ThrowException('construct_arrow_function');
        }
        var prototype = this.Get('prototype');
        if (prototype && prototype.Abrupt) return prototype;

        var instance = typeof prototype === 'object' ? new $Object(prototype) : new $Object;
        if (this.BuiltinConstructor) {
          instance.BuiltinBrand = prototype.BuiltinBrand;
        }

        var result = this.Call(instance, args, true);
        if (result && result.Abrupt) return result;
        return typeof result === 'object' ? result : instance;
      },
      function HasInstance(arg){
        if (typeof arg !== 'object' || arg === null) {
          return false;
        }

        var prototype = this.Get('prototype');
        if (prototype.Abrupt) return prototype;

        if (typeof prototype !== 'object') {
          return $$ThrowException('instanceof_nonobject_proto');
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
      this.BoundTargetFunction = target;
      this.BoundThis = boundThis;
      this.BoundArgs = boundArgs;
      this.define('arguments', intrinsics.ThrowTypeError, __A);
      this.define('caller', intrinsics.ThrowTypeError, __A);
      this.define('length', target.get('length'), ___);
    }

    inherit($BoundFunction, $Function, {
      TargetFunction: null,
      BoundThis: null,
      BoundArgs: null,
      type: '$BoundFunction'
    }, [
      function Call(_, newArgs){
        return this.BoundTargetFunction.Call(this.BoundThis, this.BoundArgs.concat(newArgs));
      },
      function Construct(newArgs){
        var target = this.BoundTargetFunction;
        if (!target.Construct) {
          return $$ThrowException('not_constructor', target.name);
        }
        target.constructCount = (target.constructCount || 0) + 1;
        return target.Construct(this.BoundArgs.concat(newArgs));
      },
      function HasInstance(arg){
        var target = this.BoundTargetFunction;
        if (!target.HasInstance) {
          return $$ThrowException('instanceof_function_expected', target.name);
        }
        return target.HasInstance(arg);
      }
    ]);

    return $BoundFunction;
  })();

  var $GeneratorFunction = (function(){
    function $GeneratorFunction(){
      $Function.apply(this, arguments);
    }

    inherit($GeneratorFunction, $Function, [
      function Call(receiver, args, isConstruct){
        if (realm !== this.Realm) {
          activate(this.Realm);
        }
        if (this.ThisMode === 'lexical') {
          var local = new DeclarativeEnv(this.Scope);
        } else {
          if (this.ThisMode !== 'strict') {
            if (receiver == null) {
              receiver = this.Realm.global;
            } else if (typeof receiver !== 'object') {
              receiver = $$ToObject(receiver);
              if (receiver.Abrupt) return receiver;
            }
          }
          var local = new FunctionEnv(receiver, this);
        }

        var ctx = new ExecutionContext(context, local, this.Realm, this.code, this, args, isConstruct);
        ExecutionContext.push(ctx);

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
      obj.set(name, new $InternalFunction({
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
      setFunction(this, 'next',  function(){ return self.Send() });
      setFunction(this, 'close', function(){ return self.Close() });
      setFunction(this, 'send',  function(v){ return self.Send(v) });
      setFunction(this, 'throw', function(v){ return self.Throw(v) });
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
          return $$ThrowException('generator_executing', 'send');
        } else if (this.State === CLOSED) {
          return $$ThrowException('generator_closed', 'send');
        }
        if (this.State === NEWBORN) {
          if (value !== undefined) {
            return $$ThrowException('generator_send_newborn');
          }
          this.ExecutionContext.currentGenerator = this;
          this.State = EXECUTING;
          ExecutionContext.push(this.ExecutionContext);
          return this.thunk.run(this.ExecutionContext);
        }

        this.State = EXECUTING;
        return $$Resume(this.ExecutionContext, Normal, value);
      },
      function Throw(value){
        if (this.State === EXECUTING) {
          return $$ThrowException('generator_executing', 'throw');
        } else if (this.State === CLOSED) {
          return $$ThrowException('generator_closed', 'throw');
        }
        if (this.State === NEWBORN) {
          this.State = CLOSED;
          this.code = null;
          return new AbruptCompletion(Throw, value);
        }

        this.State = EXECUTING;
        return $$Resume(this.ExecutionContext, Throw, value);
      },
      function Close(value){
        if (this.State === EXECUTING) {
          return $$ThrowException('generator_executing', 'close');
        } else if (this.State === CLOSED) {
          return;
        }

        if (state === NEWBORN) {
          this.State = CLOSED;
          this.code = null;
          return;
        }

        this.State = EXECUTING;
        var result = $$Resume(this.ExecutionContext, Return, value);
        this.State = CLOSED;
        return result;
      }
    ]);


    function $$Resume(ctx, completionType, value){
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
      this.setPrimitiveValue(value);
    }

    inherit($Date, $Object, {
      BuiltinBrand: BRANDS.BuiltinDate,
      type: '$Date'
    }, [
      function getPrimitiveValue(){
        return this.get(this.Realm.intrinsics.DateValue);
      },
      function setPrimitiveValue(value){
        return this.set(this.Realm.intrinsics.DateValue, value);
      }
    ]);

    return $Date;
  })();



  // ###############
  // ### $String ###
  // ###############

  var $String = (function(){
    function $String(value){
      $Object.call(this, intrinsics.StringProto);
      this.setPrimitiveValue(value);
      this.define('length', value.length, ___);
    }

    var ObjectGet = $Object.prototype.get;

    inherit($String, $Object, {
      BuiltinBrand: BRANDS.StringWrapper,
      type: '$String'
    }, [
      function getPrimitiveValue(){
        return ObjectGet.call(this, this.Realm.intrinsics.StringValue) || '';
      },
      function setPrimitiveValue(value){
        return this.set(this.Realm.intrinsics.StringValue, value);
      },

      function each(callback){
        var str = this.getPrimitiveValue();
        for (var i=0; i < str.length; i++) {
          callback([i+'', str[i], E__]);
        }
        $Object.prototype.each.call(this, callback);
      },
      function has(key){
        var str = this.getPrimitiveValue();
        if (key < str.length && key >= 0) {
          return true;
        }
        return $Object.prototype.has.call(this, key);
      },
      function get(key){
        var str = this.getPrimitiveValue();
        if (key < str.length && key >= 0) {
          return str[key];
        }
        return $Object.prototype.get.call(this, key);
      },
      function query(key){
        var str = this.getPrimitiveValue();
        if (key < str.length && key >= 0) {
          return E__;
        }
        return $Object.prototype.query.call(this, key);
      },
      function describe(key){
        var str = this.getPrimitiveValue();
        if (key < str.length && key >= 0) {
          return [key, str[key], E__];
        }
        return $Object.prototype.describe.call(this, key);
      },
      function GetOwnProperty(key){
        var str = this.getPrimitiveValue();
        if (key < str.length && key >= 0) {
          return new StringIndex(str[key]);
        }

        var desc = $Object.prototype.GetOwnProperty.call(this, key);
        if (desc) {
          return desc;
        }
      },
      function Get(key){
        var str = this.getPrimitiveValue();
        if (key < str.length && key >= 0) {
          return str[key];
        }
        return this.GetP(this, key);
      },
      function Enumerate(includePrototype, onlyEnumerable){
        var str = this.getPrimitiveValue();
        var props = $Object.prototype.Enumerate.call(this, includePrototype, onlyEnumerable);
        return unique(numbers(str.length).concat(props));
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
      this.setPrimitiveValue(value);
    }

    inherit($Number, $Object, {
      BuiltinBrand: BRANDS.NumberWrapper,
      type: '$Number'
    }, [
      function getPrimitiveValue(){
        return this.get(this.Realm.intrinsics.NumberValue);
      },
      function setPrimitiveValue(value){
        return this.set(this.Realm.intrinsics.NumberValue, value);
      }
    ]);

    return $Number;
  })();


  // ################
  // ### $Boolean ###
  // ################

  var $Boolean = (function(){
    function $Boolean(value){
      $Object.call(this, intrinsics.BooleanProto);
      this.setPrimitiveValue(value);
    }

    inherit($Boolean, $Object, {
      BuiltinBrand: BRANDS.BooleanWrapper,
      type: '$Boolean'
    }, [
      function getPrimitiveValue(){
        return this.get(this.Realm.intrinsics.BooleanValue);
      },
      function setPrimitiveValue(value){
        return this.set(this.Realm.intrinsics.BooleanValue, value);
      }
    ]);

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




  // ###############
  // ### $RegExp ###
  // ###############

  var $RegExp = (function(){
    function $RegExp(primitive){
      if (!this.properties) {
        $Object.call(this, intrinsics.RegExpProto);
      }
      this.PrimitiveValue = primitive;
    }

    var reflected = assign(new Hash, {
      global:     ['global', false, ___],
      ignoreCase: ['ignoreCase', false, ___],
      lastIndex:  ['lastIndex', 0, __W],
      multiline:  ['multiline', false, ___],
      source:     ['source', '', ___]
    });

    inherit($RegExp, $Object, {
      BuiltinBrand: BRANDS.BuiltinRegExp,
      Match: null
    }, [
      function describe(key){
        if (key in reflected) {
          var prop = reflected[key];
          prop[1] = this.PrimitiveValue[key];
          return prop;
        }
        return this.properties.describe(key);
      },
      function define(key, value, attr){
        if (key in reflected) {
          if (key === 'lastIndex') {
            this.PrimitiveValue.lastIndex = value;
          }
        } else {
          this.properties.define(key, value, attr);
        }
      },
      function get(key){
        if (key in reflected) {
          return this.PrimitiveValue[key];
        }
        return this.properties.get(key);
      },
      function set(key, value){
        if (key in reflected) {
          if (key === 'lastIndex') {
            this.PrimitiveValue.lastIndex = value;
          }
        } else {
          this.properties.set(key, value);
        }
      },
      function query(key){
        if (key in reflected) {
          return reflected[key][2];
        }
        return this.properties.query(key);
      },
      function update(key, attr){
        if (!(key in reflected)) {
          return this.properties.update(key, attr);
        }
      },
      function each(callback){
        for (var k in reflected) {
          var prop = reflected[k];
          prop[1] = this.PrimitiveValue[k];
          callback.call(this, prop);
        }
        this.properties.each(callback, this);
      }
    ]);

    return $RegExp;
  })();


  // ###############
  // ### $Symbol ###
  // ###############

  var $Symbol = (function(){
    var iterator = new (require('./object-model/$Object').$Enumerator)([]),
        prefix = uid();

    function $Symbol(name, isPublic){
      $Object.call(this, intrinsics.SymbolProto);
      this.Name = name;
      this.Private = !isPublic;
      this.gensym = prefix+this.id;
    }

    inherit($Symbol, $Object, {
      BuiltinBrand: BRANDS.BuiltinSymbol,
      Extensible: false,
      Private: true,
      Name: null,
      type: '$Symbol'
    }, [
      function toString(){
        return this.gensym;
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
      },
      function DefaultValue(){
        return '[object Symbol]';
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


  var $StrictArguments = (function(){
    function $StrictArguments(args){
      $Arguments.call(this, args.length);
      for (var i=0; i < args.length; i++) {
        this.define(i+'', args[i], ECW);
      }

      this.define('arguments', intrinsics.ThrowTypeError, __A);
      this.define('caller', intrinsics.ThrowTypeError, __A);
    }

    inherit($StrictArguments, $Arguments);

    return $StrictArguments;
  })();



  var $MappedArguments = (function(){
    function $MappedArguments(args, env, names, func){
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
          if (key === 'caller' && $$IsCallable(val) && val.strict) {
            return $$ThrowException('strict_poison_pill');
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
          return $$ThrowException('strict_lhs_assignment');
        }

        if (this.isMapped && this.ParameterMap.has(key)) {
          if ($$IsAccessorDescriptor(desc)) {
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
        if (result.Abrupt) return result;

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
          var value = $$GetValue(ref);
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

      $Object.call(this, intrinsics.Genesis);
      this.remove('__proto__');
      var self = this;

      each(names, function(name){
        self.define(name, new ModuleGetter(new Reference(object, name)), E_A);
      });
    }

    var fakeProps = { each: function(){} };

    inherit($Module, $Object, {
      BuiltinBrand: BRANDS.BuiltinModule,
      Extensible: false,
      type: '$Module'
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




  var $NativeFunction = (function(){
    function $NativeFunction(options){
      if (typeof options === 'function') {
        options = {
          call: options,
          name: fname(options),
          length: options.length,
          proto: intrinsics.FunctionProto
        };
      }
      if (options.proto === undefined) {
        options.proto = intrinsics.FunctionProto;
      }
      $Object.call(this, options.proto);

      this.define('arguments', null, ___);
      this.define('caller', null, ___);
      this.define('length', options.length, ___);
      this.define('name', options.name, ___);


      if (options.unwrapped) {
        this.Call = options.call;
        if (options.construct) {
          this.Construct = options.construct;
        }
      } else {
        this.call = options.call;
        if (options.construct) {
          this.construct = options.construct;
        }
      }

      this.Realm = realm;
      hide(this, 'Realm');
    }

    inherit($NativeFunction, $Function, {
      Builtin: true,
      type: '$NativeFunction'
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

  var deopt = ['define', 'describe', 'get', 'set', 'query', 'update', 'has', 'remove', 'each'];


  var $InternalFunction = (function(){
    function $InternalFunction(options){
      this.Prototype = intrinsics.FunctionProto;
      this.Realm = realm;
      this.Call = typeof options === 'function' ? options : options.call;
      this.storage = new Hash;
      this.name = options.name || fname(this.Call);
      this.length = options.length || this.Call.length;
    }

    var reflected = assign(new Hash, {
      caller:      ['caller', null, ___],
      'arguments': ['arguments', null, ___],
      length:      ['length', 0, ___],
      name:        ['name', '', ___]
    });

    function deoptimize(target){
      each(deopt, function(key){
        target[key] = $Function.prototype[key];
      });

      target.properties = new PropertyList;
      target.define('arguments', null, ___);
      target.define('caller', null, ___);
      target.define('length', target.length, ___);
      target.define('name', target.name, ___);
    }

    inherit($InternalFunction, $Function, [
      function has(key){
        return key in reflected;
      },
      function get(key){
        if (key === 'name') {
          return this.name;
        } else if (key === 'length') {
          return this.length;
        } else if (key in reflected) {
          return reflected[key][1];
        }
      },
      function describe(key){
        if (key === 'name' || key === 'length') {
          reflected[key][1] = this[key];
        }
        return reflected[key];
      },
      function query(key){
        return key in reflected ? reflected[key][2] : undefined;
      },
      function each(callback){
        for (var key in reflected) {
          if (key === 'name' || key === 'length') {
            reflected[key][1] = this[key];
          }
          callback(reflected[key]);
        }
      },
      function remove(key, attr){
        deoptimize(this);
        return this.remove(key);
      },
      function update(key, attr){
        deoptimize(this);
        return this.update(key, attr);
      },
      function set(key, value){
        deoptimize(this);
        return this.set(key, value);
      },
      (function(){
        return function define(key, value, attr){
          deoptimize(this);
          return this.define(key, value, attr);
        };
      })()
    ]);

    return $InternalFunction;
  })();

  var $WrappedObject = (function(){
    var keys = [],
        values = [];

    function wrap(id, o, proto){
      if (isObject(o)) {
        if (hasOwn(o, id)) {
          return o[id];
        }
        var wrapper = new $WrappedObject(id, o, proto);
        try {
          define(o, id, wrapper);
        } catch (e) {
          var index = keys.indexOf(o);
          if (~index) return values[index];
          keys.push(o);
          values.push(wrapper);
        }
        return wrapper;
      }
      return o;
    }

    natives.add(function wrapperClass(Ctor){
      var symbols = Ctor.Scope.symbols,
          proto = Ctor.get('prototype');

      var get = new $InternalFunction({
        name: symbols.get,
        call: function(obj, args){
          var wrapped = obj.wrapped,
              prop = args[0],
              result = wrap(obj.wrapid, wrapped[prop], proto);

          if (result && result.wrapped && !result.initialized) {
            Ctor.Call(result, [obj, prop], true);
            result.initialized = true;
          }
          return result;
        }
      });

      var set = new $InternalFunction({
        name: symbols.set,
        call: function(obj, args){
          var wrapped = obj.wrapped,
              prop = args[0],
              value = args[1];

          if (value && value.wrapped) {
            value = value.wrapped;
          }

          wrapped[prop] = value;
        }
      });

      proto.define(symbols.get, get);
      proto.define(symbols.set, set);
      var init = wrap(uid(), GLOBAL, proto);
      Ctor.Call(init, [], true);
      init.initialized = true;
      return init;
    });

    function $WrappedObject(id, object, prototype){
      this.Prototype = typeof prototype === 'object' ? prototype : wrap(id, getPrototypeOf(object));
      this.Realm = realm;
      this.properties = new PropertyList;
      this.storage = new Hash;
      this.wrapped = object;
      this.wrapid = id;
      tag(this);
    }

    inherit($WrappedObject, $Object);
  })();

  var ExecutionContext = (function(){
    var $$GetSymbol           = operations.$$GetSymbol,
        $$Element             = operations.$$Element,
        $$SuperReference      = operations.$$SuperReference,
        $$GetThisEnvironment  = operations.$$GetThisEnvironment,
        $$ThisResolution      = operations.$$ThisResolution,
        $$SpreadDestructuring = operations.$$SpreadDestructuring,
        $$GetTemplateCallSite = operations.$$GetTemplateCallSite;

    var strictUnfound = new Hash,
        unfound = new Hash;


    function ExecutionContext(caller, local, realm, code, func, args, isConstruct){
      this.caller = caller;
      this.Realm = realm;
      this.code = code;
      this.LexicalEnvironment = local;
      this.VariableEnvironment = local;
      this.strict = code.flags.strict;
      this.args = args || [];
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
      constructFunction: operations.$$EvaluateConstruct,
      callFunction     : operations.$$EvaluateCall,
      spreadArguments  : operations.$$SpreadArguments,
      spreadArray      : operations.$$SpreadInitialization,
      defineMethod     : $$PropertyDefinitionEvaluation
    });

    define(ExecutionContext.prototype, [
      function pop(){
        if (this === context) {
          context = this.caller;
          return this;
        }
      },
      function calleeName(){
        if (this.callee) {
          return this.callee.Get('name');
        }
        return null;
      },
      function callerName(){
        if (this.caller) {
          return this.caller.calleeName();
        }
        return null;
      },
      function createBinding(name, immutable){
        if (immutable) {
          return this.LexicalEnvironment.CreateImmutableBinding(name);
        }
        return this.LexicalEnvironment.CreateMutableBinding(name, false);
      },
      function initializeBinding(name, value, strict){
        return this.LexicalEnvironment.InitializeBinding(name, value, strict);
      },
      function hasBinding(name){
        return this.LexicalEnvironment.HasBinding(name);
      },
      function popScope(){
        var scope = this.LexicalEnvironment;
        this.LexicalEnvironment = this.LexicalEnvironment.outer;
        return scope;
      },
      function pushScope(){
        this.LexicalEnvironment = new DeclarativeEnv(this.LexicalEnvironment);
      },
      function cloneScope(){
        var scope = this.LexicalEnvironment,
            clone = new DeclarativeEnv(scope.outer);
        for (var k in scope.bindings) {
          clone.bindings[k] = scope.bindings[k];
        }
        for (var k in scope.deletables) {
          clone.deletables[k] = scope.deletables[k];
        }
        for (var k in scope.consts) {
          clone.consts[k] = scope.consts[k];
        }
        this.LexicalEnvironment = clone;
        return scope;
      },
      function replaceScope(scope){
        var oldScope = this.LexicalEnvironment;
        this.LexicalEnvironment = scope;
        return oldScope;
      },
      function pushWith(obj){
        this.LexicalEnvironment = new DeclarativeEnv(this.LexicalEnvironment);
        this.LexicalEnvironment.withBase = obj;
        return obj;
      },
      function createClass(def, superclass){
        this.LexicalEnvironment = new DeclarativeEnv(this.LexicalEnvironment);
        var ctor = $$ClassDefinitionEvaluation(def.name, superclass, def.ctor, def.methods, def.symbols);
        this.LexicalEnvironment = this.LexicalEnvironment.outer;
        return ctor;
      },
      function createFunction(isExpression, name, code){
        var $F = code.flags.generator ? $GeneratorFunction : $Function,
            env = this.LexicalEnvironment;

        if (isExpression && name) {
          env = new DeclarativeEnv(env);
          env.CreateImmutableBinding(name);
        }

        var func = new $F(code.lexicalType, name, code.params, code, env, code.flags.strict);

        if (code.lexicalType !== 'arrow') {
          $$MakeConstructor(func);
          isExpression && name && env.InitializeBinding(name, func);
        }

        return func;
      },
      function createArguments(args, env, params, func){
        if (env === undefined) {
          return new $StrictArguments(args);
        } else {
          return new $MappedArguments(args, env, params, func);
        }
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
        return $$Element(this, name, obj);
      },
      function getReference(name){
        var origin = this.LexicalEnvironment || this.VariableEnvironment,
            cache = origin.cache;

        if (cache) {
          if (name in cache) {
            return cache[name];
          }
        } else {
          cache = origin.cache = new Hash;
        }


        var lex = origin,
            strict = this.strict;

        do {
          if (lex.HasBinding(name)) {
            return cache[name] = new Reference(lex, name, strict);
          }
        } while (lex = lex.outer)

        cache = strict ? strictUnfound : unfound;
        if (name in cache) {
          return cache[name];
        }
        return cache[name] = new Reference(undefined, name, strict);
      },
      function getSuperReference(name){
        return $$SuperReference(this, name);
      },
      function getThisEnvironment(){
        return $$GetThisEnvironment(this);
      },
      function getThis(){
        return $$ThisResolution(this);
      },
      function destructureSpread(target, index){
        return $$SpreadDestructuring(this, target, index);
      },
      function getTemplateCallSite(template){
        return $$GetTemplateCallSite(this, template);
      },
      function getSymbol(name){
        return $$GetSymbol(this, name) || $$ThrowException('undefined_symbol', name);
      },
      function createSymbol(name, isPublic){
        return new $Symbol(name, isPublic);
      },
      function initializeSymbolBinding(name, symbol){
        return this.LexicalEnvironment.InitializeSymbolBinding(name, symbol);
      }
    ]);


    natives.add({
      _callerName: function(){
        return context.callerName();
      },
      _IsConstructCall: function(){
        return context.isConstruct;
      }
    });

    return ExecutionContext;
  })();




  function notify(changeRecord){
    if (!('ChangeObservers' in this)) {
      return $$ThrowException('called_on_incompatible_object', ['Notifier.prototype.notify']);
    }

    changeRecord = $$ToObject(changeRecord);
    var type = changeRecord.Get('type');
    if (typeof type !== 'string') {
      return  $$ThrowException('changerecord_type', [typeof type]);
    }

    var changeObservers = this.ChangeObservers;
    if (changeObservers.size) {
      var target = this.Target,
          newRecord = new $Object,
          keys = changeRecord.Enumerate(true, true);

      newRecord.define('object', target, 1);
      for (var i=0; i < keys.length; i++) {
        newRecord.define(keys[i], changeRecord.Get(keys[i]), 1);
      }

      newRecord.PreventExtensions();
      $$EnqueueChangeRecord(newRecord, changeObservers);
    }
  }


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
      $Array            : $Array,
      $Boolean          : $Boolean,
      $BoundFunction    : $BoundFunction,
      $Date             : $Date,
      $Error            : $Error,
      $Function         : $Function,
      $Generator        : $Generator,
      $GeneratorFunction: $GeneratorFunction,
      $InternalFunction : $InternalFunction,
      $Map              : $Map,
      $Module           : $Module,
      $NativeFunction   : $NativeFunction,
      $Number           : $Number,
      $Object           : $Object,
      $Proxy            : $Proxy,
      $RegExp           : $RegExp,
      $Set              : $Set,
      $Symbol           : $Symbol,
      $String           : $String,
      $TypedArray       : $TypedArray,
      $WeakMap          : $WeakMap,
      MapData           : MapData,
      WeakMapData       : WeakMapData,
      DeclarativeEnv    : DeclarativeEnv,
      ObjectEnv         : ObjectEnv,
      FunctionEnv       : FunctionEnv,
      GlobalEnv         : GlobalEnv,
      ExecutionContext  : ExecutionContext
    };

    function FunctionPrototypeCall(){}
    function FunctionPrototypeHasInstance(){
      return false;
    }

    function $$CreateThrowTypeError(realm){
      var thrower = create($NativeFunction.prototype);
      $Object.call(thrower, realm.intrinsics.FunctionProto);
      thrower.call = function(){
        return $$ThrowException('strict_poison_pill');
      };
      thrower.define('length', 0, ___);
      thrower.define('name', 'ThrowTypeError', ___);
      thrower.Realm = realm;
      thrower.Extensible = false;
      thrower.IsStrictThrower = true;
      thrower.strict = true;
      hide(thrower, 'Realm');
      return new Accessor(thrower);
    }

    var primitives = {
      RegExp: RegExp.prototype,
    };

    function Intrinsics(realm){
      DeclarativeEnv.call(this, null);
      this.Realm = realm;
      realm.natives = this;
      realm.intrinsics = this.bindings;
      activate(realm);
      intrinsics.Genesis = new $Object(null);
      intrinsics.Genesis.HiddenPrototype = true;
      intrinsics.ObjectProto = new $Object(intrinsics.Genesis);
      intrinsics.global = global = operators.global = realm.global = new $Object(intrinsics.ObjectProto);
      intrinsics.global.BuiltinBrand = BRANDS.GlobalObject;
      realm.globalEnv = new GlobalEnv(intrinsics.global);
      realm.globalEnv.Realm = realm;

      for (var k in $builtins) {
        var prototype = intrinsics[k + 'Proto'] = create($builtins[k].prototype);
        $Object.call(prototype, intrinsics.ObjectProto);
        if (k in primitives) {
          prototype.PrimitiveValue = primitives[k];
        }
      }


      for (var i=0; i < 6; i++) {
        var prototype = intrinsics[$errors[i] + 'Proto'] = create($Error.prototype);
        $Object.call(prototype, intrinsics.ErrorProto);
        prototype.define('name', $errors[i], _CW);
      }

      intrinsics.StopIteration = new $Object(intrinsics.ObjectProto);
      intrinsics.StopIteration.BuiltinBrand = BRANDS.StopIteration;

      intrinsics.FunctionProto.FormalParameters = [];
      intrinsics.FunctionProto.Call = FunctionPrototypeCall;
      intrinsics.FunctionProto.HasInstance = FunctionPrototypeHasInstance;
      intrinsics.FunctionProto.BuiltinBrand = BRANDS.BuiltinFunction;
      intrinsics.FunctionProto.Scope = realm.globalEnv;
      intrinsics.FunctionProto.Realm = realm;
      intrinsics.ThrowTypeError = $$CreateThrowTypeError(realm);

      intrinsics.ArrayProto.array = [];
      intrinsics.ArrayProto.length = ['length', 0, __W];

      intrinsics.ErrorProto.define('name', 'Error', _CW);
      intrinsics.ErrorProto.define('message', '', _CW);

      intrinsics.ObserverCallbacks = new MapData;
      intrinsics.NotifierProto = new $Object(intrinsics.ObjectProto);
      intrinsics.NotifierProto.define('notify', new $NativeFunction(notify), _CW);
    }

    inherit(Intrinsics, DeclarativeEnv, {
      type: 'Intrinsics'
    }, [
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


  var Script = (function(){
    function ParseOptions(o){
      if (o) {
        for (var k in o) {
          if (k in this) {
            this[k] = o[k];
          }
        }
      }
    }

    ParseOptions.prototype = {
      loc     : true,
      range   : true,
      raw     : false,
      comment : false,
      tokens  : false,
      tolerant: false
    };

    function parse(src, origin, type, options){
      try {
        return esprima.parse(src, options ? new ParseOptions(options) : ParseOptions.prototype);
      } catch (e) {
        if (!realm || !intrinsics) return e;
        var err = new $Error('SyntaxError', undefined, e.message),
            loc = { line: e.lineNumber, column: e.column  };

        err.setCode({ start: loc, end: loc }, src);
        err.setOrigin(origin, type);
        return new AbruptCompletion('throw', err);
      }
    }

    natives.add({
      parse: function(src, loc, range, raw, tokens, comment, tolerant, source){
        var ast = parse(src, source, 'script', {
          loc     : !!loc,
          range   : !!range,
          raw     : !!raw,
          tokens  : !!tokens,
          comment : !!comment,
          tolerant: !!tolerant
        });

        if (ast.Abrupt) return ast;
        return fromInternal(ast);
      }
    });

    var load = (function(){
      if (typeof process !== 'undefined') {
        var fs = require('fs');
        return function load(source){
          if (!~source.indexOf('\n') && fs.existsSync(source)) {
            return { scope: 'global', source: fs.readFileSync(source, 'utf8'), filename: source };
          } else {
            return { scope: 'global', source: source, filename: '' };
          }
        };
      }
      return function load(source){
        return { scope: 'global', source: source, filename: '' };
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
            scope: 'function',
            filename: '',
            source: '('+options+')()'
          }
        } else {
          options = {
            scope: 'function',
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
      if (options.eval || options.scope === 'eval') {
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
        tag(this.bytecode);
        this.thunk = new Thunk(this.bytecode);
      }
      return this;
    }

    define(Script, [parse]);

    return Script;
  })();


  function fromInternal(object){
    if (typeof object === 'function') {
      return new $InternalFunction(object);
    } else if (object === null || typeof object !== 'object') {
      return object;
    } else if (object instanceof RegExp) {
      return new $RegExp(object);
    } else if (object instanceof Number) {
      return new $Number(object);
    } else if (object instanceof String) {
      return new $String(object);
    } else if (object instanceof Boolean) {
      return new $Boolean(object);
    } else if (object instanceof Array) {
      var out = new $Array;
      each(object, function(item, index){
        out.set(index, fromInternal(item));
      });
      return out;
    }

    var out = new $Object;
    each(object, function(val, key){
      out.set(key, fromInternal(val));
    });
    return out;
  }


  var Realm = (function(){
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

    natives.add({
      _eval: (function(){
        function builtinEval(obj, args, direct){
          var code = args[0];
          if (typeof code !== 'string') {
            return code;
          }

          var script = new Script({
            scope: 'eval',
            natives: false,
            strict: context.strict,
            source: code
          });

          if (script.error) {
            return script.error;
          }

          if (direct) {
            return script.thunk.run(context);
          }

          ExecutionContext.push(new ExecutionContext(context, realm.globalEnv, realm, script.bytecode));
          var result = script.thunk.run(context);
          ExecutionContext.pop();
          return result;
        }
        builtinEval.isBuiltinEval = true;
        return builtinEval;
      })(),
      _FunctionCreate: function(obj, args){
        var body = args.pop();

        var script = new Script({
          scope: 'global',
          natives: false,
          source: '(function anonymous('+args.join(', ')+') {\n'+body+'\n})'
        });

        if (script.error) {
          return script.error;
        }

        ExecutionContext.push(new ExecutionContext(context, realm.globalEnv, realm, script.bytecode));
        var func = script.thunk.run(context);
        ExecutionContext.pop();
        return func;
      },
      _BoundFunctionCreate: function(obj, args){
        return new $BoundFunction(args[0], args[1], $$CreateListFromArray(args[2]));
      },
      _BooleanCreate: function(obj, args){
        return new $Boolean(args[0]);
      },
      _DateCreate: function(obj, args){
        return new $Date(applyNew(Date, args));
      },
      _NumberCreate: function(obj, args){
        return new $Number(args[0]);
      },
      _ObjectCreate: function(obj, args){
        return new $Object(args[0] === null ? intrinsics.Genesis : args[0]);
      },
      _ProxyCreate: function(obj, args){
        return new $Proxy(args[0], args[1]);
      },
      _SymbolCreate: function(obj, args){
        return new $Symbol(args[0], args[1]);
      },
      _StringCreate: function(obj, args){
        return new $String(args[0]);
      },
      _RegExpCreate: function(obj, args){
        var pattern = args[0],
            flags   = args[1];

        if (typeof pattern === 'object') {
          pattern = pattern.PrimitiveValue;
        }
        try {
          var result = new RegExp(pattern, flags);
        } catch (e) {
          return $$ThrowException('invalid_regexp', [pattern+'']);
        }
        return new $RegExp(result);
      },
      _MapInitialization: CollectionInitializer(MapData, 'Map'),
      _WeakMapInitialization: CollectionInitializer(WeakMapData, 'WeakMap'),
      EvaluateModule: function(loader, source, name, callback, errback){
        if (!callback && !errback) {
          var result, thrown;

          realm.evaluateModule(loader, source, name,
            function(module){ result = module },
            function(error){ result = error; thrown = true; }
          );

          return thrown ? new AbruptCompletion('throw', result) : result;
        } else {
          realm.evaluateModule(loader, source, name, wrapFunction(callback), wrapFunction(errback));
        }
      },
      _ToModule: function(obj, args){
        if (args[0].BuiltinBrand === BRANDS.BuiltinModule) {
          return args[0];
        }
        return new $Module(args[0], args[0].Enumerate(false, false));
      },
      _Fetch: function(obj, args){
        var result = require('./builtins')[args[0]];
        if (!result) {
          result = new $Error('Error', undefined, 'Unable to locate module "'+args[0]+'"');
        }
        args[1].Call(undefined, [result]);
      }
    });

    function deliverChangeRecordsAndReportErrors(){
      var observerResults = $$DeliverAllChangeRecords();
      if (observerResults && observerResults instanceof Array) {
        each(observerResults, function(error){
          realm.emit('throw', error);
        });
      }
    }

    var mutationScopeInit = new Script('void 0');

    function initialize(realm, Ω, ƒ){
      if (realm.initialized) Ω();
      var builtins = require('./builtins'),
          init = builtins['@@internal'] + '\n\n'+ builtins['@system'];

      var fakeLoader = {
        Get: function(key){
          if (key === 'global') return realm.global;
          if (key === 'baseURL') return '';
        }
      };


      realm.state = 'initializing';
      realm.initialized = true;
      realm.mutationScope = new ExecutionContext(null, realm.globalEnv, realm, mutationScopeInit.bytecode);
      resolveModule(fakeLoader, init, '@system', Ω, ƒ);
    }

    function prepareToRun(bytecode, scope){
      if (!scope) {
        var realm = createSandbox(realm.global);
        scope = realm.globalEnv;
      } else {
        var realm = scope.Realm;
      }
      ExecutionContext.push(new ExecutionContext(null, scope, realm, bytecode));
      var status = $$TopLevelDeclarationInstantiation(bytecode);
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
        deliverChangeRecordsAndReportErrors();
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
          deliverChangeRecordsAndReportErrors();
          ExecutionContext.pop();
        }
      }
      return toggle;
    }

    function resolveImports(loader, code, Ω, ƒ){
      var modules = new Hash;
      if (code.imports && code.imports.length) {
        var load = loader.Get('load'),
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
                sandbox = createSandbox(global, loader);

            runScript(sandbox, { bytecode: code }, function(){
              var module = new $Module(sandbox.globalEnv, code.exportedNames);
              module.mrl = code.name;
              callback.Call(null, [module]);
            }, errback.Call);
          } else {
            var origin = imported.origin;
            if (typeof origin !== 'string' && origin instanceof Array) {

            } else {
              load.Call(loader, [imported.origin, callback, errback]);
            }
          }
        });
      } else {
        Ω(modules);
      }
    }

    function createSandbox(object, loader){
      var outerRealm = object.Realm || object.Prototype.Realm,
          bindings = new $Object,
          scope = new GlobalEnv(bindings),
          realm = scope.Realm = bindings.Realm = create(outerRealm);

      bindings.BuiltinBrand = BRANDS.GlobalObject;
      scope.outer = outerRealm.globalEnv;
      realm.global = bindings;
      realm.globalEnv = scope;
      if (loader) {
        realm.loader = loader;
      }
      return realm;
    }


    function runScript(realm, script, Ω, ƒ){
      var scope = realm.globalEnv,
          ctx = new ExecutionContext(context, scope, realm, script.bytecode);

      ExecutionContext.push(ctx);
      var status = $$TopLevelDeclarationInstantiation(script.bytecode);
      context === ctx && ExecutionContext.pop();

      if (status && status.Abrupt) {
        return ƒ(status);
      }

      resolveImports(realm.loader, script.bytecode, function(modules){
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
                  obj = obj.Get(part);
                });

                scope.SetMutableBinding(name, obj);
              }
            });
          }
        });

        ExecutionContext.push(ctx);
        script.thunk || (script.thunk = new Thunk(script.bytecode));
        var result = run(realm, script.thunk, script.bytecode);
        context === ctx && ExecutionContext.pop();

        if (result && result.Abrupt) {
          ƒ(result);
        } else {
          Ω(result);
        }
      }, ƒ);
    }

    function resolveModule(loader, source, name, Ω, ƒ){
      var script = new Script({
        name: name,
        natives: true,
        source: source,
        scope: 'module'
      });


      if (script.error) {
        return ƒ(script.error);
      }

      realm.scripts.push(script);

      var sandbox = createSandbox(loader.Get('global'), loader);

      runScript(sandbox, script, function(){
        Ω(new $Module(sandbox.globalEnv, script.bytecode.exportedNames));
      }, ƒ);
    }


    function Realm(oncomplete){
      var self = this;

      Emitter.call(this);
      realms.push(this);
      this.active        = false;
      this.quiet         = false;
      this.initialized   = false;
      this.mutationScope = null;
      this.scripts       = [];
      this.templates     = {};
      this.state         = 'bootstrapping';

      new Intrinsics(this);

      hide(intrinsics.FunctionProto, 'Scope');
      hide(this, 'intrinsics');
      hide(this, 'natives');
      hide(this, 'templates');
      hide(this, 'scripts');
      hide(this, 'globalEnv');
      hide(this, 'initialized');
      hide(this, 'quiet');
      hide(this, 'mutationScope');

      iterate(natives, function(item){
        var key   = item[0],
            value = item[1],
            name  = key[0] === '_' ? key.slice(1) : key;

        intrinsics[name] = new $NativeFunction({
          unwrapped: key[0] === '_',
          length   : value.length,
          name     : name,
          call     : value
        });
      });

      function init(){
        initialize(self, function(){
          intrinsics.DateProto.set(intrinsics.DateValue, Date.prototype);
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
      function evaluateModule(loader, source, name, callback, errback){
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

        resolveModule(loader, source, name, callback, errback);
      },
      function evaluateAsync(subject, callback, errback){
        var script = new Script(subject),
            self = this;

        callback || (callback = noop);
        errback  || (errback = callback);

        if (script.error) {
          nextTick(function(){
            self.emit(script.error.type, script.error);
            errback(script.error);
          });
        } else {
          this.scripts.push(script);
          runScript(this, script, function(result){
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

        var completionType = result && result.Abrupt ? 'throw' : 'complete';
        this.emit(completionType, result);
        return result;
      }
    ]);

    return Realm;
  })();


  var realms = [],
      realmStack = [],
      realm = null,
      global = null,
      context = null,
      intrinsics = null;

  function activate(target){
    if (realm !== target) {
      if (realm) {
        realm.active = false;
        realm.emit('deactivate');
      }
      realmStack.push(realm);
      exports.realm = realm = target;
      exports.global = global = operators.global = target.global;
      exports.intrinsics = intrinsics = target.intrinsics;
      target.active = true;
      target.emit('activate');
      $Object.changeRealm(target);
      $Array.changeRealm(target);
      operations.changeRealm(target);
    }
  }

  function deactivate(target){
    if (realm === target && realmStack.length) {
      target.active = false;
      realm = realmStack.pop();
      target.emit('dectivate');
    }
  }


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
