import Iterator from '@iter';
symbol @iterator = $__iterator;


export function Map(iterable){
  var map;
  if ($__IsConstructCall()) {
    map = this;
  } else {
    if (this == null || this === $__MapProto) {
      map = $__ObjectCreate($__MapProto) ;
    } else {
      map = $__ToObject(this);
    }
  }

  if ($__HasInternal(map, 'MapData')) {
    throw $__Exception('double_initialization', ['Map'])
  }

  $__MapInitialization(map, iterable);
  return map;
}


$__setupConstructor(Map, $__MapProto);


$__defineProps(Map.prototype, {
  clear(){
    ensureMap(this, 'clear');
    return $__MapClear(this, key);
  },
  set(key, value){
    ensureMap(this, 'set');
    return $__MapSet(this, key, value);
  },
  get(key){
    ensureMap(this, 'get');
    return $__MapGet(this, key);
  },
  has(key){
    ensureMap(this, 'has');
    return $__MapHas(this, key);
  },
  delete: function(key){
    ensureMap(this, 'delete');
    return $__MapDelete(this, key);
  },
  items(){
    ensureMap(this, 'items');
    return new MapIterator(this, 'key+value');
  },
  keys(){
    ensureMap(this, 'keys');
    return new MapIterator(this, 'key');
  },
  values(){
    ensureMap(this, 'values');
    return new MapIterator(this, 'value');
  },
  @iterator(){
    ensureMap(this, '@iterator');
    return new MapIterator(this, 'key+value');
  }
});

$__set(Map.prototype.delete, 'name', 'delete');

$__DefineOwnProperty(Map.prototype, 'size', {
  configurable: true,
  enumerable: false,
  get(){
    return this === $__MapProto ? 0 : $__MapSize(this);
  },
  set: void 0
});


class MapIterator extends Iterator {
  private @data, @key, @kind;

  constructor(map, kind){
    this.@data = $__ToObject(map);
    this.@key = $__MapSigil();
    this.@kind = kind;
  }

  next(){
    if (!$__IsObject(this)) {
      throw $__Exception('called_on_non_object', ['MapIterator.prototype.next']);
    }
    if (!($__has(this, @data) && $__has(this, @key) && $__has(this, @kind))) {
      throw $__Exception('called_on_incompatible_object', ['MapIterator.prototype.next']);
    }

    var kind = this.@kind,
        item = $__MapNext(this.@data, this.@key);

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

$__hideEverything(MapIterator);

function ensureMap(o, name){
  if (!o || typeof o !== 'object' || !$__HasInternal(o, 'MapData')) {
    throw Exception('called_on_incompatible_object', ['Map.prototype.'+name]);
  }
}

