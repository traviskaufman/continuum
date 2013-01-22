import {
  ToInt32,
  ToNumber,
  ToUint32
} from '@@operations';

import {
  builtinFunction,
  define,
  internalFunction,
  set,
  setTag,
  update
} from '@@utilities';

import {
  $$Set
} from '@@internals';

import {
  $$Acos,
  $$Asin,
  $$Atan,
  $$Atan2,
  $$Cos,
  $$Exp,
  $$Log,
  $$Pow,
  $$Random,
  $$Sin,
  $$Sqrt,
  $$Tan
} from '@@math';

import {
  NaN,
  NEGATIVE_INFINITY,
  POSITIVE_INFINITY
} from '@@constants';


export const E       = 2.718281828459045,
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
      && value !== NEGATIVE_INFINITY
      && value !== POSITIVE_INFINITY;
}

internalFunction(isFiniteNonZero);


function factorial(x){
  let i = 2,
      n = 1;

  while (i <= x) {
    n *= i++;
  }

  return n;
}

internalFunction(factorial);


export function abs(x){
  x = ToNumber(x);
  return x === 0 ? 0 : x < 0 ? -x : x;
}

export function acos(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Acos(x) : x;
}

export function acosh(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Log(x + $$Sqrt(x * x - 1)) : x;
}

export function asin(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Asin(x) : x;
}

export function asinh(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Log(x + $$Sqrt(x * x + 1)) : x;
}

export function atan(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Atan(x) : x;
}

export function atan2(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Atan2(x) : x;
}

export function atanh(x) {
  x = ToNumber(x);
  return isFiniteNonZero(x) ? .5 * $$Log((1 + x) / (1 - x)) : x;
}

export function ceil(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? ToInt32(x + 1) : x;
}

export function cos(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Cos(x) : x;
}

export function cosh(x) {
  x = ToNumber(x);
  if (!isFiniteNonZero(x)) {
    return x;
  }
  x = abs(x);
  if (x > 21) {
    return $$Exp(x) / 2;
  }
  return ($$Exp(x) + $$Exp(-x)) / 2;
}

export function exp(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Exp(x) : x;
}

export function expm1(x) {
  x = ToNumber(x);
  if (!isFiniteNonZero(x)) {
    return x;
  }

  let o = 0,
      n = 50;

  for (var i = 1; i < n; i++) {
    o += $$Pow(x, i) / factorial(i);
  }

  return o;
}

export function floor(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? ToInt32(x) : x;
}

export function hypot(x, y) {
  x = ToNumber(x);
  y = ToNumber(y);
  if (!isFiniteNonZero(x)) {
    return x;
  }
  if (!isFiniteNonZero(y)) {
    return y;
  }
  return $$Sqrt(x * x + y * y);
}

export function imul(x, y){
  x = ToUint32(x);
  y = ToUint32(y);

  return ToInt32((x * y) & 0xffffffff);
}

export function log(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Log(x) : x;
}

export function log10(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Log(x) * LOG10E : x;
}

export function log1p(x){
  x = ToNumber(x);
  if (!isFiniteNonZero(x)) {
    return x;
  }

  let o = 0,
      n = 50;

  if (x <= -1) {
    return -Infinity;
  } else if (x < 0 || x > 1) {
    return $$Log(1 + x);
  } else {
    for (var i = 1; i < n; i++) {
      if ((i % 2) === 0) {
        o -= $$Pow(x, i) / i;
      } else {
        o += $$Pow(x, i) / i;
      }
    }
    return o;
  }
}

export function log2(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Log(x) * LOG2E : x;
}

export function max(...values){
  const count = values.length;

  if (count === 0) {
    return -Infinity;
  } else if (count === 1) {
    return ToNumber(values[0]);
  } else if (count === 2) {
    const x = ToNumber(values[0]),
          y = ToNumber(values[1]);

    if (x !== x || y !== y) {
      return NaN;
    }
    return x > y ? x : y;
  } else {
    let index   = count,
        maximum = -Infinity;

    while (index--) {
      const current = ToNumber(values[index]);

      if (current !== current) {
        return NaN;
      } else if (current > maximum) {
        maximum = current;
      }
    }

    return maximum;
  }
}

set(max, 'length', 2);

export function min(...values){
  const count = values.length;

  if (count === 0) {
    return Infinity;
  } else if (count === 1) {
    return ToNumber(values[0]);
  } else if (count === 2) {
    const x = ToNumber(values[0]),
          y = ToNumber(values[1]);

    if (x !== x || y !== y) {
      return NaN;
    }
    return x < y ? x : y;
  } else {
    let index   = count,
        minimum = Infinity;

    while (index--) {
      const current = ToNumber(values[index]);

      if (current !== current) {
        return NaN;
      } else if (current < minimum) {
        minimum = current;
      }
    }

    return minimum;
  }
}

set(min, 'length', 2);

export function pow(x, y){
  return $$Pow(ToNumber(x), ToNumber(y));
}

export function random(){
  return $$Random();
}

export function round(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? x + .5 | 0 : x;
}

export function sign(x){
  x = ToNumber(x);
  return x === 0 || x !== x ? x : x < 0 ? -1 : 1;
}

export function sin(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Sin(x) : x;
}

export function sinh(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? ($$Exp(x) - $$Exp(-x)) / 2 : x;
}

export function sqrt(x, y){
  return $$Sqrt(+x, +y);
}

export function tan(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? $$Tan(x) : x;
}

export function tanh(x) {
  x = ToNumber(x);
  return isFiniteNonZero(x) ? ($$Exp(x) - $$Exp(-x)) / ($$Exp(x) + $$Exp(-x)) : x;
}

export function trunc(x){
  x = ToNumber(x);
  return isFiniteNonZero(x) ? ~~x : x;
}

export const Math = {
  E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2,
  abs, acos, acosh, asinh, asin, atan, atanh, atan2, ceil, cos,
  cosh, exp, expm1, floor, hypot, log, log2, log10, log1p, max,
  min, pow, random, round, sign, sinh, sin, sqrt, tan, tanh, trunc
};

$$Set(Math, 'BuiltinBrand', 'BuiltinMath');
setTag(Math, 'Math');

for (let k in Math) {
  if (typeof Math[k] === 'function') {
    builtinFunction(Math[k]);
    update(Math, k, 6);
  } else {
    update(Math, k, 0);
  }
}
