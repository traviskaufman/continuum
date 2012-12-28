function ensureWeakMap(o, p, name){
  if ($__Type(o) !== 'Object' || !$__hasInternal(o, 'WeakMapData')) {
    throw $__Exception('called_on_incompatible_object', ['WeakMap.prototype.'+name]);
  }
  if ($__Type(p) !== 'Object') {
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

  if ($__hasInternal(target, 'WeakMapData')) {
    throw $__Exception('double_initialization', ['WeakMap']);
  }

  $__WeakMapInitialization(target, iterable);
  return target;
}

builtinFunction(weakmapCreate);


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
  return $__WeakMapSet(weakmap, key, value);
}

builtinFunction(weakmapSet);


export const create  = weakmapCreate,
           //delete  = weakmapDelete, TODO: fix exporting reserved names
             get     = weakmapGet,
             has     = weakmapHas,
             set     = weakmapSet;
