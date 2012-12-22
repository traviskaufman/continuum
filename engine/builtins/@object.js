export class Object {
  constructor(value){
    return value == null ? {} : $__ToObject(value);
  }

  toString(){
    if (this === undefined) {
      return '[object Undefined]';
    } else if (this === null) {
      return '[object Null]';
    } else {
      return '[object ' + $__ToObject(this).@toStringTag + ']';
    }
  }

  isPrototypeOf(object){
    while ($__Type(object) === 'Object') {
      object = object.@@GetPrototype();
      if (object === this) {
        return true;
      }
    }
    return false;
  }

  toLocaleString(){
    return this.toString();
  }

  valueOf(){
    return $__ToObject(this);
  }

  hasOwnProperty(key){
    return $__ToObject(this).@@HasOwnProperty($__ToPropertyKey(key));
  }

  propertyIsEnumerable(key){
    return !!($__ToObject(this).@@query(key) & 1);
  }
}

builtinClass(Object);


export function assign(target, source){
  ensureObject(target, 'Object.assign');
  source = $__ToObject(source);
  for (let [i, key] of source.@@Enumerate(false, true)) {
    let prop = source[key];
    if (typeof prop === 'function' && prop.@@get('HomeObject')) {
      // TODO
    }
    target[key] = prop;
  }
  return target;
}

export function create(prototype, properties){
  if (typeof prototype !== 'object') {
    throw $__Exception('proto_object_or_null', [])
  }

  var object = $__ObjectCreate(prototype);

  if (properties !== undefined) {
    ensureDescriptor(properties);

    for (var key in properties) {
      var desc = properties[key];
      ensureDescriptor(desc);
      object.@@DefineOwnProperty(key, desc);
    }
  }

  return object;
}

export function defineProperty(object, key, property){
  ensureObject(object, 'Object.defineProperty');
  ensureDescriptor(property);
  object.@@DefineOwnProperty($__ToPropertyKey(key), property);
  return object;
}

export function defineProperties(object, properties){
  ensureObject(object, 'Object.defineProperties');
  ensureDescriptor(properties);

  for (var key in properties) {
    var desc = properties[key];
    ensureDescriptor(desc);
    object.@@DefineOwnProperty(key, desc);
  }

  return object;
}

export function freeze(object){
  ensureObject(object, 'Object.freeze');
  var props = object.@@Enumerate(false, false);

  for (var i=0; i < props.length; i++) {
    var desc = object.@@GetOwnProperty(props[i]);
    if (desc.configurable) {
      desc.configurable = false;
      if ('writable' in desc) {
        desc.writable = false;
      }
      object.@@DefineOwnProperty(props[i], desc);
    }
  }

  object.@@PreventExtensions();
  return object;
}

export function getOwnPropertyDescriptor(object, key){
  ensureObject(object, 'Object.getOwnPropertyDescriptor');
  return object.@@GetOwnProperty($__ToPropertyKey(key));
}

export function getOwnPropertyNames(object){
  ensureObject(object, 'Object.getOwnPropertyNames');
  return object.@@Enumerate(false, false);
}

export function getPropertyDescriptor(object, key){
  ensureObject(object, 'Object.getPropertyDescriptor');
  return object.@@GetProperty($__ToPropertyKey(key));
}

export function getPropertyNames(object){
  ensureObject(object, 'Object.getPropertyNames');
  return object.@@Enumerate(true, false);
}

export function getPrototypeOf(object){
  ensureObject(object, 'Object.getPrototypeOf');
  return object.@@GetPrototype();
}

export function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
}

export function isnt(x, y){
  return x === y ? x === 0 && 1 / x !== 1 / y : x === x || y === y;
}

export function isExtensible(object){
  ensureObject(object, 'Object.isExtensible');
  return object.@@IsExtensible();
}

export function isFrozen(object){
  ensureObject(object, 'Object.isFrozen');
  if (object.@@IsExtensible()) {
    return false;
  }

  var props = object.@@Enumerate(false, false);

  for (var i=0; i < props.length; i++) {
    var desc = object.@@GetOwnProperty(props[i]);
    if (desc) {
      if (desc.configurable || 'writable' in desc && desc.writable) {
        return false;
      }
    }
  }

  return true;
}

export function isSealed(object){
  ensureObject(object, 'Object.isSealed');
  if (object.@@IsExtensible()) {
    return false;
  }

  var props = object.@@Enumerate(false, false);

  for (var i=0; i < props.length; i++) {
    var desc = object.@@GetOwnProperty(props[i]);
    if (desc && desc.configurable) {
      return false;
    }
  }

  return true;
}

export function keys(object){
  ensureObject(object, 'Object.keys');
  return object.@@Enumerate(false, true);
}

export function preventExtensions(object){
  ensureObject(object, 'Object.preventExtensions');
  object.@@PreventExtensions();
  return object;
}

export function seal(object){
  ensureObject(object, 'Object.seal');

  var desc = { configurable: false },
      props = object.@@Enumerate(false, false);

  for (var i=0; i < props.length; i++) {
    object.@@DefineOwnProperty(props[i], desc);
  }

  object.@@PreventExtensions();
  return object;
}


export function observe(object, callback){
  ensureObject(object, 'Object.observe');
  ensureFunction(callback, 'Object.observe');
  if (isFrozen(callback)) {

  }

  var notifier = $__GetNotifier(object),
      changeObservers = notifier.@@getInternal('ChangeObservers');

  $__AddObserver(changeObservers, callback);
  $__AddObserver($__ObserverCallbacks, callback);
  return object;
}

export function unobserve(object, callback){
  ensureObject(object, 'Object.unobserve');
  ensureFunction(callback, 'Object.unobserve');

  var notifier = $__GetNotifier(object),
      changeObservers = notifier.@@getInternal('ChangeObservers');

  $__RemoveObserver(changeObservers, callback);
  return object;
}

export function deliverChangeRecords(callback){
  ensureFunction(callback, 'Object.deliverChangeRecords');
  $__DeliverChangeRecords(callback);
}

export function getNotifier(object){
  ensureObject(object, 'Object.getNotifier');
  if (isFrozen(object)) {
    return null;
  }
  return $__GetNotifier(object);
}


Object.@@extend({ assign, create, defineProperty, defineProperties, deliverChangeRecords,
  freeze, getNotifier, getOwnPropertyDescriptor, getOwnPropertyNames, getPropertyDescriptor,
  getPropertyNames, getPrototypeOf, is, isnt, isExtensible, isFrozen, isSealed, keys, observe,
  preventExtensions, seal, unobserve
});



export function isPrototypeOf(object, prototype){
  while (prototype) {
    prototype = prototype.@@GetPrototype();
    if (prototype === object) {
      return true;
    }
  }
  return false;
}

builtinFunction(isPrototypeOf);


export function hasOwnProperty(object, key){
  return $__ToObject(object).@@HasOwnProperty($__ToPropertyKeys(key));
}

builtinFunction(hasOwnProperty);


export function propertyIsEnumerable(object, key){
  return !!($__ToObject(object).@@query(key) & 1);
}

builtinFunction(propertyIsEnumerable);

