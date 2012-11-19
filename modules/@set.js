import Map from '@map';
import Iterator from '@iter';
private @iterator = $__iterator;


export function Set(iterable){
  var set;
  if ($__IsConstructCall()) {
    set = this;
  } else {
    if (this == null || this === $__SetProto) {
      set = $__ObjectCreate($__SetProto) ;
    } else {
      set = $__ToObject(this);
    }
  }
  if ($__HasInternal(set, 'SetData')) {
    throw $__Exception('double_initialization', ['Set']);
  }

  var data = new Map;
  $__SetInternal(set, 'SetData', data);

  if (iterable !== undefined) {
    iterable = $__ToObject(iterable);
    for (var [key, value] of iterable) {
      $__MapSet(data, value, value);
    }
  }
  return set;
}


$__setupConstructor(Set, $__SetProto);
{
$__defineProps(Set.prototype, {
  clear(){
    return $__MapClear(ensureSet(this));
  },
  add(key){
    return $__MapSet(ensureSet(this), key, key);
  },
  has(key){
    return $__MapHas(ensureSet(this), key);
  },
  delete: function(key){
    return $__MapDelete(ensureSet(this), key);
  },
  items(){
    return new SetIterator(this, 'key+value');
  },
  keys(){
    return new SetIterator(this, 'key');
  },
  values(){
    return new SetIterator(this, 'value');
  },
  @iterator(){
    return new SetIterator(this, 'value');
  }
});

$__define(Set.prototype.delete, 'name', 'delete', 0);

$__DefineOwnProperty(Set.prototype, 'size', {
  configurable: true,
  enumerable: false,
  get: function size(){
    if (this === $__SetProto) {
      return 0;
    }
    return $__MapSize(ensureSet(this));
  },
  set: void 0
});

let SET = 'Set',
    KEY  = 'SetNextKey',
    KIND  = 'SetIterationKind';

let K = 0x01,
    V = 0x02,
    KV = 0x03;

let kinds = {
  'key': 1,
  'value': 2,
  'key+value': 3
};


class SetIterator extends Iterator {
  private @data, @key, @kind;

  constructor(set, kind){
    this.@data = ensureSet($__ToObject(set));
    this.@key = $__MapSigil();
    this.@kind = kinds[kind];
  }

  next(){
    if (!$__IsObject(this)) {
      throw $__Exception('called_on_non_object', ['SetIterator.prototype.next']);
    }
    if (!(@data in this && @key in this && @kind in this)) {
      throw $__Exception('called_on_incompatible_object', ['SetIterator.prototype.next']);
    }

    var data = this.@data,
        key  = this.@key,
        kind = this.@kind;

    var item = $__MapNext(data, key);
    this.@key = item[0];
    return kind === KV ? [item[1], item[1]] : item[1];
  }
}


function ensureSet(o, name){
  var type = typeof o;
  if (type === 'object' ? o === null : type !== 'function') {
    throw $__Exception('called_on_non_object', [name]);
  }
  var data = $__GetInternal(o, 'SetData');
  if (!data) {
    throw $__Exception('called_on_incompatible_object', [name]);
  }
  return data;
}


$__hideEverything(SetIterator);
}
