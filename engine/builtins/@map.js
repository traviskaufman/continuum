import Iterator from '@iter';

function ensureMap(o, name){
  if (!o || typeof o !== 'object' || !o.@@hasInternal('MapData')) {
    throw Exception('called_on_incompatible_object', ['Map.prototype.'+name]);
  }
}

internalFunction(ensureMap);



class MapIterator extends Iterator {
  private @map,  // Map
          @key,  // MapNextKey
          @kind; // MapIterationKind

  constructor(map, kind){
    this.@map = $__ToObject(map);
    this.@key = $__MapSigil();
    this.@kind = kind;
  }

  next(){
    if (!$__IsObject(this)) {
      throw $__Exception('called_on_non_object', ['MapIterator.prototype.next']);
    }
    if (!(this.@@has(@map) && this.@@has(@key) && this.@@has(@kind))) {
      throw $__Exception('called_on_incompatible_object', ['MapIterator.prototype.next']);
    }

    var kind = this.@kind,
        item = $__MapNext(this.@map, this.@key);

    if (!item) {
      throw $__StopIteration;
    }

    this.@key = item[0];

    if (kind === 'key+value') {
      return item;
    } else if (kind === 'key') {
      return item[0];
    }
    return item[1];
  }
}

builtinClass(MapIterator);


export class Map {
  constructor(iterable){
    var map = this == null || this === MapPrototype ? $__ObjectCreate(MapPrototype) : this;
    return mapCreate(map, iterable);
  }

  get size(){
    if (this && this.@@hasInternal('MapData')) {
      return $__MapSize(this);
    }
    return 0;
  }

  clear(){
    ensureMap(this, 'clear');
    return $__MapClear(this, key);
  }

  delete(key){
    ensureMap(this, 'delete');
    return $__MapDelete(this, key);
  }

  get(key){
    ensureMap(this, 'get');
    return $__MapGet(this, key);
  }

  has(key){
    ensureMap(this, 'has');
    return $__MapHas(this, key);
  }

  items(){
    ensureMap(this, 'items');
    return new MapIterator('key+value');
  }

  keys(){
    ensureMap(this, 'keys');
    return new MapIterator('key');
  }

  set(key, value){
    ensureMap(this, 'set');
    return $__MapSet(this, key, value);
  }

  values(){
    ensureMap(this, 'values');
    return new MapIterator('value');
  }

  @iterator(){
    ensureMap(this, '@iterator');
    return new MapIterator(this, 'key+value');
  }
}

builtinClass(Map);
const MapPrototype = Map.prototype;


function mapClear(map){
  ensureMap(map, '@map.clear');
  return $__MapClear(map);
}

function mapCreate(target, iterable){
  target = $__ToObject(target);

  if (target.@@hasInternal('MapData')) {
    throw $__Exception('double_initialization', ['Map']);
  }

  $__MapInitialization(target, iterable);
  return target;
}

function mapDelete(map, key){
  ensureMap(map, '@map.delete');
  return $__MapDelete(map, key);
}

function mapGet(map, key){
  ensureMap(map, '@map.get');
  return $__MapGet(map, key);
}

function mapHas(map, key){
  ensureMap(map, '@map.has');
  return $__MapHas(map, key);
}

function mapSet(map, key, value){
  ensureMap(map, '@map.set');
  return $__MapSet(map, key, value);
}

function mapSize(map){
  ensureMap(map, '@map.size');
  return $__MapSize(map);
}

function mapIterate(map, kind){
  ensureMap(map, '@map.iterate');
  return new MapIterator(map, kind === undefined ? 'key+value' : $__ToString(kind));
}

export let
  clear   = mapClear,
  create  = mapCreate,
  //delete  = mapDelete, TODO: fix exporting reserved names
  get     = mapGet,
  has     = mapHas,
  iterate = mapIterate,
  set     = mapSet,
  size    = mapSize;
