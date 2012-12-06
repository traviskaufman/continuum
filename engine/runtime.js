var runtime = (function(GLOBAL, exports, undefined){
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
      map           = iteration.map,
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
    return is(a.Value, b.Value) &&
           a.Get === b.Get &&
           a.Set === b.Set &&
           a.Writable === b.Writable &&
           a.Enumerable === b.Enumerable &&
           a.Configurable === b.Configurable;
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
      if (func && func.Abrupt) return func; else func = func.value;
    }

    if (!IsCallable(func)) {
      return ThrowException('called_non_callable', key);
    }

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
      var ao = new $StrictArguments(args);
      var status = ArgumentBindingInitialization(formals, ao, env);
    } else {
      var ao = env.arguments = new $MappedArguments(args, env, params, func);
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
          array.set(i, args.get(params.length + i));
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
    for (var i=0, property; property = pattern.properties[i]; i++) {
      var value = object.HasProperty(property.key.name) ? object.Get(property.key.name) : undefined;
      if (value && value.Abrupt) return value;
      BindingInitialization(property.value, value, env);
    }
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
      $Object.tag(this);
      this.guard = create(LinkedItem.prototype);
      this.guard.key = {};
      this.reset();
    }

    MapData.sigil = create(null);

    define(MapData.prototype, [
      function save(serializer){
        serializer || (serializer = new Serializer);
        if (serializer.has(this.id)) {
          return this.id;
        }

        var serialized = serializer.set(this.id, {
          type: 'MapData',
          size: this.size,
          items: []
        });
        this.forEach(function(value, key){
          serialized.items.push(map([key, value], function(item){
            if (isObject(item)) {
              serializer.add(item);
              return item.id;
            } else {
              item = serializer.serialize(item);
              return typeof item === 'number' ? [item] : item;
            }
          }));
        });
        return serialized;
      },
      function reset(){
        this.size = 0;
        this.strings = create(null);
        this.numbers = create(null);
        this.others = create(null);
        this.lastLookup = this.guard.next = this.guard.previous = this.guard;
      },
      function forEach(callback, context){
        var item = this.guard.next;
        context = context || this;

        while (item !== this.guard) {
          callback.call(context, item.value, item.key);
          item = item.next;
        }
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
      $Object.tag(this);
    }

    define(WeakMapData.prototype, [
      function save(serializer){
        serializer || (serializer = new Serializer);
        if (serializer.has(this.id)) {
          return this.id;
        }

        return serializer.set(this.id, {
          type: 'WeakMapData'
        });
      },
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

      array.set(offset++, value);
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
      array.set(i, value);
    }

    array.define('length', i, _CW);
    return array;
  }

  function EnqueueChangeRecord(record, changeObservers){
    changeObservers.forEach(function(callback){
      var changeRecords = callback.PendingChangeRecords || (callback.PendingChangeRecords = []);
      changeRecords.push(record);
    });
  }

  function DeliverChangeRecords(callback){
    var changeRecords = callback.PendingChangeRecords;
    if (changeRecords && changeRecords.length) {
      var array = FromInternalArray(changeRecords);
      changeRecords.length = 0;
      var result = callback.Call(undefined, [array]);
      if (result && result.Abrupt) {
        return result;
      }
      return true;
    }
    return false;
  }

  function DeliverAllChangeRecords(){
    var anyWorkDone = false,
        callbacks = intrinsics.ObserverCallbacks,
        errors = [];

    if (callbacks && callbacks.size) {
      callbacks.forEach(function(callback){
        var result = DeliverChangeRecords(callback);
        if (result) {
          anyWorkDone = true;
          if (result && result.Abrupt) {
            errors.push(result);
          }
        }
      });
    }

    return errors.length ? errors : anyWorkDone;
  }

  function CreateChangeRecord(type, object, name, oldDesc){
    var changeRecord = new $Object;
    changeRecord.define('type', type, E__);
    changeRecord.define('object', object, E__);
    if (name !== null) {
      changeRecord.define('name', name, E__);
    }
    if (IsDataDescriptor(oldDesc)) {
      changeRecord.define('oldValue', oldDesc.Value, E__);
    }
    changeRecord.PreventExtensions();
    return changeRecord;
  }

  function GetNotifier(object){
    var notifier = object.Notifier;
    if (!notifier) {
      notifier = object.Notifier = new $Object(intrinsics.NotifierProto);
      notifier.Target = object;
      notifier.ChangeObservers = new MapData;
    }
    return notifier;
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
    $Object.tag(this);
  }

  define(Accessor.prototype, {
    type: 'Accessor',
    Get: undefined,
    Set: undefined
  });


  function BuiltinAccessor(get, set){
    $Object.tag(this);
    if (get) this.Get = { Call: get };
    if (set) this.Set = { Call: set };
  }

  inherit(BuiltinAccessor, Accessor);


  function ArgAccessor(name, env){
    this.name = name;
    $Object.tag(this);
    define(this, { env: env  });
  }

  inherit(ArgAccessor, Accessor, {
    type: 'ArgAccessor',
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
      this.cache = new Hash;
      $Object.tag(this);
    }

    define(EnvironmentRecord.prototype, {
      bindings: null,
      withBase: undefined,
      type: 'Env',
      Environment: true
    });

    define(EnvironmentRecord.prototype, [
      function save(serializer){
        if (serializer.has(this.id)) {
          return this.id;
        }

        var serialized = serializer.set(this.id, {
          type: this.type
        });

        if (this.outer) {
          serializer.add(this.outer);
          serialized.outer = this.outer.id;
        }

        if (this.symbols) {
          serialized.symbols = {};
          each(this.symbols, function(symbol, name){
            serializer.add(symbol);
            serialized.symbols[name] = symbol.id;
          });
        }

        return serialized;
      },
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
      this.outer = outer;
      this.bindings = new Hash;
      this.consts = new Hash;
      this.deletables = new Hash;
      this.cache = new Hash;
      $Object.tag(this);
    }

    inherit(DeclarativeEnvironmentRecord, EnvironmentRecord, {
      type: 'DeclarativeEnv'
    }, [
      function save(serializer){
        serializer || (serializer = new Serializer);
        var serialized = EnvironmentRecord.prototype.save.call(this, serializer);
        if (typeof serialized === 'number') {
          return serialized;
        }
        serialized.bindings = {};
        each(this.bindings, function(binding, name){
          if (isObject(binding) && 'id' in binding) {
            serializer.add(binding);
            serialized.bindings[name] = binding.id;
          } else {
            serialized.bindings[name] = serializer.serialize(binding);
          }
        });
        var deletables = ownKeys(this.deletables);
        if (deletables.length) {
          serialized.deletables = deletables;
        }
        var consts = ownKeys(this.consts);
        if (deletables.length) {
          serialized.consts = consts;
        }
        return serialized;
      },
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
      this.bindings = object;
      this.outer = outer;
      this.cache = new Hash;
      $Object.tag(this);
    }

    inherit(ObjectEnvironmentRecord, EnvironmentRecord, {
      type: 'ObjectEnv'
    }, [
      function save(serializer){
        serializer || (serializer = new Serializer);
        var serialized = EnvironmentRecord.prototype.save.call(this, serializer);
        if (typeof serialized === 'number') {
          return serialized;
        }
        serializer.add(this.bindings);
        serialized.bindings = this.bindings.id;
        return serialized;
      },
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
      this.outer = method.Scope;
      this.bindings = new Hash;
      this.consts = new Hash;
      this.deletables = new Hash;
      this.cache = new Hash;
      this.thisValue = receiver;
      this.HomeObject = method.HomeObject;
      this.MethodName = method.MethodName;
      $Object.tag(this);
    }

    inherit(FunctionEnvironmentRecord, DeclarativeEnvironmentRecord, {
      HomeObject: undefined,
      MethodName: undefined,
      thisValue: undefined,
      type: 'FunctionEnv'
    }, [
      function save(serializer){
        var serialized = DeclarativeEnvironmentRecord.prototype.save.call(this, serializer);
        if (typeof serialized === 'number') {
          return serialized;
        }
        if (isObject(this.thisValue)) {
          serializer.add(this.thisValue);
          serialized.thisValue = this.thisValue.id;
        }
        if (this.HomeObject) {
          serializer.add(this.HomeObject);
          serialized.HomeObject =this.HomeObject.id;
        }
        if (this.MethodName) {
          serialized.MethodName = serializer.serialize(this.MethodName);
        }
        return serialized;
      },
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
      this.thisValue = this.bindings = global;
      this.outer = null;
      this.cache = new Hash;
      global.env = this;
      hide(global, 'env');
      $Object.tag(this);
    }

    inherit(GlobalEnvironmentRecord, ObjectEnvironmentRecord, {
      outer: null,
      type: 'GlobalEnv'
    }, [
      function save(serializer){
        serializer || (serializer = new Serializer);
        var serialized = ObjectEnvironmentRecord.prototype.save.call(this, serializer);
        if (typeof serialized === 'number') {
          return serialized;
        }
        serializer.add(this.bindings.Realm.natives);
        serialized.natives = this.bindings.Realm.natives.id;
        return serialized;
      },
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

  function Serializer(){
    this.cache = new Hash;
    this.repo = new Hash;
  }

  define(Serializer.prototype, [
    function ident(obj){
      if (isObject(obj)) {
        if ('id' in obj) {
          if (typeof obj.id !== 'number') {
            delete obj.id;
            $Object.tag(obj);
          }
        } else {
          $Object.tag(obj);
        }
      }
    },
    function serialize(value){
      if (!isObject(value)) {
        if (value !== value) {
          return ['NaN'];
        } else if (value === Infinity) {
          return ['Infinity'];
        } else if (value === -Infinity) {
          return ['-Infinity'];
        } else if (value === 0) {
          return 1 / value === -Infinity ? ['-0'] : 0;
        } else if (value === undefined) {
          return ['undefined'];
        } else {
          return value;
        }
      }
      if (value.save) {
        return value.save(this);
      }
      if ('Get' in value || 'Set' in value) {
        var ret = { type: value.type || 'Accessor' };
        if (value.Get) {
          ret.Get = this.serialize(value.Get);
        }
        if (value.Set) {
          ret.Set = this.serialize(value.Set);
        }
        return ret;
      }
      if (value instanceof Array) {
        return map(value, serialize, this);
      }
      if (typeof value === 'function' && value.name) {
        value = value.name;
      } else if (value && value.constructor && value.constructor.name) {
        value = value.constructor.name;
      }
      return ['unhandled object '+value];
    },
    function has(id){
      return id in this.cache;
    },
    function set(id, value){
      this.cache[id] = value;
      value.id = id;
      if (!(id in this.repo)) {
        this.repo[id] = value;
      }
      return value;
    },
    function get(id){
      return this.cache[id];
    },
    function add(obj){
      this.repo[obj.id] = obj.id in this.cache ? this.cache[obj.id] : this.serialize(obj);
    }
  ]);



  // ###############
  // ### $Object ###
  // ###############

  var $Object = (function(){
    var Proto = {
      Get: {
        Call: function(receiver){
          do {
            receiver = receiver.GetInheritance();
          } while (receiver && receiver.HiddenPrototype)
          return receiver;
        }
      },
      Set: {
        Call: function(receiver, args){
          var proto = receiver.Prototype;
          if (proto && proto.HiddenPrototype) {
            receiver = proto;
          }
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
      this.storage = new Hash;
      $Object.tag(this);
      if (proto && proto.HiddenPrototype) {
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
          return this.properties.describe(key);
        },
        (function(){ // IE6-8 leaks function expression names to surrounding scope
          return function define(key, value, attrs){
            return this.properties.define(key, value, attrs);
          };
        })(),
        function get(key){
          return this.properties.get(key);
        },
        function set(key, value){
          this.properties.set(key, value);
        },
        function query(key){
          return this.properties.query(key);
        },
        function update(key, attr){
          this.properties.update(key, attr);
        },
        function each(callback){
          this.properties.each(callback, this);
        },
        function save(serializer){
          if (!serializer) {
            var returnRepo = true;
            serializer = new Serializer;
          }

          if (serializer.has(this.id)) {
            return this.id
          }

          var serialized = serializer.set(this.id, {
            type: this.constructor.name,
            BuiltinBrand: this.BuiltinBrand.name
          });

          if (IsCallable(this)) {
            var name = this.get('name');
            if (name && typeof name === 'string') {
              serialized.name = name;
            }
            if (this.strict) {
              serialized.Strict = this.strict;
            }
            serialized.Parameters = null;
          }

          if (!this.IsExtensible()) {
            serialized.Extensible = false;
          }

          if (this.ConstructorName) {
            serialized.ConstructorName = this.ConstructorName;
          }

          each(['MapData', 'SetData', 'WeakMapData'], function(data){
            if (this[data]) {
              serializer.add(this[data]);
              serialized[data] = this[data].id;
            }
          }, this);

          var objects = [],
              functions = [],
              self = this,
              isFunction = IsCallable(this);

          var props = [];
          this.properties.each(function(prop){
            if (isFunction) {
              if (prop[0] === 'arguments' || prop[0] === 'caller') {
                if (prop[1] === null || self.strict) {
                  return;
                }
              } else if (prop[0] === 'length') {
                return;
              }
            }
            if (typeof prop[0] === 'string') {
              var key = prop[0];
            } else {
              serializer.add(prop[0]);
              var key = prop[0].id;
            }
            prop = [key, prop[2], 0, prop[1]];
            props.push(prop);
            if (isObject(prop[3])) {
              if (prop[3].Scope) {
                functions.push(prop);
              } else {
                objects.push(prop);
              }
            } else {
              prop[3] = serializer.serialize(prop[3]);
            }
          });

          each(objects, function(prop){
            serializer.add(prop[3]);
            prop[3] = prop[3].id;
            prop[2] = 1;
          });

          var proto = this.GetInheritance();
          if (proto) {
            serializer.add(proto);
            serialized.Prototype = proto.id;
          } else {
            serialized.Prototype = null;
          }

          each(functions, function(prop){
            serializer.add(prop[3]);
            prop[3] = prop[3].id;
            prop[2] = 2;
          });

          serialized.properties = props;
          return returnRepo ? serializer.repo : serialized;
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

          if (this.Notifier) {
            var changeObservers = this.Notifier.ChangeObservers;
            if (changeObservers.size) {
              EnqueueChangeRecord(CreateChangeRecord('prototype', this, null, { Value: this.GetInheritance() }), changeObservers);
            }
          }
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

        var current = this.GetOwnProperty(key),
            changeType = 'reconfigured';

        if (current === undefined) {
          if (!this.IsExtensible()) {
            return reject('define_disallowed', []);
          } else {
            if (IsGenericDescriptor(desc) || IsDataDescriptor(desc)) {
              this.define(key, desc.Value, desc.Enumerable | (desc.Configurable << 1) | (desc.Writable << 2));
            } else {
              this.define(key, new Accessor(desc.Get, desc.Set), desc.Enumerable | (desc.Configurable << 1) | A);
            }

            if (this.Notifier) {
              var changeObservers = this.Notifier.ChangeObservers;
              if (changeObservers.size) {
                EnqueueChangeRecord(CreateChangeRecord('new', this, key), changeObservers);
              }
            }
            return true;
          }
        } else {
          var rejected = false;
          if (IsEmptyDescriptor(desc) || IsEquivalentDescriptor(desc, current)) {
            return true;
          }

          if (!current.Configurable) {
            if (desc.Configurable || desc.Enumerable === !current.Enumerable) {
              return reject('redefine_disallowed', []);
            } else {
              var currentIsData = IsDataDescriptor(current),
                  descIsData = IsDataDescriptor(desc);

              if (currentIsData !== descIsData) {
                return reject('redefine_disallowed', []);
              } else if (currentIsData && descIsData) {
                if (!current.Writable && 'Value' in desc && desc.Value !== current.Value) {
                  return reject('redefine_disallowed', []);
                }
              } else if ('Set' in desc && desc.Set !== current.Set) {
                return reject('redefine_disallowed', []);
              } else if ('Get' in desc && desc.Get !== current.Get) {
                return reject('redefine_disallowed', []);
              }
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
            this.update(key, desc.Enumerable | (desc.Configurable << 1) | (desc.Writable << 2));
            if ('Value' in desc) {
              this.set(key, desc.Value);
              changeType = 'updated';
            }
          }

          if (this.Notifier) {
            var changeObservers = this.Notifier.ChangeObservers;
            if (changeObservers.size) {
              EnqueueChangeRecord(CreateChangeRecord(changeType, this, key, current), changeObservers);
            }
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
          if (this.Notifier) {
            var changeObservers = this.Notifier.ChangeObservers;
            if (changeObservers.size) {
              EnqueueChangeRecord(CreateChangeRecord('deleted', this, key, this.GetOwnProperty(key)), changeObservers);
            }
          }
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
      $Object.tag(code);
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
      function save(serializer){
        serializer || (serializer = new Serializer);
        var serialized = $Object.prototype.save.call(this, serializer);
        if (typeof serialized === 'number') {
          return serialized;
        }
        serialized.Strict = this.strict;
        serialized.ThisMode = this.ThisMode;
        if (this.Scope) {
          serializer.add(this.Scope);
          serialized.Scope = this.Scope.id;
        }
        if (this.code) {
          serializer.add(this.code);
          serialized.Code = this.code.id;
          var code = serializer.repo[this.code.id];
          serialized.Parameters = code.params;
          delete code.params;
        }
        if (this.HomeObject) {
          serializer.add(this.HomeObject);
          serialized.HomeObject = this.HomeObject.id;
        }
        if (this.MethodName) {
          serialized.MethodName = serializer.serialize(this.MethodName);
        }

        return serialized;
      },
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

        ExecutionContext.push(new ExecutionContext(context, local, realm, this.code, this, args, isConstruct));
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
      BoundArgs: null
    }, [
      function save(serializer){
        if (!serializer) {
          var returnRepo = true;
          serializer = new Serializer;
        }

        var serialized = $Object.prototype.save.call(this, serializer);
        if (typeof serialized === 'number') {
          return serialized;
        }
        delete serialized.Parameters;
        if (isObject(this.TargetFunction)) {
          serializer.add(this.TargetFunction);
          serialized.TargetFunction = this.TargetFunction.id;
        }
        if (isObject(this.BoundThis)) {
          serializer.add(this.BoundThis);
          serialized.BoundThis = this.BoundThis.id;
        } else {
          serialized.BoundThis = serializer.serialize(this.BoundThis);
        }
        serialized.BoundArgs = map(this.BoundArgs, function(arg){
          if (isObject(arg)) {
            serializer.add(arg);
            return arg.id;
          } else {
            return serializer.serialize(arg);
          }
        });

        return returnRepo ? serializer.repo : serialized;
      },
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

        var ctx = new ExecutionContext(context, local, this.Realm, this.code, this, args, isConstruct);
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


  var primitiveWrapperSave = (function(){
    return function save(serializer){
      serializer || (serializer = new Serializer);
      var serialized = $Object.prototype.save.call(this, serializer);
      if (typeof serialized === 'number') {
        return serialized;
      }

      serialized.PrimitiveValue = this.PrimitiveValue;
      return serialized;
    };
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
    }, [
      function save(serializer){
        return +primitiveWrapperSave.call(this, serializer);
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
      this.PrimitiveValue = value;
      this.define('length', value.length, ___);
    }

    inherit($String, $Object, {
      BuiltinBrand: BRANDS.StringWrapper,
      PrimitiveValue: undefined
    }, [
      primitiveWrapperSave,
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
    }, [primitiveWrapperSave]);

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
    }, [primitiveWrapperSave]);

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
    var iterator = new $Enumerator([]);

    function $Symbol(name, isPublic){
      $Object.call(this, intrinsics.SymbolProto);
      this.Name = name;
      this.Private = !isPublic;
    }

    inherit($Symbol, $Object, {
      BuiltinBrand: BRANDS.BuiltinSymbol,
      Extensible: false,
      Private: true,
      Name: null
    }, [
      function save(serializer){
        serializer || (serializer = new Serializer);
        if (serializer.has(this.id)) {
          return this.id;
        }

        return serializer.set(this.id, {
          type: '$Symbol',
          Name: this.Name,
          Private: this.Private
        });
      },
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
      Extensible: false
    }, [
      function save(serializer){
        var props = this.properties;
        this.properties = fakeProps;

        serializer || (serializer = new Serializer);
        var serialized = $Object.prototype.save.call(this, serializer);
        this.properties = props;
        if (typeof serialized === 'number') {
          return serialized;
        }

        delete serialized.properties;
        delete serialized.Prototype;
        delete serialized.Extensible;
        serialized.exports = [];


        this.properties.each(function(prop){
          var value = prop[1].Get.Call();

          if (isObject(value)) {
            serializer.add(value);
            value = value.id;
          } else {
            value = serializer.serialize(value);
            if (typeof value === 'number') {
              value = [value];
            }
          }

          serialized.exports.push(value);
        });

        return serialized;
      },
    ]);

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

      return trap.Call(this.ProxyHandler, [this.ProxyTarget, thisValue, FromInternalArray(args)]);
    }

    function ProxyConstruct(args){
      var trap = GetMethod(this.ProxyHandler, 'construct');
      if (trap === undefined) {
        return this.ProxyTarget.Construct(args);
      }

      return trap.Call(this.ProxyHandler, [this.ProxyTarget, FromInternalArray(args)]);
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
      Builtin: true
    }, [
      function save(serializer){
        var serialized = $Object.prototype.save.call(this, serializer);
        if (typeof serialized === 'number') {
          return serialized;
        }
        delete serialized.Parameters;
        return serialized;
      },
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
      function popBlock(){
        var block = this.LexicalEnvironment;
        this.LexicalEnvironment = this.LexicalEnvironment.outer;
        return block;
      },
      function pushBlock(decls){
        this.LexicalEnvironment = new DeclarativeEnvironmentRecord(this.LexicalEnvironment);
        if (decls) {
          return BlockDeclarationInstantiation(decls, this.LexicalEnvironment);
        }
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
      function createFunction(isExpression, name, code){
        var $F = code.generator ? $GeneratorFunction : $Function,
            env = this.LexicalEnvironment;

        if (isExpression && name) {
          env = new DeclarativeEnvironmentRecord(env);
          env.CreateImmutableBinding(name);
        }

        var func = new $F(code.lexicalType, name, code.params, code, env, code.flags.strict);

        if (code.lexicalType !== ARROW) {
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
      $Array                : $Array,
      $Boolean              : $Boolean,
      $BoundFunction        : $BoundFunction,
      $Date                 : $Date,
      $Error                : $Error,
      $Function             : $Function,
      $Generator            : $Generator,
      $GeneratorFunction    : $GeneratorFunction,
      $Map                  : $Map,
      $Module               : $Module,
      $NativeFunction       : $NativeFunction,
      $Number               : $Number,
      $Object               : $Object,
      $Proxy                : $Proxy,
      $RegExp               : $RegExp,
      $Set                  : $Set,
      $Symbol               : $Symbol,
      $String               : $String,
      $TypedArray           : $TypedArray,
      $WeakMap              : $WeakMap,
      MapData               : MapData,
      WeakMapData           : WeakMapData,
      DeclarativeEnvironment: DeclarativeEnvironmentRecord,
      ObjectEnvironment     : ObjectEnvironmentRecord,
      FunctionEnvironment   : FunctionEnvironmentRecord,
      GlobalEnvironment     : GlobalEnvironmentRecord,
      ExecutionContext      : ExecutionContext
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
      bindings.Genesis = new $Object(null);
      bindings.Genesis.HiddenPrototype = true;
      bindings.ObjectProto = new $Object(bindings.Genesis);

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

    inherit(Intrinsics, DeclarativeEnvironmentRecord, {
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
        $Object.tag(this.bytecode);
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
                  return FromInternalArray(result);
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
          return FromInternalArray(obj.Enumerate(args[0], args[1]));
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
        IsObject: function(object){
          return object instanceof $Object;
        },
        IsConstructor: function(obj){
          return !!(obj && obj.Construct);
        },
        IsConstructCall: function(){
          return context.isConstruct;
        },
        GetNotifier: GetNotifier,
        EnqueueChangeRecord: EnqueueChangeRecord,
        DeliverChangeRecords: DeliverChangeRecords,
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
          realm.emit.apply(realm, arguments);
        },
        wrapDateMethods: function(target){
          wrapBuiltins(Date.prototype, target);
        },
        _now: Date.now || function(){ return +new Date },


        Fetch: function(name, callback){
          var result = require('../modules')[name];
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
        _FunctionCreate: function(obj, args){
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
        _DateToNumber: function(obj, args){
          return +obj.PrimitiveValue;
        },
        _DateToString: function(obj, args){
          return ''+obj.PrimitiveValue;
        },
        CallBuiltin: function(target, name, args){
          if (args) {
            return target[name].apply(target, ToInternalArray(args));
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
          return FromInternalArray(str.split(separator, limit));
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
          return result instanceof Array ? FromInternalArray(result) : result;
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

    var globals = new Script({
      scope: SCOPE.GLOBAL,
      natives: true,
      filename: 'module-init.js',
      source: 'import * from "@std"; $__hideEverything(this); $__update.call(this, "undefined", 0);'
    });

    var mutationScopeInit = new Script('void 0');

    function initialize(realm, Ω, ƒ){
      if (realm.initialized) Ω();
      realm.state = 'initializing';
      realm.initialized = true;
      realm.mutationScope = new ExecutionContext(null, realm.globalEnv, realm, mutationScopeInit.bytecode);
      var fakeLoader = { global: realm.global, baseURL: '' },
          modules = require('../modules'),
          init = modules['@@internal'] + '\n\n'+ modules['@system'];

      resolveModule(fakeLoader, init, '@system', function(){
        runScript(realm, globals, function(){
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
      var modules = create(null);
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
          scope = new GlobalEnvironmentRecord(bindings),
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
        scope: SCOPE.MODULE
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

      activate(this);
      this.natives = new Intrinsics(this);
      intrinsics = this.intrinsics = this.natives.bindings;
      intrinsics.global = global = operators.global = this.global = new $Object(intrinsics.ObjectProto);
      global.BuiltinBrand = BRANDS.GlobalObject;
      this.globalEnv = new GlobalEnvironmentRecord(global);
      this.globalEnv.Realm = this;

      intrinsics.FunctionProto.Scope = this.globalEnv;
      intrinsics.FunctionProto.Realm = this;
      intrinsics.ThrowTypeError = CreateThrowTypeError(this);
      intrinsics.ObserverCallbacks = new MapData;
      intrinsics.NotifierProto = new $Object(intrinsics.ObjectProto);
      intrinsics.NotifierProto.define('notify', new $NativeFunction(notify), _CW);
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
