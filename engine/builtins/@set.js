import {
  @@iterator: iterator,
  @@create  : create
} from '@@symbols';

import {
  undefined
} from '@@constants';

import {
  $$Exception,
  $$Get,
  $$Has,
  $$Set
} from '@@internals';

import {
  builtinClass,
  builtinFunction,
  define,
  extend,
  hasBrand,
  hideEverything,
  internalFunction,
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
  $$MapClear,
  $$MapDelete,
  $$MapGet,
  $$MapHas,
  $$MapInitialization,
  $$MapNext,
  $$MapSet,
  $$MapSigil,
  $$MapSize
} from '@@collections';

import {
  Map
} from '@map';

import {
  Iterator
} from '@iter';

import {
  hasOwn
} from '@reflect';

function ensureSet(o, name){
  const type = typeof o;
  if (type === 'object' ? o === null : type !== 'function') {
    throw $$Exception('called_on_non_object', [name]);
  }

  const data = $$Get(o, 'SetData');
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
    this.@data = ensureSet(ToObject(set), 'SetIterator');
    this.@key  = $$MapSigil();
  }

  next(){
    if (Type(this) !== 'Object') {
      throw $$Exception('called_on_non_object', ['SetIterator.prototype.next']);
    }

    if (!hasOwn(this, @data) || !hasOwn(this, @key)) {
      throw $$Exception('called_on_incompatible_object', ['SetIterator.prototype.next']);
    }

    const next = $$MapNext(this.@data, this.@key);
    if (!next) {
      throw StopIteration;
    }

    return this.@key = next[0];
  }
}

builtinClass(SetIterator);




export class Set {
  constructor(iterable){
    if (!isInitializing(this, 'SetData')) {
      return new Set(iterable);
    }

    const data = new Map;
    $$Set(this, 'SetData', data);

    if (iterable !== undefined) {
      iterable = ToObject(iterable);
      for (let [key, value] of iterable) {
        $$MapSet(data, value, true);
      }
    }
  }

  get size(){
    if (this && $$Has(this, 'SetData')) {
      return $$MapSize($$Get(this, 'SetData'));
    }
    return 0;
  }

  clear(){
    $$MapClear(ensureSet(this, 'Set.prototype.clear'));
    return this;
  }

  add(value){
    $$MapSet(ensureSet(this, 'Set.prototype.add'), value, value);
    return this;
  }

  has(value){
    return $$MapHas(ensureSet(this, 'Set.prototype.has'), value);
  }

  delete(value){
    return $$MapDelete(ensureSet(this, 'Set.prototype.delete'), value);
  }

  values(){
    return new SetIterator(this);
  }
}

extend(Set, {
  @@create(){
    const obj = OrdinaryCreateFromConstructor(this, '%SetPrototype%');
    $$Set(obj, 'SetData', undefined);
    $$Set(obj, 'BuiltinBrand', 'BuiltinSet');
    return obj;
  }
});

builtinClass(Set);
const SetPrototype = Set.prototype;
define(SetPrototype, @@iterator, SetPrototype.values);



function setAdd(set, value){
  $$MapSet(ensureSet(set, '@set.add'), value, value);
  return set;
}

builtinFunction(setAdd);


function setClear(set){
  $$MapClear(ensureSet(set, '@set.clear'));
  return set;
}

builtinFunction(setClear);


function setDelete(set, value){
  return $$MapDelete(ensureSet(set, '@set.delete'), value);
}

builtinFunction(setDelete);


function setHas(set, value){
  return $$MapHas(ensureSet(set, '@set.has'), value);
}

builtinFunction(setHas);


function setSize(set){
  return $$MapSize(ensureMap(set, '@set.size'));
}

builtinFunction(setSize);


function setIterate(set){
  return new SetIterator(set);
}

builtinFunction(setIterate);


export const add     = setAdd,
             clear   = setClear,
           //delete  = setDelete, TODO: fix exporting reserved names
             has     = setHas,
             iterate = setIterate,
             size    = setSize;
