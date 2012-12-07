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
    } else {
      return item[1];
    }
  }
}

builtinClass(MapIterator);


export class Map {
  constructor(iterable){
    var map;
    if ($__IsConstructCall()) {
      map = this;
    } else {
      if (this == null || this === MapPrototype) {
        map = $__ObjectCreate(MapPrototype) ;
      } else {
        map = $__ToObject(this);
      }
    }

    if (map.@@hasInternal('MapData')) {
      throw $__Exception('double_initialization', ['Map'])
    }

    $__MapInitialization(map, iterable);
    return map;
  }

  clear(){
    ensureMap(this, 'clear');
    return $__MapClear(this, key);
  }

  set(key, value){
    ensureMap(this, 'set');
    return $__MapSet(this, key, value);
  }

  get(key){
    ensureMap(this, 'get');
    return $__MapGet(this, key);
  }

  has(key){
    ensureMap(this, 'has');
    return $__MapHas(this, key);
  }

  delete(key){
    ensureMap(this, 'delete');
    return $__MapDelete(this, key);
  }

  items(){
    ensureMap(this, 'items');
    return new MapIterator('key+value');
  }

  keys(){
    ensureMap(this, 'keys');
    return new MapIterator('key');
  }

  values(){
    ensureMap(this, 'values');
    return new MapIterator('value');
  }

  get size(){
    return this === MapPrototype ? 0 : $__MapSize(this);
  }

  @iterator(){
    ensureMap(this, '@iterator');
    return new MapIterator(this, 'key+value');
  }
}

builtinClass(Map);
const MapPrototype = Map.prototype;


