import {
  $$Get,
  $$Set
} from '@@internals';

import {
  define
} from '@@utilities';

import {
  ToNumber,
  ToPrimitive,
  ToString
} from '@@operations';

import {
  @@toStringTag: toStringTag
} from '@@symbols';

define($__global, @@toStringTag, 'global');
define($__StopIteration, @@toStringTag, 'StopIteration');


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


export function eval(source){}
builtinFunction(eval);
$$Set(eval, 'Call', $$Get($__eval, 'Call'));
$$Set(eval, 'Construct', $$Get($__eval, 'Construct'));


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
