private @toString;

export class Function {
  constructor(...args){
    return $__FunctionCreate(...args);
  }

  apply(thisArg, args){
    ensureFunction(this, 'Function.prototype.apply');
    return this.@@Call(thisArg, ensureArgs(args));
  }

  bind(thisArg, ...args){
    ensureFunction(this, 'Function.prototype.bind');
    return $__BoundFunctionCreate(this, thisArg, args);
  }

  call(thisArg, ...args){
    ensureFunction(this, 'Function.prototype.call');
    return this.@@Call(thisArg, args);
  }

  toString(){
    ensureFunction(this, 'Function.prototype.toString');
    return this.@toString();
  }
}

builtinClass(Function);

Function.prototype.@@define('name', '', 0);
Function.prototype.@toString = $__FunctionToString;



export function apply(func, thisArg, args){
  ensureFunction(func, '@function.apply');
  return func.@@Call(thisArg, ensureArgs(args));
}

builtinFunction(apply);

export function bind(func, thisArg, ...args){
  ensureFunction(func, '@function.bind');
  return $__BoundFunctionCreate(func, thisArg, args);
}

builtinFunction(bind);

export function call(func, thisArg, ...args){
  ensureFunction(func, '@function.call');
  return func.@@Call(thisArg, args);
}

builtinFunction(call);

