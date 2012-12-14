export const
  E       = 2.718281828459045,
  LN10    = 2.302585092994046,
  LN2     = 0.6931471805599453,
  LOG10E  = 0.4342944819032518,
  LOG2E   = 1.4426950408889634,
  PI      = 3.141592653589793,
  SQRT1_2 = 0.7071067811865476,
  SQRT2   = 1.4142135623730951;


function isFiniteNonZero(value) {
  return value === value
      && value !== 0
      && value !== -Infinity
      && value !== Infinity;
}

internalFunction(isFiniteNonZero);


function factorial(x){
  var i = 2,
      n = 1;

  while (i <= x) {
    n *= i++;
  }

  return n;
}

internalFunction(factorial);


export function abs(x){
  x = $__ToNumber(x);
  return x === 0 ? 0 : x < 0 ? -x : x;
}

export function acos(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__acos(x) : x;
}

export function acosh(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__log(x + $__sqrt(x * x - 1)) : x;
}

export function asin(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__asin(x) : x;
}

export function asinh(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__log(x + $__sqrt(x * x + 1)) : x;
}

export function atan(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__atan(x) : x;
}

export function atan2(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__atan2(x) : x;
}

export function atanh(x) {
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? .5 * $__log((1 + x) / (1 - x)) : x;
}

export function ceil(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? x + 1 >> 0 : x;
}

export function cos(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__cos(x) : x;
}

export function cosh(x) {
  x = $__ToNumber(x);
  if (!isFiniteNonZero(x)) {
    return x;
  }
  x = abs(x);
  if (x > 21) {
    return $__exp(x) / 2;
  }
  return ($__exp(x) + $__exp(-x)) / 2;
}

export function exp(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__exp(x) : x;
}

export function expm1(x) {
  x = $__ToNumber(x);
  if (!isFiniteNonZero(x)) {
    return x;
  }

  var o = 0,
      n = 50;

  for (var i = 1; i < n; i++) {
    o += $__pow(x, i) / factorial(i);
  }
  return o;
}

export function floor(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? x >> 0 : x;
}

export function hypot(x, y) {
  x = $__ToNumber(x);
  y = $__ToNumber(y);
  if (!isFiniteNonZero(x)) {
    return x;
  }
  if (!isFiniteNonZero(y)) {
    return y;
  }
  return $__sqrt(x * x + y * y);
}

export function log(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__log(x) : x;
}

export function log10(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__log(x) * LOG10E : x;
}

export function log1p(x){
  x = $__ToNumber(x);
  if (!isFiniteNonZero(x)) {
    return x;
  }

  var o = 0,
      n = 50;

  if (x <= -1) {
    return -Infinity;
  } else if (x < 0 || x > 1) {
    return $__log(1 + x);
  } else {
    for (var i = 1; i < n; i++) {
      if ((i % 2) === 0) {
        o -= $__pow(x, i) / i;
      } else {
        o += $__pow(x, i) / i;
      }
    }
    return o;
  }
}

export function log2(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__log(x) * LOG2E : x;
}

export function max(...values){
  var i = values.length,
      maximum = -Infinity,
      current;

  while (i--) {
    current = +values[i];
    if (current !== current) {
      return NaN;
    }
    if (current > maximum) {
      maximum = current;
    }
  }

  return maximum;
}

max.@@set('length', 2);

export function min(...values){
  var i = values.length,
      minimum = Infinity,
      current;

  while (i--) {
    current = $__ToNumber(values[i]);
    if (current !== current) {
      return NaN;
    }
    if (current < minimum) {
      minimum = current;
    }
  }

  return minimum;
}

min.@@set('length', 2);

export function pow(x, y){
  return $__pow($__ToNumber(x), $__ToNumber(y));
}

export let random = $__random;

export function round(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? x + .5 | 0 : x;
}

export function sign(x){
  x = $__ToNumber(x);
  return x === 0 || x !== x ? x : x < 0 ? -1 : 1;
}

export function sin(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__sin(x) : x;
}

export function sinh(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? ($__exp(x) - $__exp(-x)) / 2 : x;
}

export function sqrt(x, y){
  return $__sqrt(+x, +y);
}

export function tan(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? $__tan(x) : x;
}

export function tanh(x) {
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? ($__exp(x) - $__exp(-x)) / ($__exp(x) + $__exp(-x)) : x;
}

export function trunc(x){
  x = $__ToNumber(x);
  return isFiniteNonZero(x) ? ~~x : x;
}

export const Math = {
  E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2,
  abs, acos, acosh, asinh, asin, atan, atanh, atan2, ceil, cos,
  cosh, exp, expm1, floor, hypot, log, log2, log10, log1p, max,
  min, pow, random, round, sign, sinh, sin, sqrt, tan, tanh, trunc
};

Math.@@SetBuiltinBrand('BuiltinMath');
Math.@@define(@toStringTag, 'Math');

for (let k in Math) {
  if (typeof Math[k] === 'function') {
    builtinFunction(Math[k]);
    Math.@@update(k, HIDDEN);
  } else {
    Math.@@update(k, FROZEN);
  }
}
