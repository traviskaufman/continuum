import {
  ToInteger,
  ToString
} from '@@operations';

import {
  builtinFunction
} from '@@utilities';

import {
  $$ClearImmediate,
  $$ClearTimer,
  $$SetImmediate,
  $$SetTimer
} from '@@internals';

import {
  Function
} from '@function';


export function clearImmediate(id){
  $$ClearImmediate(ToInteger(id));
}

builtinFunction(clearImmediate);


export function clearInterval(id){
  $$ClearTimer(ToInteger(id));
}

builtinFunction(clearInterval);


export function clearTimeout(id){
  $$ClearTimer(ToInteger(id));
}

builtinFunction(clearTimeout);


export function setImmediate(callback){
  if (typeof callback !== 'function') {
    callback = new Function(ToString(callback));
  }

  return $$SetImmediate(callback);
}

builtinFunction(setImmediate);


export function setInterval(callback, milliseconds){
  if (typeof callback !== 'function') {
    callback = new Function(ToString(callback));
  }

  return $$SetTimer(callback, ToInteger(milliseconds), true);
}

builtinFunction(setInterval);


export function setTimeout(callback, milliseconds){
  if (typeof callback !== 'function') {
    callback = new Function(ToString(callback));
  }

  return $$SetTimer(callback, ToInteger(milliseconds), false);
}

builtinFunction(setTimeout);
