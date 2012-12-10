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
      $Object      = require('./object-model/$Object'),
      $Proxy       = require('./object-model/$Proxy'),
      Emitter      = require('./lib/Emitter'),
      buffers      = require('./lib/buffers'),
      PropertyList = require('./lib/PropertyList'),
      Thunk        = require('./thunk').Thunk,
      Stack        = require('./lib/Stack');

  var Hash          = objects.Hash,
      DataView      = buffers.DataView,
      ArrayBuffer   = buffers.ArrayBuffer,
      create        = objects.create,
      hasOwn        = objects.hasOwn,
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
      map           = iteration.map,
      numbers       = utility.numbers,
      nextTick      = utility.nextTick,
      tag           = utility.tag,
      unique        = utility.unique,
      MapData       = collections.MapData,
      WeakMapData   = collections.WeakMapData;

  var ThrowException   = errors.ThrowException,
      MakeException    = errors.MakeException,
      Completion       = errors.Completion,
      AbruptCompletion = errors.AbruptCompletion;

  var GetValue         = operators.GetValue,
      PutValue         = operators.PutValue,
      GetThisValue     = operators.GetThisValue,
      ToObject         = operators.ToObject,
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

  var Reference               = operations.Reference,
      CheckObjectCoercible    = operations.checkObjectCoercible,
      IsArrayIndex            = operations.isArrayIndex,
      GetSymbol               = operations.getSymbol,
      Element                 = operations.element,
      SuperReference          = operations.superReference,
      GetThisEnvironment      = operations.getThisEnvironment,
      ThisResolution          = operations.thisResolution,
      IdentifierResolution    = operations.identifierResolution,
      IsCallable              = operations.isCallable,
      IsConstructor           = operations.isConstructor,
      Invoke                  = operations.invoke,
      SpreadDestructuring     = operations.spreadDestructuring,
      GetTemplateCallSite     = operations.getTemplateCallSite,
      EnqueueChangeRecord     = operations.enqueueChangeRecord,
      DeliverAllChangeRecords = operations.deliverAllChangeRecords,
      IsStopIteration         = operations.isStopIteration;

  var StringIndex            = descriptors.StringIndex,
      ArrayBufferIndex       = descriptors.ArrayBufferIndex,
      Value                  = descriptors.Value,
      Accessor               = descriptors.Accessor,
      ArgAccessor            = descriptors.ArgAccessor,
      IsAccessorDescriptor   = descriptors.isAccessorDescriptor,
      FromPropertyDescriptor = descriptors.fromPropertyDescriptor,
      ToPropertyDescriptor   = descriptors.toPropertyDescriptor;

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





  var PropertyDefinitionEvaluation = (function(){
    function makeDefiner(constructs, field, desc){
      return function(obj, key, code) {

        var sup = code.flags.usesSuper,
            lex = context.LexicalEnvironment,
            home = sup ? obj : undefined,
            $F = code.flags.generator ? $GeneratorFunction : $Function,
            func = new $F('method', key, code.params, code, lex, code.flags.strict, undefined, home, sup);

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


  var mutable = { Value: undefined,
                  Writable: true,
                  Enumerable: true,
                  Configurable: true };

  var immutable = { Value: undefined,
                    Writable: true,
                    Enumerable: true,
                    Configurable: false };

  function TopLevelDeclarationInstantiation(code){
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

    each(methods, function(method){
      PropertyDefinitionEvaluation(method.kind, proto, getKey(method.name), method.code);
    });

    return ctor;
  }

  // ## InstantiateFunctionDeclaration

  function InstantiateFunctionDeclaration(decl, env){
    var code = decl.code,
        $F = code.flags.generator ? $GeneratorFunction : $Function,
        func = new $F('normal', decl.id.name, code.params, code, env, code.flags.strict);

    MakeConstructor(func);
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

      iterable = ToObject(iterable);
      if (iterable && iterable.Abrupt) return iterable;

      var iterator = Invoke(intrinsics.iterator, iterable);
      if (iterator && iterator.Abrupt) return iterator;

      var adder = object.Get('set');
      if (adder && adder.Abrupt) return adder;

      if (!IsCallable(adder)) {
        return ThrowException('called_on_incompatible_object', [name + '.prototype.set']);
      }

      var next;
      while (next = ToObject(Invoke('next', iterator))) {
        if (IsStopIteration(next)) {
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
              receiver = ToObject(receiver);
              if (receiver.Completion) {
                if (receiver.Abrupt) return receiver; else receiver = receiver.value;
              }
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
      this.TargetFunction = target;
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
        return this.TargetFunction.Call(this.BoundThis, this.BoundArgs.concat(newArgs));
      },
      function Construct(newArgs){
        if (!this.TargetFunction.Construct) {
          return ThrowException('not_constructor', this.TargetFunction.name);
        }
        return this.TargetFunction.Construct(this.BoundArgs.concat(newArgs));
      },
      function HasInstance(arg){
        if (!this.TargetFunction.HasInstance) {
          return ThrowException('instanceof_function_expected', this.TargetFunction.name);
        }
        return This.TargetFunction.HasInstance(arg);
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
              receiver = ToObject(receiver);
              if (receiver.Completion) {
                if (receiver.Abrupt) return receiver; else receiver = receiver.value;
              }
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
      this.Date = value;
    }

    inherit($Date, $Object, {
      BuiltinBrand: BRANDS.BuiltinDate,
      type: '$Date'
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
      PrimitiveValue: undefined,
      type: '$String'
    }, [
      function each(callback){
        var str = this.PrimitiveValue;
        for (var i=0; i < str.length; i++) {
          callback([i+'', str[i], E__]);
        }
        $Object.prototype.each.call(this, callback);
      },
      function has(key){
        var str = this.PrimitiveValue;
        if (key < str.length && key >= 0) {
          return true;
        }
        return $Object.prototype.has.call(this, key);
      },
      function get(key){
        var str = this.PrimitiveValue;
        if (key < str.length && key >= 0) {
          return str[key];
        }
        return $Object.prototype.get.call(this, key);
      },
      function query(key){
        var str = this.PrimitiveValue;
        if (key < str.length && key >= 0) {
          return E__;
        }
        return $Object.prototype.query.call(this, key);
      },
      function describe(key){
        var str = this.PrimitiveValue;
        if (key < str.length && key >= 0) {
          return [key, str[key], E__];
        }
        return $Object.prototype.describe.call(this, key);
      },
      function GetOwnProperty(key){
        var str = this.PrimitiveValue;
        if (key < str.length && key >= 0) {
          return new StringIndex(str[key]);
        }

        var desc = $Object.prototype.GetOwnProperty.call(this, key);
        if (desc) {
          return desc;
        }
      },
      function Get(key){
        var str = this.PrimitiveValue;
        if (key < str.length && key >= 0) {
          return str[key];
        }
        return this.GetP(this, key);
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
      PrimitiveValue: undefined,
      type: '$Number'
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
      PrimitiveValue: undefined,
      type: '$Boolean'
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
    var iterator = new $Object.$Enumerator([]);

    function $Symbol(name, isPublic){
      $Object.call(this, intrinsics.SymbolProto);
      this.Name = name;
      this.Private = !isPublic;
    }

    inherit($Symbol, $Object, {
      BuiltinBrand: BRANDS.BuiltinSymbol,
      Extensible: false,
      Private: true,
      Name: null,
      type: '$Symbol'
    }, [
      function toString(){
        return this.id;
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
      return index < max && (index >>> 0) === index;
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
              callback.call(this, [i+'', this.data[i], 5]);
            }
            this.properties.each(callback, this);
          },
          function get(key){
            if (hasIndex(key, this.Length)) {
              return this.data[+key];
            } else {
              return this.properties.get(key);
            }
          },
          function describe(key){
            if (hasIndex(key, this.Length)) {
              return [key, this.data[+key], 5];
            } else {
              return this.properties.describe(key);
            }
          },
          function set(key, value){
            if (hasIndex(key, this.Length)) {
              this.data[+key] = value;
            } else {
              return this.properties.set(key, value);
            }
          },
          (function(){ // IE6-8 leaks function expression names to surrounding scope
            return function define(key, value, attr){
              if (hasIndex(key, this.Length)) {
                this.data[+key] = value;
              } else {
                return this.properties.define(key, value, attr);
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
              callback.call(this, [i+'', this.data.get(i * this.bytesPer, true), 5]);
            }
            this.properties.each(callback, this);
          },
          function get(key){
            if (hasIndex(key, this.Length)) {
              return this.data.get(key * this.bytesPer, true);
            } else {
              return this.properties.get(key);
            }
          },
          function describe(key){
            if (hasIndex(key, this.Length)) {
              return [key, this.data.get(key * this.bytesPer, true), 5];
            } else {
              return this.properties.describe(key);
            }
          },
          function set(key, value){
            if (hasIndex(key, this.Length)) {
              this.data.set(key * this.bytesPer, value, true);
            } else {
              return this.properties.set(key, value);
            }
          },
          (function(){ // IE6-8 leaks function expression names to surrounding scope
            return function define(key, value, attr){
              if (hasIndex(key, this.Length)) {
                this.data.set(key * this.bytesPer, value, true);
              } else {
                return this.properties.define(key, value, attr);
              }
            };
          })()
        ]);
      }();
    }


    define($TypedArray.prototype, [
      function has(key){
        if (hasIndex(key, this.Length)) {
          return true;
        }

        return this.properties.has(key);
      },
      function GetOwnProperty(key){
        if (hasIndex(key, this.Length)) {
          return new ArrayBufferIndex(this.get(key));
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


  var $InternalArray = (function(){
    function $InternalArray(array){
      this.Prototype = intrinsics.ArrayProto;

      if (typeof array === 'number') {
        this.array = new Array(array);
      } else if (array) {
        this.array = array;
      } else {
        this.array = [];
      }
      this.length = ['length', this.array.length, __W];
    }

    function deoptimize(target){
      target.properties = new PropertyList;
      each(deopt, function(key){
        target[key] = $Array.prototype[key];
      });
      var len = target.array.length;
      for (var i=0; i < len; i++) {
        if (i in target.array) {
          target.define(i+'', target.array[i], ECW);
        }
      }
      target.define('length', target.array.length, __W);
    }

    inherit($InternalArray, $Array, [
      function get(key){
        if (key === 'length') {
          return this.array.length;
        } else if ((key >>> 0) == key) {
          return this.array[key];
        }
      },
      function has(key){
        return key === 'length' || (key >>> 0) == key && key in this.array;
      },
      function remove(key){
        if (key === 'length') {
          return false;
        } else if ((key >>> 0) == key && key < this.array.length) {
          delete this.array[key];
          return true;
        }
        return false;
      },
      function describe(key){
        if (key === 'length') {
          this.length[1] = this.array.length;
          return this.length;
        } else if ((key >>> 0) == key) {
          return [key, this.array[key], ECW];
        }
      },
      function query(key){
        if (key === 'length') {
          return __W;
        } else if ((key >>> 0) == key && key in this.array) {
          return ECW;
        }
      },
      function update(key, attr){
        if (attr === __W && key === 'length') {
          return true;
        } else if (attr === ECW && (key >>> 0) == key) {
          return true;
        }
        return false;
      },
      function set(key, value){
        if (key === 'length') {
          this.length[1] = this.array.length = value;
          return true;
        } else if ((key >>> 0) == key) {
          this.array[key] = value;
          return true;
        }
        deoptimize(this);
        return this.set(key, value);
      },
      function define(key, value, attr){
        if (key === 'length' && attr === __W) {
          this.length[1] = this.array.length = value;
          return true;
        } else if (attr === ECW && (key >>> 0) == key) {
          this.array[key] = value;
          return true;
        }
        deoptimize(this);
        return this.define(key, value, attr);
      },
      function each(callback){
        var len = this.length[1] = this.array.length;

        for (var i=0; i < len; i++) {
          callback([i+'', this.array[i], ECW]);
        }
        callback(this.length);
      },
      function lower(){
        return this.array;
      }
    ]);


    return $InternalArray;
  })();


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

  var ExecutionContext = (function(){
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
      constructFunction: operations.evaluateConstruct,
      callFunction: operations.evaluateCall,
      spreadArguments: operations.spreadArguments,
      spreadArray: operations.spreadInitialization,
      defineMethod: PropertyDefinitionEvaluation
    });

    define(ExecutionContext.prototype, [
      function pop(){
        if (this === context) {
          context = this.caller;
          return this;
        }
      },
      function createBinding(name, immutable){
        if (immutable) {
          return this.LexicalEnvironment.CreateImmutableBinding(name);
        } else {
          return this.LexicalEnvironment.CreateMutableBinding(name, false);
        }
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
        var ctor = ClassDefinitionEvaluation(def.name, superclass, def.ctor, def.methods, def.symbols);
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
          MakeConstructor(func);
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
        return Element(this, name, obj);
      },
      function getReference(name){
        var origin = this.LexicalEnvironment || this.VariableEnvironment;
        origin.cache || (origin.cache = new Hash);
        if (name in origin.cache) {
          return origin.cache[name];
        }

        var lex = origin,
            strict = this.strict;

        do {
          if (lex.HasBinding(name)) {
            return origin.cache[name] = new Reference(lex, name, strict);
          }
        } while (lex = lex.outer)
        return new Reference(undefined, name, strict);
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




  function notify(changeRecord){
    if (!('ChangeObservers' in this)) {
      return ThrowException('called_on_incompatible_object', ['Notifier.prototype.notify']);
    }

    changeRecord = ToObject(changeRecord);
    var type = changeRecord.Get('type');
    if (typeof type !== 'string') {
      return  ThrowException('changerecord_type', [typeof type]);
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
      EnqueueChangeRecord(newRecord, changeObservers);
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
      $InternalArray    : $InternalArray,
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



    function CreateThrowTypeError(realm){
      var thrower = create($NativeFunction.prototype);
      $Object.call(thrower, realm.intrinsics.FunctionProto);
      thrower.call = function(){ return ThrowException('strict_poison_pill') };
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
      Date   : Date.prototype,
      RegExp : RegExp.prototype,
      String : '',
      Number : 0,
      Boolean: false
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

      intrinsics.StopIteration = new $Object(intrinsics.ObjectProto);
      intrinsics.StopIteration.BuiltinBrand = BRANDS.StopIteration;

      for (var i=0; i < 6; i++) {
        var prototype = intrinsics[$errors[i] + 'Proto'] = create($Error.prototype);
        $Object.call(prototype, intrinsics.ErrorProto);
        prototype.define('name', $errors[i], _CW);
      }

      intrinsics.FunctionProto.FormalParameters = [];
      intrinsics.FunctionProto.Call = function(){};
      intrinsics.FunctionProto.HasInstance = function(){ return false };
      intrinsics.FunctionProto.BuiltinBrand = BRANDS.BuiltinFunction;
      intrinsics.FunctionProto.Scope = realm.globalEnv;
      intrinsics.FunctionProto.Realm = realm;
      intrinsics.ArrayProto.define('length', 0, __W);
      intrinsics.ErrorProto.define('name', 'Error', _CW);
      intrinsics.ErrorProto.define('message', '', _CW);
      intrinsics.ThrowTypeError = CreateThrowTypeError(realm);
      intrinsics.ObserverCallbacks = new MapData;
      intrinsics.NotifierProto = new $Object(intrinsics.ObjectProto);
      intrinsics.NotifierProto.define('notify', new $NativeFunction(notify), _CW);
    }

    inherit(Intrinsics, DeclarativeEnv, {
      type: 'Intrinsics',
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

  function FromJSON(object){
    if (object instanceof Array) {
      var $array = new $Array,
          len = object.length;
      for (var i=0; i < len; i++) {
        $array.define(i+'', FromJSON(object[i]), ECW);
      }
      $array.define('length', object.length, __W);
      return $array;
    } else if (typeof object === 'function') {
      return new $NativeFunction(object);
    } else if (object === null || typeof object !== 'object') {
      return object;
    } else {
      var out = new $Object;
      each(object, function(val, key){
        out.set(key, FromJSON(val));
      });
      return out;
    }
  }

  function FromInternalArray(array){
    var $array = new $Array,
        len = array.length;

    for (var i=0; i < len; i++) {
      $array.define(i+'', array[i], ECW);
    }
    $array.define('length', array.length, __W);
    return $array;
  }

  function ToInternalArray($array){
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
      raw    : true,
      tokens : false,
      comment: true
    }

    function parse(src, origin, type, options){
      try {
        return esprima.parse(src, options || parseOptions);
      } catch (e) {
        if (!realm || !intrinsics) return e;
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


  var Realm = (function(){

    var Hooked = create(null);

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

      var timers = {};
      var nativeCode = ['function ', '() { [native code] }'];

      return {
        _GetPrimitiveValue: function(obj, args){
          return obj.PrimitiveValue;
        },
        _SetPrimitiveValue: function(obj, args){
          obj.PrimitiveValue = args[0];
        },
        _GetBuiltinBrand: function(obj, args){
          if (obj.BuiltinBrand) {
            return obj.BuiltinBrand.name;
          }
        },
        _SetBuiltinBrand: function(obj, args){
          var brand = BRANDS[args[0]];
          if (brand) {
            obj.BuiltinBrand = brand;
          } else {
            var err = new $Error('ReferenceError', undefined, 'Unknown BuiltinBrand "'+args[0]+'"');
            return new AbruptCompletion('throw', err);
          }
          return obj.BuiltinBrand.name;
        },
        _Call: function(obj, args){
          return obj.Call(args[0], ToInternalArray(args[1]));
        },
        _Construct: function(obj, args){
          return obj.Construct(ToInternalArray(args[0]));
        },
        _HasProperty: function(obj, args){
          return obj.HasProperty(args[0]);
        },
        _IsExtensible: function(obj){
          return obj.IsExtensible();
        },
        _PreventExtensions: function(obj){
          return obj.PreventExtensions();
        },
        _GetPrototype: function(obj){
          do {
            obj = obj.GetInheritance();
          } while (obj && obj.HiddenPrototype)
          return obj;
        },
        _SetPrototype: function(obj, args){
          var proto = obj.Prototype;
          if (proto && proto.HiddenPrototype) {
            obj = proto;
          }
          return obj.SetInheritance(args[0]);
        },
        _DefineOwnProperty: function(obj, args){
          return obj.DefineOwnProperty(args[0], ToPropertyDescriptor(args[1]), false);
        },
        _Enumerate: function(obj, args){
          return new $InternalArray(obj.Enumerate(args[0], args[1]));
        },
        _GetProperty: function(obj, args){
          return FromPropertyDescriptor(obj.GetProperty(args[0]));
        },
        _GetOwnProperty: function(obj, args){
          return FromPropertyDescriptor(obj.GetOwnProperty(args[0]));
        },
        _HasOwnProperty: function(obj, args){
          return obj.HasOwnProperty(args[0]);
        },
        _SetP: function(obj, args){
          return obj.SetP(args[2], args[0], args[1]);
        },
        _GetP: function(obj, args){
          return obj.GetP(args[1], args[0]);
        },
        _Put: function(obj, args){
          return obj.Put(args[0]);
        },
        _has: function(obj, args){
          return obj.has(args[0]);
        },
        _delete: function(obj, args){
          return obj.remove(args[0]);
        },
        _set: function(obj, args){
          return obj.set(args[0], args[1]);
        },
        _get: function(obj, args){
          return obj.get(args[0]);
        },
        _define: function(obj, args){
          obj.define(args[0], args[1], args.length === 3 ? args[2] : _CW);
        },
        _query: function(obj, args){
          return obj.query(args[0]);
        },
        _update: function(obj, args){
          return obj.update(args[0], args[1]);
        },
        _each: function(obj, args){
          var callback = args[0];
          obj.each(function(prop){
            callback.Call(obj, prop);
          });
        },
        _setInternal: function(obj, args){
          obj[args[0]] = args[1];
        },
        _getInternal: function(obj, args){
          return obj[args[0]];
        },
        _hasInternal: function(obj, args){
          return args[0] in obj;
        },
        _GetIntrinsic: function(obj, args){
          return intrinsics[args[0]];
        },
        _SetIntrinsic: function(obj, args){
          intrinsics[args[0]] = args[1];
        },
        CheckObjectCoercible: operations.checkObjectCoercible,
        ToObject: operators.ToObject,
        ToString: operators.ToString,
        ToNumber: operators.ToNumber,
        ToBoolean: operators.ToBoolean,
        ToPropertyName: operators.ToPropertyName,
        ToInteger: operators.ToInteger,
        ToInt32: operators.ToInt32,
        ToUint32: operators.ToUint32,
        ToUint16: operators.ToUint16,
        ToModule: function(obj){
          if (obj.BuiltinBrand === BRANDS.BuiltinModule) {
            return obj;
          }
          return new $Module(obj, obj.Enumerate(false, false));
        },
        IsObject: function(object){
          return object instanceof $Object;
        },
        IsConstructor: function(obj){
          return !!(obj && obj.Construct);
        },
        IsConstructCall: function(){
          return context.isConstruct;
        },
        GetNotifier: operations.getNotifier,
        EnqueueChangeRecord: operations.enqueueChangeRecord,
        DeliverChangeRecords: operations.deliverChangeRecords,
        Type: function(o){
          if (o === null) {
            return 'Null';
          } else {
            switch (typeof o) {
              case 'undefined': return 'Undefined';
              case 'function':
              case 'object':    return 'Object';
              case 'string':    return 'String';
              case 'number':    return 'Number';
              case 'boolean':   return 'Boolean';
            }
          }
        },
        Exception: function(type, args){
          return MakeException(type, ToInternalArray(args));
        },
        _Signal: function(obj, args){
          realm.emit.apply(realm, args);
        },
        _now: Date.now || function(){ return +new Date },


        Fetch: function(name, callback){
          var result = require('./builtins')[name];
          if (!result) {
            result = new $Error('Error', undefined, 'Unable to locate module "'+name+'"');
          }
          callback.Call(undefined, [result]);
        },

        EvaluateModule: function(source, name, callback, errback){
          if (!callback && !errback) {
            var result, thrown;

            realm.evaluateModule(this, source, name,
              function(module){ result = module },
              function(error){ result = error; thrown = true; }
            );

            return thrown ? new AbruptCompletion('throw', result) : result;
          } else {
            realm.evaluateModule(this, source, name, wrapFunction(callback), wrapFunction(errback));
          }
        },
        SetDefaultLoader: function(loader){
          realm.loader = loader;
        },
        _promoteClass: function(obj, args){
          var ctor = args[0],
              prototype = ctor.Get('prototype');

          function $Reflected(){
            $Object.call(this, prototype);
          }

          $Reflected.prototype = define(create(prototype), {
            Prototype: prototype,
            properties: undefined,
            storage: undefined,
            id: undefined,
            __introspected: undefined
          });

          ctor.Construct = function Construct(args){
            var instance = new $Reflected;
            var result = this.Call(instance, args, true);
            return result !== null && typeof result === 'object' ? result : instance;
          };

          return ctor;
        },
        _getHook: function(obj, args){
          var hook = args[0][args[1]];
          if (hook && hook.hooked === Hooked) {
            return hook.callback;
          }
        },
        _hasHook: function(obj, args){
          var hook = args[0][args[1]];
          return !!hook && hook.hooked === Hooked;
        },
        _setHook: function(obj, args){
          var target = args[0],
              type = args[1],
              callback = args[2],
              original = target[type];

          if (type === 'describe') {
            var forward = new $InternalFunction(function(_, args){
              return new $InternalArray(original.call(args[0], args[1]));
            });

            target.describe = function(key){
              var result = callback.Call(this, [key]);
              if (result instanceof $Array) {
                return [result.get(0), result.get(1), result.get(2)];
              }
            };
          } else if (type === 'each') {
            var stack = new Stack;

            var forward = new $InternalFunction(function(_, args){
              return original.call(args[0], stack.top);
            });

            var proxy = [new $InternalFunction(function(obj, args){
              var result = args[0];
              if (result instanceof $Array) {
                stack.top([result.get(0), result.get(1), result.get(2)]);
              }
            })];

            target.each = function(callback){
              stack.push(callback);
              args[2].Call(this, proxy);
              stack.pop();
            };
          } else if (type === 'define') {
            var forward = new $InternalFunction(function(_, args){
              return original.call(args[0], args[1], args[2], args[3]);
            });

            target.define = function(key, value, attr){
              return callback.Call(this, [key, value, attr]);
            };
          } else if (type === 'get' || type === 'has' || type === 'remove' || type === 'query') {
            var forward = new $InternalFunction(function(_, args){
              return original.call(args[0], args[1]);
            });

            target[type] = function(key){
              return callback.Call(this, [key]);
            };
          } else if (type === 'set' || type === 'update') {
            var forward = new $InternalFunction(function(_, args){
              return original.call(args[0], args[1], args[2]);
            });

            target[type] = function(key, value){
              return callback.Call(this, [key, value]);
            };
          }

          target[type].hooked = Hooked;
          target[type].callback = callback;
          return forward;
        },
        _removeHook: function(obj, args){
          var target = args[0],
              type = args[1],
              hook = target[type];

          if (hook && hook.hooked === Hooked) {
            delete target[type];
            return true;
          }
          return false;
        },
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
          return new $BoundFunction(args[0], args[1], ToInternalArray(args[2]));
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
        _RegExpCreate: function(obj, args){
          var pattern = args[0],
              flags = args[1];

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
        _ProxyCreate: function(obj, args){
          return new $Proxy(args[0], args[1]);
        },
        _SymbolCreate: function(obj, args){
          return new $Symbol(args[0], args[1]);
        },
        _StringCreate: function(obj, args){
          return new $String(args[0]);
        },
        _TypedArrayCreate: function(obj, args){
          return new $TypedArray(args[0], args[1], args[2], args[3]);
        },
        _NativeBufferCreate: function(obj, args){
          return new ArrayBuffer(args[0]);
        },
        NativeDataViewCreate: function(buffer){
          return new DataView(buffer.NativeBuffer);
        },
        NativeBufferSlice: function(buffer, begin, end){
          return buffer.slice(begin, end);
        },
        _DataViewSet: function(obj, args){
          var offset = args[1] >>> 0;

          if (offset >= obj.ByteLength) {
            return ThrowException('buffer_out_of_bounds')
          }

          return obj.View['set'+args[0]](offset, args[2], !!args[3]);
        },
        _DataViewGet: function(obj, args){
          var offset = args[1] >>> 0;

          if (offset >= obj.ByteLength) {
            return ThrowException('buffer_out_of_bounds')
          }

          return obj.View['get'+args[0]](offset, !!args[2]);
        },

        _FunctionToString: function(obj, args){
          if (obj.Proxy) {
            obj = obj.ProxyTarget;
          }
          var code = obj.code;
          if (obj.BuiltinFunction || !code) {
            var name = obj.get('name');
            if (name && typeof name !== 'string' && name instanceof $Symbol) {
              name = '@' + name.Name;
            }
            return nativeCode[0] + name + nativeCode[1];
          } else {
            return code.source.slice(code.range[0], code.range[1]);
          }
        },
        _NumberToString: function(obj, args){
          return args[0].toString(args[1]);
        },
        _RegExpToString: function(obj, args){
          return ''+obj.PrimitiveValue;
        },
        _RegExpExec: function(obj, args){
          var result = obj.PrimitiveValue.exec(args[0]);
          if (result) {
            var array = FromInternalArray(result);
            array.set('index', result.index);
            array.set('input', args[0]);
            return array;
          }
          return result;
        },
        _RegExpTest: function(obj, args){
          return obj.PrimitiveValue.test(args[0]);
        },
        _CallBuiltin: function(obj, args){
          if (args[2]) {
            return args[0][args[1]].apply(args[0], ToInternalArray(args[2]));
          } else {
            return args[0][args[1]]();
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
          return new $InternalArray(str.split(separator, limit));
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
              deliverChangeRecordsAndReportErrors();
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
        _MapInitialization: CollectionInitializer(MapData, 'Map'),
        _MapSigil: function(){
          return MapData.sigil;
        },
        _MapSize: function(obj, args){
          return args[0].MapData ? args[0].MapData.size : 0;
        },
        _MapClear: function(obj, args){
          return args[0].MapData.clear();
        },
        _MapGet: function(obj, args){
          return args[0].MapData.get(args[1]);
        },
        _MapSet: function(obj, args){
          return args[0].MapData.set(args[1], args[2]);
        },
        _MapDelete: function(obj, args){
          return args[0].MapData.remove(args[1]);
        },
        _MapHas: function(obj, args){
          return args[0].MapData.has(args[1]);
        },
        _MapNext: function(obj, args){
          var result = args[0].MapData.after(args[1]);
          return result instanceof Array ? new $InternalArray(result) : result;
        },

        _WeakMapInitialization: CollectionInitializer(WeakMapData, 'WeakMap'),
        _WeakMapGet: function(obj, args){
          return args[0].WeakMapData.get(args[1]);
        },
        _WeakMapSet: function(obj, args){
          return args[0].WeakMapData.set(args[1], args[2]);
        },
        _WeakMapDelete: function(obj, args){
          return args[0].WeakMapData.remove(args[1]);
        },
        _WeakMapHas: function(obj, args){
          return args[0].WeakMapData.has(args[1]);
        },
        parse: function(src, loc, range, raw, tokens, comment, source){
          var ast = Script.parse(src, source, 'script', {
            loc    : !!loc,
            range  : !!range,
            raw    : !!raw,
            tokens : !!tokens,
            comment: !!comment
          });
          if (ast.Abrupt) {
            return ast;
          }
          return FromJSON(ast);
        },
        AddObserver: function(data, callback){
          data.set(callback, callback);
        },
        RemoveObserver: function(data, callback){
          data.remove(callback);
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


    function deliverChangeRecordsAndReportErrors(){
      var observerResults = DeliverAllChangeRecords();
      if (observerResults && observerResults instanceof Array) {
        each(observerResults, function(error){
          realm.emit('throw', error);
        });
      }
    }

    var mutationScopeInit = new Script('void 0');

    function initialize(realm, Ω, ƒ){
      if (realm.initialized) Ω();
      realm.state = 'initializing';
      realm.initialized = true;
      realm.mutationScope = new ExecutionContext(null, realm.globalEnv, realm, mutationScopeInit.bytecode);
      var fakeLoader = { global: realm.global, baseURL: '' },
          builtins = require('./builtins'),
          init = builtins['@@internal'] + '\n\n'+ builtins['@system'];

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

      if (!script.thunk) {
        script.thunk = new Thunk(script.bytecode);
      }

      ExecutionContext.push(ctx);
      var status = TopLevelDeclarationInstantiation(script.bytecode);
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

      var sandbox = createSandbox(loader.global, loader);

      runScript(sandbox, script, function(){
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

      new Intrinsics(this);

      hide(intrinsics.FunctionProto, 'Scope');
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
        var name = k[0] === '_' ? k.slice(1) : k;
        intrinsics[name] = new $NativeFunction({
          unwrapped: k[0] === '_',
          name: name,
          length: natives[k].length,
          call: natives[k]
        });
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
        errback || (errback = callback);

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
      $Object.changeRealm(target);
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
