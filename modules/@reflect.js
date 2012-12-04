export class Proxy {
  constructor(target, handler){
    ensureObject(target, 'Proxy');
    ensureObject(handler, 'Proxy');
    return $__ProxyCreate(target, handler);
  }
}

builtinClass(Proxy);

Proxy.@@delete('prototype');

export class Handler {
  getOwnPropertyDescriptor(target, name){
    throw $__Exception('missing_fundamental_trap', ['getOwnPropertyDescriptor']);
  }

  getOwnPropertyNames(target){
    throw $__Exception('missing_fundamental_trap', ['getOwnPropertyNames']);
  }

  getPrototypeOf(target){
    throw $__Exception('missing_fundamental_trap', ['getPrototypeOf']);
  }

  defineProperty(target, name, desc){
    throw $__Exception('missing_fundamental_trap', ['defineProperty']);
  }

  deleteProperty(target, name){
    throw $__Exception('missing_fundamental_trap', ['deleteProperty']);
  }

  preventExtensions(target){
    throw $__Exception('missing_fundamental_trap', ['preventExtensions']);
  }

  isExtensible(target){
    throw $__Exception('missing_fundamental_trap', ['isExtensible']);
  }

  apply(target, thisArg, args){
    throw $__Exception('missing_fundamental_trap', ['apply']);
  }

  seal(target) {
    if (!this.preventExtensions(target)) return false;

    var props = this.getOwnPropertyNames(target),
        len = +props.length;

    for (var i = 0; i < len; i++) {
      success = success && this.defineProperty(target, props[i], { configurable: false });
    }
    return success;
  }

  freeze(target){
    if (!this.preventExtensions(target)) return false;

    var props = this.getOwnPropertyNames(target),
        len = +props.length;

    for (var i = 0; i < len; i++) {
      var name = props[i],
          desc = this.getOwnPropertyDescriptor(target, name);

      if (desc) {
        desc = 'writable' in desc || 'value' in desc
          ? { configurable: false, writable: false }
          : { configurable: false };
        success = success && this.defineProperty(target, name, desc);
      }
    }

    return success;
  }

  isSealed(target){
    var props = this.getOwnPropertyNames(target),
        len = $__ToUint32(props.length);

    for (var i = 0; i < len; i++) {
      var desc = this.getOwnPropertyDescriptor(target, props[i]);

      if (desc && desc.configurable) {
        return false;
      }
    }
    return !this.isExtensible(target);
  }

  isFrozen(target){
    var props = this.getOwnPropertyNames(target),
        len = $__ToUint32(props.length);

    for (var i = 0; i < len; i++) {
      var desc = this.getOwnPropertyDescriptor(target, props[i]);

      if (desc.configurable || ('writable' in desc || 'value' in desc) && desc.writable) {
        return false;
      }
    }
    return !this.isExtensible(target);
  }

  has(target, name){
    var desc = this.getOwnPropertyDescriptor(target, name);
    if (desc !== undefined) {
      return true;
    }

    var proto = target.@@GetPrototype();
    return proto === null ? false : this.has(proto, name);
  }

  hasOwn(target, name){
    return this.getOwnPropertyDescriptor(target, name) !== undefined;
  }

  get(target, name, receiver){
    receiver = receiver || target;

    var desc = this.getOwnPropertyDescriptor(target, name);
    if (desc === undefined) {
      var proto = target.@@GetPrototype();
      return proto === null ? undefined : this.get(proto, name, receiver);
    }

    if ('writable' in desc || 'value' in desc) {
      return desc.value;
    }

    var getter = desc.get;
    return getter === undefined ? undefined : getter.@@Call(receiver, []);
  }

  set(target, name, value, receiver){
    var ownDesc = this.getOwnPropertyDescriptor(target, name);

    if (ownDesc !== undefined) {
      if ('get' in ownDesc || 'set' in ownDesc) {
        var setter = ownDesc.set;
        if (setter === undefined) return false;
        setter.@@Call(receiver, [value]);
        return true;
      }

      if (ownDesc.writable === false) {
        return false;
      } else if (receiver === target) {
        receiver.@@DefineOwnProperty(name, { value: value });
        return true;
      } else {
        receiver.@@DefineOwnProperty(name, newDesc);
        if (receiver.@@IsExtensible()) {
          object.@@DefineOwnProperty(key, { writable: true,
                                            enumerable: true,
                                            configurable: true });
          return true;
        }
        return false;
      }
    }

    var proto = target.@@GetPrototype();
    if (proto === null) {
      if (receiver.@@IsExtensible()) {
        receiver.@@DefineOwnProperty(key, { writable: true,
                                            enumerable: true,
                                            configurable: true });
        return true;
      }
      return false;
    }

    return this.set(proto, name, value, receiver);
  }

  enumerate(target){
    var result = this.getOwnPropertyNames(target),
        len = +result.length,
        out = [];

    for (var i = 0; i < len; i++) {
      var name = $__ToString(result[i]),
          desc = this.getOwnPropertyDescriptor(name);

      if (desc != null && !desc.enumerable) {
        out.push(name);
      }
    }

    var proto = target.@@GetPrototype();
    return proto === null ? out : out.concat(enumerate(proto));
  }

  keys(target){
    var result = this.getOwnPropertyNames(target),
        len = +result.length,
        result = [];

    for (var i = 0; i < len; i++) {
      var name = $__ToString(result[i]),
          desc = this.getOwnPropertyDescriptor(name);

      if (desc != null && desc.enumerable) {
        result.push(name);
      }
    }
    return result;
  }

  construct(target, args) {
    var proto = this.get(target, 'prototype', target),
        instance = $__Type(proto) === 'Object' ? $__ObjectCreate(proto) : {},
        result = this.apply(target, instance, args);

    return $__Type(result) === 'Object' ? result : instance;
  }
}

builtinClass(Handler);


export function apply(target, thisArg, args){
  ensureFunction(target, '@Reflect.apply');
  return target.@@Call(thisArg, ensureArgs(args));
}
builtinFunction(apply);

export function construct(target, args){
  ensureFunction(target, '@Reflect.construct');
  return target.@@Construct(ensureArgs(args));
}
builtinFunction(construct);

export function defineProperty(target, name, desc){
  ensureObject(target, '@Reflect.defineProperty');
  ensureDescriptor(desc);
  return target.@@DefineOwnProperty($__ToPropertyName(name), desc);
}
builtinFunction(defineProperty);

export function deleteProperty(target, name){
  ensureObject(target, '@Reflect.deleteProperty');
  return target.@@Delete($__ToPropertyName(name), false);
}
builtinFunction(deleteProperty);

export function enumerate(target){
  return $__ToObject(target).@@Enumerate(false, false);
}
builtinFunction(enumerate);

export function freeze(target){
  if ($__Type(target) !== 'Object' || !target.@@PreventExtensions()) {
    return false;
  }

  var props = target.@@Enumerate(false, false);
      len = props.length
      success = true;

  for (var i = 0; i < len; i++) {
    var desc = target.@@GetOwnProperty(props[i]),
        attrs = 'writable' in desc || 'value' in desc
          ? { configurable: false, writable: false }
          : desc !== undefined
            ? { configurable: false }
            : null;

    if (attrs !== null) {
      success = success && target.@@DefineOwnProperty(props[i], attrs);
    }
  }
  return success;
}
builtinFunction(freeze);

export function get(target, name, receiver){
  receiver = receiver === undefined ? receiver : $__ToObject(receiver);
  return $__ToObject(target).@@GetP($__ToPropertyName(name), receiver);
}
builtinFunction(get);

export function getOwnPropertyDescriptor(target, name){
  ensureObject(target, '@Reflect.getOwnPropertyDescriptor');
  return target.@@GetOwnProperty($__ToPropertyName(name));
}
builtinFunction(getOwnPropertyDescriptor);

export function getOwnPropertyNames(target){
  ensureObject(target, '@Reflect.getOwnPropertyNames');
  return target.@@Enumerate(false, false);
}
builtinFunction(getOwnPropertyNames);

export function getPrototypeOf(target){
  ensureObject(target, '@Reflect.getPrototypeOf');
  return target.@@GetPrototype();
}
builtinFunction(getPrototypeOf);

export function has(target, name){
  return $__ToObject(target).@@HasProperty($__ToPropertyName(name));
}
builtinFunction(has);

export function hasOwn(target, name){
  return $__ToObject(target).@@HasOwnProperty($__ToPropertyName(name));
}
builtinFunction(hasOwn);

export function isFrozen(target){
  ensureObject(target, '@Reflect.isFrozen');
  if (target.@@IsExtensible()) {
    return false;
  }

  var props = target.@@Enumerate(false, false);

  for (var i=0; i < props.length; i++) {
    var desc = target.@@GetOwnProperty(props[i]);
    if (desc) {
      if (desc.configurable || 'writable' in desc && desc.writable) {
        return false;
      }
    }
  }

  return true;
}
builtinFunction(isFrozen);

export function isSealed(target){
  ensureObject(target, '@Reflect.isSealed');
  if (target.@@IsExtensible()) {
    return false;
  }

  var props = target.@@Enumerate(false, false);

  for (var i=0; i < props.length; i++) {
    var desc = target.@@GetOwnProperty(props[i]);
    if (desc && desc.configurable) {
      return false;
    }
  }

  return true;
}
builtinFunction(isSealed);

export function isExtensible(target){
  ensureObject(target, '@Reflect.isExtensible');
  return target.@@IsExtensible();
}
builtinFunction(isExtensible);

export function keys(target){
  ensureObject(target, '@Reflect.keys');
  return target.@@Enumerate(false, true);
}
builtinFunction(keys);

export function preventExtensions(target){
  if ($__Type(target) !== 'Object') return false;
  return target.@@PreventExtensions();
}
builtinFunction(preventExtensions);

export function seal(target){
  if ($__Type(target) !== 'Object') return false;
  var success = target.@@PreventExtensions();
  if (!success) return success;

  var props = target.@@Enumerate(false, false),
      len = props.length;

  for (var i = 0; i < len; i++) {
    success = success && target.@@DefineOwnProperty(props[i], { configurable: false });
  }
  return success;
}
builtinFunction(seal);

export function set(target, name, value, receiver){
  receiver = receiver === undefined ? receiver : $__ToObject(receiver);
  return $__ToObject(target).@@SetP($__ToPropertyName(name), value, receiver);
}
builtinFunction(set);
