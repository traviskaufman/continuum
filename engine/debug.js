var debug = (function(exports){
  "use strict";
  var objects   = require('../lib/objects'),
      iteration = require('../lib/iteration'),
      utility   = require('../lib/utility'),
      runtime   = require('./runtime');

  var isObject   = objects.isObject,
      inherit    = objects.inherit,
      create     = objects.create,
      define     = objects.define,
      assign     = objects.assign,
      getBrandOf = objects.getBrandOf,
      Hash       = objects.Hash,
      each       = iteration.each,
      quotes     = utility.quotes,
      uid        = utility.uid,
      realm      = runtime.activeRealm;

  var ENUMERABLE   = 0x01,
      CONFIGURABLE = 0x02,
      WRITABLE     = 0x04,
      ACCESSOR     = 0x08;

  function always(value){
    return function(){ return value };
  }

  function alwaysCall(func, args){
    args || (args = []);
    return function(){ return func.apply(null, args) }
  }

  function isNegativeZero(n){
    return n === 0 && 1 / n === -Infinity;
  }


  function Mirror(){}

  define(Mirror.prototype, {
    destroy: function(){
      this.subject = null;
      this.destroy = null;
    },
    type: null,
    getPrototype: function(){
      return _Null;
    },
    get: function(){
      return _Undefined;
    },
    getValue: function(){
      return _Undefined;
    },
    kind: 'Unknown',
    label: always(''),
    hasOwn: always(null),
    has: always(null),
    list: alwaysCall(Array),
    inheritedAttrs: alwaysCall(create, [null]),
    ownAttrs: alwaysCall(create, [null]),
    getterAttrs: alwaysCall(create, [null]),
    isExtensible: always(null),
    isEnumerable: always(null),
    isConfigurable: always(null),
    getOwnDescriptor: always(null),
    getDescriptor: always(null),
    describe: always(null),
    isAccessor: always(null),
    isWritable: always(null),
    query: always(null)
  });

  function MirrorValue(subject, label){
    this.subject = subject;
    this.type = typeof subject;
    this.kind = getBrandOf(subject)+'Value';
    if (this.type === 'number' && isNegativeZero(subject)) {
      label = '-0';
    }
    this.label = always(label);
  }

  inherit(MirrorValue, Mirror);

  function MirrorStringValue(subject){
    this.subject = subject;
  }

  inherit(MirrorStringValue, MirrorValue, {
    label: always('string'),
    kind: 'StringValue',
    type: 'string'
  });

  function MirrorNumberValue(subject){
    this.subject = subject;
  }

  inherit(MirrorNumberValue, MirrorValue, {
    label: always('number'),
    kind: 'NumberValue',
    type: 'number'
  });


  var MirrorAccessor = (function(){
    function MirrorAccessor(holder, accessor, key){
      this.holder = holder;
      this.accessor = accessor;
      this.key = key;
      realm().enterMutationContext();
      this.subject = accessor.Get.Call(holder, []);
      if (this.subject && this.subject.__introspected) {
        this.introspected = this.subject.__introspected;
      } else {
        this.introspected = introspect(this.subject);
      }
      this.kind = this.introspected.kind;
      this.type = this.introspected.type;
      realm().exitMutationContext();
    }


    inherit(MirrorAccessor, Mirror, {
      accessor: true
    }, [
      function destroy(){
        this.introspected && this.introspected.destroy && this.introspected.destroy();
        this.subject = null;
        this.destroy = null;
        this.holder = null;
        this.key = null;
      },
      function getValue(key){
        return this.introspected.getValue(key);
      },
      function getError(){
        return this.introspected.getError && this.introspected.getError();
      },
      function origin(){
        return this.introspected.origin && this.introspected.origin();
      },
      function label(){
        return this.introspected.label();
      },
      function getName(){
        return this.subject.get('name');
      },
      function getParams(){
        var params = this.subject.FormalParameters;
        if (params && params.ArgNames) {
          var names = params.ArgNames.slice();
          if (params.Rest) {
            names.rest = true;
          }
          return names;
        } else {
          return [];
        }
      }
    ]);

    return MirrorAccessor;
  })();

  var proto = uid();


  var MirrorPrototypeAccessor = (function(){
    function MirrorPrototypeAccessor(holder, accessor, key){
      this.holder = holder;
      this.subject = accessor;
      this.key = key;
    }


    inherit(MirrorPrototypeAccessor, Mirror, {
      accessor: true,
      kind: 'Accessor'
    }, [
      function label(){
        var label = [];
        if ('Get' in this.subject) label.push('Getter');
        if ('Set' in this.subject) label.push('Setter');
        return label.join('/');
      },
      function getName(){
        return (this.subject.Get || this.subject.Set).get('name');
      }
    ]);

    return MirrorPrototypeAccessor;
  })();




  var MirrorObject = (function(){
    function MirrorObject(subject){
      subject.__introspected = this;
      this.subject = subject;
      this.accessors = new Hash;
    }

    inherit(MirrorObject, Mirror, {
      kind: 'Object',
      type: 'object',
      parentLabel: '[[proto]]',
      attrs: null,
      props: null
    }, [
      function destroy(){
        this.__introspected = null;
        this.destroy = null;
      },
      function get(key){
        if (this.isAccessor(key)) {
          var prop = this.describe(key),
              accessor = prop[1] || prop[3];

          if (!this.accessors[key]) {
            if (this.subject.IsProto) {
              this.accessors[key] = new MirrorPrototypeAccessor(this.subject, accessor, key);
            } else {
              this.accessors[key] = new MirrorAccessor(this.subject, accessor, key);
            }
          }
          return this.accessors[key];
        } else {
          var prop = this.subject.describe(key);
          if (prop) {
            return introspect(prop[1]);
          } else {
            return this.getPrototype().get(key);
          }
        }
      },
      function describe(key){
        return this.subject.describe(key) || this.getPrototype().describe(key);
      },
      function isClass(){
        return !!this.subject.Class;
      },
      function getBrand(){
        return this.subject.Brand || this.subject.BuiltinBrand;
      },
      function getValue(key){
        return this.get(key).subject;
      },
      function getPrototype(){
        //return introspect(this.subject.GetInheritance());
        var obj = this.subject;
        do {
          obj = obj.GetInheritance();
        } while (obj && obj.HiddenPrototype)
        return introspect(obj);
      },
      function setPrototype(value){
        realm().enterMutationContext();
        var proto = this.subject.Prototype;

        if (proto && proto.HiddenPrototype) {
          var ret = proto.SetInheritance(value);
        } else {
          var ret = this.subject.SetInheritance(value);
        }

        realm().exitMutationContext();
        return ret;
      },
      function set(key, value){
        var ret;
        ret = this.subject.set(key, value);
        return ret;
      },
      function update(key, attr){
        return this.subject.update(key, attr);
      },
      function defineProperty(key, desc){
        desc = Object(desc);
        var Desc = {};
        if ('value' in desc) {
          Desc.Value = desc.value;
        }
        if ('get' in desc) {
          Desc.Get = desc.get;
        }
        if ('set' in desc) {
          Desc.Set = desc.set;
        }
        if ('enumerable' in desc) {
          Desc.Enumerable = desc.enumerable;
        }
        if ('configurable' in desc) {
          Desc.Configurable = desc.configurable;
        }
        if ('writable' in desc) {
          Desc.Writable = desc.writable;
        }
        realm().enterMutationContext();
        var ret = this.subject.DefineOwnProperty(key, Desc, false);
        realm().exitMutationContext();
        return ret;
      },
      function hasOwn(key){
        if (this.subject) {
          return this.subject.has(key);
        } else {
          return false;
        }
      },
      function has(key){
        return this.hasOwn(key) || this.getPrototype().has(key);
      },
      function isExtensible(key){
        return this.subject.IsExtensible();
      },
      function getDescriptor(key){
        return this.getOwnDescriptor(key) || this.getPrototype().getDescriptor(key);
      },
      function getOwnDescriptor(key){
        var prop = this.subject.describe(key);
        if (prop) {
          if (prop[2] & ACCESSOR) {
            return {
              name: key,
              get: prop[1].Get,
              set: prop[1].Set,
              enumerable: (prop[2] & ENUMERABLE) > 0,
              configurable: (prop[2] & CONFIGURABLE) > 0
            }
          } else {
            return {
              name: key,
              value: prop[1],
              writable: (prop[2] & WRITABLE) > 0,
              enumerable: (prop[2] & ENUMERABLE) > 0,
              configurable: (prop[2] & CONFIGURABLE) > 0
            }
          }
        }
      },
      function getInternal(name){
        return this.subject[name];
      },
      function isEnumerable(key){
        return (this.query(key) & ENUMERABLE) > 0;
      },
      function isConfigurable(key){
        return (this.query(key) & CONFIGURABLE) > 0;
      },
      function isAccessor(key){
        return (this.query(key) & ACCESSOR) > 0;
      },
      function isWritable(key){
        var prop = this.subject.describe(key);
        if (prop) {
          return !!(prop[2] & ACCESSOR ? prop[1].Set : prop[2] & WRITABLE);
        } else {
          return this.subject.IsExtensible();
        }
      },
      function query(key){
        var attrs = this.subject.query(key);
        return attrs === null ? this.getPrototype().query(key) : attrs;
      },
      function label(){
        var brand = this.subject.Brand || this.subject.BuiltinBrand;
        if (brand && brand.name !== 'Object') {
          return brand.name;
        }

        if (this.subject.ConstructorName) {
          return this.subject.ConstructorName;
        } else if (this.has('constructor')) {
          var ctorName = this.get('constructor').get('name');
          if (ctorName.subject && typeof ctorName.subject === 'string') {
            return ctorName.subject;
          }
        }

        return 'Object';
      },
      function inheritedAttrs(){
        return this.ownAttrs(this.getPrototype().inheritedAttrs());
      },
      function ownAttrs(props){
        props || (props = new Hash);
        this.subject.each(function(prop){
          var key = prop[0] === '__proto__' ? proto : prop[0];
          props[key] = prop;
        });
        return props;
      },
      function getterAttrs(own){
        var inherited = this.getPrototype().getterAttrs(),
            props = this.ownAttrs();

        for (var k in props) {
          if (own || (props[k][2] & ACCESSOR)) {
            inherited[k] = props[k];
          }
        }
        return inherited;
      },
      function list(hidden, own){
        var keys = [],
            props = own
              ? this.ownAttrs()
              : own === false
                ? this.inheritedAttrs()
                : this.getterAttrs(true);

        for (var k in props) {
          var prop = props[k];
          if (hidden || !prop[0].Private && (prop[2] & ENUMERABLE)) {
            keys.push(prop[0]);
          }
        }

        return keys.sort();
      }
    ]);

    return MirrorObject;
  })();



  var MirrorArray = (function(){

    function MirrorArray(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorArray, MirrorObject, {
      kind: 'Array'
    }, [
      function list(hidden, own){
        var keys = [],
            indexes = [],
            len = this.getValue('length'),
            props = own
              ? this.ownAttrs()
              : own === false
                ? this.inheritedAttrs()
                : this.getterAttrs(true);


        for (var k in props) {
          var prop = props[k];
          if (hidden || !prop[0].Private && (prop[2] & ENUMERABLE)) {
            if (prop[0] >= 0 && prop[0] < len) {
              indexes.push(prop[0]);
            } else {
              keys.push(prop[0]);
            }
          }
        }

        return indexes.concat(keys.sort());
      }
    ]);

    return MirrorArray;
  })();


  var MirrorArguments = (function(){
    function MirrorArguments(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorArguments, MirrorArray, {
      kind: 'Arguments'
    });

    return MirrorArguments;
  })();


  var MirrorArrayBufferView = (function(){
    function MirrorArrayBufferView(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorArrayBufferView, MirrorArray, {
      kind: 'ArrayBuffer'
    }, [
      function label(){
        return this.subject.BuiltinBrand.name;
      }
    ]);
    return MirrorArrayBufferView;
  })();


  var MirrorPrimitiveWrapper = (function(){
    function MirrorPrimitiveWrapper(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorPrimitiveWrapper, MirrorObject, {
      kind: 'PrimitiveWrapper'
    }, [
      function primitiveValue(){
        return this.subject.PrimitiveValue
      }
    ]);

    return MirrorPrimitiveWrapper;
  })();



  var MirrorBoolean = (function(){
    function MirrorBoolean(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorBoolean, MirrorPrimitiveWrapper, {
      kind: 'Boolean'
    });

    return MirrorBoolean;
  })();


  var MirrorDate = (function(){
    var formatDate = (function(){
      if ('toJSON' in Date.prototype) {
        return function formatDate(date){
          var json = date.toJSON();
          return json.slice(0, 10) + ' ' + json.slice(11, 19);
        };
      }
      return function formateDate(date){
        return ''+date;
      };
    })();

    function MirrorDate(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorDate, MirrorObject, {
      kind: 'Date'
    }, [
      function label(){
        var date = this.subject.Date;
        if (!date || date === Date.prototype || ''+date === 'Invalid Date') {
          return 'Invalid Date';
        } else {
          return formatDate(date);
        }
      }
    ]);

    return MirrorDate;
  })();


  var MirrorError = (function(){
    function MirrorError(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorError, MirrorObject, {
      kind: 'Error'
    }, [
      function label(){
        return this.getValue('name');
      }
    ]);

    return MirrorError;
  })();


  var MirrorThrown = (function(){
    function MirrorThrown(subject){
      if (isObject(subject)) {
        MirrorError.call(this, subject);
      } else {
        return introspect(subject);
      }
    }

    inherit(MirrorThrown, MirrorError, {
      kind: 'Thrown'
    }, [
      function getError(){
        if (this.subject.BuiltinBrand.name === 'StopIteration') {
          return 'StopIteration';
        }
        return this.getValue('name') + ': ' + this.getValue('message');
      },
      function origin(){
        var file = this.getValue('filename') || '',
            type = this.getValue('kind') || '';

        return file && type ? type + ' ' + file : type + file;
      },
      function trace(){
        return this.subject.trace;
      },
      function context(){
        return this.subject.context;
      }
    ]);

    return MirrorThrown;
  })();


  var MirrorFunction = (function(){
    function MirrorFunction(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorFunction, MirrorObject, {
      type: 'function',
      kind: 'Function'
    }, [
      function getName(){
        return this.subject.get('name');
      },
      function getParams(){
        var params = this.subject.FormalParameters;
        if (params && params.boundNames) {
          var names = params.boundNames.slice();
          if (params.Rest) {
            names.rest = true;
          }
          return names;
        } else {
          return [];
        }
      },
      function apply(receiver, args){
        if (receiver.subject) {
          receiver = receiver.subject;
        }
        realm().enterMutationContext();
        var ret = this.subject.Call(receiver, args);
        realm().exitMutationContext();
        return introspect(ret);
      },
      function construct(args){
        if (this.subject.Construct) {
          realm().enterMutationContext();
          var ret = this.subject.Construct(args);
          realm().exitMutationContext();
          return introspect(ret);
        } else {
          return false;
        }
      },
      function getScope(){
        return introspect(this.subject.Scope);
      },
      function isStrict(){
        return !!this.subject.strict;
      },
      function ownAttrs(props){
        var strict = this.isStrict();
        props || (props = new Hash);
        this.subject.each(function(prop){
          if (!prop[0].Private && !strict || prop[0] !== 'arguments' && prop[0] !== 'caller' && prop[0] !== 'callee') {
            var key = prop[0] === '__proto__' ? proto : prop[0];
            props[key] = prop;
          }
        });
        return props;
      }
    ]);

    return MirrorFunction;
  })();



  var MirrorGlobal = (function(){
    function MirrorGlobal(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorGlobal, MirrorObject, {
      kind: 'Global'
    }, [
      function getEnvironment(){
        return introspect(this.subject.env);
      }
    ]);

    return MirrorGlobal;
  })();


  var MirrorJSON = (function(){
    function MirrorJSON(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorJSON, MirrorObject, {
      kind: 'JSON'
    });

    return MirrorJSON;
  })();


  var MirrorMath = (function(){
    function MirrorMath(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorMath, MirrorObject, {
      kind: 'Math'
    });

    return MirrorMath;
  })();


  var MirrorModule = (function(){
    function MirrorModule(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorModule, MirrorObject, {
      kind: 'Module'
    }, [
      function get(key){
        if (this.isAccessor(key)) {
          if (!this.accessors[key]) {
            var prop = this.describe(key),
                accessor = prop[1] || prop[3];

            realm().enterMutationContext();
            this.accessors[key] = introspect(accessor.Get.Call(this.subject, []));
            realm().exitMutationContext();
          }

          return this.accessors[key];
        } else {
          return introspect(this.subject.get(key));
        }
      }
    ]);

    return MirrorModule;
  })();

  var MirrorNumber = (function(){
    function MirrorNumber(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorNumber, MirrorPrimitiveWrapper, {
      kind: 'Number'
    });

    return MirrorNumber;
  })();


  var MirrorRegExp = (function(){
    function MirrorRegExp(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorRegExp, MirrorObject, {
      kind: 'RegExp'
    }, [
      function label(){
        return this.subject.PrimitiveValue+'';
      }
    ]);

    return MirrorRegExp;
  })();



  var MirrorString = (function(){
    function MirrorString(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorString, MirrorPrimitiveWrapper,{
      kind: 'String'
    }, [
      MirrorArray.prototype.list
    ]);

    return MirrorString;
  })();


  var MirrorSymbol = (function(){
    function MirrorSymbol(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorSymbol, MirrorObject, {
      kind: 'Symbol'
    }, [
      function label(){
        return '@' + (this.subject.Name || 'Symbol');
      },
      function isPrivate(){
        return this.subject.Private;
      }
    ]);

    return MirrorSymbol;
  })();



  var MirrorCollection = (function(){
    function CollectionIterator(data){
      this.guard = this.current = data.guard;
      this.index = 0;
    }

    define(CollectionIterator.prototype, [
      function next(){
        if (!this.current || this.current.next === this.guard) {
          this.guard = this.current = null;
          throw StopIteration;
        }
        this.index++;
        return this.current = this.current.next;
      }
    ]);

    function MirrorCollection(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorCollection, MirrorObject, [
      function count(){
        return this.data.size;
      },
      function __iterator__(){
        return new CollectionIterator(this.data);
      }
    ]);

    return MirrorCollection;
  })();


  var MirrorSet = (function(){
    function MirrorSet(subject){
      MirrorCollection.call(this, subject);
      var map = this.subject.SetData;
      if (map) {
        this.data = map.MapData;
      }
    }

    inherit(MirrorSet, MirrorCollection, {
      kind: 'Set'
    }, [
    ]);

    return MirrorSet;
  })();

  var MirrorMap = (function(){
    function MirrorMap(subject){
      MirrorCollection.call(this, subject);
      this.data = this.subject.MapData;
    }

    inherit(MirrorMap, MirrorCollection, {
      kind: 'Map'
    }, [
    ]);

    return MirrorMap;
  })();


  var MirrorWeakMap = (function(){
    function MirrorWeakMap(subject){
      MirrorObject.call(this, subject);
    }

    inherit(MirrorWeakMap, MirrorObject, {
      kind: 'WeakMap'
    });

    return MirrorWeakMap;
  })();






  var MirrorProxy = (function(){
    function MirrorProxy(subject){
      this.subject = subject;
      if ('Call' in subject) {
        this.type = 'function';
      }
      this.attrs = new Hash;
      this.kind = introspect(subject.Target).kind;
    }

    function descToAttrs(desc){
      if (desc) {
        if ('Value' in desc) {
          return desc.Enumerable | (desc.Configurable << 1) | (desc.Writable << 2);
        }
        return desc.Enumerable | (desc.Configurable << 1) | ACCESSOR;
      }
    }

    inherit(MirrorProxy, Mirror, {
      type: 'object'
    }, [
      MirrorObject.prototype.isExtensible,
      MirrorObject.prototype.getPrototype,
      MirrorObject.prototype.list,
      MirrorObject.prototype.inheritedAttrs,
      MirrorObject.prototype.getterAttrs,
      function getOwnDescriptor(key){
        var desc = this.subject.GetOwnProperty(key);
        var out =  {};
        for (var k in desc) {
          out[k.toLowerCase()] = desc[k];
        }
        return out;
      },
      function label(){
        return 'Proxy' + MirrorObject.prototype.label.call(this);
      },
      function get(key){
        return introspect(this.subject.Get(key));
      },
      function getValue(key){
        return this.subject.Get(key);
      },
      function hasOwn(key){
        return this.subject.HasOwnProperty(key);
      },
      function has(key){
        return this.subject.HasProperty(key);
      },
      function isEnumerable(key){
        var desc = this.subject.GetOwnProperty(key);
        return !!(desc && desc.Enumerable);
      },
      function isConfigurable(key){
        var desc = this.subject.GetOwnProperty(key);
        return !!(desc && desc.Configurable);
      },
      function isAccessor(key){
        var desc = this.subject.GetOwnProperty(key);
        return !!(desc && desc.Get || desc.Set);
      },
      function isWritable(key){
        var desc = this.subject.GetOwnProperty(key);
        return !!(desc && desc.Writable);
      },
      function query(key){
        var desc = this.subject.GetOwnProperty(key);
        if (desc) {
          return descToAttrs(desc);
        }
      },
      function ownAttrs(props){
        var key, keys = this.subject.Enumerate(false, true);

        props || (props = new Hash);
        this.attrs = new Hash;

        for (var i=0; i < keys.length; i++) {
          var desc = this.subject.GetOwnProperty(key);
          if (desc) {
            props[keys[i]] = [keys[i], desc.Value, descToAttrs(desc)];
          }
        }

        return props;
      }
    ]);

    return MirrorProxy;
  })();



  var MirrorScope = (function(){
    function MirrorScope(subject){
      if (subject.type === 'GlobalEnv') {
        return new MirrorGlobalScope(subject);
      }
      subject.__introspected = this;
      this.subject = subject;
    }

    inherit(MirrorScope, Mirror, {
      kind: 'Scope',
      type: 'scope',
      parentLabel: '[[outer]]',
      isExtensible: always(true),
      isEnumerable: always(true),
      isAccessor: always(false)
    }, [
      function isAccessor(key){
        return this.getPrototype().isAccessor(key) || false;
      },
      function getPrototype(){
        return introspect(this.subject.outer);
      },
      function getValue(key){
        return this.subject.GetBindingValue(key);
      },
      function get(key){
        return introspect(this.subject.GetBindingValue(key));
      },
      function getOwn(key){
        if (this.hasOwn(key)) {
          return introspect(this.subject.GetBindingValue(key));
        }
      },
      function label(){
        return this.subject.type;
      },
      function hasOwn(key){
        return this.subject.HasBinding(key);
      },
      function has(key){
        return this.subject.HasBinding(key) || this.getPrototype().has(key);
      },
      function inheritedAttrs(){
        return this.ownAttrs(this.getPrototype().inheritedAttrs());
      },
      function ownAttrs(props){
        props || (props = new Hash);

        each(this.subject.EnumerateBindings(), function(key){
          key = key === '__proto__' ? proto : key;
          props[key] = [key, null, 7]
        });
        return props;
      },
      function isClass(){
        return !!this.subject.Class;
      },
      function list(hidden, own){
        own = true;
        var props = own ? this.ownAttrs() : this.inheritedAttrs(),
            keys = [];

        for (var k in props) {
          keys.push(props[k][0]);
        }

        return keys.sort();
      },
      function isConfigurable(key){
        return !(this.subject.deletables && key in this.subject.deletables);
      },
      function isWritable(key){
        return !(this.subject.consts && key in this.subject.consts);
      },
      function getOwnDescriptor(key){
        if (this.hasOwn(key)) {
          return { configurable: this.isConfigurable(key),
                   enumerable: true,
                   writable: this.isWritable(key),
                   value: this.get(key)   };
        }
      },
      function getDescriptor(key){
        return this.getOwnDescriptor(key) || this.getPrototype().getDescriptor(key);
      },
      function describe(key){
        return [this.subject.GetBindingValue(key), value, this.query(key)];
      },
      function query(key){
        return 1 | (this.isConfigurable(key) << 1) | (this.isWritable(key) << 2);
      }
    ]);

    return MirrorScope;
  })();

  var MirrorGlobalScope = (function(){
    function MirrorGlobalScope(subject){
      subject.__introspected = this;
      this.subject = subject;
      this.global = introspect(subject.bindings);
    }

    inherit(MirrorGlobalScope, MirrorScope, {
    }, [
      function isExtensible(){
        return this.global.isExtensible();
      },
      function isEnumerable(key){
        return this.global.isEnumerable(key);
      },
      function isConfigurable(key){
        return this.global.isConfigurable(key);
      },
      function isWritable(key){
        return this.global.isWritable(key);
      },
      function isAccessor(key){
        return this.global.isAccessor(key);
      },
      function query(key){
        return this.global.query(key);
      },
      function describe(key){
        return this.global.describe(key);
      },
      function getDescriptor(key){
        return this.global.getDescriptor(key);
      },
      function getOwnDescriptor(key){
        return this.global.getOwnDescriptor(key);
      },
      function inheritedAttrs(){
        return this.global.inheritedAttrs();
      },
      function ownAttrs(props){
        return this.global.ownAttrs(props);
      },
      function list(hidden, own){
        return this.global.list(hidden, own);
      }
    ]);

    return MirrorGlobalScope;
  })();




  var brands = {
    Arguments   : MirrorArguments,
    Array       : MirrorArray,
    Boolean     : MirrorBoolean,
    Date        : MirrorDate,
    Error       : MirrorError,
    Function    : MirrorFunction,
    global      : MirrorGlobal,
    JSON        : MirrorJSON,
    Map         : MirrorMap,
    Math        : MirrorMath,
    Module      : MirrorModule,
    Number      : MirrorNumber,
    RegExp      : MirrorRegExp,
    Set         : MirrorSet,
    String      : MirrorString,
    Symbol      : MirrorSymbol,
    WeakMap     : MirrorWeakMap,
    Int8Array   : MirrorArrayBufferView,
    Uint8Array  : MirrorArrayBufferView,
    Int16Array  : MirrorArrayBufferView,
    Uint16Array : MirrorArrayBufferView,
    Int32Array  : MirrorArrayBufferView,
    Uint32Array : MirrorArrayBufferView,
    Float32Array: MirrorArrayBufferView,
    Float64Array: MirrorArrayBufferView
  };

  var _Null        = new MirrorValue(null, 'null'),
      _Undefined   = new MirrorValue(undefined, 'undefined'),
      _True        = new MirrorValue(true, 'true'),
      _False       = new MirrorValue(false, 'false'),
      _NaN         = new MirrorValue(NaN, 'NaN'),
      _Infinity    = new MirrorValue(Infinity, 'Infinity'),
      _NegInfinity = new MirrorValue(-Infinity, '-Infinity'),
      _Zero        = new MirrorValue(0, '0'),
      _NegZero     = new MirrorValue(-0, '-0'),
      _One         = new MirrorValue(1, '1'),
      _NegOne      = new MirrorValue(-1, '-1'),
      _Empty       = new MirrorValue('', "''");

  var numbers = new Hash,
      strings = new Hash;


  function introspect(subject){
    switch (typeof subject) {
      case 'undefined': return _Undefined;
      case 'boolean': return subject ? _True : _False;
      case 'string':
        if (subject === '') {
          return _Empty
        } else if (subject.length < 20) {
          if (subject in strings) {
            return strings[subject];
          } else {
            return strings[subject] = new MirrorStringValue(subject);
          }
        } else {
          return new MirrorStringValue(subject);
        }
      case 'number':
        if (subject !== subject) {
          return _NaN;
        }
        switch (subject) {
          case Infinity: return _Infinity;
          case -Infinity: return _NegInfinity;
          case 0: return 1 / subject === -Infinity ? _NegZero : _Zero;
          case 1: return _One;
          case -1: return _NegOne;
        }
        if (subject in numbers) {
          return numbers[subject];
        } else {
          return numbers[subject] = new MirrorNumberValue(subject);
        }
      case 'object':
        if (subject == null) {
          return _Null;
        } else if (subject instanceof Mirror) {
          return subject;
        } else if (subject.__introspected) {
          return subject.__introspected;
        } else if (subject.Environment) {
          return new MirrorScope(subject);
        } else if (subject.Completion) {
          return new MirrorThrown(subject.value);
        } else if (subject.BuiltinBrand) {
          if (subject.Proxy) {
            return new MirrorProxy(subject);
          } else if ('Call' in subject) {
            return new MirrorFunction(subject);
          } else if (subject.BuiltinBrand.name in brands) {
            return new brands[subject.BuiltinBrand.name](subject);
          } else {
            return new MirrorObject(subject);
          }
        } else {
          return _Undefined
        }
    }
  }


  var Renderer = (function(){

    function alwaysLabel(mirror){
      return mirror.label();
    }


    function Renderer(handlers){
      if (handlers) {
        for (var k in this) {
          if (k in handlers) {
            this[k] = handlers[k];
          }
        }
      }
    }

    define(Renderer.prototype, [
      function render(subject){
        var mirror = introspect(subject);
        return this[mirror.kind](mirror);
      }
    ]);

    assign(Renderer.prototype, {
      Unknown: alwaysLabel,
      BooleanValue: alwaysLabel,
      StringValue: function(mirror){
        return quotes(mirror.subject);
      },
      NumberValue: function(mirror){
        var label = mirror.label();
        return label === 'number' ? mirror.subject : label;
      },
      UndefinedValue: alwaysLabel,
      NullValue: alwaysLabel,
      Thrown: function(mirror){
        return mirror.getError();
      },
      Accessor: alwaysLabel,
      Arguments: alwaysLabel,
      Array: alwaysLabel,
      ArrayBuffer: alwaysLabel,
      Boolean: alwaysLabel,
      Date: alwaysLabel,
      Error: function(mirror){
        return mirror.getValue('name') + ': ' + mirror.getValue('message');
      },
      Function: alwaysLabel,
      Global: alwaysLabel,
      JSON: alwaysLabel,
      Map: alwaysLabel,
      Math: alwaysLabel,
      Module: alwaysLabel,
      Object: alwaysLabel,
      Number: alwaysLabel,
      RegExp: alwaysLabel,
      Scope: alwaysLabel,
      Set: alwaysLabel,
      Symbol: alwaysLabel,
      String: alwaysLabel,
      WeakMap: alwaysLabel
    });

    return Renderer;
  })();


  var renderer = new Renderer;

  define(exports, [
    function basicRender(o){
      return renderer.render(o);
    },
    function createRenderer(handlers){
      return new Renderer(handlers);
    },
    function isMirror(o){
      return o instanceof Mirror;
    },
    introspect,
    Renderer
  ]);

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
