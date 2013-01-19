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


function ensureMap(o, name){
  if (Type(o) !== 'Object' || !$$Has(o, 'MapData')) {
    throw $$Exception('called_on_incompatible_object', ['Map.prototype.'+name]);
  }
}

internalFunction(ensureMap);


class MapIterator extends Iterator {
  private @map,  // Map
          @key,  // MapNextKey
          @kind; // MapIterationKind

  constructor(map, kind){
    this.@map = ToObject(map);
    this.@key = $$MapSigil();
    this.@kind = kind;
  }

  next(){
    if (Type(this) !== 'Object') {
      throw $$Exception('called_on_non_object', ['MapIterator.prototype.next']);
    }

    if (!(hasOwn(this, @map) && hasOwn(this, @key) && hasOwn(this, @kind))) {
      throw $$Exception('called_on_incompatible_object', ['MapIterator.prototype.next']);
    }

    var kind = this.@kind,
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


export class Map {
  constructor(iterable){
    if (!isInitializing(this, 'MapData')) {
      return new Map(iterable);
    }

    $$MapInitialization(this, iterable);
  }

  get size(){
    if (this && $$Has(this, 'MapData')) {
      return $$MapSize(this);
    }
    return 0;
  }

  clear(){
    ensureMap(this, 'clear');
    $$MapClear(this, key);
    return this;
  }

  delete(key){
    ensureMap(this, 'delete');
    return $$MapDelete(this, key);
  }

  get(key){
    ensureMap(this, 'get');
    return $$MapGet(this, key);
  }

  has(key){
    ensureMap(this, 'has');
    return $$MapHas(this, key);
  }

  entries(){
    ensureMap(this, 'entries');
    return new MapIterator(this, 'key+value');
  }

  keys(){
    ensureMap(this, 'keys');
    return new MapIterator(this, 'key');
  }

  set(key, value){
    ensureMap(this, 'set');
    $$MapSet(this, key, value);
    return this;
  }

  values(){
    ensureMap(this, 'values');
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

builtinClass(Map);
const MapPrototype = Map.prototype;
define(MapPrototype, @@iterator, MapPrototype.entries);



function mapClear(map){
  ensureMap(map, '@map.clear');
  $$MapClear(map);
  return map;
}

builtinFunction(mapClear);


function mapDelete(map, key){
  ensureMap(map, '@map.delete');
  return $$MapDelete(map, key);
}

builtinFunction(mapDelete);


function mapGet(map, key){
  ensureMap(map, '@map.get');
  return $$MapGet(map, key);
}

builtinFunction(mapGet);


function mapHas(map, key){
  ensureMap(map, '@map.has');
  return $$MapHas(map, key);
}

builtinFunction(mapHas);


function mapIterate(map, kind){
  ensureMap(map, '@map.iterate');
  return new MapIterator(map, kind === undefined ? 'key+value' : ToString(kind));
}

builtinFunction(mapIterate);


function mapSet(map, key, value){
  ensureMap(map, '@map.set');
  $$MapSet(map, key, value);
  return map;
}

builtinFunction(mapSet);


function mapSize(map){
  ensureMap(map, '@map.size');
  return $$MapSize(map);
}

builtinFunction(mapSize);


export const clear   = mapClear,
           //delete  = mapDelete, TODO: fix exporting reserved names
             get     = mapGet,
             has     = mapHas,
             iterate = mapIterate,
             set     = mapSet,
             size    = mapSize;
