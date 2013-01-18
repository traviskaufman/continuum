import {
  @@iterator: iterator,
  @@create  : create
} from '@@symbols';

import {
  $$Exception,
  $$Get,
  $$Has,
  $$Set
} from '@@internals';


import {
  builtinClass,
  extend,
  isInitializing
} from '@@utilities';

import {
  OrdinaryCreateFromConstructor
} from '@@operations';

import {
  Type
} from '@@types';


function ensureWeakMap(o, p, name){
  if (Type(o) !== 'Object' || !$$Has(o, 'WeakMapData')) {
    throw $$Exception('called_on_incompatible_object', [`WeakMap.prototype.${name}`]);
  }

  if (Type(p) !== 'Object') {
    throw $$Exception('invalid_weakmap_key', []);
  }
}

internalFunction(ensureWeakMap);


export class WeakMap {
  constructor(iterable){
    if (!isInitializing(this, 'WeakMapData')) {
      return new WeakMap(iterable);
    }

    $__WeakMapInitialization(this, iterable);
  }

  delete(key){
    ensureWeakMap(this, key, 'delete');
    return $__WeakMapDelete(this, key);
  }

  get(key){
    ensureWeakMap(this, key, 'get');
    return $__WeakMapGet(this, key);
  }

  has(key){
    ensureWeakMap(this, key, 'has');
    $__WeakMapHas(this, key);
  }

  set(key, value){
    ensureWeakMap(this, key, 'set');
    $__WeakMapSet(this, key, value);
    return this;
  }
}

extend(WeakMap, {
  @@create(){
    const obj = OrdinaryCreateFromConstructor(this, '%WeakMapPrototype%');
    $$Set(obj, 'BuiltinBrand', 'BuiltinWeakMap');
    $$Set(obj, 'WeakMapData', undefined);
    return obj;
  }
});

builtinClass(WeakMap);

const WeakMapPrototype = WeakMap.prototype;



function weakmapDelete(weakmap, key){
  ensureWeakMap(weakmap, key, '@weakmap.delete');
  return $__WeakMapDelete(weakmap, key);
}

builtinFunction(weakmapDelete);


function weakmapGet(weakmap, key){
  ensureWeakMap(weakmap, key, '@weakmap.get');
  return $__WeakMapGet(weakmap, key);
}

builtinFunction(weakmapGet);


function weakmapHas(weakmap, key){
  ensureWeakMap(weakmap, key, '@weakmap.has');
  return $__WeakMapHas(weakmap, key);
}

builtinFunction(weakmapHas);


function weakmapSet(weakmap, key, value){
  ensureWeakMap(weakmap, key, '@weakmap.set');
  $__WeakMapSet(weakmap, key, value);
  return weakmap;
}

builtinFunction(weakmapSet);


export const get     = weakmapGet,
           //delete  = weakmapDelete, TODO: fix exporting reserved names
             has     = weakmapHas,
             set     = weakmapSet;
