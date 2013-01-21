import {
  @@create: create
} from '@@symbols';

import {
  undefined
} from '@@constants';

import {
  $$Exception,
  $$Has,
  $$Set
} from '@@internals';


import {
  builtinClass,
  builtinFunction,
  extend,
  internalFunction,
  isInitializing
} from '@@utilities';

import {
  OrdinaryCreateFromConstructor
} from '@@operations';

import {
  Type
} from '@@types';

import {
  $$WeakMapGet,
  $$WeakMapDelete,
  $$WeakMapHas,
  $$WeakMapSet,
  $$WeakMapInitialization
} from '@@collections';


function ensureWeakMap(o, p, name){
  if (Type(o) !== 'Object' || !$$Has(o, 'WeakMapData')) {
    throw $$Exception('called_on_incompatible_object', [name]);
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

    $$WeakMapInitialization(this, iterable);
  }

  delete(key){
    ensureWeakMap(this, key, 'WeakMap.prototype.delete');
    return $$WeakMapDelete(this, key);
  }

  get(key){
    ensureWeakMap(this, key, 'WeakMap.prototype.get');
    return $$WeakMapGet(this, key);
  }

  has(key){
    ensureWeakMap(this, key, 'WeakMap.prototype.has');
    $$WeakMapHas(this, key);
  }

  set(key, value){
    ensureWeakMap(this, key, 'WeakMap.prototype.set');
    $$WeakMapSet(this, key, value);
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
  return $$WeakMapDelete(weakmap, key);
}

builtinFunction(weakmapDelete);


function weakmapGet(weakmap, key){
  ensureWeakMap(weakmap, key, '@weakmap.get');
  return $$WeakMapGet(weakmap, key);
}

builtinFunction(weakmapGet);


function weakmapHas(weakmap, key){
  ensureWeakMap(weakmap, key, '@weakmap.has');
  return $$WeakMapHas(weakmap, key);
}

builtinFunction(weakmapHas);


function weakmapSet(weakmap, key, value){
  ensureWeakMap(weakmap, key, '@weakmap.set');
  $$WeakMapSet(weakmap, key, value);
  return weakmap;
}

builtinFunction(weakmapSet);


export const get     = weakmapGet,
           //delete  = weakmapDelete, TODO: fix exporting reserved names
             has     = weakmapHas,
             set     = weakmapSet;
