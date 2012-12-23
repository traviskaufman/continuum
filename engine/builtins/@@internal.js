private @@Call,
        @@Construct,
        @@DefineOwnProperty,
        @@Enumerate,
        @@GetBuiltinBrand,
        @@GetP,
        @@GetProperty,
        @@GetPrototype,
        @@HasOwnProperty,
        @@HasProperty,
        @@IsExtensible,
        @@PreventExtensions,
        @@PrimitiveValue,
        @@Put,
        @@SetBuiltinBrand,
        @@SetP,
        @@SetPrototype,
        @@GetOwnProperty;

private @@define,
        @@delete,
        @@each,
        @@get,
        @@getInternal,
        @@has,
        @@hasInternal,
        @@query,
        @@set,
        @@setInternal,
        @@update;

private @@extend;

symbol  @toStringTag,
        @iterator;


$__iterator = @iterator;
$__toStringTag = @toStringTag;

var Genesis = $__Genesis;
Genesis.@@Call              = $__Call;
Genesis.@@Construct         = $__Construct;
Genesis.@@DefineOwnProperty = $__DefineOwnProperty;
Genesis.@@Enumerate         = $__Enumerate;
Genesis.@@GetBuiltinBrand   = $__GetBuiltinBrand;
Genesis.@@GetOwnProperty    = $__GetOwnProperty;
Genesis.@@GetP              = $__GetP;
Genesis.@@GetProperty       = $__GetProperty;
Genesis.@@GetPrototype      = $__GetPrototype;
Genesis.@@HasOwnProperty    = $__HasOwnProperty;
Genesis.@@HasOwnProperty    = $__HasOwnProperty;
Genesis.@@HasProperty       = $__HasProperty;
Genesis.@@IsExtensible      = $__IsExtensible;
Genesis.@@PreventExtensions = $__PreventExtensions;
Genesis.@@Put               = $__Put;
Genesis.@@SetBuiltinBrand   = $__SetBuiltinBrand;
Genesis.@@SetP              = $__SetP;
Genesis.@@SetPrototype      = $__SetPrototype;

Genesis.@@define            = $__define;
Genesis.@@delete            = $__delete;
Genesis.@@each              = $__each;
Genesis.@@get               = $__get;
Genesis.@@getInternal       = $__getInternal;
Genesis.@@has               = $__has;
Genesis.@@hasInternal       = $__hasInternal;
Genesis.@@query             = $__query;
Genesis.@@set               = $__set;
Genesis.@@setInternal       = $__setInternal;
Genesis.@@update            = $__update;

Genesis.@@extend            = extend;


Genesis.@@each((key, value, attr) => {
  if ($__Type(Genesis[key]) === 'Object') {
    Genesis[key].@@set('name', key);
    internalFunction(Genesis[key]);
  }
});


function extend(properties){
  var keys = properties.@@Enumerate(false, false),
      i = keys.length;

  while (i--) {
    var key = keys[i];
    var desc = properties.@@GetOwnProperty(key);
    desc.enumerable = false;

    if (typeof desc.value === 'number') {
      desc.configurable = desc.writable = false;
    } else if (typeof desc.value === 'function') {
      builtinFunction(desc.value);
    }

    this.@@DefineOwnProperty(key, desc);
  }
};




let HIDDEN = 6,
    FROZEN = 0,
    Infinity = 1 / 0,
    NaN = +'NaN',
    undefined;


function internalFunction(func){
  func.@@setInternal('InternalFunction', true);
  func.@@setInternal('strict', false);
  func.@@delete('prototype');
  func.@@delete('caller');
  func.@@delete('arguments');
}

internalFunction(internalFunction);



function builtinClass(Ctor, brand){
  var prototypeName = Ctor.name + 'Proto',
      prototype = $__GetIntrinsic(prototypeName),
      isSymbol = Ctor.name === 'Symbol';

  if (prototype) {
    if (!isSymbol) {
      prototype.@@extend(Ctor.prototype);
    }
    Ctor.@@set('prototype', prototype);
  } else {
    $__SetIntrinsic(prototypeName, Ctor.prototype);
  }

  Ctor.@@setInternal('BuiltinConstructor', true);
  Ctor.@@setInternal('BuiltinFunction', true);
  Ctor.@@setInternal('strict', false);
  Ctor.@@update('prototype', FROZEN);
  Ctor.@@set('length', 1);
  Ctor.@@define('caller', null, 0);
  Ctor.@@define('arguments', null, 0);

  if (!isSymbol) {
    brand || (brand = 'Builtin'+Ctor.name);
    Ctor.prototype.@@SetBuiltinBrand(brand);
    Ctor.prototype.@@define(@toStringTag, Ctor.name);
    hideEverything(Ctor);
  }
}

internalFunction(builtinClass);



function builtinFunction(func){
  func.@@setInternal('BuiltinFunction', true);
  func.@@delete('prototype');
  func.@@update('name', FROZEN);
  func.@@define('caller', null, 0);
  func.@@define('arguments', null, 0);
}

internalFunction(builtinFunction);



function hideEverything(o){
  var type = typeof o;
  if (type === 'object' ? o === null : type !== 'function') {
    return o;
  }

  var keys = o.@@Enumerate(false, true),
      i = keys.length;

  while (i--) {
    o.@@update(keys[i], typeof o[keys[i]] === 'number' ? FROZEN : HIDDEN);
  }

  if (type === 'function') {
    hideEverything(o.prototype);
  }

  return o;
}

internalFunction(hideEverything);

$__hideEverything = hideEverything;



function ensureObject(o, name){
  var type = typeof o;
  if (type === 'object' ? o === null : type !== 'function') {
    throw $__Exception('called_on_non_object', [name]);
  }
}

internalFunction(ensureObject);



function ensureDescriptor(o){
  if (o === null || typeof o !== 'object') {
    throw $__Exception('property_desc_object', [typeof o])
  }
}

internalFunction(ensureDescriptor);



function ensureArgs(o, name){
  if (o == null || typeof o !== 'object' || typeof o.@@get('length') !== 'number') {
    throw $__Exception('apply_wrong_args', []);
  }

  var brand = o.@@GetBuiltinBrand();
  return brand === 'Array' || brand === 'Arguments' ? o : [...o];
}

internalFunction(ensureArgs);



function ensureFunction(o, name){
  if (typeof o !== 'function') {
    throw $__Exception('called_on_non_function', [name]);
  }
}

internalFunction(ensureFunction);



$__EmptyClass = function(...args){ super(...args) };
