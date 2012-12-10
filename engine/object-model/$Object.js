var $Object = (function(module){
  var objects      = require('../lib/objects'),
      errors       = require('../errors'),
      constants    = require('../constants'),
      operators    = require('./operators'),
      descriptors  = require('./descriptors'),
      operations   = require('./operations'),
      PropertyList = require('../lib/PropertyList'),
      utility      = require('../lib/utility');

  var inherit = objects.inherit,
      define = objects.define,
      create = objects.create,
      hide = objects.hide,
      Hash = objects.Hash,
      tag = utility.tag,
      AccessorDescriptor = descriptors.AccessorDescriptor,
      DataDescriptor = descriptors.DataDescriptor,
      Accessor = descriptors.Accessor,
      Value = descriptors.Value,
      IsDataDescriptor = descriptors.isDataDescriptor,
      IsAccessorDescriptor = descriptors.isAccessorDescriptor,
      IsEmptyDescriptor = descriptors.isEmptyDescriptor,
      IsEquivalentDescriptor = descriptors.isEquivalentDescriptor,
      IsGenericDescriptor = descriptors.isGenericDescriptor,
      ThrowException = errors.ThrowException,
      ToBoolean = operators.ToBoolean,
      ToString = operators.ToString,
      ToUint32 = operators.ToUint32,
      IsCallable = operations.isCallable,
      Invoke = operations.invoke,
      ThrowStopIteration = operations.throwStopIteration,
      CreateChangeRecord = operations.createChangeRecord,
      EnqueueChangeRecord = operations.enqueueChangeRecord;

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

    hide(this, 'storage');
    hide(this, 'Prototype');
    hide(this, 'Realm');
  }

  define($Object.prototype, {
    Extensible: true,
    BuiltinBrand: constants.BRANDS.BuiltinObject,
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
            var record = CreateChangeRecord('prototype', this, null, new Value(this.GetInheritance()));
            EnqueueChangeRecord(record, changeObservers);
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
              var record = CreateChangeRecord('new', this, key);
              EnqueueChangeRecord(record, changeObservers);
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
            var record = CreateChangeRecord(changeType, this, key, current);
            EnqueueChangeRecord(record, changeObservers);
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
            var record = CreateChangeRecord('deleted', this, key, this.GetOwnProperty(key));
            EnqueueChangeRecord(record, changeObservers);
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
        if (method && method.Abrupt) return method;

        if (IsCallable(method)) {
          var value = method.Call(this, []);
          if (value && value.Abrupt) return value;
          if (value === null || typeof value !== 'object') {
            return value;
          }
        }
      }

      return ThrowException('cannot_convert_to_primitive', []);
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


  var realm, intrinsics;

  define($Object, [
    $Enumerator,
    function changeRealm(newRealm){
      realm = newRealm;
      intrinsics = realm ? realm.intrinsics : undefined;
    }
  ]);

  return module.exports = $Object;
})(typeof module !== 'undefined' ? module : {});
