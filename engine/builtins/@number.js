import {
  @@NumberValue: NumberValue
} from '@@symbols';

import {
  $$ArgumentCount,
  $$Exception,
  $$Get,
  $$IsConstruct,
  $$NumberToString
} from '@@internals';

import {
  ToInteger,
  ToNumber
} from '@@operations';

import {
  Type
} from '@@types';

import {
  builtinClass,
  define,
  extend,
  floor,
  hasBrand
} from '@@utilities';



export const EPSILON           = 2.220446049250313e-16,
             MAX_INTEGER       = 9007199254740992,
             MAX_VALUE         = 1.7976931348623157e+308,
             MIN_VALUE         = 5e-324,
             NaN               = +'NaN',
             NEGATIVE_INFINITY = 1 / -0,
             POSITIVE_INFINITY = 1 / 0;




export class Number {
  constructor(value){
    value = $$ArgumentCount() ? ToNumber(value) : 0;
    return $$IsConstruct() ? $__NumberCreate(value) : value;
  }

  toString(radix = 10){
    if (typeof this === 'number') {
      return $$NumberToString(this, ToInteger(radix));
    } else if (hasBrand(this, 'NumberWrapper')) {
      return $$NumberToString(this.@@NumberValue, ToInteger(radix));
    }

    throw $$Exception('not_generic', ['Number.prototype.toString']);
  }

  valueOf(){
    if (typeof this === 'number') {
      return this;
    } else if (hasBrand(this, 'NumberWrapper')) {
      return this.@@NumberValue;
    }

    throw $$Exception('not_generic', ['Number.prototype.valueOf']);
  }

  clz(){
    let x = ToNumber(this);

    if (!x || !isFinite(x)) {
      return 32;
    }

    x = x < 0 ? floor(x + 1) : floor(x);
    x -= floor(x / 0x100000000) * 0x100000000;
    return 32 - $$NumberToString(x, 2).length;
  }
}

builtinClass(Number);

define(Number.prototype, @@NumberValue, 0);


export function isNaN(value){
  return value !== value;
}

export function isFinite(value){
  return typeof value === 'number'
      && value === value
      && value < POSITIVE_INFINITY
      && value > NEGATIVE_INFINITY;
}


export function isInteger(value) {
  return typeof value === 'number'
      && value === value
      && value > -MAX_INTEGER
      && value < MAX_INTEGER
      && value | 0 === value;
}

export function toInteger(value){
  return (value / 1 || 0) | 0;
}

extend(Number, { isNaN, isFinite, isInteger, toInteger,
                 EPSILON, MAX_INTEGER, MAX_VALUE, MIN_VALUE,
                 NaN, NEGATIVE_INFINITY, POSITIVE_INFINITY });

