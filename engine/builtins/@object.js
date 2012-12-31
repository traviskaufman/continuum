export class Object {
  constructor(value){
    return value == null ? {} : $__ToObject(value);
  }

  hasOwnProperty(key){
    return $__HasOwnProperty($__ToObject(this), $__ToPropertyKey(key));
  }

  isPrototypeOf(object){
    while ($__Type(object) === 'Object') {
      object = $__GetInheritance(object);
      if (object === this) {
        return true;
      }
    }
    return false;
  }

  propertyIsEnumerable(key){
    return $__ToBoolean($__query($__ToObject(this), key) & 1);
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
    return '[object ' + $__ToObject(this).@@toStringTag + ']';
  }

  valueOf(){
    return $__ToObject(this);
  }
}

builtinClass(Object);

$__ObjectToString = Object.prototype.toString;


export function assign(target, source){
  ensureObject(target, 'Object.assign');
  source = $__ToObject(source);
  for (let [i, key] of $__Enumerate(source, false, true)) {
    const prop = source[key];
    if (typeof prop === 'function' && $__get(prop, 'HomeObject')) {
      // TODO
    }
    target[key] = prop;
  }
  return target;
}

export function create(proto, properties){
  ensureProto(proto, 'Object.create');
  const object = $__ObjectCreate(proto);

  if (properties !== undefined) {
    ensureDescriptor(properties);

    for (var key in properties) {
      const desc = properties[key];
      ensureDescriptor(desc);
      $__DefineOwnProperty(object, key, desc);
    }
  }

  return object;
}

export function defineProperty(object, key, property){
  ensureObject(object, 'Object.defineProperty');
  ensureDescriptor(property);
  $__DefineOwnProperty(object, $__ToPropertyKey(key), property);
  return object;
}

export function defineProperties(object, properties){
  ensureObject(object, 'Object.defineProperties');
  ensureDescriptor(properties);

  for (var key in properties) {
    const desc = properties[key];
    ensureDescriptor(desc);
    $__DefineOwnProperty(object, key, desc);
  }

  return object;
}

export function freeze(object){
  ensureObject(object, 'Object.freeze');
  const props = $__Enumerate(object, false, false);

  for (var i=0; i < props.length; i++) {
    const desc = $__GetOwnProperty(object, props[i]);
    if (desc.configurable) {
      desc.configurable = false;
      if ('writable' in desc) {
        desc.writable = false;
      }
      $__DefineOwnProperty(object, props[i], desc);
    }
  }

  $__PreventExtensions(object);
  return object;
}

$__freeze = freeze;

export function getOwnPropertyDescriptor(object, key){
  ensureObject(object, 'Object.getOwnPropertyDescriptor');
  return $__GetOwnProperty(object, $__ToPropertyKey(key));
}

export function getOwnPropertyNames(object){
  ensureObject(object, 'Object.getOwnPropertyNames');
  return $__Enumerate(object, false, false);
}

export function getPropertyDescriptor(object, key){
  ensureObject(object, 'Object.getPropertyDescriptor');
  return $__GetProperty(object, $__ToPropertyKey(key));
}

export function getPropertyNames(object){
  ensureObject(object, 'Object.getPropertyNames');
  return $__Enumerate(object, true, false);
}

export function getPrototypeOf(object){
  ensureObject(object, 'Object.getPrototypeOf');
  return $__GetInheritance(object);
}

export function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
}

export function isnt(x, y){
  return x === y ? x === 0 && 1 / x !== 1 / y : x === x || y === y;
}

export function isExtensible(object){
  ensureObject(object, 'Object.isExtensible');
  return $__IsExtensible(object);
}

export function isFrozen(object){
  ensureObject(object, 'Object.isFrozen');
  if ($__IsExtensible(object)) {
    return false;
  }

  const props = $__Enumerate(object, false, false);

  for (var i=0; i < props.length; i++) {
    const desc = $__GetOwnProperty(object, props[i]);
    if (desc && desc.configurable || 'writable' in desc && desc.writable) {
      return false;
    }
  }

  return true;
}

export function isSealed(object){
  ensureObject(object, 'Object.isSealed');
  if ($__IsExtensible(object)) {
    return false;
  }

  const props = $__Enumerate(object, false, false);

  for (var i=0; i < props.length; i++) {
    const desc = $__GetOwnProperty(object, props[i]);
    if (desc && desc.configurable) {
      return false;
    }
  }

  return true;
}

export function keys(object){
  ensureObject(object, 'Object.keys');
  return $__Enumerate(object, false, true);
}

export function preventExtensions(object){
  ensureObject(object, 'Object.preventExtensions');
  $__PreventExtensions(object);
  return object;
}

export function seal(object){
  ensureObject(object, 'Object.seal');

  const desc = { configurable: false },
        props = $__Enumerate(object, false, false);

  for (var i=0; i < props.length; i++) {
    $__DefineOwnProperty(object, props[i], desc);
  }

  $__PreventExtensions(object);
  return object;
}


function getObservers(object){
  return $__getInternal($__GetNotifier(object), 'ChangeObservers');
}

internalFunction(getObservers);

export function observe(object, callback){
  ensureObject(object, 'Object.observe');
  ensureFunction(callback, 'Object.observe');
  if (isFrozen(callback)) {

  }

  $__AddObserver(getObservers(object), callback);
  $__AddObserver($__ObserverCallbacks, callback);
  return object;
}

export function unobserve(object, callback){
  ensureObject(object, 'Object.unobserve');
  ensureFunction(callback, 'Object.unobserve');
  $__RemoveObserver(getObservers(object), callback);
  return object;
}

export function deliverChangeRecords(callback){
  ensureFunction(callback, 'Object.deliverChangeRecords');
  $__DeliverChangeRecords(callback);
}

export function getNotifier(object){
  ensureObject(object, 'Object.getNotifier');
  return isFrozen(object) ? null : $__GetNotifier(object);
}


extend(Object, { assign, create, defineProperty, defineProperties, deliverChangeRecords,
  freeze, getNotifier, getOwnPropertyDescriptor, getOwnPropertyNames, getPropertyDescriptor,
  getPropertyNames, getPrototypeOf, is, isnt, isExtensible, isFrozen, isSealed, keys, observe,
  preventExtensions, seal, unobserve
});



export function isPrototypeOf(object, prototype){
  while (prototype) {
    prototype = $__GetInheritance(prototype);
    if (prototype === object) {
      return true;
    }
  }
  return false;
}

builtinFunction(isPrototypeOf);


export function hasOwnProperty(object, key){
  return $__HasOwnProperty($__ToObject(object), $__ToPropertyKeys(key));
}

builtinFunction(hasOwnProperty);


export function propertyIsEnumerable(object, key){
  return $__ToBoolean($__query($__ToObject(object), key) & 1);
}

builtinFunction(propertyIsEnumerable);
