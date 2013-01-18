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

import {
  toStringTag
} from '@@symbols';


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

export function construct(func, args){
  return $$Invoke(func, 'Call', args ? $$Get(args, 'array') : emptyList);
}


export function enumerate(obj, inherited, onlyEnumerable){
  return $$CreateObject('Array', $$Invoke(obj, 'Enumerate', inherited, onlyEnumerable));
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

export function query(obj, key){
  return $$Invoke(obj, 'query', key);
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

export function internalFunction(func){
  $$Set(func, 'InternalFunction', true);
  $$Set(func, 'Strict', false);
  deleteProperty(func, 'prototype');
  deleteProperty(func, 'caller');
  deleteProperty(func, 'arguments');
}

export function extend(obj, properties){
  const keys = enumerate(properties, false, false);
  let index = keys.length;

  while (index--) {
    const key   = keys[index],
          desc  = $$Invoke(properties, 'GetOwnProperty', key);

    $$Set(desc, 'Enumerable', false);

    if ($$Has(desc, 'Value')) {
      const value = $$Get(desc, 'Value');

      if (typeof value === 'number') {
        $$Set(desc, 'Configurable', false);
        $$Set(desc, 'Writable', false);
      } else if (typeof value === 'function') {
        builtinFunction(value);
      }
    }

    $$Invoke(obj, 'DefineOwnProperty', key, desc);
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
    const key   = keys[index],
          attrs = query(o, key),
          val   = get(o, key);

    update(o, key, typeof val === 'number' ? FROZEN : attrs & ~1);
  }

  if (type === 'function') {
    hideEverything(o.prototype);
  }

  return o;
}

export function builtinClass(Ctor, brand){
  $$SetIntrinsic(`%${Ctor.name}%`, Ctor);
  $$SetIntrinsic(`%${Ctor.name}Prototype%`, Ctor.prototype);
  $$Set(Ctor, 'BuiltinConstructor', true);
  $$Set(Ctor, 'BuiltinFunction', true);
  update(Ctor, 'prototype', FROZEN);
  define(Ctor, 'length', 1, FROZEN);
  define(Ctor, 'caller', null, FROZEN);
  define(Ctor, 'arguments', null, FROZEN);

  if (Ctor.name !== 'Symbol') {
    $$Set(Ctor.prototype, 'BuiltinBrand', brand || 'Builtin'+Ctor.name);
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

export function getIntrinsic(name){
  return $$GetIntrinsic($$CurrentRealm(), name);
}

export function setTag(obj, tag){
  define(obj, toStringTag, tag);
}
