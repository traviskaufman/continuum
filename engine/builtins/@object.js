import {
  @@toStringTag: toStringTag
} from '@@symbols';

import {
  ToBoolean,
  ToObject,
  ToPropertyKey
} from '@@operations';

import {
  builtinClass,
  builtinFunction,
  ensureDescriptor,
  ensureFunction,
  ensureObject,
  ensureProto,
  enumerate,
  extend,
  getOwnProperty,
  defineOwnProperty,
  internalFunction,
  query
} from '@@utilities';

import {
  ObjectCreate,
  Type
} from '@@types';

import {
  $$AddObserver,
  $$DeliverChangeRecords,
  $$Exception,
  $$GetIntrinsic,
  $$GetNotifier,
  $$Has,
  $$Invoke,
  $$RemoveObserver,
  $$SetIntrinsic,
  $$WrapDescriptor
} from '@@internals';

import {
  hasOwn
} from '@reflect';


export class Object extends null {
  constructor(value){
    return value == null ? {} : ToObject(value);
  }

  hasOwnProperty(key){
    return hasOwn(ToObject(this), key);
  }

  isPrototypeOf(object){
    while (Type(object) === 'Object') {
      object = $$Invoke(object, 'GetInheritance');
      if (object === this) {
        return true;
      }
    }
    return false;
  }

  propertyIsEnumerable(key){
    return ToBoolean(query(ToObject(this), key) & 1);
  }

  toLocaleString(){
    return this.toString();
  }

  toString(){
    if (this === undefined) {
      return '[object Undefined]';
    } else if (this === null) {
      return '[object Null]';
    }
    return `[object ${this.@@toStringTag}]`;
  }

  valueOf(){
    return ToObject(this);
  }
}

builtinClass(Object);

$$SetIntrinsic('%ObjProto_toString%', Object.prototype.toString);


export function assign(target, source){
  ensureObject(target, 'Object.assign');
  source = ToObject(source);

  for (let [i, key] of enumerate(source, false, true)) {
    const prop = source[key];
    if (typeof prop === 'function' && $$Has(prop, 'HomeObject')) {
      // TODO
    }
    target[key] = prop;
  }

  return target;
}

export function create(proto, properties){
  ensureProto(proto, 'Object.create');
  const object = ObjectCreate(proto);

  if (properties !== undefined) {
    ensureDescriptor(properties);

    for (var key in properties) {
      const desc = properties[key];
      ensureDescriptor(desc);
      defineOwnProperty(object, key, desc);
    }
  }

  return object;
}

export function defineProperty(object, key, property){
  ensureObject(object, 'Object.defineProperty');
  ensureDescriptor(property);
  defineOwnProperty(object, ToPropertyKey(key), property);
  return object;
}

export function defineProperties(object, properties){
  ensureObject(object, 'Object.defineProperties');
  ensureDescriptor(properties);

  for (var key in properties) {
    const desc = properties[key];
    ensureDescriptor(desc);
    defineOwnProperty(object, key, desc);
  }

  return object;
}

export function freeze(object){
  ensureObject(object, 'Object.freeze');
  const props = enumerate(object, false, false);

  for (var i=0; i < props.length; i++) {
    const desc = getOwnProperty(object, props[i]);
    if (desc.configurable) {
      desc.configurable = false;
      if ('writable' in desc) {
        desc.writable = false;
      }
      defineOwnProperty(object, props[i], desc);
    }
  }

  $$Invoke(object, 'PreventExtensions');
  return object;
}


export function getOwnPropertyDescriptor(object, key){
  ensureObject(object, 'Object.getOwnPropertyDescriptor');
  return getOwnProperty(object, ToPropertyKey(key));
}

export function getOwnPropertyNames(object){
  ensureObject(object, 'Object.getOwnPropertyNames');
  return enumerate(object, false, false);
}

export function getPropertyDescriptor(object, key){
  ensureObject(object, 'Object.getPropertyDescriptor');
  return $$WrapDescriptor($$Invoke(object, 'GetProperty', ToPropertyKey(key)));
}

export function getPropertyNames(object){
  ensureObject(object, 'Object.getPropertyNames');
  return enumerate(object, true, false);
}

export function getPrototypeOf(object){
  ensureObject(object, 'Object.getPrototypeOf');
  return $$Invoke(object, 'GetInheritance');
}

export function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
}

export function isnt(x, y){
  return x === y ? x === 0 && 1 / x !== 1 / y : x === x || y === y;
}

export function isExtensible(object){
  ensureObject(object, 'Object.isExtensible');
  return $$Invoke(object, 'IsExtensible');
}

export function isFrozen(object){
  ensureObject(object, 'Object.isFrozen');
  if ($$Invoke(object, 'IsExtensible')) {
    return false;
  }

  const props = enumerate(object, false, false);

  for (var i=0; i < props.length; i++) {
    const desc = getOwnProperty(object, props[i]);
    if (desc && desc.configurable || 'writable' in desc && desc.writable) {
      return false;
    }
  }

  return true;
}

export function isSealed(object){
  ensureObject(object, 'Object.isSealed');
  if ($$Invoke(object, 'IsExtensible')) {
    return false;
  }

  const props = enumerate(object, false, false);

  for (var i=0; i < props.length; i++) {
    const desc = getOwnProperty(object, props[i]);
    if (desc && desc.configurable) {
      return false;
    }
  }

  return true;
}

export function keys(object){
  ensureObject(object, 'Object.keys');
  return enumerate(object, false, true);
}

export function preventExtensions(object){
  ensureObject(object, 'Object.preventExtensions');
  $$Invoke(object, 'PreventExtensions');
  return object;
}

export function seal(object){
  ensureObject(object, 'Object.seal');

  const desc = { configurable: false },
        props = enumerate(object, false, false);

  for (var i=0; i < props.length; i++) {
    defineOwnProperty(object, props[i], desc);
  }

  $$Invoke(object, 'PreventExtensions');
  return object;
}


function getObservers(object){
  return $$GetInternal($$GetNotifier(object), 'ChangeObservers');
}


internalFunction(getObservers);

export function observe(object, callback){
  ensureObject(object, 'Object.observe');
  ensureFunction(callback, 'Object.observe');
  if (isFrozen(callback)) {

  }

  $$AddObserver(getObservers(object), callback);
  $$AddObserver($$GetIntrinsic('ObserverCallbacks'), callback);
  return object;
}

export function unobserve(object, callback){
  ensureObject(object, 'Object.unobserve');
  ensureFunction(callback, 'Object.unobserve');
  $$RemoveObserver(getObservers(object), callback);
  return object;
}

export function deliverChangeRecords(callback){
  ensureFunction(callback, 'Object.deliverChangeRecords');
  $$DeliverChangeRecords(callback);
}

export function getNotifier(object){
  ensureObject(object, 'Object.getNotifier');
  return isFrozen(object) ? null : $$GetNotifier(object);
}


extend(Object, { assign, create, defineProperty, defineProperties, deliverChangeRecords,
  freeze, getNotifier, getOwnPropertyDescriptor, getOwnPropertyNames, getPropertyDescriptor,
  getPropertyNames, getPrototypeOf, is, isnt, isExtensible, isFrozen, isSealed, keys, observe,
  preventExtensions, seal, unobserve
});



export function isPrototypeOf(object, prototype){
  while (prototype) {
    prototype = $$Invoke(prototype, 'GetInheritance');
    if (prototype === object) {
      return true;
    }
  }
  return false;
}

builtinFunction(isPrototypeOf);


export function hasOwnProperty(object, key){
  return hasOwn(ToObject(object), key);
}

builtinFunction(hasOwnProperty);


export function propertyIsEnumerable(object, key){
  return ToBoolean(query(ToObject(object), key) & 1);
}

builtinFunction(propertyIsEnumerable);
