import {
  $$CreateEval,
  $$GetUnwrapped,
  $$GetIntrinsic,
  $$Set
} from '@@internals';

import {
  builtinFunction,
  define,
  setTag
} from '@@utilities';

import {
  ToNumber,
  ToPrimitive,
  ToString
} from '@@operations';

setTag($$GetIntrinsic('global'), 'global');
setTag($$GetIntrinsic('StopIteration'), 'StopIteration');


export function decodeURI(value){
  return $__decodeURI(ToString(value));
}

builtinFunction(decodeURI);


export function decodeURIComponent(value){
  return $__decodeURIComponent(ToString(value));
}

builtinFunction(decodeURIComponent);


export function encodeURI(value){
  return $__encodeURI(ToString(value));
}

builtinFunction(encodeURI);


export function encodeURIComponent(value){
  return $__encodeURIComponent(ToString(value));
}

builtinFunction(encodeURIComponent);


export function escape(value){
  return $__escape(ToString(value));
}

builtinFunction(escape);

export const eval = $$CreateEval();
//builtinFunction(eval);


export function isFinite(number){
  number = ToNumber(number);
  return number === number && number !== Infinity && number !== -Infinity;
}

builtinFunction(isFinite);


export function isNaN(number){
  number = ToNumber(number);
  return number !== number;
}

builtinFunction(isNaN);


export function parseFloat(value){
  return $__parseFloat(ToPrimitive(value));
}

builtinFunction(parseFloat);


export function parseInt(value, radix){
  return $__parseInt(ToPrimitive(value), +radix);
}

builtinFunction(parseInt);


export function unescape(value){
  return $__unescape(ToString(value));
}

builtinFunction(unescape);
