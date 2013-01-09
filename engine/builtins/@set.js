import {
  @@iterator: iterator,
  @@create  : create
} from '@@symbols';

import {
  $$Exception,
  $$Get,
  $$Has,
  $$Set
} from '@@internals';

import {
  builtinClass,
  define,
  extend,
  hasBrand,
  hideEverything,
  isInitializing
} from '@@utilities';

import {
  Type
} from '@@types';

import {
  OrdinaryCreateFromConstructor,
  ToObject
} from '@@operations';

import {
  Map
} from '@map';

import {
  Iterator
} from '@iter';



function ensureSet(o, name){
  var type = typeof o;
  if (type === 'object' ? o === null : type !== 'function') {
    throw $$Exception('called_on_non_object', [name]);
  }
  var data = $$Get(o, 'SetData');
  if (!data) {
    throw $$Exception('called_on_incompatible_object', [name]);
  }
  return data;
}

internalFunction(ensureSet);



class SetIterator extends Iterator {
  private @data, // Set
          @key;  // SetNextKey

  constructor(set){
    this.@data = ensureSet($__ToObject(set), 'SetIterator');
    this.@key  = $__MapSigil();
  }

  next(){
    if (Type(this) !== 'Object') {
      throw $$Exception('called_on_non_object', ['SetIterator.prototype.next']);
    }

    if (!$__has(this, @data) || !$__has(this, @key)) {
      throw $$Exception('called_on_incompatible_object', ['SetIterator.prototype.next']);
    }

    const next = $__MapNext(this.@data, this.@key);
    if (!next) {
      throw $__StopIteration;
    }
    return this.@key = next[0];
  }
}

builtinClass(SetIterator);




export class Set {
  constructor(iterable){
    const target = this == null || this === SetPrototype ? $__ObjectCreate(SetPrototype) : ToObject(this);

    if ($$Has(target, 'SetData')) {
      throw $$Exception('double_initialization', ['Set']);
    }

    const data = new Map;
    $$Set(target, 'SetData', data);

    if (iterable !== undefined) {
      iterable = $__ToObject(iterable);
      for (var [key, value] of iterable) {
        $__MapSet(data, value, true);
      }
    }

    return target;
  }

  get size(){
    if (this && $$Has(this, 'SetData')) {
      return $__MapSize($$Get(this, 'SetData'));
    }
    return 0;
  }

  clear(){
    $__MapClear(ensureSet(this, 'clear'));
    return this;
  }

  add(value){
    $__MapSet(ensureSet(this, 'add'), value, value);
    return this;
  }

  has(value){
    return $__MapHas(ensureSet(this, 'has'), value);
  }

  delete(value){
    return $__MapDelete(ensureSet(this, 'delete'), value);
  }

  values(){
    return new SetIterator(this);
  }
}

extend(Set, {
  @@create(){
    var obj = OrdinaryCreateFromConstructor(this, '%SetPrototype%');
    $$Set(obj, 'BuiltinBrand', 'BuiltinSet');
    return obj;
  }
});

builtinClass(Set);
const SetPrototype = Set.prototype;
define(SetPrototype, @@iterator, SetPrototype.values);



function setAdd(set, value){
  $__MapSet(ensureSet(set, '@set.add'), value, value);
  return set;
}

builtinFunction(setAdd);


function setClear(set){
  $__MapClear(ensureSet(set, '@set.clear'));
  return set;
}

builtinFunction(setClear);


function setCreate(target, iterable){
  target = ToObject(target);

  if ($$Has(target, 'SetData')) {
    throw $$Exception('double_initialization', ['Set']);
  }

  const data = new Map;
  $$Set(target, 'SetData', data);

  if (iterable !== undefined) {
    iterable = $__ToObject(iterable);
    for (var [key, value] of iterable) {
      $__MapSet(data, value, true);
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


function setIterate(set){
  return new SetIterator(set);
}

builtinFunction(setIterate);


export const add     = setAdd,
             clear   = setClear,
             create  = setCreate,
           //delete  = setDelete, TODO: fix exporting reserved names
             has     = setHas,
             iterate = setIterate,
             size    = setSize;
