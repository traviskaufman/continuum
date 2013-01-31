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

import {
  $$DecodeURI,
  $$DecodeURIComponent,
  $$EncodeURI,
  $$EncodeURIComponent,
  $$Escape,
  $$ParseFloat,
  $$ParseInt,
  $$Unescape
} from '@@globals';

setTag($$GetIntrinsic('global'), 'global');
setTag($$GetIntrinsic('StopIteration'), 'StopIteration');


export function decodeURI(value){
  return $$DecodeURI(ToString(value));
}

builtinFunction(decodeURI);


export function decodeURIComponent(value){
  return $$DecodeURIComponent(ToString(value));
}

builtinFunction(decodeURIComponent);


export function encodeURI(value){
  return $$EncodeURI(ToString(value));
}

builtinFunction(encodeURI);


export function encodeURIComponent(value){
  return $$EncodeURIComponent(ToString(value));
}

builtinFunction(encodeURIComponent);


export function escape(value){
  return $$Escape(ToString(value));
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
  return $$ParseFloat(ToPrimitive(value));
}

builtinFunction(parseFloat);


export function parseInt(value, radix){
  return $$ParseInt(ToPrimitive(value), ToNumber(radix));
}

builtinFunction(parseInt);


export function unescape(value){
  return $$Unescape(ToString(value));
}

builtinFunction(unescape);
