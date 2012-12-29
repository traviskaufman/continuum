export class Proxy {
  constructor(target, handler){
    ensureObject(target, 'Proxy');
    ensureObject(handler, 'Proxy');
    return $__ProxyCreate(target, handler);
  }
}

builtinClass(Proxy);

$__delete(Proxy, 'prototype');

const normal = {
  writable: true,
  enumerable: true,
  configurable: true
};

export class Handler {
  getOwnPropertyDescriptor(target, name){
    //throw $__Exception('missing_fundamental_trap', ['getOwnPropertyDescriptor']);
    return getOwnPropertyDescriptor(target, name);
  }

  getOwnPropertyNames(target){
    //throw $__Exception('missing_fundamental_trap', ['getOwnPropertyNames']);
    return getOwnPropertyNames(target);
  }

  getPrototypeOf(target){
    //throw $__Exception('missing_fundamental_trap', ['getPrototypeOf']);
    return getPrototypeOf(target);
  }

  defineProperty(target, name, desc){
    //throw $__Exception('missing_fundamental_trap', ['defineProperty']);
    return defineProperty(target, name, desc);
  }

  deleteProperty(target, name){
    //throw $__Exception('missing_fundamental_trap', ['deleteProperty']);
    return deleteProperty(target, name);
  }

  preventExtensions(target){
    //throw $__Exception('missing_fundamental_trap', ['preventExtensions']);
    return preventExtensions(target);
  }

  isExtensible(target){
    //throw $__Exception('missing_fundamental_trap', ['isExtensible']);
    return isExtensible(target);
  }

  apply(target, thisArg, args){
    //throw $__Exception('missing_fundamental_trap', ['apply']);
    return apply(target, thisArg, args);
  }

  seal(target) {
    if (!this.preventExtensions(target)) return false;

    const props = this.getOwnPropertyNames(target),
          len   = $__ToUint32(props.length);

    for (var i = 0; i < len; i++) {
      success = success && this.defineProperty(target, props[i], { configurable: false });
    }
    return success;
  }

  freeze(target){
    if (!this.preventExtensions(target)) return false;

    const props = this.getOwnPropertyNames(target),
          len   = $__ToUint32(props.length);

    for (var i = 0; i < len; i++) {
      const name = props[i];
      let desc = this.getOwnPropertyDescriptor(target, name);

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
    const props = this.getOwnPropertyNames(target),
          len   = $__ToUint32(props.length);

    for (var i = 0; i < len; i++) {
      const desc = this.getOwnPropertyDescriptor(target, props[i]);

      if (desc && desc.configurable) {
        return false;
      }
    }

    return !this.isExtensible(target);
  }

  isFrozen(target){
    const props = this.getOwnPropertyNames(target),
          len   = $__ToUint32(props.length);

    for (var i = 0; i < len; i++) {
      const desc = this.getOwnPropertyDescriptor(target, props[i]);

      if (desc.configurable || ('writable' in desc || 'value' in desc) && desc.writable) {
        return false;
      }
    }

    return !this.isExtensible(target);
  }

  has(target, name){
    const desc = this.getOwnPropertyDescriptor(target, name);
    if (desc) {
      return true;
    }

    const proto = $__GetPrototype(target);
    return proto === null ? false : this.has(proto, name);
  }

  hasOwn(target, name){
    return this.getOwnPropertyDescriptor(target, name) !== undefined;
  }

  get(target, name, receiver = target){
    const desc = this.getOwnPropertyDescriptor(target, name);

    if (desc === undefined) {
      const proto = $__GetPrototype(target);
      return proto === null ? undefined : this.get(proto, name, receiver);
    }

    if ('writable' in desc || 'value' in desc) {
      return desc.value;
    }

    const getter = desc.get;
    return getter === undefined ? undefined : $__Call(getter, receiver, []);
  }

  set(target, name, value, receiver) {
    const ownDesc = this.getOwnPropertyDescriptor(target, name);

    if (ownDesc !== undefined) {
      if ('get' in ownDesc || 'set' in ownDesc) {
        const setter = ownDesc.set;
        if (setter === undefined) {
          return false;
        }
        $__Call(setter, receiver, [value]);
        return true;
      } else if (ownDesc.writable === false) {
        return false;
      } else if (receiver === target) {
        $__DefineOwnProperty(receiver, name, { value: value });
        return true;
      } else if (!$__IsExtensible(receiver)) {
        return false;
      }
      normal.value = value;
      $__DefineOwnProperty(receiver, name, normal);
      normal.value = undefined;
      return true;
    }

    const proto = $__GetPrototype(target);
    if (proto === null) {
      if (!$__IsExtensible(receiver)) {
        return false;
      }
      normal.value = value;
      $__DefineOwnProperty(receiver, name, normal);
      normal.value = undefined;
      return true;
    }

    return $__SetP(proto, name, value, receiver);
  }

  enumerate(target){
    const result = this.getOwnPropertyNames(target),
          len    = $__ToUint32(result.length),
          result = [];

    for (var i = 0; i < len; i++) {
      const name = $__ToString(result[i]),
            desc = this.getOwnPropertyDescriptor(name);

      if (desc != null && desc.enumerable) {
        result.push(name);
      }
    }

    var proto = $__GetPrototype(target);
    return proto === null ? result : result.concat(enumerate(proto));
  }

  keys(target){
    const result = this.getOwnPropertyNames(target),
          len    = $__ToUint32(result.length);
          result = [];

    for (var i = 0; i < len; i++) {
      const name = $__ToString(result[i]),
            desc = this.getOwnPropertyDescriptor(name);

      if (desc != null && desc.enumerable) {
        result.push(name);
      }
    }

    return result;
  }

  construct(target, args) {
    const proto    = this.get(target, 'prototype', target),
          instance = $__Type(proto) === 'Object' ? $__ObjectCreate(proto) : {},
          result   = this.apply(target, instance, args);

    return $__Type(result) === 'Object' ? result : instance;
  }
}

builtinClass(Handler);



export function apply(target, thisArg, args){
  ensureFunction(target, '@reflect.apply');
  return $__Call(target, thisArg, ensureArgs(args));
}

builtinFunction(apply);


export function construct(target, args){
  ensureFunction(target, '@reflect.construct');
  return $__Construct(target, ensureArgs(args));
}

builtinFunction(construct);


export function defineProperty(target, name, desc){
  ensureObject(target, '@reflect.defineProperty');
  ensureDescriptor(desc);
  return $__DefineOwnProperty(target, $__ToPropertyKey(name), desc);
}

builtinFunction(defineProperty);


export function deleteProperty(target, name){
  ensureObject(target, '@reflect.deleteProperty');
  return $__Delete(target, $__ToPropertyKey(name), false);
}

builtinFunction(deleteProperty);


export function enumerate(target){
  return $__Enumerate($__ToObject(target), true, true);
}

builtinFunction(enumerate);


export function freeze(target){
  if ($__Type(target) !== 'Object' || !$__PreventExtensions(target)) {
    return false;
  }

  const props = $__Enumerate(target, false, false),
        len   = props.length;

  letsuccess = true;

  for (var i = 0; i < len; i++) {
    const desc = target.@@GetOwnProperty(props[i]),
          attrs = 'writable' in desc || 'value' in desc
            ? { configurable: false, writable: false }
            : desc !== undefined
              ? { configurable: false }
              : null;

    if (attrs !== null) {
      success = success && $__DefineOwnProperty(target, props[i], attrs);
    }
  }

  return success;
}

builtinFunction(freeze);


export function get(target, name, receiver){
  receiver = receiver === undefined ? receiver : $__ToObject(receiver);
  return $__GetP($__ToObject(target), $__ToPropertyKey(name), receiver);
}

builtinFunction(get);


export function getOwnPropertyDescriptor(target, name){
  ensureObject(target, '@reflect.getOwnPropertyDescriptor');
  return $__GetOwnProperty(target, $__ToPropertyKey(name));
}

builtinFunction(getOwnPropertyDescriptor);


export function getOwnPropertyNames(target){
  ensureObject(target, '@reflect.getOwnPropertyNames');
  return $__Enumerate(target, false, false);
}

builtinFunction(getOwnPropertyNames);


export function getPrototypeOf(target){
  ensureObject(target, '@reflect.getPrototypeOf');
  return $__GetPrototype(target);
}

builtinFunction(getPrototypeOf);


export function has(target, name){
  return $__HasProperty($__ToObject(target), $__ToPropertyKey(name));
}

builtinFunction(has);


export function hasOwn(target, name){
  return $__HasOwnProperty($__ToObject(target), $__ToPropertyKey(name));
}

builtinFunction(hasOwn);


export function isFrozen(target){
  ensureObject(target, '@reflect.isFrozen');
  if ($__IsExtensible(target)) {
    return false;
  }

  const props = $__Enumerate(target, false, false);

  for (var i=0; i < props.length; i++) {
    const desc = $__GetOwnProperty(target, props[i]);
    if (desc && desc.configurable || 'writable' in desc && desc.writable) {
      return false;
    }
  }

  return true;
}

builtinFunction(isFrozen);


export function isSealed(target){
  ensureObject(target, '@reflect.isSealed');

  if ($__IsExtensible(target)) {
    return false;
  }

  const props = $__Enumerate(target, false, false);

  for (var i=0; i < props.length; i++) {
    const desc = $__GetOwnProperty(target, props[i]);
    if (desc && desc.configurable) {
      return false;
    }
  }

  return true;
}

builtinFunction(isSealed);


export function isExtensible(target){
  ensureObject(target, '@reflect.isExtensible');
  return $__IsExtensible(target);
}

builtinFunction(isExtensible);


export function keys(target){
  ensureObject(target, '@reflect.keys');
  return $__Enumerate(target, false, true);
}

builtinFunction(keys);


export function preventExtensions(target){
  return $__Type(target) === 'Object' ? $__PreventExtensions(target) : false;
}

builtinFunction(preventExtensions);


export function seal(target){
  if ($__Type(target) !== 'Object') return false;
  let success = $__PreventExtensions(target);
  if (!success) return success;

  const props = $__Enumerate(target, false, false),
        len   = props.length,
        desc  = { configurable: false };

  for (var i = 0; i < len; i++) {
    success = success && $__DefineOwnProperty(target, props[i], desc);
  }

  return success;
}

builtinFunction(seal);


export function set(target, name, value, receiver){
  receiver = receiver === undefined ? receiver : $__ToObject(receiver);
  return $__SetP($__ToObject(target), $__ToPropertyKey(name), value, receiver);
}

builtinFunction(set);
