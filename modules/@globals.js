let Infinity = 1 / 0;

export function decodeURI(value){
  return $__decodeURI('' + value);
}

export function decodeURIComponent(value){
  return $__decodeURIComponent('' + value);
}

export function encodeURI(value){
  return $__encodeURI('' + value);
}

export function encodeURIComponent(value){
  return $__encodeURIComponent('' + value);
}

export function escape(value){
  return $__escape('' + value);
}

export function unescape(value){
  return $__unescape('' + value);
}

export function isFinite(number){
  number = +number;
  return number === number && number !== Infinity && number !== -Infinity;
}

export function isNaN(number){
  number = +number;
  return number !== number;
}
export function parseFloat(value){
  return $__parseFloat($__ToPrimitive(value));
}

export function parseInt(value, radix){
  return $__parseInt($__ToPrimitive(value), +radix);
}


$__setupFunctions(decodeURI, decodeURIComponent, encodeURI, encodeURIComponent,
                  escape, isFinite, isNaN, parseInt, parseFloat);

