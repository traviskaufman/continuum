var $Object = (function(exports){
  var objects      = require('../lib/objects'),
      errors       = require('../errors'),
      constants    = require('../constants'),
      operators    = require('./operators'),
      descriptors  = require('./descriptors'),
      operations   = require('./operations'),
      PropertyList = require('../lib/PropertyList'),
      utility      = require('../lib/utility'),
      symbols      = require('./$Symbol').wellKnownSymbols;

  var inherit = objects.inherit,
      define  = objects.define,
      create  = objects.create,
      hide    = objects.hide,
      is      = objects.is,
      Hash    = objects.Hash,
      tag     = utility.tag,
      AccessorDescriptor       = descriptors.AccessorDescriptor,
      DataDescriptor           = descriptors.DataDescriptor,
      Accessor                 = descriptors.Accessor,
      Value                    = descriptors.Value,
      $$IsDataDescriptor       = descriptors.$$IsDataDescriptor,
      $$IsAccessorDescriptor   = descriptors.$$IsAccessorDescriptor,
      $$IsEmptyDescriptor      = descriptors.$$IsEmptyDescriptor,
      $$IsEquivalentDescriptor = descriptors.$$IsEquivalentDescriptor,
      $$IsGenericDescriptor    = descriptors.$$IsGenericDescriptor,
      $$ThrowException         = errors.$$ThrowException,
      $$ToBoolean              = operators.$$ToBoolean,
      $$ToString               = operators.$$ToString,
      $$ToUint32               = operators.$$ToUint32,
      $$IsCallable             = operations.$$IsCallable,
      $$Invoke                 = operations.$$Invoke,
      $$ThrowStopIteration     = operations.$$ThrowStopIteration,
      $$CreateChangeRecord     = operations.$$CreateChangeRecord,
      $$EnqueueChangeRecord    = operations.$$EnqueueChangeRecord;

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



  var normalDescriptor = { Value: undefined,
                           Writable: true,
                           Enumerable: true,
                           Configurable: true,
                           isDescriptor: true,
                           isDataDescriptor: true,
                           isAccessorDescriptor: false };

  function $$CreateOwnDataProperty(object, key, value){
    var extensible = object.IsExtensible();
    if (!extensible || extensible.Abrupt) return extensible;
    normalDescriptor.Value = value;
    return object.DefineOwnProperty(key, normalDescriptor);
  }

  exports.$$CreateOwnDataProperty = $$CreateOwnDataProperty;


  function $$OrdinaryGetOwnProperty(object, key){
    if (key === '__proto__') {
      var val = object.GetP(object, '__proto__');
      return typeof val === 'object' ? new DataDescriptor(val, _CW) : undefined;
    }

    var prop = object.describe(key);
    if (prop) {
      if (prop[2] & A) {
        var Descriptor = AccessorDescriptor,
            val = prop[1];
      } else {
        var val = prop[3] ? prop[3].Get.Call(object, []) : prop[1],
            Descriptor = DataDescriptor;
      }
      return new Descriptor(val, prop[2]);
    }
  }

  exports.$$OrdinaryGetOwnProperty = $$OrdinaryGetOwnProperty;


  function $$DefinePropertyOrThrow(object, key, desc){
    var success = object.DefineOwnProperty(key, value, desc);
    if (!success) {
      return $$ThrowException('redefine_disallowed', [key]);
    }
    return success;
  }

  exports.$$DefinePropertyOrThrow = $$DefinePropertyOrThrow;


  function $$DeletePropertyOrThrow(object, key){
    var success = object.DeleteProperty(key, value);
    if (!success) {
      return $$ThrowException('strict_delete_property', [key]);
    }
    return success;
  }

  exports.$$DeletePropertyOrThrow = $$DeletePropertyOrThrow;


  function $$HasProperty(object, key){
    if (object === null) return false;

    var obj = object;
    do {
      if (typeof obj !== 'object')  {
        return $$ThrowException('invalid_in_operator_use', [key, typeof obj]);
      }
      var has = obj.HasOwnProperty(key);
      if (has) return has;
      obj = obj.GetInheritance();
      if (obj && obj.Abrupt) return obj;
    } while (obj)
    return false;
  }

  exports.$$HasProperty = $$HasProperty;


  function $$OrdinaryDefineOwnProperty(object, key, desc){
    var current = $$OrdinaryGetOwnProperty(object, key),
        extensible = object.IsExtensible();
    return $$ValidateAndApplyPropertyDescriptor(object, key, extensible, desc, current);
  }

  exports.$$OrdinaryDefineOwnProperty = $$OrdinaryDefineOwnProperty;


  function $$IsCompatibleDescriptor(extensible, desc, current){
    return $$ValidateAndApplyPropertyDescriptor(undefined, undefined, extensible, desc, current);
  }

  exports.$$IsCompatibleDescriptor = $$IsCompatibleDescriptor;


  function $$ValidateAndApplyPropertyDescriptor(object, key, extensible, desc, current){
    var changeType = 'reconfigured';

    // New property
    if (current === undefined) {
      if (extensible && object !== undefined) {
        if ($$IsGenericDescriptor(desc) || $$IsDataDescriptor(desc)) {
          object.define(key, desc.Value, desc.Enumerable | (desc.Configurable << 1) | (desc.Writable << 2));
        } else {
          object.define(key, new Accessor(desc.Get, desc.Set), desc.Enumerable | (desc.Configurable << 1) | 8);
        }

        if (object.Notifier) {
          var changeObservers = object.Notifier.ChangeObservers;
          if (changeObservers.size) {
            var record = $$CreateChangeRecord('new', object, key);
            $$EnqueueChangeRecord(record, changeObservers);
          }
        }
      }
      return extensible === true;
    }

    // Empty descriptor
    if (!('Get' in desc || 'Set' in desc || 'Value' in desc)) {
      if (!('Writable' in desc || 'Enumerable' in desc || 'Configurable' in desc)) {
        return true;
      }
    }

    //Equal descriptor
    if (desc.Writable === current.Writable && desc.Enumerable === current.Enumerable && desc.Configurable === current.Configurable) {
      if (desc.Get === current.Get && desc.Set === current.Set && is(desc.Value, current.Value)) {
        return true;
      }
    }

    if (!current.Configurable) {
      if (desc.Configurable || 'Enumerable' in desc && desc.Enumerable !== current.Enumerable) {
        return false;
      } else {
        var currentIsData = $$IsDataDescriptor(current),
            descIsData = $$IsDataDescriptor(desc);

        if (currentIsData !== descIsData) {
          return false;
        } else if (currentIsData && descIsData) {
          if (!current.Writable && 'Value' in desc && !is(desc.Value, current.Value)) {
            return false;
          }
        } else if ('Set' in desc && desc.Set !== current.Set) {
          return false;
        } else if ('Get' in desc && desc.Get !== current.Get) {
          return false;
        }
      }
    }

    if (object === undefined) {
      return true;
    }

    'Configurable' in desc || (desc.Configurable = current.Configurable);
    'Enumerable' in desc || (desc.Enumerable = current.Enumerable);

    if ($$IsAccessorDescriptor(desc)) {
      object.update(key, desc.Enumerable | (desc.Configurable << 1) | 8);
      if ($$IsDataDescriptor(current)) {
        object.set(key, new Accessor(desc.Get, desc.Set));
      } else {
        var accessor = current.getAccessor();
        'Set' in desc && (accessor.Set = desc.Set);
        'Get' in desc && (accessor.Get = desc.Get);
        ('Set' in desc || 'Get' in desc) && object.set(key, accessor);
      }
    } else {
      if ($$IsAccessorDescriptor(current)) {
        current.Writable = true;
      }
      'Writable' in desc || (desc.Writable = current.Writable);
      object.update(key, desc.Enumerable | (desc.Configurable << 1) | (desc.Writable << 2));
      if ('Value' in desc) {
        object.set(key, desc.Value);
        changeType = 'updated';
      }
    }

    if (object.Notifier) {
      var changeObservers = object.Notifier.ChangeObservers;
      if (changeObservers.size) {
        var record = $$CreateChangeRecord(changeType, object, key, current);
        $$EnqueueChangeRecord(record, changeObservers);
      }
    }

    return true;
  }

  exports.$$ValidateAndApplyPropertyDescriptor = $$ValidateAndApplyPropertyDescriptor;



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
    tag(this);
    if (proto && proto.HiddenPrototype) {
      this.properties.setProperty(['__proto__', null, 6, Proto]);
    }
  }

  exports.$Object = $Object;


  define($Object.prototype, {
    Extensible: true,
    BuiltinBrand: 'BuiltinObject',
    type: '$Object'
  });

  void function(){
    define($Object.prototype, [
      (function(){ // IE6-8 leaks function expression names to surrounding scope
        return function define(key, value, attrs){
          return this.properties.define(key, value, attrs);
        };
      })(),
      function has(key){
        return this.properties.has(key);
      },
      function remove(key){
        return this.properties.remove(key);
      },
      function describe(key){
        return this.properties.describe(key);
      },
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
      function destroy(){
        this.destroy = null;
        this.properties.each(function(prop){
          var val = prop[1];
          this.remove(prop[0]);
          prop.length = 0;
          if (val && val.destroy) {
            val.destroy();
          }
        });
        for (var k in this) {
          if (this[k] && this[k].destroy) {
            this[k].destroy();
          }
        }
      },
      function toStringTag(){
        return this.get(symbols.toStringTag);
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
            return $$ThrowException('cyclic_proto');
          }
          proto = proto.GetInheritance();
        }

        if (this.Notifier) {
          var changeObservers = this.Notifier.ChangeObservers;
          if (changeObservers.size) {
            var record = $$CreateChangeRecord('prototype', this, null, new Value(this.GetInheritance()));
            $$EnqueueChangeRecord(record, changeObservers);
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
      return $$OrdinaryGetOwnProperty(this, key);
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
        return $$ThrowException('strict_cannot_assign', [key]);
      }
      return true;
    },
    function GetP(receiver, key){
      var prop = this.describe(key);
      if (!prop) {
        var parent = this.GetInheritance();
        if (parent && parent.Abrupt) return parent;

        if (parent) {
          return parent.GetP(receiver, key);
        }
      } else {
        if (prop[3]) {
          var getter = prop[3].Get;
        } else if (prop[2] & A) {
          var getter = prop[1].Get;
        }

        if (getter && $$IsCallable(getter)) {
          return getter.Call(receiver, []);
        }
        return prop[1];
      }
    },
    function SetP(receiver, key, value) {
      var prop = this.describe(key);
      if (!prop) {
        var parent = this.GetInheritance();
        if (parent && parent.Abrupt) return parent;

        if (parent) {
          return parent.SetP(receiver, key, value);
        } else if (typeof receiver === 'object') {
          return $$CreateOwnDataProperty(receiver, key, value);
        }
      } else {
        if (prop[3]) {
          var setter = prop[3].Set;
        } else if (prop[2] & A) {
          var setter = prop[1].Set;
        }

        if (setter && $$IsCallable(setter)) {
          var setterResult = setter.Call(receiver, [value]);
          if (setterResult && setterResult.Abrupt) return setterResult;

          return true;
        } else if (prop[2] & W) {
          if (this === receiver) {
            return $$OrdinaryDefineOwnProperty(this, key, { Value: value });
          } else if (typeof receiver === 'object') {
            return $$CreateOwnDataProperty(receiver, key, value);
          }
        }
      }
      return false;
    },
    function DefineOwnProperty(key, desc){
      return $$OrdinaryDefineOwnProperty(this, key, desc);
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
            var record = $$CreateChangeRecord('deleted', this, key, this.GetOwnProperty(key));
            $$EnqueueChangeRecord(record, changeObservers);
          }
        }
        this.remove(key);
        return true;
      } else if (strict) {
        return $$ThrowException('strict_delete', []);
      } else {
        return false;
      }
    },
    function Iterate(){
      return $$Invoke(this, symbols.iterator);
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
          if (!(key in seen || key.Private)) {
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
        if (method && method.Abrupt) return method;

        if ($$IsCallable(method)) {
          var value = method.Call(this, []);
          if (value && value.Abrupt) return value;
          if (value === null || typeof value !== 'object') {
            return value;
          }
        }
      }

      return $$ThrowException('cannot_convert_to_primitive', []);
    }
    // function Keys(){},
    // function OwnPropertyKeys(){},
    // function Freeze(){},
    // function Seal(){},
    // function IsFrozen(){},
    // function IsSealed(){}
  ]);


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
        return $$ThrowStopIteration();
      } else {
        return this.keys[this.index++];
      }
    }

    function $Enumerator(keys){
      this.next = ['next', new next(keys), 7];
    }

    exports.$Enumerator = $Enumerator;

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


  var realm, intrinsics;

  define($Object, [
    function changeRealm(newRealm){
      realm = newRealm;
      intrinsics = realm ? realm.intrinsics : undefined;
    }
  ]);

  return exports;
})(typeof module !== 'undefined' ? exports : {});
