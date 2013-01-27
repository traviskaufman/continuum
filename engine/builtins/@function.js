// #################################
// ##### 15.3 Function Objects #####
// #################################


import {
  @@create: create,
  @@hasInstance: hasInstance
} from '@@symbols';

import {
  OrdinaryCreateFromConstructor,
  OrdinaryHasInstance,
  ToString
} from '@@operations';

import {
  builtinClass,
  builtinFunction,
  define,
  ensureArgs,
  ensureFunction,
  getGlobal,
  hasBrand,
  listFrom
} from '@@utilities';

import {
  $BoundFunctionCreate,
  $$EvaluateInGlobal,
  $$Get,
  $$Has,
  $$Invoke
} from '@@internals';

import {
  $$StringSlice
} from '@@string';


const global = getGlobal();


// ##########################################################
// ### 15.3.4 Properties of the Function Prototype Object ###
// ##########################################################

export class Function {
  // ###############################################
  // ### 15.3.4.1 Function.prototype.constructor ###
  // ###############################################
  constructor(...args){
    const argCount = args.length;

    let bodyText,
        paramText;

    if (argCount === 0) {
      bodyText = '';
      paramText = '';
    } else if (argCount === 1) {
      bodyText = ToString(args[0]);
      paramText = '';
    } else if (argCount > 1) {
      let index = 1;

      paramText = ToString(args[0]);
      do {
        paramText += ',' + ToString(args[index]);
      } while (++index < argCount - 1)

      bodyText = ToString(args[index]);
    }

    bodyText = '{\n' + bodyText + '\n}';

    return $$EvaluateInGlobal(`(function anonymous(${paramText}) ${bodyText})`, global);
  }

  // ############################################
  // ### 15.3.4.2 Function.prototype.toString ###
  // ############################################
  toString(){
    ensureFunction(this, 'Function.prototype.toString');

    let obj = this;
    while ($$Has(obj, 'ProxyTarget')) {
      obj = $$Get(obj, 'ProxyTarget');
    }

    if ($$Get(obj, 'BuiltinFunction') || !$$Has(obj, 'Code')) {
      let name = obj.name;

      if (hasBrand(name, 'BuiltinSymbol')) {
        name = '@' + $$Get(name, 'Name');
      }

      return `function ${name}() { [native code] }`;
    }

    const code  = $$Get(obj, 'Code'),
          range = $$Get(code, 'range');

    return $$StringSlice($$Get(code, 'source'), $$Get(range, '0'), $$Get(range, '1'));
  }

  // #########################################
  // ### 15.3.4.3 Function.prototype.apply ###
  // #########################################
  apply(thisArg, argArray){
    ensureFunction(this, 'Function.prototype.apply');
    return $$Invoke(this, 'Call', thisArg, listFrom(ensureArgs(argArray)));
  }

  // ########################################
  // ### 15.3.4.4 Function.prototype.call ###
  // ########################################
  call(thisArg, ...args){
    ensureFunction(this, 'Function.prototype.call');
    return $$Invoke(this, 'Call', thisArg, listFrom(args));
  }

  // ########################################
  // ### 15.3.4.5 Function.prototype.bind ###
  // ########################################
  bind(thisArg, ...args){
    ensureFunction(this, 'Function.prototype.bind');
    return $$BoundFunctionCreate(this, thisArg, listFrom(args));
  }

  // ############################################
  // ### 15.3.4.6 Function.prototype.@@create ###
  // ############################################
  @@create(){
    return OrdinaryCreateFromConstructor(this, '%ObjectPrototype%');
  }

  // #################################################
  // ### 15.3.4.7 Function.prototype.@@hasInstance ###
  // #################################################
  @@hasInstance(V){
    return OrdinaryHasInstance(this, V);
  }
}

builtinClass(Function);

define(Function.prototype, 'length', 0, 0);
define(Function.prototype, 'name', '', 0);



export function apply(func, thisArg, args){
  ensureFunction(func, '@function.apply');
  return $$Invoke(func, 'Call', thisArg, listFrom(ensureArgs(args)));
}

builtinFunction(apply);


export function bind(func, thisArg, ...args){
  ensureFunction(func, '@function.bind');
  return $BoundFunctionCreate(func, thisArg, listFrom(args));
}

builtinFunction(bind);


export function call(func, thisArg, ...args){
  ensureFunction(func, '@function.call');
  return $$Invoke(func, 'Call', thisArg, listFrom(args));
}

builtinFunction(call);
