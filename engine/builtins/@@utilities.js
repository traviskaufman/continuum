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
  NEGATIVE_INFINITY,
  undefined
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

internalFunction(zeroPad);


export function abs(x){
  return x < 0 ? -x : x;
}

internalFunction(abs);


export function floor(x){
  return x >> 0;
}

internalFunction(floor);


export function sign(x){
  return x < 0 ? -1 : 1;
}

internalFunction(sign);


export function isZeroOrInfinite(x){
  return x === 0 || x === POSITIVE_INFINITY || x === NEGATIVE_INFINITY;
}

internalFunction(isZeroOrInfinite);


export function isNaN(x){
  return x !== x;
}

internalFunction(isNaN);


export function isFinite(value){
  return typeof value === 'number'
      && !isNaN(value)
      && value < POSITIVE_INFINITY
      && value > NEGATIVE_INFINITY;
}

internalFunction(isFinite);


export function isInteger(value) {
  return typeof value === 'number'
      && !isNaN(value)
      && value > -MAX_INTEGER
      && value < MAX_INTEGER
      && value | 0 === value;
}

internalFunction(isInteger);


export function hasBrand(obj, brand){
  if (obj == null) {
    return false;
  }
  return $$Get(obj, 'BuiltinBrand') === brand;
}

internalFunction(hasBrand);


const emptyList = $$Get([], 'array');

export function call(func, receiver, args){
  return $$Invoke(func, 'Call', receiver, args ? $$Get(args, 'array') : emptyList);
}

internalFunction(call);


export function construct(func, args){
  return $$Invoke(func, 'Construct', args ? $$Get(args, 'array') : emptyList);
}

internalFunction(construct);


export function enumerate(obj, inherited, onlyEnumerable){
  return $$CreateObject('Array', $$Invoke(obj, 'Enumerate', inherited, onlyEnumerable));
}

internalFunction(enumerate);


export function deleteProperty(obj, key){
  return $$Invoke(obj, 'remove', key);
}

internalFunction(deleteProperty);


export function update(obj, key, attr){
  return $$Invoke(obj, 'update', key, attr);
}

internalFunction(update);


export function define(obj, key, value, attr){
  return $$Invoke(obj, 'define', key, value, attr);
}

internalFunction(define);


export function query(obj, key){
  return $$Invoke(obj, 'query', key);
}

internalFunction(query);


export function get(obj, key){
  return $$Invoke(obj, 'get', key);
}

internalFunction(get);


export function set(obj, key, value){
  return $$Invoke(obj, 'set', key, value);
}

internalFunction(set);


export function builtinFunction(func){
  $$Set(func, 'BuiltinFunction', true);
  deleteProperty(func, 'prototype');
  update(func, 'name', 0);
  define(func, 'caller', null, 0);
  define(func, 'arguments', null, 0);
}

internalFunction(builtinFunction);


export function internalFunction(func){
  $$Set(func, 'InternalFunction', true);
  $$Set(func, 'Strict', false);
  deleteProperty(func, 'prototype');
  deleteProperty(func, 'caller');
  deleteProperty(func, 'arguments');
}

internalFunction(internalFunction);


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

internalFunction(extend);


export function extendInternal(internal, properties){
  const keys = enumerate(properties, false, false);

  let index = keys.length;

  while (index--) {
    const key = keys[index];
    $$Set(internal, key, properties[key]);
  }

  return internal;
}

internalFunction(extendInternal);


export function createInternal(proto, properties){
  return extendInternal($$CreateInternalObject(proto), properties);
}

internalFunction(createInternal);


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

internalFunction(hideEverything);


export function builtinClass(Ctor, brand){
  const prototype = $$GetIntrinsic(`${Ctor.name}Proto`),
        isSymbol  = Ctor.name === 'Symbol';

  if (prototype) {
    if (!isSymbol) {
      extend(prototype, Ctor.prototype);
      Ctor.prototype = prototype;
    }
  } else {
    $$SetIntrinsic(`%${Ctor.name}%`, Ctor);
    $$SetIntrinsic(`%${Ctor.name}Prototype%`, Ctor.prototype);
  }

  $$Set(Ctor, 'BuiltinConstructor', true);
  $$Set(Ctor, 'BuiltinFunction', true);
  update(Ctor, 'prototype', FROZEN);
  define(Ctor, 'length', 1, FROZEN);
  define(Ctor, 'caller', null, FROZEN);
  define(Ctor, 'arguments', null, FROZEN);

  if (!isSymbol) {
    setBrand(Ctor.prototype, brand || `Builtin${Ctor.name}`);
    setTag(Ctor.prototype, Ctor.name);
    hideEverything(Ctor);
  }
}

internalFunction(builtinClass);


export function isInitializing(obj, internal){
  return obj != null && $$Has(obj, internal) && $$Get(obj, internal) === undefined;
}

internalFunction(isInitializing);



export function listFrom(array){
  return $$Get(array, 'array') || $$Get([...array], 'array');
}

internalFunction(listFrom);


export function listOf(...items){
  return $$Get(items, 'array');
}

internalFunction(listOf);


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

internalFunction(numbers);


export function getIntrinsic(name){
  return $$GetIntrinsic($$CurrentRealm(), name);
}

internalFunction(getIntrinsic);


export function setBrand(obj, brand){
  $$Set(obj, 'BuiltinBrand', brand);
}

internalFunction(setBrand);


export function setTag(obj, tag){
  define(obj, toStringTag, tag);
}

internalFunction(setTag);


export function ensureObject(o, name){
  if (Type(o) !== 'Object') {
    throw $$Exception('called_on_non_object', [name]);
  }
}

internalFunction(ensureObject);


export function ensureDescriptor(o){
  if (o === null || typeof o !== 'object') {
    throw $$Exception('property_desc_object', [Type(o)])
  }
}

internalFunction(ensureDescriptor);


export function ensureArgs(o, name){
  const brand = Type(o) === 'Object' ? $$Get(o, 'BuiltinBrand') : null;

  if (brand === 'BuiltinArguments') {
    return [...o];
  } else if (brand === 'BuiltinArray') {
    return o;
  }

  throw $$Exception('apply_wrong_args', []);
}

internalFunction(ensureArgs);


export function ensureFunction(o, name){
  if (typeof o !== 'function') {
    throw $$Exception('called_on_non_function', [name]);
  }
}

internalFunction(ensureFunction);


export function ensureCallback(o, name){
  if (typeof o !== 'function') {
    throw $$Exception('callback_must_be_callable', [name]);
  }
}

internalFunction(ensureCallback);


export function ensureProto(proto){
  if (proto !== null && Type(proto) !== 'Object') {
    throw $$Exception('proto_object_or_null', [])
  }
}

internalFunction(ensureProto);
