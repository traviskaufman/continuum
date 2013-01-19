import {
  @@create: create,
  @@hasInstance: hasInstance
} from '@@symbols';

import {
  OrdinaryCreateFromConstructor,
  OrdinaryHasInstance
} from '@@operations';

import {
  //builtinClass,
  define,
  ensureArgs,
  ensureFunction
} from '@@utilities';

import {
  $$Get,
  $$Invoke
} from '@@internals';

export class Function {
  constructor(...args){
    return $__FunctionCreate(...args);
  }

  apply(thisArg, args){
    ensureFunction(this, 'Function.prototype.apply');
    return $$Invoke(this, 'Call', thisArg, $$Get(ensureArgs(args), 'array'));
  }

  bind(thisArg, ...args){
    ensureFunction(this, 'Function.prototype.bind');
    return $__BoundFunctionCreate(this, thisArg, args);
  }

  call(thisArg, ...args){
    ensureFunction(this, 'Function.prototype.call');
    return $$Invoke(this, 'Call', thisArg, $$Get(args, 'array'));
  }

  toString(){
    ensureFunction(this, 'Function.prototype.toString');
    return $__FunctionToString(this);
  }

  @@create(){
    return OrdinaryCreateFromConstructor(this, '%ObjectPrototype%');
  }

  @@hasInstance(V){
    return OrdinaryHasInstance(this, V);
  }
}

builtinClass(Function);

define(Function.prototype, 'name', '', FROZEN);



export function apply(func, thisArg, args){
  ensureFunction(func, '@function.apply');
  return $$Invoke(func, 'Call', thisArg, $$Get(ensureArgs(args), 'array'));
}

builtinFunction(apply);


export function bind(func, thisArg, ...args){
  ensureFunction(func, '@function.bind');
  return $__BoundFunctionCreate(func, thisArg, args);
}

builtinFunction(bind);


export function call(func, thisArg, ...args){
  ensureFunction(func, '@function.call');
  return $$Invoke(func, 'Call', thisArg, $$Get(args, 'array'));
}

builtinFunction(call);
