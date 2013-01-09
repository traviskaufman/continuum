import {
  $$Invoke,
  $$CreateInternalObject,
  $$CreateObject,
  $$Get,
  $$GetIntrinsic,
  $$Has,
  $$NumberToString,
  $$Set,
  $$SetIntrinsic
} from '@@internals';

import {
  MAX_INTEGER,
  MAX_VALUE,
  MIN_VALUE,
  NaN,
  POSITIVE_INFINITY,
  NEGATIVE_INFINITY
} from '@@constants';


const FROZEN = 0,
      HIDDEN = 6;


const padding = ['', '0', '00', '000', '0000', '00000', '000000'];

export function zeroPad(number, places = 2){
  const num  = $$NumberToString(number),
        len  = num.length,
        diff = places - len;

  if (diff > 0) {
    return padding[diff] + num;
  }
  return num;
}

export function abs(x){
  return x < 0 ? -x : x;
}

export function floor(x){
  return x >> 0;
}

export function sign(x){
  return x < 0 ? -1 : 1;
}

export function isZeroOrInfinite(x){
  return x === 0 || x === POSITIVE_INFINITY || x === NEGATIVE_INFINITY;
}

export function isNaN(x){
  return x !== x;
}

export function isFinite(value){
  return typeof value === 'number'
      && !isNaN(value)
      && value < POSITIVE_INFINITY
      && value > NEGATIVE_INFINITY;
}

export function isInteger(value) {
  return typeof value === 'number'
      && !isNaN(value)
      && value > -MAX_INTEGER
      && value < MAX_INTEGER
      && value | 0 === value;
}

export function hasBrand(obj, brand){
  if (obj == null) {
    return false;
  }
  return $$Get(obj, 'BuiltinBrand') === brand;
}

const emptyList = $$Get([], 'array');

export function call(func, receiver, args){
  return $$Invoke(func, 'Call', receiver, args ? $$Get(args, 'array') : emptyList);
}



export function enumerate(obj, inherited, onlyEnumerable){
  return $$CreateObject('Array', $$Invoke(obj, 'Enumerate', inherited, onlyEnumerable));
}

function getOwnPropertyInternal(obj, key){
  return $$Invoke(obj, 'GetOwnProperty', key);
}

function defineOwnPropertyInternal(obj, key, Desc){
  return $$Invoke(obj, 'DefineOwnProperty', key, Desc);
}

export function deleteProperty(obj, key){
  return $$Invoke(obj, 'remove', key);
}

export function update(obj, key, attr){
  return $$Invoke(obj, 'update', key, attr);
}

export function define(obj, key, value, attr){
  return $$Invoke(obj, 'define', key, value, attr);
}

export function get(obj, key){
  return $$Invoke(obj, 'get', key);
}

export function set(obj, key, value){
  return $$Invoke(obj, 'set', key, value);
}

export function builtinFunction(func){
  $$Set(func, 'BuiltinFunction', true);
  deleteProperty(func, 'prototype');
  update(func, 'name', 0);
  define(func, 'caller', null, 0);
  define(func, 'arguments', null, 0);
}

export function builtinClass(Ctor, brand){
  var prototypeName = '%' + Ctor.name + 'Prototype%',
      isSymbol = Ctor.name === 'Symbol';

  $$SetIntrinsic(`%${Ctor.name}%`, Ctor);
  $$SetIntrinsic(`%${Ctor.name}Prototype%`, Ctor.prototype);
  $$Set(Ctor, 'BuiltinConstructor', true);
  $$Set(Ctor, 'BuiltinFunction', true);
  $$Set(Ctor, 'strict', false);
  update(Ctor, 'prototype', FROZEN);
  set(Ctor, 'length', 1);
  define(Ctor, 'caller', null, FROZEN);
  define(Ctor, 'arguments', null, FROZEN);

  if (!isSymbol) {
    brand || (brand = 'Builtin'+Ctor.name);
    if (brand in brands) {
      brand = brands[brand];
    }

    $$Set(Ctor.prototype, 'BuiltinBrand', brand);
    define(Ctor.prototype, @@toStringTag, Ctor.name);
    hideEverything(Ctor);
  }
}


export function extend(obj, properties){
  const keys = enumerate(properties, false, false);
  let index = keys.length;

  while (index--) {
    const key   = keys[index],
          desc  = getOwnPropertyInternal(properties, key),
          value = $$Get(desc, 'Value');

    $$Set(desc, 'Enumerable', false);
    if (typeof value === 'number') {
      $$Set(desc, 'Configurable', false);
      $$Set(desc, 'Writable', false);
    } else if (typeof value === 'function') {
      builtinFunction(value);
    }

    defineOwnPropertyInternal(obj, key, desc);
  }
}

export function extendInternal(internal, properties){
  const keys = enumerate(properties, false, false);

  let index = keys.length;

  while (index--) {
    const key = keys[index];
    $$Set(internal, key, properties[key]);
  }

  return internal;
}

export function createInternal(proto, properties){
  return extendInternal($$CreateInternalObject(proto), properties);
}

export function hideEverything(o){
  const type = typeof o;
  if (type === 'object' ? o === null : type !== 'function') {
    return o;
  }

  const keys = enumerate(o, false, true);
  let index = keys.length;

  while (index--) {
    update(o, keys[index], typeof o[keys[index]] === 'number' ? FROZEN : HIDDEN);
  }

  if (type === 'function') {
    hideEverything(o.prototype);
  }

  return o;
}

function builtinClass(Ctor, brand){
  const prototypeName = Ctor.name + 'Proto',
        prototype     = $$GetIntrinsic(prototypeName),
        isSymbol      = Ctor.name === 'Symbol';

  if (prototype) {
    if (!isSymbol) {
      extend(prototype, Ctor.prototype);
    }
    set(Ctor, 'prototype', prototype);
  } else {
    $$SetIntrinsic(prototypeName, Ctor.prototype);
  }

  $$Set(Ctor, 'BuiltinConstructor', true);
  $$Set(Ctor, 'BuiltinFunction', true);
  $$Set(Ctor, 'strict', false);
  update(Ctor, 'prototype', FROZEN);
  set(Ctor, 'length', 1);
  define(Ctor, 'caller', null, FROZEN);
  define(Ctor, 'arguments', null, FROZEN);

  if (!isSymbol) {
    $$Set(Ctor.prototype, 'BuiltinBrand', brand || 'Builtin'+Ctor.name)
    define(Ctor.prototype, @@toStringTag, Ctor.name);
    hideEverything(Ctor);
  }
}

export function isInitializing(obj, internal){
  return obj != null && $$Has(obj, internal) && $$Get(obj, internal) === undefined;
}



export function listFrom(array){
  return $$Get(array, 'array') || $$Get([...array], 'array');
}

export function listOf(...items){
  return $$Get(items, 'array');
}


const cache = [];

export function numbers(start, end){
  if (!isFinite(end)) {
    end = start;
    start = 0;
  }

  let index = end - start;

  if (end > cache.length) {
    while (index--) {
      const curr = start + index;
      cache[curr] = ToString(curr);
    }
  }

  const result = [];
  index = 0;

  while (start < end) {
    result[index++] = cache[start++];
  }

  return result;
}

