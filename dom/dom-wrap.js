
var wrap = (function(){

  function resolvedNames(o){
    var names = Object.create(null),
        proto = Object(o),
        keys = [];

    Object.getOwnPropertyNames(proto).forEach(function(key){
      var desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc && !(key in names) && !('get' in desc)) {
        names[key] = true;
        keys.push(key);
      }
    });

    while (proto = Object.getPrototypeOf(proto)) {
      Object.getOwnPropertyNames(proto).forEach(function(key){
        var desc = Object.getOwnPropertyDescriptor(proto, key);
        if (desc && !(key in names) && 'get' in desc) {
          names[key] = true;
          keys.push(key);
        }
      });
    }

    return keys;
  }


  var wrapped = new WeakMap,
      isObject = continuum.utility.isObject;

  function unwrap(value){
    if (isObject(value)) {
      if (value.object) {
        value = value.object;
      }
    }
    return value;
  }

  function wrap(value){
    if (isObject(value)) {
      if (wrapped.has(value)) {
        return wrapped.get(value);
      }
      if (typeof value === 'function') {
        return new $ExoticFunction(value);
      }
      return new $ExoticObject(value);
    }
    return value;
  }

  function attrsToDesc(attr){
    if (attr < 0) {
      var val = false;
      attr = ~attr;
    } else {
      var val = true;
    }
    var desc = {
      enumerable: (attr & 1) ? val : !val,
      configurable: (attr & 2) ? val : !val
    };
    if (attr & 4) {
      desc.writable = val;
    }
    return desc;
  }

  function descToAttrs(desc){
    if (desc) {
      return desc.enumerable | (desc.configurable << 1) | (desc.writable << 2);
    }
  }



  var handlers = [
    function init(object){
      this.object = object;
      wrapped.set(object, this);
      if ((typeof object === 'function' || 'prototype' in object) && !('name' in object)) {
        try {
          Object.defineProperty(object, 'name', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: utility.fname(object)
          });
        } catch (e) {}
      }
    },
    function remove(key){
      delete this.object[key];
    },
    function describe(key){
      return [key, this.get(key), this.query(key)];
    },
    function define(key, value, attrs){
      this.object[key] = unwrap(value);
      return;
      var desc = attrsToDesc(attrs);
      desc.value = unwrap(value);
      //console.log(desc);
      //Object.defineProperty(this.object, key, desc);
    },
    function has(key){
      return key in this.object;
    },
    function each(callback){
      var keys = resolvedNames(this.object);
      for (var i=0; i < keys.length; i++) {
        var val = this.get(keys[i]);
        if (typeof val !== 'string' || val.length < 50) {
          callback([keys[i], val, this.query(keys[i])]);
        }
      }
    },
    function get(key){
      try {
        return wrap(this.object[key]);
      } catch (e) { }
    },
    function set(key, value){
      this.object[key] = unwrap(value);
    },
    function query(key){
      return this.object.propertyIsEnumerable(key) + 6;//descToAttrs(Object.getOwnPropertyDescriptor(this, key));
    },
    function update(key, attr){
      //Object.defineProperty(this.object, key, attrsToDesc(attr));
    },
    function getExtensible(){
      return true;
    },
    function getPrototype(){
      if (!this.protoSet) {
        this.Prototype = wrap(Object.getPrototypeOf(this.object));
      }
      return this.Prototype;
    }
  ]

  var applyNew = continuum.utility.applyNew;
  var $ExoticObject = continuum.createExotic('Object', handlers);
  var $ExoticFunction = continuum.createExotic('Function', handlers);

  $ExoticFunction.prototype.Call = function Call(receiver, args){
    return wrap(this.call.apply(unwrap(receiver), args.map(unwrap)));
  };

  $ExoticFunction.prototype.Construct = function Construct(args){
    return wrap(applyNew(this.call, args.map(unwrap)));
  };

  return wrap;
})();

