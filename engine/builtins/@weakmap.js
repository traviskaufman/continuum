function ensureWeakMap(o, p, name){
  if (!o || typeof o !== 'object' || !o.@@hasInternal('WeakMapData')) {
    throw $__Exception('called_on_incompatible_object', ['WeakMap.prototype.'+name]);
  }
  if (typeof p === 'object' ? p === null : typeof p !== 'function') {
    throw $__Exception('invalid_weakmap_key', []);
  }
}


export class WeakMap {
  constructor(iterable){
    var map = this == null || this === WeakMapPrototype ? $__ObjectCreate(WeakMapPrototype) : this;
    return weakmapCreate(map, iterable);
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
    return $__WeakMapHas(this, key);
  }

  set(key, value){
    ensureWeakMap(this, key, 'set');
    return $__WeakMapSet(this, key, value);
  }
}

builtinClass(WeakMap);

var WeakMapPrototype = WeakMap.prototype;




function weakmapCreate(target, iterable){
  target = $__ToObject(target);

  if (target.@@hasInternal('WeakMapData')) {
    throw $__Exception('double_initialization', ['WeakMap']);
  }

  $__WeakMapInitialization(target, iterable);
  return target;
}

function weakmapDelete(weakmap, key){
  ensureWeakMap(weakmap, key, '@weakmap.delete');
  return $__WeakMapDelete(weakmap, key);
}

function weakmapGet(weakmap, key){
  ensureWeakMap(weakmap, key, '@weakmap.get');
  return $__WeakMapGet(weakmap, key);
}

function weakmapHas(weakmap, key){
  ensureWeakMap(weakmap, key, '@weakmap.has');
  return $__WeakMapHas(weakmap, key);
}

function weakmapSet(weakmap, key, value){
  ensureWeakMap(weakmap, key, '@weakmap.set');
  return $__WeakMapSet(weakmap, key, value);
}

export let
  create  = weakmapCreate,
//delete  = weakmapDelete, TODO: fix exporting reserved names
  get     = weakmapGet,
  has     = weakmapHas,
  set     = weakmapSet;
