private @@toStringTag  = $__getWellKnownSymbol('toStringTag'),
        @@iterator     = $__getWellKnownSymbol('iterator'),
        @@create       = $__getWellKnownSymbol('create'),
        @@BooleanValue = $__getWellKnownSymbol('BooleanValue'),
        @@StringValue  = $__getWellKnownSymbol('StringValue'),
        @@NumberValue  = $__getWellKnownSymbol('NumberValue'),
        @@DateValue    = $__getWellKnownSymbol('DateValue'),
        @@BuiltinBrand = $__getWellKnownSymbol('BuiltinBrand');

const StopIteration = $__StopIteration,
      HIDDEN   = 6,
      FROZEN   = 0,
      Infinity = 1 / 0,
      NaN      = +'NaN';

let undefined;


function extend(object, properties){
  const keys = $__Enumerate(properties, false, false);

  let index = keys.length;

  while (index--) {
    const key  = keys[index],
          desc = $__GetOwnProperty(properties, key);

    desc.enumerable = false;

    if (typeof desc.value === 'number') {
      desc.configurable = desc.writable = false;
    } else if (typeof desc.value === 'function') {
      builtinFunction(desc.value);
    }

    $__DefineOwnProperty(object, key, desc);
  }
}

$__extend = extend;


function internalFunction(func){
  $__setInternal(func, 'InternalFunction', true);
  $__setInternal(func, 'strict', false);
  $__delete(func, 'prototype');
  $__delete(func, 'caller');
  $__delete(func, 'arguments');
}

internalFunction(internalFunction);

const brands = {
  BuiltinString: 'StringWrapper',
  BuiltinNumber: 'NumberWrapper',
  BuiltinBoolean: 'BooleanWrapper'
};

function builtinClass(Ctor, brand){
  var prototypeName = Ctor.name + 'Proto',
      prototype = $__GetIntrinsic(prototypeName),
      isSymbol = Ctor.name === 'Symbol';

  if (prototype) {
    if (!isSymbol) {
      extend(prototype, Ctor.prototype);
    }
    $__set(Ctor, 'prototype', prototype);
  } else {
    $__SetIntrinsic(prototypeName, Ctor.prototype);
  }

  $__setInternal(Ctor, 'BuiltinConstructor', true);
  $__setInternal(Ctor, 'BuiltinFunction', true);
  $__setInternal(Ctor, 'strict', false);
  $__update(Ctor, 'prototype', FROZEN);
  $__set(Ctor, 'length', 1);
  $__define(Ctor, 'caller', null, FROZEN);
  $__define(Ctor, 'arguments', null, FROZEN);

  if (!isSymbol) {
    brand || (brand = 'Builtin'+Ctor.name);
    if (brand in brands) {
      brand = brands[brand];
    }
    $__SetBuiltinBrand(Ctor.prototype, brand);
    $__define(Ctor.prototype, @@toStringTag, Ctor.name);
    hideEverything(Ctor);
  }
}

internalFunction(builtinClass);



function builtinFunction(func){
  $__setInternal(func, 'BuiltinFunction', true);
  $__delete(func, 'prototype');
  $__update(func, 'name', FROZEN);
  $__define(func, 'caller', null, FROZEN);
  $__define(func, 'arguments', null, FROZEN);
}

internalFunction(builtinFunction);



function hideEverything(o){
  const type = typeof o;
  if (type === 'object' ? o === null : type !== 'function') {
    return o;
  }

  const keys = $__Enumerate(o, false, true);

  let index = keys.length;

  while (index--) {
    $__update(o, keys[index], typeof o[keys[index]] === 'number' ? FROZEN : HIDDEN);
  }

  if (type === 'function') {
    hideEverything(o.prototype);
  }

  return o;
}

internalFunction(hideEverything);

$__hideEverything = hideEverything;



function ensureObject(o, name){
  const type = typeof o;
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
  if (o == null || typeof o !== 'object' || typeof $__get(o, 'length') !== 'number') {
    throw $__Exception('apply_wrong_args', []);
  }

  const brand = $__GetBuiltinBrand(o);
  return brand === 'BuiltinArray' || brand === 'BuiltinArguments' ? o : [...o];
}

internalFunction(ensureArgs);


function ensureFunction(o, name){
  if (typeof o !== 'function') {
    throw $__Exception('called_on_non_function', [name]);
  }
}

internalFunction(ensureFunction);


function ensureCallback(o, name){
  if (typeof o !== 'function') {
    throw $__Exception('callback_must_be_callable', [name]);
  }
}

internalFunction(ensureCallback);


function ensureProto(proto){
  if (proto !== null && $__Type(proto) !== 'Object') {
    throw $__Exception('proto_object_or_null', [])
  }
}

internalFunction(ensureProto);


function PutPropertyOrThrow(object, key, value, name){
  if (!$__Put(object, key, value)) {
    throw $__Exception('put_property_or_throw', [name, key]);
  }
}

internalFunction(PutPropertyOrThrow);


function DeletePropertyOrThrow(object, key, name){
  if (!$__Delete(object, key)) {
    throw $__Exception('delete_property_or_throw', [name, key]);
  }
}

internalFunction(DeletePropertyOrThrow);

