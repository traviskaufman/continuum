import {
  @@create: create,
  @@hasInstance: hasInstance
} from '@@symbols';

import {
  OrdinaryCreateFromConstructor,
  OrdinaryHasInstance
} from '@@operations';


export class Function {
  constructor(...args){
    return $__FunctionCreate(...args);
  }

  apply(thisArg, args){
    ensureFunction(this, 'Function.prototype.apply');
    return $__Call(this, thisArg, ensureArgs(args));
  }

  bind(thisArg, ...args){
    ensureFunction(this, 'Function.prototype.bind');
    return $__BoundFunctionCreate(this, thisArg, args);
  }

  call(thisArg, ...args){
    ensureFunction(this, 'Function.prototype.call');
    return $__Call(this, thisArg, args);
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

$__define(Function.prototype, 'name', '', FROZEN);



export function apply(func, thisArg, args){
  ensureFunction(func, '@function.apply');
  return $__Call(func, thisArg, ensureArgs(args));
}

builtinFunction(apply);


export function bind(func, thisArg, ...args){
  ensureFunction(func, '@function.bind');
  return $__BoundFunctionCreate(func, thisArg, args);
}

builtinFunction(bind);


export function call(func, thisArg, ...args){
  ensureFunction(func, '@function.call');
  return $__Call(func, thisArg, args);
}

builtinFunction(call);
