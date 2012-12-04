import Map from '@map';
import Iterator from '@iter';



function ensureSet(o, name){
  var type = typeof o;
  if (type === 'object' ? o === null : type !== 'function') {
    throw $__Exception('called_on_non_object', [name]);
  }
  var data = o.@@getInternal('SetData');
  if (!data) {
    throw $__Exception('called_on_incompatible_object', [name]);
  }
  return data;
}

internalFunction(ensureSet);

class SetIterator extends Iterator {
  private @data, // Set
          @key,  // SetNextKey
          @kind; // SetIterationKind

  constructor(set, kind){
    this.@data = ensureSet($__ToObject(set), 'SetIterator');
    this.@key  = $__MapSigil();
    this.@kind = kind;
  }

  next(){
    if (!$__IsObject(this)) {
      throw $__Exception('called_on_non_object', ['SetIterator.prototype.next']);
    }
    if (!(this.@@has(@data) && this.@@has(@key) && this.@@has(@kind))) {
      throw $__Exception('called_on_incompatible_object', ['SetIterator.prototype.next']);
    }

    var data = this.@data,
        key  = this.@key,
        kind = this.@kind,
        item = $__MapNext(data, key);

    this.@key = item[0];
    return kind === 'key+value' ? [item[1], item[1]] : item[1];
  }
}

builtinClass(SetIterator);




export class Set {
  constructor(iterable){
    var set;
    if ($__IsConstructCall()) {
      set = this;
    } else {
      if (this == null || this === SetPrototype) {
        set = $__ObjectCreate(SetPrototype);
      } else {
        set = $__ToObject(this);
      }
    }
    if (set.@@hasInternal('SetData')) {
      throw $__Exception('double_initialization', ['Set']);
    }

    var data = new Map;
    set.@@setInternal('SetData', data);

    if (iterable !== undefined) {
      iterable = $__ToObject(iterable);
      for (var [key, value] of iterable) {
        $__MapSet(data, value, value);
      }
    }

    return set;
  }

  clear(){
    return $__MapClear(ensureSet(this, 'clear'));
  }

  add(key){
    return $__MapSet(ensureSet(this, 'add'), key, key);
  }

  has(key){
    return $__MapHas(ensureSet(this, 'has'), key);
  }

  delete(key){
    return $__MapDelete(ensureSet(this, 'delete'), key);
  }

  items(){
    return new SetIterator(this, 'key+value');
  }

  keys(){
    return new SetIterator(this, 'key');
  }

  values(){
    return new SetIterator(this, 'value');
  }

  get size(){
    if (this.@@hasInternal('SetData')) {
      return $__MapSize(ensureSet(this, 'size'));
    }
    return 0;
  }

  @iterator(){
    return new SetIterator(this, 'value');
  }
}

builtinClass(Set);
var SetPrototype = Set.prototype;

