import {
  @@iterator: iterator,
  @@create  : create
} from '@@symbols';

import {
  undefined
} from '@@constants';

import {
  $$CallerName,
  $$Exception,
  $$Get,
  $$Has,
  $$Set
} from '@@internals';

import {
  builtinClass,
  builtinFunction,
  define,
  ensureObject,
  extend,
  hasBrand,
  internalFunction,
  isInitializing
} from '@@utilities';

import {
  ObjectCreate,
  Type
} from '@@types';

import {
  OrdinaryCreateFromConstructor,
  ToObject,
  ToString
} from '@@operations';

import {
  $$MapClear,
  $$MapDelete,
  $$MapGet,
  $$MapHas,
  // 15.14.1.1 MapInitialisation (TODO: self-host in ES6)
  $$MapInitialization,
  $$MapNext,
  $$MapSet,
  $$MapSigil,
  $$MapSize
} from '@@collections';

import {
  Iterator
} from '@iter';

import {
  hasOwn
} from '@reflect';


const sigil = $$MapSigil();

function ensureMap(o){
  if (Type(o) !== 'Object' || !$$Has(o, 'MapData')) {
    throw $$Exception('called_on_incompatible_object', [$$CallerName()]);
  }
}

internalFunction(ensureMap);



class MapIterator extends Iterator {
  private @map,  // Map
          @key,  // MapNextKey
          @kind; // MapIterationKind

  constructor(map, kind){
    this.@map = ToObject(map);
    this.@key = sigil;
    this.@kind = kind;
  }

  next(){
    ensureObject(this);

    if (!(hasOwn(this, @map) && hasOwn(this, @key) && hasOwn(this, @kind))) {
      throw $$Exception('called_on_incompatible_object', ['MapIterator.prototype.next']);
    }

    const kind = this.@kind,
          item = $$MapNext(this.@map, this.@key);

    if (!item) {
      throw StopIteration;
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


// ######################################################
// ### 15.14.5 Properties of the Map Prototype Object ###
// ######################################################

export class Map {
  // #######################################
  // # 15.14.5.1 Map.prototype.constructor #
  // #######################################
  constructor(iterable){
    if (!isInitializing(this, 'MapData')) {
      // 15.14.2 The Map Constructor Called as a Function
      return new Map(iterable);
    }

    // 15.14.3 The Map Constructor
    $$MapInitialization(this, iterable);
  }

  // #################################
  // # 15.14.5.2 Map.prototype.clear #
  // #################################
  clear(){
    ensureMap(this);
    $$MapClear(this, key);
    return this;
  }

  // ##################################
  // # 15.14.5.3 Map.prototype.delete #
  // ##################################
  delete(key){
    ensureMap(this);
    return $$MapDelete(this, key);
  }

  // ###################################
  // # 15.14.5.4 Map.prototype.forEach #
  // ###################################
  forEach(callbackfn, thisArg = undefined){
    ensureMap(this);
    ensureCallback(callbackfn);

    let item = $$MapNext(this, sigil);

    while (item) {
      call(callbackfn, this, item[1], item[0], this);
      item = $$MapNext(this, item);
    }
  }

  get size(){
    if (this && $$Has(this, 'MapData')) {
      return $$MapSize(this);
    }

    return 0;
  }

  get(key){
    ensureMap(this);
    return $$MapGet(this, key);
  }

  has(key){
    ensureMap(this);
    return $$MapHas(this, key);
  }

  entries(){
    ensureMap(this);
    return new MapIterator(this, 'key+value');
  }

  keys(){
    ensureMap(this);
    return new MapIterator(this, 'key');
  }

  set(key, value){
    ensureMap(this);
    $$MapSet(this, key, value);
    return this;
  }

  values(){
    ensureMap(this);
    return new MapIterator(this, 'value');
  }
}

extend(Map, {
  @@create(){
    const obj = OrdinaryCreateFromConstructor(this, '%MapPrototype%');
    $$Set(obj, 'MapData', undefined);
    $$Set(obj, 'BuiltinBrand', 'BuiltinMap');
    return obj;
  }
});

define(Map.prototype, @@iterator, Map.prototype.entries);
builtinClass(Map);
