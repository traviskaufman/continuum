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
  builtinFunction,
  define,
  extend,
  hasBrand,
  isInitializing
} from '@@utilities';

import {
  Type
} from '@@types';

import {
  OrdinaryCreateFromConstructor
} from '@@operations';

import {
  Iterator
} from '@iter';

function ensureMap(o, name){
  if (!o || typeof o !== 'object' || !$$Has(o, 'MapData')) {
    throw $$Exception('called_on_incompatible_object', ['Map.prototype.'+name]);
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
    if (Type(this) !== 'Object') {
      throw $$Exception('called_on_non_object', ['MapIterator.prototype.next']);
    }

    if (!($__has(this, @map) && $__has(this, @key) && $__has(this, @kind))) {
      throw $$Exception('called_on_incompatible_object', ['MapIterator.prototype.next']);
    }

    var kind = this.@kind,
        item = $__MapNext(this.@map, this.@key);

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
    var map = this == null || this === MapPrototype ? $__ObjectCreate(MapPrototype) : this;
    return mapCreate(map, iterable);
  }

  get size(){
    if (this && $$Has(this, 'MapData')) {
      return $__MapSize(this);
    }
    return 0;
  }

  clear(){
    ensureMap(this, 'clear');
    $__MapClear(this, key);
    return this;
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
    $__MapSet(this, key, value);
    return this;
  }

  values(){
    ensureMap(this, 'values');
    return new MapIterator(this, 'value');
  }
}

extend(Map, {
  @@create(){
    var obj = OrdinaryCreateFromConstructor(this, '%MapPrototype%');
    $$Set(obj, 'BuiltinBrand', 'BuiltinMap');
    return obj;
  }
});

builtinClass(Map);
const MapPrototype = Map.prototype;
define(MapPrototype, @@iterator, MapPrototype.entries);



function mapClear(map){
  ensureMap(map, '@map.clear');
  $__MapClear(map);
  return map;
}

builtinFunction(mapClear);

function mapCreate(target, iterable){
  target = $__ToObject(target);

  if ($$Has(target, 'MapData')) {
    throw $$Exception('double_initialization', ['Map']);
  }

  $__MapInitialization(target, iterable);
  return target;
}

builtinFunction(mapCreate);


function mapDelete(map, key){
  ensureMap(map, '@map.delete');
  return $__MapDelete(map, key);
}

builtinFunction(mapDelete);


function mapGet(map, key){
  ensureMap(map, '@map.get');
  return $__MapGet(map, key);
}

builtinFunction(mapGet);


function mapHas(map, key){
  ensureMap(map, '@map.has');
  return $__MapHas(map, key);
}

builtinFunction(mapHas);


function mapIterate(map, kind){
  ensureMap(map, '@map.iterate');
  return new MapIterator(map, kind === undefined ? 'key+value' : $__ToString(kind));
}

builtinFunction(mapIterate);


function mapSet(map, key, value){
  ensureMap(map, '@map.set');
  $__MapSet(map, key, value);
  return map;
}

builtinFunction(mapSet);


function mapSize(map){
  ensureMap(map, '@map.size');
  return $__MapSize(map);
}

builtinFunction(mapSize);


export const clear   = mapClear,
             create  = mapCreate,
           //delete  = mapDelete, TODO: fix exporting reserved names
             get     = mapGet,
             has     = mapHas,
             iterate = mapIterate,
             set     = mapSet,
             size    = mapSize;
