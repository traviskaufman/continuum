var operations = (function(exports){
  "use strict";
  var environments = require('./environments'),
      operators    = require('./operators'),
      descriptors  = require('./descriptors'),
      objects      = require('../lib/objects'),
      iteration    = require('../lib/iteration'),
      errors       = require('../errors'),
      constants    = require('../constants'),
      Nil          = require('./$Nil'),
      MapData      = require('./collections').MapData;

  var isFalsey               = Nil.isFalsey,
      isNullish              = Nil.isNullish,
      isUndefined            = Nil.isUndefined,
      isUndetectable         = Nil.isUndetectable,
      is                     = objects.is,
      create                 = objects.create,
      define                 = objects.define,
      inherit                = objects.inherit,
      Hash                   = objects.Hash,
      each                   = iteration.each,
      AbruptCompletion       = errors.AbruptCompletion,
      $$ThrowException       = errors.$$ThrowException,
      HAS_INSTANCE           = operators.HAS_INSTANCE,
      $$ToPropertyKey        = operators.$$ToPropertyKey,
      $$GetThisValue         = operators.$$GetThisValue,
      $$ToUint32             = operators.$$ToUint32,
      $$ToObject             = operators.$$ToObject,
      $$Type                 = operators.$$Type,
      $$IsDataDescriptor     = descriptors.$$IsDataDescriptor,
      $$IsAccessorDescriptor = descriptors.$$IsAccessorDescriptor,
      $$IsGenericDescriptor  = descriptors.$$IsGenericDescriptor,
      $$IsEmptyDescriptor    = descriptors.$$IsEmptyDescriptor,
      Accessor               = descriptors.Accessor,
      DataDescriptor         = descriptors.DataDescriptor,
      AccessorDescriptor     = descriptors.AccessorDescriptor;

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



  function $Object(o){
    $Object = require('./$Object').$Object;
    return new $Object(o);
  }

  function $Array(o){
    $Array = require('./$Array').$Array;
    return new $Array(o);
  }


  var Reference = exports.Reference = (function(){
    function Reference(base, name, strict){
      this.base = base;
      this.name = name;
      this.strict = !!strict;
    }
    define(Reference.prototype, {
      Reference: constants.SYMBOLS.Reference
    });


    define(environments.EnvironmentRecord.prototype, [
      function reference(key, strict){
        var cache = this.cache;
        if (cache) {
          if (key in cache) {
            return cache[key];
          }
        } else {
          cache = this.cache = new Hash;
        }
        return cache[key] = new Reference(this, key, strict);
      }
    ]);

    return Reference;
  })();


  function $$CheckObjectCoercible(argument){
    if (argument === null) {
      return $$ThrowException('null_to_object');
    } else if (argument === undefined) {
      return $$ThrowException('undefined_to_object');
    }
    return argument;
  }

  exports.$$CheckObjectCoercible = $$CheckObjectCoercible;


  function $$IsArrayIndex(argument) {
    var n = argument >>> 0;
    return ''+n === argument && n !== 0xffffffff;
  }

  exports.$$IsArrayIndex = $$IsArrayIndex;


  function $$IsPropertyReference(v){
    var type = typeof v.base;
    return type === 'string' || type === 'number' || type === 'boolean'|| type === 'object' && !!v.base.GetP;
  }

  exports.$$IsPropertyReference = $$IsPropertyReference;


  function $$GetIdentifierReference(lex, name, strict){
    if (isNullish(lex)) {
      return new Reference(undefined, name, strict);
    } else if (lex.HasBinding(name)) {
      return new Reference(lex, name, strict);
    } else {
      return $$GetIdentifierReference(lex.outer, name, strict);
    }
  }

  exports.$$GetIdentifierReference = $$GetIdentifierReference;


  function $$GetSymbol(context, name){
    var env = context.LexicalEnvironment;
    while (env) {
      if (env.HasSymbolBinding(name)) {
        return env.GetSymbol(name);
      }
      env = env.outer;
    }
  }

  exports.$$GetSymbol = $$GetSymbol;


  function $$Element(context, prop, base){
    var result = $$CheckObjectCoercible(base);
    if (result.Abrupt) return result;

    var name = $$ToPropertyKey(prop);
    if (name && name.Abrupt) return name;
    return new Reference(base, name, context.callee ? context.callee.Strict : context.code.flags.strict);
  }

  exports.$$Element = $$Element;


  function $$SuperReference(context, prop){
    var env = $$GetThisEnvironment(context);
    if (!env.HasSuperBinding()) {
      return $$ThrowException('invalid_super_binding');
    } else if (prop === null) {
      return env;
    }

    var baseValue = env.GetSuperBase(),
        status = $$CheckObjectCoercible(baseValue);

    if (status.Abrupt) return status;

    var key = $$ToPropertyKey(prop);
    if (key && key.Abrupt) return key;

    var ref = new Reference(baseValue, key, context.callee ? context.callee.Strict : context.code.flags.strict);
    ref.thisValue = env.GetThisBinding();
    return ref;
  }

  exports.$$SuperReference = $$SuperReference;


  function $$GetThisEnvironment(context){
    var env = context.LexicalEnvironment;
    while (env) {
      if (env.HasThisBinding()) {
        return env;
      }
      env = env.outer;
    }
  }

  exports.$$GetThisEnvironment = $$GetThisEnvironment;


  function $$ThisResolution(context){
    return $$GetThisEnvironment(context).GetThisBinding();
  }

  exports.$$ThisResolution = $$ThisResolution;


  function $$IdentifierResolution(context, name) {
    return $$GetIdentifierReference(context.LexicalEnvironment, name, context.callee ? context.callee.Strict : context.code.flags.strict);
  }

  exports.$$IdentifierResolution = $$IdentifierResolution;


  function $$IsCallable(argument){
    if (argument && argument.Abrupt) return argument;
    return !!(argument && typeof argument === 'object' ? argument.Call : false);
  }

  exports.$$IsCallable = $$IsCallable;


  function $$IsConstructor(argument){
    if (argument && argument.Abrupt) return argument;
    return !!(argument && typeof argument === 'object' ? argument.Construct : false);
  }

  exports.$$IsConstructor = $$IsConstructor;


  function $$EvaluateConstruct(func, args) {
    if (typeof func !== 'object') {
      return $$ThrowException('not_constructor', func);
    }

    if ($$IsConstructor(func)) {
      func.constructCount = (func.constructCount || 0) + 1;
      return func.Construct(args);
    } else {
      return $$ThrowException('not_constructor', func);
    }
  }

  exports.$$EvaluateConstruct = $$EvaluateConstruct;


  function $$EvaluateCall(ref, func, args, tail){
    if (!func || !func.Call) {
      return $$ThrowException('called_non_callable', [ref && ref.name]);
    }

    if (ref && ref.Reference) {
      var receiver = $$IsPropertyReference(ref) ? $$GetThisValue(ref) : ref.base.WithBaseObject();
    }

    return func.Call(receiver, args);
  }

  exports.$$EvaluateCall = $$EvaluateCall;


  function $$GetMethod(object, key){
    var func = object.GetP(object, key);
    if (!isUndefined(func) && !$$IsCallable(func)) {
      return $$ThrowException('called_non_callable', [key]);
    }
    return func;
  }

  exports.$$GetMethod = $$GetMethod;


  var emptyArgs = [];

  function $$Invoke(receiver, key, args){
    var object = $$ToObject(receiver);
    if (object && object.Abrupt) return object;

    var func = $$GetMethod(object, key);
    if (func && func.Abrupt) return func;

    if (isUndefined(func)) {
      return $$ThrowException('property_not_function', [key]);
    }

    return func.Call(receiver, args || emptyArgs);
  }

  exports.$$Invoke = $$Invoke;



  function $$SpreadArguments(precedingArgs, spread){
    var obj = $$ToObject(spread);
    if (obj && obj.Abrupt) return obj;

    var len = $$ToUint32(obj.Get('length'));
    if (len && len.Abrupt) return len;

    var offset = precedingArgs.length;

    for (var i=0; i < len; i++) {
      var value = obj.Get(i);
      if (value && value.Abrupt) return value;
      precedingArgs[i + offset] = value;
    }
  }

  exports.$$SpreadArguments = $$SpreadArguments;


  function $$SpreadInitialization(array, offset, spread){
    var obj = $$ToObject(spread);
    if (obj && obj.Abrupt) return obj;

    var len = $$ToUint32(obj.Get('length'));
    if (len && len.Abrupt) return len;

    for (var i = offset; i < len; i++) {
      var value = obj.Get(i);
      if (value && value.Abrupt) return value;
      array.set(offset++ + '', value);
    }

    array.define('length', offset, _CW);
    return offset;
  }

  exports.$$SpreadInitialization = $$SpreadInitialization;


  function $$SpreadDestructuring(context, spread, index){
    var array = new $Array(0);

    if (isNullish(spread)) {
      return array;
    }

    var obj = $$ToObject(spread);
    if (obj && obj.Abrupt) return obj;

    var len = $$ToUint32(obj.Get('length'));
    if (len && len.Abrupt) return len;

    var count = len - index;

    for (var i=0; i < count; i++) {
      var value = obj.Get(index + i);
      if (value && value.Abrupt) return value;
      array.set(i+'', value);
    }

    array.define('length', i, _CW);

    return array;
  }

  exports.$$SpreadDestructuring = $$SpreadDestructuring;


  function $$GetTemplateCallSite(context, template){
    if (!('id' in template)) {
      $$GetTemplateCallSite.count = ($$GetTemplateCallSite.count || 0) + 1;
      template.id = $$GetTemplateCallSite.count;
    }
    if (template.id in realm.templates) {
      return context.Realm.templates[template.id];
    }

    var cooked = [],
        raw = [];

    each(template, function(item, index){
      cooked[index] = item.cooked;
      raw[index] = item.raw;
    });

    var cookedObj = new $Array(cooked),
        rawObj = new $Array(raw);

    cookedObj.set('raw', rawObj);
    intrinsics.freeze.Call(undefined, [cookedObj]);
    intrinsics.freeze.Call(undefined, [rawObj]);
    realm.templates[template.id] = cookedObj;
    return cookedObj;
  }

  exports.$$GetTemplateCallSite = $$GetTemplateCallSite;


  function $$EnqueueChangeRecord(record, changeObservers){
    changeObservers.forEach(function(callback){
      var changeRecords = callback.PendingChangeRecords || (callback.PendingChangeRecords = []);
      changeRecords.push(record);
    });
  }

  exports.$$EnqueueChangeRecord = $$EnqueueChangeRecord;


  function $$CreateChangeRecord(type, object, name, oldDesc){
    var changeRecord = new $Object;
    changeRecord.define('type', type, E__);
    changeRecord.define('object', object, E__);
    if (name !== null) {
      changeRecord.define('name', name, E__);
    }
    if ($$IsDataDescriptor(oldDesc)) {
      changeRecord.define('oldValue', oldDesc.Value, E__);
    }
    changeRecord.PreventExtensions();
    return changeRecord;
  }

  exports.$$CreateChangeRecord = $$CreateChangeRecord;


  function $$DeliverChangeRecords(callback){
    var changeRecords = callback.PendingChangeRecords;
    if (changeRecords && changeRecords.length) {
      callback.PendingChangeRecords = [];
      var result = callback.Call(undefined, [new $Array(changeRecords)]);
      if (result && result.Abrupt) return result;
      return true;
    }
    return false;
  }

  exports.$$DeliverChangeRecords = $$DeliverChangeRecords;


  function $$DeliverAllChangeRecords(realm){
    var anyWorkDone = false,
        callbacks = intrinsics.ObserverCallbacks,
        errors = [];

    if (callbacks && callbacks.size) {
      callbacks.forEach(function(callback){
        var result = $$DeliverChangeRecords(callback);
        if (result) {
          anyWorkDone = true;
          if (result.Abrupt) {
            errors.push(result);
          }
        }
      });
    }

    return errors.length ? errors : anyWorkDone;
  }

  exports.$$DeliverAllChangeRecords = $$DeliverAllChangeRecords;


  function $$GetNotifier(object){
    var notifier = object.Notifier;
    if (!notifier) {
      notifier = object.Notifier = new $Object(intrinsics.NotifierProto);
      notifier.Target = object;
      notifier.ChangeObservers = new MapData;
    }
    return notifier;
  }

  exports.$$GetNotifier = $$GetNotifier;


  function $$ThrowStopIteration(){
    return new AbruptCompletion('throw', intrinsics.StopIteration);
  }

  exports.$$ThrowStopIteration = $$ThrowStopIteration;


  function $$IsStopIteration(o){
    return !!(o && o.Abrupt && o.value && o.value.BuiltinBrand === 'StopIteration');
  }

  exports.$$IsStopIteration = $$IsStopIteration;


  function $$GetKey(context, value){
    if (!value || typeof value === 'string') {
      return value;
    }
    return value[0] !== '@' ? value[1] : context.getSymbol(value[1]);
  }

  exports.$$GetKey = $$GetKey;


  function $$CreateListFromArray($array){
    if ($array.array) {
      return $array.array;
    }
    var array = [],
        len   = $array.Get('length');

    for (var i=0; i < len; i++) {
      array[i] = $array.Get(i+'');
    }
    return array;
  }

  exports.$$CreateListFromArray = $$CreateListFromArray;


  function $$CreateArrayFromList(elements){
    return new $Array(elements.slice());
  }

  exports.$$CreateArrayFromList = $$CreateArrayFromList;



  var protos = {
    '%ArrayBufferPrototype%' : 'ArrayBufferProto',
    '%ArrayPrototype%'       : 'ArrayProto',
    '%BooleanPrototype%'     : '%BooleanPrototype%',
    '%DataViewPrototype%'    : 'DataViewProto',
    '%DatePrototype%'        : '%DatePrototype%',
    '%Float32ArrayPrototype%': 'Float32ArrayProto',
    '%Float64ArrayPrototype%': 'Float64ArrayProto',
    '%FunctionPrototype%'    : 'FunctionProto',
    '%Int16ArrayPrototype%'  : 'Int16ArrayProto',
    '%Int32ArrayPrototype%'  : 'Int32ArrayProto',
    '%Int8ArrayPrototype%'   : 'Int8ArrayProto',
    '%MapPrototype%'         : '%MapPrototype%',
    '%NumberPrototype%'      : '%NumberPrototype%',
    '%ObjectPrototype%'      : 'ObjectProto',
    '%SetPrototype%'         : '%SetPrototype%',
    '%StringPrototype%'      : '%StringPrototype%',
    '%Uint16ArrayPrototype%' : 'Uint16ArrayProto',
    '%Uint32ArrayPrototype%' : 'Uint32ArrayProto',
    '%Uint8ArrayPrototype%'  : 'Uint8ArrayProto',
    '%WeakMapPrototype%'     : '%WeakMapPrototype%'
  };


  function $$OrdinaryCreateFromConstructor(constructor, intrinsicDefaultProto){
    if ($$Type(constructor) !== 'Object') {
      return $$ThrowException('construct_non_constructor', [$$Type(constructor)]);
    }

    var proto = constructor.Get('prototype');
    if ($$Type(proto) !== 'Object') {
      proto = (constructor.Realm || realm).intrinsics[protos[intrinsicDefaultProto]];
    }

    return new $Object(proto);
  }

  exports.$$OrdinaryCreateFromConstructor = $$OrdinaryCreateFromConstructor;



  function $$OrdinaryHasInstance(C, O){
    if (!$$IsCallable(C)) {
      return false;
    }

    if (C.BoundTargetFunction) {
      return INSTANCE_OF(O, C.BoundTargetFunction);
    }

    if ($$Type(O) !== 'Object') {
      return false;
    }

    var P = C.Get('prototype');
    if ($$Type(P) !== 'Object') {
      return $$ThrowException('instanceof_nonobject_proto');
    }

    do {
      O = O.GetInheritance();
      if (O === P) {
        return true;
      }
    } while (O)

    return false;
  }

  exports.$$OrdinaryHasInstance = $$OrdinaryHasInstance;




  var realm, intrinsics;

  exports.changeRealm = function changeRealm(newRealm){
    realm = newRealm;
    intrinsics = realm ? realm.intrinsics : undefined;
  };

  return exports;
})(typeof module !== 'undefined' ? exports : {});
