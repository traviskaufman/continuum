var operations = (function(exports){
  var environments = require('./environments'),
      operators = require('./operators'),
      objects   = require('../lib/objects'),
      iteration = require('../lib/iteration'),
      errors    = require('../engine/errors'),
      constants = require('../engine/constants'),
      MapData   = require('./collections').MapData;

  var is               = objects.is,
      create           = objects.create,
      define           = objects.define,
      inherit          = objects.inherit,
      each             = iteration.each,
      ThrowException   = errors.ThrowException,
      AbruptCompletion = errors.AbruptCompletion,
      StopIeration     = constants.BRANDS.StopIteration,
      ToPropertyName   = operators.ToPropertyName,
      GetThisValue     = operators.GetThisValue,
      ToUint32         = operators.ToUint32,
      ToObject         = operators.ToObject;


  function IsDataDescriptor(o){
    IsDataDescriptor = require('./descriptors').isDataDescriptor;
    return IsDataDescriptor(o);
  }

  function $Object(o){
    $Object = require('./$Object');
    return new $Object(o);
  }

  function $InternalArray(o){
    $InternalArray = require('../engine/runtime').builtins.$InternalArray;
    return new $InternalArray(o);
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
        return new Reference(this, key, strict);
      }
    ]);

    return Reference;
  })();


  function CheckObjectCoercible(argument){
    if (argument === null) {
      return ThrowException('null_to_object');
    } else if (argument === undefined) {
      return ThrowException('undefined_to_object');
    }
    return argument;
  }

  exports.checkObjectCoercible = CheckObjectCoercible;


  function IsArrayIndex(argument) {
    var n = argument >>> 0;
    return ''+n === argument && n !== 0xffffffff;
  }

  exports.isArrayIndex = IsArrayIndex;


  function IsPropertyReference(v){
    var type = typeof v.base;
    return v !== null
        && type === 'string' || type === 'number' || type === 'boolean'
        || type === 'object' && 'GetP' in v.base;
  }

  exports.isPropertyReference = IsPropertyReference;


  function GetIdentifierReference(lex, name, strict){
    if (lex == null) {
      return new Reference(undefined, name, strict);
    } else if (lex.HasBinding(name)) {
      return new Reference(lex, name, strict);
    } else {
      return GetIdentifierReference(lex.outer, name, strict);
    }
  }

  exports.getIdentifierReference = GetIdentifierReference;


  function GetSymbol(context, name){
    var env = context.LexicalEnvironment;
    while (env) {
      if (env.HasSymbolBinding(name)) {
        return env.GetSymbol(name);
      }
      env = env.outer;
    }
  }

  exports.getSymbol = GetSymbol;


  function Element(context, prop, base){
    var result = CheckObjectCoercible(base);
    if (result.Abrupt) return result;

    var name = ToPropertyName(prop);
    if (name && name.Abrupt) return name;
    return new Reference(base, name, context.strict);
  }

  exports.element = Element;


  function SuperReference(context, prop){
    var env = GetThisEnvironment(context);
    if (!env.HasSuperBinding()) {
      return ThrowException('invalid_super_binding');
    } else if (prop === null) {
      return env;
    }

    var baseValue = env.GetSuperBase(),
        status = CheckObjectCoercible(baseValue);

    if (status.Abrupt) return status;

    if (prop === false) {
      var key = env.GetMethodName();
    } else {
      var key = ToPropertyName(prop);
      if (key && key.Abrupt) return key;
    }

    var ref = new Reference(baseValue, key, context.strict);
    ref.thisValue = env.GetThisBinding();
    return ref;
  }

  exports.superReference = SuperReference;


  function GetThisEnvironment(context){
    var env = context.LexicalEnvironment;
    while (env) {
      if (env.HasThisBinding())
        return env;
      env = env.outer;
    }
  }

  exports.getThisEnvironment = GetThisEnvironment;


  function ThisResolution(context){
    return GetThisEnvironment(context).GetThisBinding();
  }

  exports.thisResolution = ThisResolution;


  function IdentifierResolution(context, name) {
    return GetIdentifierReference(context.LexicalEnvironment, name, context.strict);
  }

  exports.identifierResolution = IdentifierResolution;


  function IsCallable(argument){
    if (argument && argument.Abrupt) return argument;
    return argument && typeof argument === 'object' ? 'Call' in argument : false;
  }

  exports.isCallable = IsCallable;


  function IsConstructor(argument){
    if (argument && argument.Abrupt) return argument;
    return argument && typeof argument === 'object' ? 'Construct' in argument : false;
  }

  exports.isConstructor = IsConstructor;


  function EvaluateConstruct(func, args) {
    if (typeof func !== 'object') {
      return ThrowException('not_constructor', func);
    }

    if (IsConstructor(func)) {
      return func.Construct(args);
    } else {
      return ThrowException('not_constructor', func);
    }
  }

  exports.evaluateConstruct = EvaluateConstruct;


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

  exports.evaluateCall = EvaluateCall;

  var emptyArgs = [];


  function Invoke(key, receiver, args){
    var obj = ToObject(receiver);
    if (obj && obj.Abrupt) return obj;

    var func = obj.Get(key);
    if (func && func.Abrupt) return func;

    if (!IsCallable(func)) {
      return ThrowException('called_non_callable', key);
    }

    return func.Call(obj, args || emptyArgs);
  }

  exports.invoke = Invoke;


  function SpreadArguments(precedingArgs, spread){
    if (typeof spread !== 'object') {
      return ThrowException('spread_non_object');
    }

    var offset = precedingArgs.length,
        len = ToUint32(spread.Get('length'));

    if (len && len.Abrupt) return len;

    for (var i=0; i < len; i++) {
      var value = spread.Get(i);
      if (value && value.Abrupt) return value;
      precedingArgs[i + offset] = value;
    }
  }

  exports.spreadArguments = SpreadArguments;


  function SpreadInitialization(array, offset, spread){
    if (typeof spread !== 'object') {
      return ThrowException('spread_non_object');
    }

    var len = ToUint32(spread.Get('length'));

    for (var i = offset; i < len; i++) {
      var value = spread.Get(i);
      if (value && value.Abrupt) return value;
      array.set(offset++ + '', value);
    }

    array.define('length', offset, _CW);
    return offset;
  }

  exports.spreadInitialization = SpreadInitialization;


  function SpreadDestructuring(context, target, index){
    var array = context.createArray(0);
    if (target == null) {
      return array;
    }
    if (typeof target !== 'object') {
      return ThrowException('spread_non_object', typeof target);
    }

    var len = ToUint32(target.Get('length'));
    if (len && len.Abrupt) return len;

    var count = len - index;
    for (var i=0; i < count; i++) {
      var value = target.Get(index + i);
      if (value && value.Abrupt) return value;
      array.set(i+'', value);
    }

    array.define('length', i, _CW);
    return array;
  }

  exports.spreadDestructuring = SpreadDestructuring;


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

  exports.getTemplateCallSite = GetTemplateCallSite;


  function EnqueueChangeRecord(record, changeObservers){
    changeObservers.forEach(function(callback){
      var changeRecords = callback.PendingChangeRecords || (callback.PendingChangeRecords = []);
      changeRecords.push(record);
    });
  }

  exports.enqueueChangeRecord = EnqueueChangeRecord;


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

  exports.createChangeRecord = CreateChangeRecord;


  function DeliverChangeRecords(callback){
    var changeRecords = callback.PendingChangeRecords;
    if (changeRecords && changeRecords.length) {
      var array = new $InternalArray(changeRecords);
      changeRecords.length = 0;
      var result = callback.Call(undefined, [array]);
      if (result && result.Abrupt) {
        return result;
      }
      return true;
    }
    return false;
  }

  exports.deliverChangeRecords = DeliverChangeRecords;


  function DeliverAllChangeRecords(realm){
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

  exports.deliverAllChangeRecords = DeliverAllChangeRecords;


  function GetNotifier(object){
    var notifier = object.Notifier;
    if (!notifier) {
      notifier = object.Notifier = new $Object(intrinsics.NotifierProto);
      notifier.Target = object;
      notifier.ChangeObservers = new MapData;
    }
    return notifier;
  }

  exports.getNotifier = GetNotifier;


  function ThrowStopIteration(){
    return new AbruptCompletion('throw', intrinsics.StopIteration);
  }

  exports.throwStopIteration = ThrowStopIteration;


  function IsStopIteration(o){
    return !!(o && o.Abrupt && o.value && o.value.BuiltinBrand === StopIteration);
  }

  exports.isStopIteration = IsStopIteration;


  function GetKey(context, value){
    if (!value || typeof value === 'string') {
      return value;
    }
    return value[0] !== '@' ? value[1] : context.getSymbol(value[1]);
  }

  exports.getKey = GetKey;




  var realm, intrinsics;

  exports.changeRealm = function changeRealm(newRealm){
    realm = newRealm;
    intrinsics = realm ? realm.intrinsics : undefined;
  };

  return exports;
})(typeof module !== 'undefined' ? exports : {});
