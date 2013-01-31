var natives = (function(module){
  "use strict";
  var objects          = require('./lib/objects'),
      Stack            = require('./lib/Stack'),
      buffers          = require('./lib/buffers'),
      errors           = require('./errors'),
      Nil              = require('./object-model/$Nil'),
      $Array           = require('./object-model/$Array').$Array,
      $Object          = require('./object-model/$Object').$Object,
      $TypedArray      = require('./object-model/$TypedArray'),
      operators        = require('./object-model/operators'),
      operations       = require('./object-model/operations'),
      descriptors      = require('./object-model/descriptors'),
      collections      = require('./object-model/collections'),
      constants        = require('./constants'),
      wellKnownSymbols = require('./object-model/$Symbol').wellKnownSymbols;

  var $Nil             = Nil.$Nil,
      Undetectable     = Nil.Undetectable,
      isUndetectable   = Nil.isUndetectable,
      inherit          = objects.inherit,
      define           = objects.define,
      isObject         = objects.isObject,
      create           = objects.create,
      Hash             = objects.Hash,
      DataView         = buffers.DataView,
      ArrayBuffer      = buffers.ArrayBuffer,
      $$ThrowException = errors.$$ThrowException,
      $$MakeException  = errors.$$MakeException,
      $$ToPropertyDescriptor    = descriptors.$$ToPropertyDescriptor,
      $$FromPropertyDescriptor  = descriptors.$$FromPropertyDescriptor,
      $$IsCallable              = operations.$$IsCallable,
      $$CreateListFromArray     = operations.$$CreateListFromArray,
      $$DeliverAllChangeRecords = operations.$$DeliverAllChangeRecords;

  var Hooked = new Hash,
      timers = {};


  var natives = (function(){
    var HashMap  = require('./lib/HashMap'),
        inherit  = require('./lib/objects').inherit,
        isObject = require('./lib/objects').isObject,
        each     = require('./lib/iteration').each,
        fname    = require('./lib/functions').fname;

    function BulkMap(){
      HashMap.apply(this, arguments);
    }

    inherit(BulkMap, HashMap, [
      function add(name, value){
        if (typeof name === 'string') {
          this.set(name, value);
        } else if (typeof name === 'function') {
          this.set(fname(name), name);
        } else if (isObject(name)) {
          each(name, function(value, name){
            this.set(name, value);
          }, this);
        }
        return this.size;
      }
    ]);

    return new BulkMap;
  })();



  function $InternalFunction(o){
    $InternalFunction = require('./runtime').builtins.$InternalFunction;
    return new $InternalFunction(o);
  }

  function deliverChangeRecordsAndReportErrors(){
    var observerResults = $$DeliverAllChangeRecords();
    if (observerResults && observerResults instanceof Array) {
      each(observerResults, function(error){
        require('./runtime').emit('throw', error);
      });
    }
  }

  natives.add({
    _createUndetectable: function(obj, args){
      return new Undetectable(args[0]);
    },
    _unwrapUndetectable: function(obj, args){
      if (isUndetectable(args[0])) {
        return args[0].value;
      }
    },
    _isUndetectable: function(obj, args){
      return isUndetectable(args[0]);
    },
    _Call: function(obj, args){
      return args[0].Call(args[1], $$CreateListFromArray(args[2]));
    },
    _Construct: function(obj, args){
      return args[0].Construct($$CreateListFromArray(args[1]));
    },
    _GetBuiltinBrand: function(obj, args){
      return args[0].BuiltinBrand;
    },
    _SetBuiltinBrand: function(obj, args){
      args[0].BuiltinBrand = args[1];
    },
    _GetInheritance: function(obj, args){
      obj = args[0];
      do {
        obj = obj.GetInheritance();
      } while (obj && obj.HiddenPrototype)
      return obj;
    },
    _SetInheritance: function(obj, args){
      obj = args[0];
      var proto = obj.Prototype;
      if (proto && proto.HiddenPrototype) {
        obj = proto;
      }
      return obj.SetInheritance(args[1]);
    },
    _IsExtensible: function(obj, args){
      return args[0].IsExtensible();
    },
    _PreventExtensions: function(obj, args){
      return args[0].PreventExtensions();
    },
    _DefineOwnProperty: function(obj, args){
      return args[0].DefineOwnProperty(args[1], $$ToPropertyDescriptor(args[2]), args[3]);
    },
    _Enumerate: function(obj, args){
      return new $Array(args[0].Enumerate(args[1], args[2]));
    },
    _GetProperty: function(obj, args){
      return $$FromPropertyDescriptor(args[0].GetProperty(args[1]));
    },
    _GetOwnProperty: function(obj, args){
      return $$FromPropertyDescriptor(args[0].GetOwnProperty(args[1]));
    },
    _HasProperty: function(obj, args){
      return args[0].HasProperty(args[1]);
    },
    _HasOwnProperty: function(obj, args){
      return args[0].HasOwnProperty(args[1]);
    },
    _SetP: function(obj, args){
      return args[0].SetP(args[3], args[1], args[2]);
    },
    _GetP: function(obj, args){
      return args[0].GetP(args[2], args[1]);
    },
    _Get: function(obj, args){
      return args[0].Get(args[1]);
    },
    _Put: function(obj, args){
      return args[0].Put(args[1], args[2], args[3]);
    },
    _has: function(obj, args){
      return args[0].has(args[1]);
    },
    _delete: function(obj, args){
      return args[0].remove(args[1]);
    },
    _set: function(obj, args){
      return args[0].set(args[1], args[2]);
    },
    _get: function(obj, args){
      return args[0].get(args[1]);
    },
    _define: function(obj, args){
      args[0].define(args[1], args[2], args.length === 4 ? args[3] : 6);
    },
    _query: function(obj, args){
      return args[0].query(args[1]);
    },
    _update: function(obj, args){
      return args[0].update(args[1], args[2]);
    },
    _each: function(obj, args){
      var callback = args[1];
      args[0].each(function(prop){
        callback.Call(obj, prop);
      });
    },
    _setInternal: function(obj, args){
      args[0][args[1]] = args[2];
    },
    _getInternal: function(obj, args){
      return args[0][args[1]];
    },
    _hasInternal: function(obj, args){
      return args[1] in args[0];
    },
    Exception: function(type, args){
      return $$MakeException(type, $$CreateListFromArray(args));
    },
    _createNil: function(){
      return new $Nil;
    },
    _NumberToString: function(obj, args){
      return args[0].toString(args[1]);
    },
    _Signal: function(obj, args){
      var realm = require('./runtime').realm;
      realm.emit.apply(realm, args);
    },
    DateParse: Date.parse || function(){ return NaN },
    readFile: function(path, callback){
      require('fs').readFile(path, 'utf8', function(err, file){
        callback.Call(undefined, [file]);
      });
    },
    baseURL: module ? function(){ return module.parent.parent.dirname }
                    : function(){ return location.origin + location.pathname }
  });


  return module.exports = natives;
})(typeof module !== 'undefined' ? module : {});
