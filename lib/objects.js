var objects = (function(exports){
  var functions = require('./functions'),
      callbind  = functions.callbind,
      bind      = functions.bind,
      fname     = functions.fname;

  var toBrand = callbind({}.toString),
      hasOwn = callbind({}.hasOwnProperty);

  exports.hasOwn = hasOwn;

  var hasDunderProto = { __proto__: [] } instanceof Array,
      isES5 = !(!Object.getOwnPropertyNames || 'prototype' in Object.getOwnPropertyNames);

  var hidden = {
    configurable: true,
    enumerable: false,
    writable: true,
    value: undefined
  };


  function getBrandOf(o){
    if (o === null) {
      return 'Null';
    } else if (o === undefined) {
      return 'Undefined';
    } else {
      return toBrand(o).slice(8, -1);
    }
  }
  exports.getBrandOf = getBrandOf;

  function ensureObject(name, o){
    if (typeof o === 'object' ? o === null : typeof o !== 'function') {
      throw new TypeError(name + ' called with non-object ' + getBrandOf(o));
    }
  }

  function isObject(v){
    var type = typeof v;
    return type === 'object' ? v !== null : type === 'function';
  }
  exports.isObject = isObject;



  if (isES5) {
    var create = exports.create = Object.create;
  } else {
    var Null = function(){};
    var hiddens = ['constructor', 'hasOwnProperty', 'propertyIsEnumerable',
                   'isPrototypeOf', 'toLocaleString', 'toString', 'valueOf'];

    var create = exports.create = (function(F){
      var iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = 'javascript:';
      Null.prototype = iframe.contentWindow.Object.prototype;
      document.body.removeChild(iframe);

      while (hiddens.length) {
        delete Null.prototype[hiddens.pop()];
      }

      return function create(object){
        if (object === null) {
          return new Null;
        } else {
          F.prototype = object;
          object = new F;
          F.prototype = null;
          return object;
        }
      };
    })(function(){});
  }

  var ownKeys = exports.keys = (function(){
    if (isES5) return Object.keys;
    return function keys(o){
      var out = [], i=0;
      for (var k in o) {
        if (hasOwn(o, k)) {
          out[i++] = k;
        }
      }
      return out;
    };
  })();

  var getPrototypeOf = exports.getPrototypeOf = (function(){
    if (isES5) {
      return Object.getPrototypeOf;
    } else if (hasDunderProto) {
      return function getPrototypeOf(o){
        ensureObject('getPrototypeOf', o);
        return o.__proto__;
      };
    } else {
      return function getPrototypeOf(o){
        ensureObject('getPrototypeOf', o);

        var ctor = o.constructor;

        if (typeof ctor === 'function') {
          var proto = ctor.prototype;
          if (o !== proto) {
            return proto;
          } else if (ctor._super) {
            return ctor._super.prototype;
          } else {
            delete o.constructor;
            var _super = ctor._super = o.constructor;
            o.constructor = ctor;
            if (_super) {
              return _super.prototype;
            } else if (o instanceof Object) {
              return Object.prototype;
            } else {
              return null;
            }
          }
        } else if (o instanceof Null) {
          return null;
        } else if (o instanceof Object) {
          return Object.prototype;
        }
      };
    }
  })();

  var defineProperty = exports.defineProperty = (function(){
    if (isES5) return Object.defineProperty;
    return function defineProperty(o, k, desc){
      try { o[k] = desc.value } catch (e) {}
      return o;
    };
  })();


  var describeProperty = exports.describeProperty = (function(){
    if (isES5) return Object.getOwnPropertyDescriptor;
    return function getOwnPropertyDescriptor(o, k){
      ensureObject('getOwnPropertyDescriptor', o);
      if (hasOwn(o, k)) {
        return { value: o[k] };
      }
    };
  })();

  var ownProperties = exports.properties = isES5 ? Object.getOwnPropertyNames : ownKeys;

  if (isES5) {
    exports.isExtensible = Object.isExtensible;
  } else {
    exports.isExtensible = function isExtensible(){ return true };
  }

  function enumerate(o){
    var out = [], i = 0;
    for (out[i++] in o);
    return out;
  }
  exports.enumerate = enumerate;


  function copy(o){
    return assign(create(getPrototypeOf(o)), o);
  }
  exports.copy = copy;


  function define(o, p, v){
    switch (typeof p) {
      case 'function':
        v = p;
        p = fname(v);
      case 'string':
        hidden.value = v;
        defineProperty(o, p, hidden);
        break;
      case 'object':
        if (p instanceof Array) {
          for (var i=0; i < p.length; i++) {
            var f = p[i];
            if (typeof f === 'function') {
              var name = fname(f);
            } else if (typeof f === 'string' && typeof p[i+1] !== 'function' || !fname(p[i+1])) {
              var name = f;
              f = p[i+1];
            }
            if (name) {
              hidden.value = f;
              defineProperty(o, name, hidden);
            }
          }
        } else if (p) {
          var keys = ownKeys(p)

          for (var i=0; i < keys.length; i++) {
            var desc = describeProperty(p, keys[i]);
            if (desc) {
              desc.enumerable = 'get' in desc;
              defineProperty(o, keys[i], desc);
            }
          }
        }
    }

    hidden.value = undefined;
    return o;
  }
  exports.define = define;


  function assign(o, p, v){
    switch (typeof p) {
      case 'function':
        o[fname(p)] = p;
        break;
      case 'string':
        o[p] = v;
        break;
      case 'object':
        if (p instanceof Array) {
          for (var i=0; i < p.length; i++) {
            var f = p[i];
            if (typeof f === 'function' && fname(f)) {
              var name = fname(f);
            } else if (typeof f === 'string' && typeof p[i+1] !== 'function' || !fname(p[i+1])) {
              var name = f;
              f = p[i+1];
            }
            if (name) {
              o[name] = f;
            }
          }
        } else if (p) {
          var keys = ownKeys(p)

          for (var i=0; i < keys.length; i++) {
            var k = keys[i];
            o[k] = p[k];
          }
        }
    }
    return o;
  }
  exports.assign = assign;

  exports.assignAll = function assignAll(o, array){
    for (var i=0; i < array.length; i++) {
      assign(o, array[i]);
    }
    return o;
  }

  var nonEnumerable = { enumerable: false };

  var hide = exports.hide = (function(){
    if (isES5) {
      return function hide(o, k){
        defineProperty(o, k, nonEnumerable);
      };
    }
    return function hide(){};
  })();

  function inherit(Ctor, Super, properties, methods){
    define(Ctor, 'inherits', Super);
    Ctor.prototype = create(Super.prototype);
    define(Ctor.prototype, 'constructor', Ctor);
    properties && define(Ctor.prototype, properties);
    methods    && define(Ctor.prototype, methods);
    return Ctor;
  }
  exports.inherit = inherit;

  function Hash(){}
  Hash.prototype = create(null);
  exports.Hash = Hash;

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
