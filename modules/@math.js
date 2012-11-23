const Infinity = 1 / 0,
      NaN = +'NaN';

export const
  E       = 2.718281828459045,
  LN10    = 2.302585092994046,
  LN2     = 0.6931471805599453,
  LOG10E  = 0.4342944819032518,
  LOG2E   = 1.4426950408889634,
  PI      = 3.141592653589793,
  SQRT1_2 = 0.7071067811865476,
  SQRT2   = 1.4142135623730951;



export function abs(x){
  x = +x;
  return x === 0 ? 0 : x < 0 ? -x : x;
}

export function acos(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__acos(x);
}

export function acosh(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__log(x + $__sqrt(x * x - 1));
}

export function asinh(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__log(x + $__sqrt(x * x + 1));
}

export function atan(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__atan(x);
}

export function asin(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__asin(x);
}

export function atanh(x) {
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return .5 * $__log((1 + x) / (1 - x));
}

export function atan2(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__atan2(x);
}


export function ceil(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return x + 1 >> 0;
}

export function acos(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__acos(x);
}

export function cos(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__cos(x);
}

export function cosh(x) {
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  if (x < 0) {
    x = -x;
  }
  if (x > 21) {
    return $__exp(x) / 2;
  } else {
    return ($__exp(x) + $__exp(-x)) / 2;
  }
}

export function exp(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__exp(x);
}

function factorial(x){
  var i = 2,
      o = 1;

  if (i <= x) {
    do {
      o *= i;
    } while (++i <= x)
  }
  return o;
}

export function expm1(x) {
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
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
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return x >> 0;
}

export function hypot(x, y) {
  x = +x;
  y = +y;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  if (y === 0 || y !== y || y === Infinity || y === -Infinity) {
    return y;
  }
  return $__sqrt(x * x + y * y);
}

export function log(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__log(x);
}

export function log2(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__log(x) * LOG2E;
}

export function log10(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__log(x) * LOG10E;
}

export function log1p(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
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

export function min(...values){
  var i = values.length,
      minimum = Infinity,
      current;

  while (i--) {
    current = +values[i];
    if (current !== current) {
      return NaN;
    }
    if (current < minimum) {
      minimum = current;
    }
  }

  return minimum;
}

export function pow(x, y){
  return $__pow(+x, +y);
}

export let random = $__random;

export function round(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return x + .5 | 0;
}

export function sign(x){
  x = +x;
  return x === 0 || x !== x ? x : x < 0 ? -1 : 1;
}

export function sinh(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return ($__exp(x) - $__exp(-x)) / 2;
}

export function sin(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__sin(x);
}

export function sqrt(x, y){
  return $__sqrt(+x, +y);
}

export function tan(x){
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return $__tan(x);
}

export function tanh(x) {
  x = +x;
  if (x === 0 || x !== x || x === Infinity || x === -Infinity) {
    return x;
  }
  return ($__exp(x) - $__exp(-x)) / ($__exp(x) + $__exp(-x));
}

export function trunc(x){
  x = +x;
  return x === 0 || x !== x || x === Infinity || x === -Infinity ? x : ~~x;
}

export var Math = {
  E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2,
  abs, acos, acosh, asinh, asin, atan, atanh, atan2, ceil, cos,
  cosh, exp, expm1, floor, hypot, log, log2, log10, log1p, max,
  min, pow, random, round, sign, sinh, sin, sqrt, tan, tanh, trunc
};

$__hideEverything(Math);
$__SetNativeBrand(Math, 'NativeMath');
