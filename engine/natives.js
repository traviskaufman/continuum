var natives = (function(module){
  "use strict";
  var objects     = require('./lib/objects'),
      Stack       = require('./lib/Stack'),
      buffers     = require('./lib/buffers'),
      errors      = require('./errors'),
      $Array      = require('./object-model/$Array'),
      $Object     = require('./object-model/$Object').$Object,
      $TypedArray = require('./object-model/$TypedArray'),
      operators   = require('./object-model/operators'),
      operations  = require('./object-model/operations'),
      descriptors = require('./object-model/descriptors'),
      collections = require('./object-model/collections'),
      BRANDS      = require('./constants').BRANDS;

  var inherit                   = objects.inherit,
      define                    = objects.define,
      isObject                  = objects.isObject,
      create                    = objects.create,
      Hash                      = objects.Hash,
      $$ThrowException          = errors.$$ThrowException,
      $$MakeException           = errors.$$MakeException,
      DataView                  = buffers.DataView,
      ArrayBuffer               = buffers.ArrayBuffer,
      $$ToPropertyDescriptor    = descriptors.$$ToPropertyDescriptor,
      $$FromPropertyDescriptor  = descriptors.$$FromPropertyDescriptor,
      $$IsCallable              = operations.$$IsCallable,
      $$CreateListFromArray     = operations.$$CreateListFromArray,
      $$DeliverAllChangeRecords = operations.$$DeliverAllChangeRecords;

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      Hooked = new Hash,
      timers = {},
      nativeCode = ['function ', '() { [native code] }'];


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
    ToObject: operators.$$ToObject,
    ToString: operators.$$ToString,
    ToNumber: operators.$$ToNumber,
    ToBoolean: operators.$$ToBoolean,
    ToPropertyKey: operators.$$ToPropertyKey,
    ToInteger: operators.$$ToInteger,
    ToInt32: operators.$$ToInt32,
    ToUint32: operators.$$ToUint32,
    ToUint16: operators.$$ToUint16,
    CheckObjectCoercible: operations.$$CheckObjectCoercible,
    GetNotifier: operations.$$GetNotifier,
    EnqueueChangeRecord: operations.$$EnqueueChangeRecord,
    DeliverChangeRecords: operations.$$DeliverChangeRecords,
    parseInt: parseInt,
    parseFloat: parseFloat,
    decodeURI: decodeURI,
    decodeURIComponent: decodeURIComponent,
    encodeURI: encodeURI,
    encodeURIComponent: encodeURIComponent,
    escape: escape,
    unescape: unescape,
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
    _Call: function(obj, args){
      return args[0].Call(args[1], $$CreateListFromArray(args[2]));
    },
    _Construct: function(obj, args){
      return args[0].Construct($$CreateListFromArray(args[1]));
    },
    _GetBuiltinBrand: function(obj, args){
      if (args[0].BuiltinBrand) {
        return args[0].BuiltinBrand.name;
      }
    },
    _SetBuiltinBrand: function(obj, args){
      var brand = BRANDS[args[1]];
      if (brand) {
        args[0].BuiltinBrand = brand;
        return args[0].BuiltinBrand.name;
      }
      return $$ThrowException('unknown_builtin_brand');
    },
    _HasProperty: function(obj, args){
      return args[0].HasProperty(args[1]);
    },
    _IsExtensible: function(obj){
      return args[0].IsExtensible();
    },
    _PreventExtensions: function(obj){
      return args[0].PreventExtensions();
    },
    _GetPrototype: function(obj, args){
      obj = args[0];
      do {
        obj = obj.GetInheritance();
      } while (obj && obj.HiddenPrototype)
      return obj;
    },
    _SetPrototype: function(obj, args){
      obj = args[0];
      var proto = obj.Prototype;
      if (proto && proto.HiddenPrototype) {
        obj = proto;
      }
      return obj.SetInheritance(args[1]);
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
        return $$ThrowException('buffer_out_of_bounds')
      }

      return obj.View['set'+args[0]](offset, args[2], !!args[3]);
    },
    _DataViewGet: function(obj, args){
      var offset = args[1] >>> 0;

      if (offset >= obj.ByteLength) {
        return $$ThrowException('buffer_out_of_bounds')
      }

      return obj.View['get'+args[0]](offset, !!args[2]);
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
    _GetIntrinsic: function(obj, args){
      return require('./runtime').intrinsics[args[0]];
    },
    _SetIntrinsic: function(obj, args){
      require('./runtime').intrinsics[args[0]] = args[1];
    },
    _IsConstructor: function(obj, args){
      return !!(args[0] && args[0].Construct);
    },
    _Type: function(obj, args){
      if (args[0] === null) {
        return 'Null';
      }
      switch (typeof args[0]) {
        case 'undefined': return 'Undefined';
        case 'function':
        case 'object':    return 'Object';
        case 'string':    return 'String';
        case 'number':    return 'Number';
        case 'boolean':   return 'Boolean';
      }
    },
    Exception: function(type, args){
      return $$MakeException(type, $$CreateListFromArray(args));
    },
    _now: Date.now || function(){ return +new Date },
    _SetDefaultLoader: function(obj, args){
      require('./runtime').realm.loader = args[0];
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
          return new $Array(original.call(args[0], args[1]));
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

    _FunctionToString: function(obj, args){
      obj = args[0];
      if (obj.Proxy) {
        obj = obj.ProxyTarget;
      }
      var code = obj.code;
      if (obj.BuiltinFunction || !code) {
        var name = obj.get('name');
        if (name && typeof name !== 'string' && name.BuiltinBrand === BRANDS.BuiltinSymbol) {
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
      return ''+args[0].PrimitiveValue;
    },
    _RegExpExec: function(obj, args){
      var result = args[0].PrimitiveValue.exec(args[1]);
      if (result) {
        var array = new $Array(result);
        array.set('index', result.index);
        array.set('input', args[1]);
        return array;
      }
      return result;
    },
    _RegExpTest: function(obj, args){
      return args[0].PrimitiveValue.test(args[1]);
    },
    _CallBuiltin: function(obj, args){
      var object  = args[0],
          prop    = args[1],
          arglist = args[2];

      if (arglist) {
        return object[prop].apply(object, $$CreateListFromArray(arglist));
      }
      return object[prop]();
    },
    _CodeUnit: function(obj, args){
      return args[0].charCodeAt(0);
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
      return new $Array(str.split(separator, limit));
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

    SetTimer: function(f, time, repeating){
      if (typeof f === 'string') {
        f = natives.get('FunctionCreate')(f);
      }
      var id = Math.random() * 1000000 << 10;
      timers[id] = setTimeout(function trigger(){
        if (timers[id]) {
          f.Call(require('./runtime').global, []);
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
    JSONParse: function parse(source, reviver){
      function walk(holder, key){
        var value = holder.get(key);
        if (value && typeof value === 'object') {
          value.each(function(prop){
            if (prop[2] & 1) {
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

      source = $$ToString(source);
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
        var json = require('./runtime').realm.evaluate('('+source+')'),
            wrapper = new $Object;
        wrapper.set('', json);
        return $$IsCallable(reviver) ? walk(wrapper, '') : json;
      }

      return $$ThrowException('invalid_json', source);
    },
    _MapSigil: function(){
      return collections.MapData.sigil;
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
      return result instanceof Array ? new $Array(result) : result;
    },
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
    _Signal: function(obj, args){
      var realm = require('./runtime').realm;
      realm.emit.apply(realm, args);
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
    resolve: require('path')
      ?  require('path').resolve
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
  });

  void function(){
    var escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\' };

    function escaper(a) {
      var c = meta[a];
      return typeof c === 'string' ? c : '\\u'+('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }

    natives.add({
      Quote: function(string){
        escapable.lastIndex = 0;
        return '"'+string.replace(escapable, escaper)+'"';
      }
    });
  }();

  return module.exports = natives;
})(typeof module !== 'undefined' ? module : {});
