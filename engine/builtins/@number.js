// ###############################
// ##### 15.7 Number Objects #####
// ###############################


import {
  $$ArgumentCount,
  $$CallerName,
  $$Exception,
  $$Get,
  $$Invoke,
  $$NumberToString,
  $$Set
} from '@@internals';

import {
  OrdinaryCreateFromConstructor,
  ToInteger,
  ToNumber,
  ToUint32
} from '@@operations';

import {
  Type
} from '@@types';

import {
  builtinClass,
  define,
  extend,
  floor,
  hasBrand,
  internalFunction,
  isInitializing
} from '@@utilities';

import {
  @@create: create
} from '@@symbols';

import {
  undefined
} from '@@constants';

import {
  parseFloat,
  parseInt
} from '@globals';


function ensureNumber(o){
  if (Type(o) === 'Number') {
    return o;
  } else if (hasBrand(o, 'NumberWrapper')) {
    return $$Get(o, 'NumberValue');
  }

  throw $$Exception('not_generic', [`Number.prototype.${$$CallerName()}`]);
}

internalFunction(ensureNumber);


// ########################################################
// ### 15.7.4 Properties of the Number Prototype Object ###
// ########################################################

export class Number {
  // #########################################
  // # 15.7.4.1 Number.prototype.constructor #
  // #########################################
  constructor(value){
    value = $$ArgumentCount() ? ToNumber(value) : 0;

    // 15.7.1.1 Number ( [ value ] )
    if (!isInitializing(this, 'NumberValue')) {
      return value;
    }

    // 15.7.2.1 new Number ( [ value ] )
    $$Set(this, 'NumberValue', value);
  }

  // ######################################
  // # 15.7.4.2 Number.prototype.toString #
  // ######################################
  toString(radix = 10){
    radix = ToInteger(radix);
    if (radix < 2 || radix > 36) {
      throw $$Exception('invalid_radix', []);
    }

    return $$NumberToString(ensureNumber(this), radix);
  }

  // ############################################
  // # 15.7.4.3 Number.prototype.toLocaleString #
  // ############################################
  toLocaleString(){
    return $$Invoke(ensureNumber(this), 'toLocaleString');
  }

  // #####################################
  // # 15.7.4.4 Number.prototype.valueOf #
  // #####################################
  valueOf(){
    return ensureNumber(this);
  }

  // #####################################
  // # 15.7.4.5 Number.prototype.toFixed #
  // #####################################
  toFixed(fractionDigits){
    const f = ToInteger(fractionDigits);

    if (f < 0 || f > 20) {
      throw $$Exception('invalid_fraction');
    }

    return $$Invoke(ensureNumber(this), 'toFixed', f);
  }

  // ###########################################
  // # 15.7.4.6 Number.prototype.toExponential #
  // ###########################################
  toExponential(fractionDigits){
    const x = ensureNumber(this),
          f = ToInteger(fractionDigits);

    if (fractionDigits !== undefined && f < 0 || f > 20) {
      throw $$Exception('invalid_fraction');
    }

    return $$Invoke(x, 'toExponential', f);
  }

  // #########################################
  // # 15.7.4.6 Number.prototype.toPrecision #
  // #########################################
  toPrecision(precision){
    const x = ensureNumber(this),
          p = ToInteger(precision);

    if (isNaN(x)) {
      return 'NaN';
    } else if (x === NEGATIVE_INFINITY) {
      return '-Infinity';
    } else if (x === POSITIVE_INFINITY) {
      return 'Infinity';
    }

    if (p < 1 || p > 21) {
      throw $$Exception('invalid_precision');
    }

    return $$Invoke(x, 'toPrecision', p);
  }

  // #################################
  // # 15.7.4.8 Number.prototype.clz #
  // #################################
  clz(){
    const x = ensureNumber(this);
    let n = ToUint32(x);

    if (n === 0) {
      return 32;
    }

    n = n < 0 ? floor(n + 1) : floor(n);
    n -= floor(n / 0x100000000) * 0x100000000;
    return 32 - $$NumberToString(n, 2).length;
  }
}

builtinClass(Number, 'NumberWrapper');
$$Set(Number.prototype, 'NumberValue', 0);



// ###################################################
// ### 15.7.3 Properties of the Number Constructor ###
// ###################################################

extend(Number, {
  // #############################
  // # 15.7.3.2 Number.MAX_VALUE #
  // #############################
  MAX_VALUE: 1.7976931348623157e+308,

  // #############################
  // # 15.7.3.3 Number.MIN_VALUE #
  // #############################
  MIN_VALUE: 5e-324,

  // #######################
  // # 15.7.3.4 Number.NaN #
  // #######################
  NaN: +'NaN',

  // #####################################
  // # 15.7.3.5 Number.NEGATIVE_INFINITY #
  // #####################################
  NEGATIVE_INFINITY: 1 / -0,

  // #####################################
  // # 15.7.3.6 Number.POSITIVE_INFINITY #
  // #####################################
  POSITIVE_INFINITY: 1 / 0,

  // ###########################
  // # 15.7.3.7 Number.EPSILON #
  // ###########################
  EPSILON: 2.220446049250313e-16,

  // ###############################
  // # 15.7.3.8 Number.MAX_INTEGER #
  // ###############################
  MAX_INTEGER: 9007199254740992,

  // ############################
  // # 15.7.3.9 Number.parseInt #
  // ############################
  parseInt,

  // ###############################
  // # 15.7.3.10 Number.parseFloat #
  // ###############################
  parseFloat,

  // ##########################
  // # 15.7.3.11 Number.isNaN #
  // ##########################
  isNaN(number){
    return number !== number;
  },

  // #############################
  // # 15.7.3.12 Number.isFinite #
  // #############################
  isFinite(number){
    return Type(number) === 'Number'
        && number === number
        && number !== POSITIVE_INFINITY
        && number !== NEGATIVE_INFINITY;
  },

  // ##############################
  // # 15.7.3.13 Number.isInteger #
  // ##############################
  isInteger(number) {
    return Type(number) === 'Number' && ToInteger(number) === number;
  },

  // ##########################
  // # 15.7.3.14 Number.toInt #
  // ##########################
  toInt(number){
    return ToInteger(number);
  },

  // #############################
  // # 15.7.3.15 Number.@@create #
  // #############################
  @@create(){
    const obj = OrdinaryCreateFromConstructor(this, '%NumberPrototype%');
    $$Set(obj, 'BuiltinBrand', 'NumberWrapper');
    $$Set(obj, 'NumberValue', undefined);
    return obj;
  }
});


export const MAX_VALUE         = Number.MAX_VALUE,
             MIN_VALUE         = Number.MIN_VALUE,
             NaN               = Number.NaN,
             NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY,
             POSITIVE_INFINITY = Number.POSITIVE_INFINITY,
             EPSILON           = Number.EPSILON,
             MAX_INTEGER       = Number.MAX_INTEGER,
             parseInt          = Number.parseInt,
             parseFloat        = Number.parseFloat,
             isNaN             = Number.isNaN,
             isFinite          = Number.isFinite,
             isInteger         = Number.isInteger,
             toInt             = Number.toInt;
