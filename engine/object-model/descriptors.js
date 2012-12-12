var descriptors = (function(exports){
  var objects   = require('../lib/objects'),
      iteration = require('../lib/iteration'),
      errors    = require('../errors'),
      utility   = require('../lib/utility');


  var is = objects.is,
      create = objects.create,
      define = objects.define,
      inherit = objects.inherit,
      each = iteration.each,
      tag = utility.tag,
      ThrowException = errors.ThrowException;

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


  var descFields = ['value', 'writable', 'enumerable', 'configurable', 'get', 'set'],
      descProps = ['Value', 'Writable', 'Enumerable', 'Configurable', 'Get', 'Set'],
      standardFields = create(null);

  each(descFields, function(field){
    standardFields[field] = true;
  });


  function $Object(proto){
    $Object = require('./$Object');
    return new $Object(proto);
  }


  function PropertyDescriptor(){}

  PropertyDescriptor.prototype = define(create(null), {
    constructor: PropertyDescriptor,
    type: 'PropertyDescriptor',
    isDescriptor: true
  });

  exports.PropertyDescriptor = PropertyDescriptor;


  function EmptyDataDescriptor(){}

  exports.EmptyDataDescriptor = EmptyDataDescriptor;

  inherit(EmptyDataDescriptor, PropertyDescriptor, {
    type: 'DataDescriptor',
    isDataDescriptor: true,
    isAccessorDescriptor: false
  });


  function EmptyAccessorDescriptor(){}

  exports.EmptyAccessorDescriptor = EmptyAccessorDescriptor;

  inherit(EmptyAccessorDescriptor, PropertyDescriptor, {
    type: 'AccessorDescriptor',
    isDataDescriptor: false,
    isAccessorDescriptor: true
  });


  function DataDescriptor(value, attributes){
    this.Value = value;
    this.Writable = (attributes & W) > 0;
    this.Enumerable = (attributes & E) > 0;
    this.Configurable = (attributes & C) > 0;
  }

  exports.DataDescriptor = DataDescriptor;

  inherit(DataDescriptor, EmptyDataDescriptor, {
    Writable: undefined,
    Value: undefined
  });



  function AccessorDescriptor(accessors, attributes){
    this.Get = accessors.Get;
    this.Set = accessors.Set;
    this.Enumerable = (attributes & E) > 0;
    this.Configurable = (attributes & C) > 0;
  }

  exports.AccessorDescriptor = AccessorDescriptor;

  inherit(AccessorDescriptor, EmptyAccessorDescriptor, {
    Get: undefined,
    Set: undefined
  });


  function StringIndex(value){
    this.Value = value;
  }

  exports.StringIndex = StringIndex;

  StringIndex.prototype = new DataDescriptor(undefined, E__);


  function Value(value){
    this.Value = value;
  }

  exports.Value = Value;

  inherit(Value, EmptyDataDescriptor);


  function Accessor(get, set){
    this.Get = get;
    this.Set = set;
    tag(this);
  }

  exports.Accessor = Accessor;

  define(Accessor.prototype, {
    Get: undefined,
    Set: undefined
  });


  function BuiltinAccessor(get, set){
    tag(this);
    if (get) this.Get = { Call: get };
    if (set) this.Set = { Call: set };
  }

  exports.BuiltinAccessor = BuiltinAccessor;

  inherit(BuiltinAccessor, Accessor);


  function ArgAccessor(name, env){
    this.name = name;
    this.env = env;
    tag(this);
  }

  exports.ArgAccessor = ArgAccessor;

  inherit(ArgAccessor, Accessor, {
    type: 'ArgAccessor',
    Get: { Call: function(){ return this.env.GetBindingValue(this.name) } },
    Set: { Call: function(v){ this.env.SetMutableBinding(this.name, v) } }
  });




  function IsDescriptor(desc) {
    return desc ? desc.isDescriptor === true : false;
  }

  exports.isDescriptor = IsDescriptor;


  function IsEmptyDescriptor(desc) {
    return !('Get' in desc
          || 'Set' in desc
          || 'Value' in desc
          || 'Writable' in desc
          || 'Enumerable' in desc
          || 'Configurable' in desc);
  }

  exports.isEmptyDescriptor = IsEmptyDescriptor;


  function IsAccessorDescriptor(desc) {
    return desc === undefined ? false : 'Get' in desc || 'Set' in desc;
  }

  exports.isAccessorDescriptor = IsAccessorDescriptor;

  function IsDataDescriptor(desc) {
    return desc === undefined ? false : 'Value' in desc || 'Writable' in desc;
  }

  exports.isDataDescriptor = IsDataDescriptor;


  function IsGenericDescriptor(desc) {
    return desc === undefined ? false : !('Get' in desc || 'Set' in desc || 'Value' in desc || 'Writable' in desc);
  }

  exports.isGenericDescriptor = IsGenericDescriptor;


  function IsEquivalentDescriptor(a, b) {
    return a.isDataDescriptor === b.isDataDescriptor
        && a.Get === b.Get
        && a.Set === b.Set
        && a.Writable === b.Writable
        && a.Enumerable === b.Enumerable
        && a.Configurable === b.Configurable
        && is(a.Value, b.Value);
  }

  exports.isEquivalentDescriptor = IsEquivalentDescriptor;



  function FromPropertyDescriptor(desc){
    if (desc) {
      var obj = new $Object;
      obj.set('enumerable', desc.Enumerable);
      obj.set('configurable', desc.Configurable);
      if (desc.isDataDescriptor) {
        obj.set('writable', desc.Writable);
        obj.set('value', desc.Value);
      } else if (desc.isAccessorDescriptor)  {
        obj.set('get', desc.Get);
        obj.set('set', desc.Set);
      }
      return obj;
    }
  }

  exports.fromPropertyDescriptor = FromPropertyDescriptor;


  function ToPropertyDescriptor(obj) {
    if (typeof obj !== 'object') {
      return ThrowException('property_desc_object', [typeof obj]);
    }

    var fields = create(null);

    for (var i=0; i < 6; i++) {
      var field = descFields[i];
      if (obj.HasProperty(field)) {
        var result = fields[field] = obj.Get(field);
        if (result && result !== true && result.Abrupt) return result;
      }
    }

    if (fields.get ? !fields.get.Call : fields.get !== undefined) {
      return ThrowException('getter_must_be_callable', [typeof fields.get]);
    }

    if (fields.set ? !fields.set.Call : fields.set !== undefined) {
      return ThrowException('setter_must_be_callable', [typeof fields.set]);
    }

    if ('get' in fields || 'set' in fields) {
      if ('value' in fields || 'writable' in fields) {
        return ThrowException('value_and_accessor', [fields]);
      }
      var desc = new EmptyDataDescriptor;
      if ('get' in fields) desc.Get = fields.get;
      if ('set' in fields) desc.Set = fields.set;
    } else if ('value' in fields || 'writable' in fields) {
      var desc = new EmptyAccessorDescriptor;
      if ('value' in fields) desc.Value = fields.value;
      if ('writable' in fields) desc.Writable = fields.writable;
    } else {
      var desc = new PropertyDescriptor;
    }
    if ('enumerable' in fields) desc.Enumerable = fields.enumerable;
    if ('configurable' in fields) desc.Configurable = fields.configurable;
    return desc;
  }

  exports.toPropertyDescriptor = ToPropertyDescriptor;

  function FromGenericPropertyDescriptor(desc){
    if (desc === undefined) return;
    var obj = new $Object;
    for (var i=0, v; i < 6; i++) {
      if (descProps[i] in desc) {
        obj.set(descFields[i], desc[descProps[i]]);
      }
    }
    return obj;
  }

  exports.fromGenericPropertyDescriptor = FromGenericPropertyDescriptor;


  function ToCompletePropertyDescriptor(obj) {
    var desc = ToPropertyDescriptor(obj);
    if (desc && desc.Abrupt) return desc;

    if (desc.isDataDescriptor) {
      'Value' in desc    || (desc.Value = undefined);
      'Writable' in desc || (desc.Writable = false);
    } else if (desc.isAccessorDescriptor) {
      'Get' in desc || (desc.Get = undefined);
      'Set' in desc || (desc.Set = undefined);
    } else {
      desc.isDataDescriptor = true;
      desc.Value = undefined;
      desc.Writable = false;
    }
    'Enumerable' in desc   || (desc.Enumerable = false);
    'Configurable' in desc || (desc.Configurable = false);
    return desc;
  }

  exports.toCompletePropertyDescriptor = ToCompletePropertyDescriptor;


  function CopyAttributes(from, to){
    var props = from.Enumerate(true, false);
    for (var i=0; i < props.length; i++) {
      var field = props[i];
      if (!(field in standardFields)) {
        to.define(field, from.Get(field), ECW);
      }
    }
  }

  exports.copyAttributes = CopyAttributes;


  return exports;
})(typeof module !== 'undefined' ? exports : {});
