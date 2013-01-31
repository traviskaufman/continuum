var $Descriptor = (function(exports){
  var $Object = require('./$Object').$Object,
      MISSING = require('../constants').MISSING
      tag     = require('../lib/utility').tag,
      engine  = require('../engine').engine;

  var inherit = require('../lib/objects').inherit;

  var ECW = 7;

  var Configurable = ['configurable', undefined, ECW],
      Enumerable   = ['enumerable', undefined, ECW],
      Writable     = ['writable', undefined, ECW],
      Value        = ['value', undefined, ECW],
      Get          = ['get', undefined, ECW],
      Set          = ['set', undefined, ECW];


  function deoptimize(object){
    var id = object.id;
    $Object.call(object, object.Prototype);
    object.id = id;

    object.get = $Object.prototype.get;
    object.set = $Object.prototype.set;
    object.has = $Object.prototype.has;
    object.each = $Object.prototype.each;
    object.query = $Object.prototype.query;
    object.update = $Object.prototype.update;
    object.remove = $Object.prototype.remove;
    object.define = $Object.prototype.define;
    object.describe = $Object.prototype.describe;

    var desc = object.descriptor;
    object.set('configurable', desc.Configurable);
    object.set('enumerable', desc.Enumerable);
    if (desc.isDataDescriptor) {
      object.set('writable', desc.Writable);
      object.set('value', desc.Value);
    } else if (desc.isAccessorDescriptor) {
      object.set('get', desc.Get);
      object.set('set', desc.Set);
    }

    object.descriptor = undefined;
  }


  function $Descriptor(descriptor){
    this.descriptor = descriptor;
    this.Prototype = intrinsics['%ObjectPrototype%'];
    this.Realm = realm;
    tag(this);
  }

  exports.$Descriptor = $Descriptor;

  inherit($Descriptor, $Object, [
    function has(key){
      switch (key) {
        case 'configurable':
          return 'Configurable' in this.descriptor;
        case 'enumerable':
          return 'Enumerable' in this.descriptor;
        case 'writable':
          return 'Writable' in this.descriptor;
        case 'value':
          return 'Value' in this.descriptor;
        case 'get':
          return 'Get' in this.descriptor;
        case 'set':
          return 'Set' in this.descriptor;
      }
      return false;
    },
    function remove(key){
      switch (key) {
        case 'configurable':
          return delete this.descriptor.Configurable;
        case 'enumerable':
          return delete this.descriptor.Enumerable;
        case 'writable':
          return delete this.descriptor.Writable;
        case 'value':
          return delete this.descriptor.Value;
        case 'get':
          return delete this.descriptor.Get;
        case 'set':
          return delete this.descriptor.Set;
      }
      return false;
    },
    function get(key){
      switch (key) {
        case 'configurable':
          return this.descriptor.Configurable;
        case 'enumerable':
          return this.descriptor.Enumerable;
        case 'writable':
          return this.descriptor.Writable;
        case 'value':
          return this.descriptor.Value;
        case 'get':
          return this.descriptor.Get;
        case 'set':
          return this.descriptor.Set;
      }
    },
    function set(key, value){
      switch (key) {
        case 'configurable':
          this.descriptor.Configurable = value;
          return true;
        case 'enumerable':
          this.descriptor.Enumerable = value;
          return true;
        case 'writable':
          if (this.descriptor.isDataDescriptor) {
            this.descriptor.Writable = value;
            return true;
          }
          break;
        case 'value':
          if (this.descriptor.isDataDescriptor) {
            this.descriptor.Value = value;
            return true;
          }
          break;
        case 'get':
          if (this.descriptor.isAccessorDescriptor) {
            this.descriptor.Get = value;
            return true;
          }
          break;
        case 'set':
          if (this.descriptor.isAccessorDescriptor) {
            this.descriptor.Set = value;
            return true;
          }
          break;
      }

      deoptimize(this);
      return this.set(key, value);
    },
    function describe(key){
      switch (key) {
        case 'configurable':
          if ('Configurable' in this.descriptor) {
            Configurable[1] = this.descriptor.Configurable;
            return Configurable;
          }
          return;
        case 'enumerable':
          if ('Enumerable' in this.descriptor) {
            Enumerable[1] = this.descriptor.Enumerable;
            return Enumerable;
          }
          return;
        case 'writable':
          if ('Writable' in this.descriptor) {
            Writable[1] = this.descriptor.Writable;
            return Writable;
          }
          return;
        case 'value':
          if ('Value' in this.descriptor) {
            Value[1] = this.descriptor.Value;
            return Value;
          }
          return;
        case 'get':
          if ('Get' in this.descriptor) {
            Get[1] = this.descriptor.Get;
            return Get;
          }
          return;
        case 'set':
          if ('Set' in this.descriptor) {
            Set[1] = this.descriptor.Set;
            return Set;
          }
          return;
      }
    },
    function query(key){
      return ECW;
    },
    function update(key, attr){
      if (attr !== ECW) {
        deoptimize(this);
        return this.update(key, attr);
      }
      return true;
    },
    function each(callback){
      if ('Configurable' in this.descriptor) {
        Configurable[1] = this.descriptor.Configurable;
        callback.call(this, Configurable);
      }

      if ('Enumerable' in this.descriptor) {
        Enumerable[1] = this.descriptor.Enumerable;
        callback.call(this, Enumerable);
      }

      if ('Writable' in this.descriptor) {
        Writable[1] = this.descriptor.Writable;
        callback.call(this, Writable);
      }

      if ('Value' in this.descriptor) {
        Value[1] = this.descriptor.Value;
        callback.call(this, Value);
      }

      if ('Get' in this.descriptor) {
        Get[1] = this.descriptor.Get;
        callback.call(this, Get);
      }

      if ('Set' in this.descriptor) {
        Set[1] = this.descriptor.Set;
        callback.call(this, Set);
      }
    },
    function define(key, value, attrs){
      var ret = this.set(key, value);
      return this.update(key, attrs) && ret;
    }
  ]);



  var realm, intrinsics;

  engine.on('realm-change', function(){
    realm = engine.activeRealm;
    intrinsics = engine.activeIntrinsics;
  });


  return exports;
})(typeof module !== 'undefined' ? exports : {});
