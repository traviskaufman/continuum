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
    var set = this == null || this === SetPrototype ? $__ObjectCreate(SetPrototype) : this;
    return setCreate(set, iterable);
  }

  get size(){
    if (this && this.@@hasInternal('SetData')) {
      return $__MapSize(this.@@getInternal('SetData'));
    }
    return 0;
  }

  clear(){
    return $__MapClear(ensureSet(this, 'clear'));
  }

  add(value){
    return $__MapSet(ensureSet(this, 'add'), value, value);
  }

  has(value){
    return $__MapHas(ensureSet(this, 'has'), value);
  }

  delete(value){
    return $__MapDelete(ensureSet(this, 'delete'), value);
  }

  entries(){
    return new SetIterator(this, 'key+value');
  }

  keys(){
    return new SetIterator(this, 'key');
  }

  values(){
    return new SetIterator(this, 'value');
  }

  @iterator(){
    return new SetIterator(this, 'value');
  }
}

builtinClass(Set);
const SetPrototype = Set.prototype;



function setAdd(set, value){
  return $__MapSet(ensureSet(set, '@set.add'), value, value);
}

builtinFunction(setAdd);


function setClear(set){
  return $__MapClear(ensureSet(set, '@set.clear'));
}

builtinFunction(setClear);


function setCreate(target, iterable){
  target = $__ToObject(target);

  if (target.@@hasInternal('SetData')) {
    throw $__Exception('double_initialization', ['Set']);
  }

  const data = new Map;
  target.@@setInternal('SetData', data);

  if (iterable !== undefined) {
    iterable = $__ToObject(iterable);
    for (var [key, value] of iterable) {
      $__MapSet(data, value, value);
    }
  }

  return target;
}

builtinFunction(setCreate);


function setDelete(set, value){
  return $__MapDelete(ensureSet(set, '@set.delete'), value);
}

builtinFunction(setDelete);


function setHas(set, value){
  return $__MapHas(ensureSet(set, '@set.has'), value);
}

builtinFunction(setHas);


function setSize(set){
  return $__MapSize(ensureMap(set, '@set.size'));
}

builtinFunction(setSize);


function setIterate(set, kind){
  return new SetIterator(set, 'value');
}

builtinFunction(setIterate);


export const add     = setAdd,
             clear   = setClear,
             create  = setCreate,
           //delete  = setDelete, TODO: fix exporting reserved names
             has     = setHas,
             iterate = setIterate,
             size    = setSize;
