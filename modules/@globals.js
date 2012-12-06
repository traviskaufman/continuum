export function decodeURI(value){
  return $__decodeURI($__ToString(value));
}

builtinFunction(decodeURI);


export function decodeURIComponent(value){
  return $__decodeURIComponent($__ToString(value));
}

builtinFunction(decodeURIComponent);


export function encodeURI(value){
  return $__encodeURI($__ToString(value));
}

builtinFunction(encodeURI);


export function encodeURIComponent(value){
  return $__encodeURIComponent($__ToString(value));
}

builtinFunction(encodeURIComponent);


export function escape(value){
  return $__escape($__ToString(value));
}

builtinFunction(escape);


export let eval = $__eval;
builtinFunction(eval);


export function isFinite(number){
  number = $__ToNumber(number);
  return number === number && number !== Infinity && number !== -Infinity;
}

builtinFunction(isFinite);


export function isNaN(number){
  number = $__ToNumber(number);
  return number !== number;
}

builtinFunction(isNaN);


export function parseFloat(value){
  return $__parseFloat($__ToPrimitive(value));
}

builtinFunction(parseFloat);


export function parseInt(value, radix){
  return $__parseInt($__ToPrimitive(value), +radix);
}

builtinFunction(parseInt);


export function unescape(value){
  return $__unescape($__ToString(value));
}

builtinFunction(unescape);
