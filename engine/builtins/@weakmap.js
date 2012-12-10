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
    var weakmap;
    if ($__IsConstructCall()) {
      weakmap = this;
    } else {
      if (this === undefined || this === WeakMapPrototype) {
        weakmap = $__ObjectCreate(WeakMapPrototype) ;
      } else {
        weakmap = $__ToObject(this);
      }
    }

    if (weakmap.@@hasInternal('WeakMapData')) {
      throw $__Exception('double_initialization', ['WeakMap']);
    }

    $__WeakMapInitialization(weakmap, iterable);
    return weakmap;
  }

  set(key, value){
    ensureWeakMap(this, key, 'set');
    return $__WeakMapSet(this, key, value);
  }

  get(key){
    ensureWeakMap(this, key, 'get');
    return $__WeakMapGet(this, key);
  }

  has(key){
    ensureWeakMap(this, key, 'has');
    return $__WeakMapHas(this, key);
  }

  delete(key){
    ensureWeakMap(this, key, 'delete');
    return $__WeakMapDelete(this, key);
  }
}

builtinClass(WeakMap);

var WeakMapPrototype = WeakMap.prototype;
