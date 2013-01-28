// ################################
// ##### 15.8 The Math Object #####
// ################################


import {
  ToInt32,
  ToNumber,
  ToUint32
} from '@@operations';

import {
  builtinFunction,
  define,
  hideEverything,
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


export const Math = {
  // ##################################################
  // ### 15.8.1 Value Properties of the Math Object ###
  // ##################################################

  // ###################
  // # 15.8.1.1 Math.E #
  // ###################
  E: 2.7182818284590452354,

  // ######################
  // # 15.8.1.2 Math.LN10 #
  // ######################
  LN10: 2.302585092994046,

  // #####################
  // # 15.8.1.3 Math.LN2 #
  // #####################
  LN2: 0.6931471805599453,

  // #######################
  // # 15.8.1.4 Math.LOG2E #
  // #######################
  LOG2E: 1.4426950408889634,

  // ########################
  // # 15.8.1.5 Math.LOG10E #
  // ########################
  LOG10E: 0.4342944819032518,

  // ####################
  // # 15.8.1.6 Math.PI #
  // ####################
  PI: 3.1415926535897932,

  // #########################
  // # 15.8.1.7 Math.SQRT1_2 #
  // #########################
  SQRT1_2: 0.7071067811865476,

  // #######################
  // # 15.8.1.8 Math.SQRT2 #
  // #######################
  SQRT2: 1.4142135623730951,


  // #####################################################
  // ### 15.8.2 Function Properties of the Math Object ###
  // #####################################################


  // #####################
  // # 15.8.2.1 Math.abs #
  // #####################
  abs(x){
    x = ToNumber(x);

    return x === 0 ? 0 : x < 0 ? -x : x;
  },

  // ######################
  // # 15.8.2.2 Math.acos #
  // ######################
  acos(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Acos(x) : x;
  },

  // ######################
  // # 15.8.2.3 Math.asin #
  // ######################
  asin(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Asin(x) : x;
  },

  // ######################
  // # 15.8.2.4 Math.atan #
  // ######################
  atan(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Atan(x) : x;
  },

  // #######################
  // # 15.8.2.5 Math.atan2 #
  // #######################
  atan2(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Atan2(x) : x;
  },

  // ######################
  // # 15.8.2.6 Math.ceil #
  // ######################
  ceil(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? ToInt32(x + 1) : x;
  },

  // #####################
  // # 15.8.2.7 Math.cos #
  // #####################
  cos(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Cos(x) : x;
  },

  // #####################
  // # 15.8.2.8 Math.exp #
  // #####################
  exp(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Exp(x) : x;
  },

  // #######################
  // # 15.8.2.9 Math.floor #
  // #######################
  floor(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? ToInt32(x) : x;
  },

  // ######################
  // # 15.8.2.10 Math.log #
  // ######################
  log(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Log(x) : x;
  },

  // ######################
  // # 15.8.2.11 Math.max #
  // ######################
  max(...values){
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
  },

  // ######################
  // # 15.8.2.12 Math.min #
  // ######################
  min(...values){
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
  },

  // ######################
  // # 15.8.2.13 Math.pow #
  // ######################
  pow(x, y){
    return $$Pow(ToNumber(x), ToNumber(y));
  },

  // #########################
  // # 15.8.2.14 Math.random #
  // #########################
  random(){
    return $$Random();
  },

  // ########################
  // # 15.8.2.15 Math.round #
  // ########################
  round(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? x + .5 | 0 : x;
  },

  // ######################
  // # 15.8.2.16 Math.sin #
  // ######################
  sin(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Sin(x) : x;
  },

  // #######################
  // # 15.8.2.17 Math.sqrt #
  // #######################
  sqrt(x){
    return $$Sqrt(ToNumber(x));
  },

  // ######################
  // # 15.8.2.18 Math.tan #
  // ######################
  tan(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Tan(x) : x;
  },

  // ########################
  // # 15.8.2.19 Math.log10 #
  // ########################
  log10(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Log(x) * LOG10E : x;
  },

  // #######################
  // # 15.8.2.20 Math.log2 #
  // #######################
  log2(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Log(x) * LOG2E : x;
  },

  // ########################
  // # 15.8.2.21 Math.log1p #
  // ########################
  log1p(x){
    x = ToNumber(x);
    if (!isFiniteNonZero(x)) {
      return x;
    }

    if (x <= -1) {
      return -Infinity;
    } else if (x < 0 || x > 1) {
      return $$Log(1 + x);
    }

    let o = 0,
        n = 50;

    for (var i = 1; i < n; i++) {
      if ((i % 2) === 0) {
        o -= $$Pow(x, i) / i;
      } else {
        o += $$Pow(x, i) / i;
      }
    }

    return o;
  },

  // ########################
  // # 15.8.2.22 Math.expm1 #
  // ########################
  expm1(x) {
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
  },

  // #######################
  // # 15.8.2.23 Math.cosh #
  // #######################
  cosh(x) {
    x = ToNumber(x);
    if (!isFiniteNonZero(x)) {
      return x;
    }

    x = abs(x);

    return x > 21 ? $$Exp(x) / 2 : ($$Exp(x) + $$Exp(-x)) / 2;
  },

  // #######################
  // # 15.8.2.24 Math.sinh #
  // #######################
  sinh(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? ($$Exp(x) - $$Exp(-x)) / 2 : x;
  },

  // #######################
  // # 15.8.2.25 Math.tanh #
  // #######################
  tanh(x) {
    x = ToNumber(x);

    return isFiniteNonZero(x) ? ($$Exp(x) - $$Exp(-x)) / ($$Exp(x) + $$Exp(-x)) : x;
  },

  // ########################
  // # 15.8.2.26 Math.acosh #
  // ########################
  acosh(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Log(x + $$Sqrt(x * x - 1)) : x;
  },

  // ########################
  // # 15.8.2.27 Math.asinh #
  // ########################
  asinh(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? $$Log(x + $$Sqrt(x * x + 1)) : x;
  },

  // ########################
  // # 15.8.2.28 Math.atanh #
  // ########################
  atanh(x) {
    x = ToNumber(x);

    return isFiniteNonZero(x) ? .5 * $$Log((1 + x) / (1 - x)) : x;
  },

  // ########################
  // # 15.8.2.29 Math.hypot #
  // ########################
  hypot(value1, value2, value3 = 0) {
    const x = ToNumber(value1),
          y = ToNumber(value2),
          z = ToNumber(value3);

    if (x === POSITIVE_INFINITY || y === POSITIVE_INFINITY || z === POSITIVE_INFINITY) {
      return POSITIVE_INFINITY;
    } else if (x === NEGATIVE_INFINITY || y === NEGATIVE_INFINITY || z === NEGATIVE_INFINITY) {
      return POSITIVE_INFINITY;
    } else if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return NaN;
    } else if (x === 0 && y === 0 && z === 0) {
      return 0;
    }

    return $$Sqrt(x * x + y * y + z * z);
  },

  // ########################
  // # 15.8.2.30 Math.trunc #
  // ########################
  trunc(x){
    x = ToNumber(x);

    return isFiniteNonZero(x) ? ~~x : x;
  },

  // #######################
  // # 15.8.2.31 Math.sign #
  // #######################
  sign(x){
    x = ToNumber(x);

    return x === 0 || x !== x ? x : x < 0 ? -1 : 1;
  },

  // #######################
  // # 15.8.2.31 Math.cbrt #
  // #######################
  cbrt(x){
    x = ToNumber(x);

    return sign(x) * $$Pow(abs(x), 1 / 3);
  },

  imul(x, y) {
    const xlo = loword(x),
          ylo = loword(y);

    return xlo * ylo + (((hiword(x) * ylo + hiword(y) * xlo) << 16) >>> 0);
  }
};

const loword = x => x & 0xffff,
      hiword = x => x >>> 16 & 0xffff;


$$Set(Math, 'BuiltinBrand', 'BuiltinMath');
setTag(Math, 'Math');
set(Math.max, 'length', 2);
set(Math.min, 'length', 2);
hideEverything(Math);


export const E       = Math.E,
             LN10    = Math.LN10,
             LN2     = Math.LN2,
             LOG2E   = Math.LOG2E,
             LOG10E  = Math.LOG10E,
             PI      = Math.PI,
             SQRT1_2 = Math.SQRT1_2,
             SQRT2   = Math.SQRT2,
             abs     = Math.abs,
             acos    = Math.acos,
             acosh   = Math.acosh,
             asin    = Math.asin,
             asinh   = Math.asinh,
             atan    = Math.atan,
             atan2   = Math.atan2,
             atanh   = Math.atanh,
             ceil    = Math.ceil,
             cbrt    = Math.cbrt,
             cos     = Math.cos,
             cosh    = Math.cosh,
             exp     = Math.exp,
             expm1   = Math.expm1,
             floor   = Math.floor,
             hypot   = Math.hypot,
             imul    = Math.imul,
             log     = Math.log,
             log10   = Math.log10,
             log1p   = Math.log1p,
             log2    = Math.log2,
             max     = Math.max,
             min     = Math.min,
             pow     = Math.pow,
             random  = Math.random,
             round   = Math.round,
             sign    = Math.sign,
             sin     = Math.sin,
             sinh    = Math.sinh,
             sqrt    = Math.sqrt,
             tan     = Math.tan,
             tanh    = Math.tanh,
             trunc   = Math.trunc;
