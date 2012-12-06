export const
  EPSILON           = 2.220446049250313e-16,
  MAX_INTEGER       = 9007199254740992,
  MAX_VALUE         = 1.7976931348623157e+308,
  MIN_VALUE         = 5e-324,
  NaN               = NaN,
  NEGATIVE_INFINITY = -Infinity,
  POSITIVE_INFINITY = Infinity;


export class Number {
  constructor(value){
    value = arguments.length ? $__ToNumber(value) : 0;
    return $__IsConstructCall() ? $__NumberCreate(value) : value;
  }

  toString(radix){
    radix = $__ToInteger(radix || 10);
    if (typeof this === 'number') {
      return $__NumberToString(this, radix);
    } else if (this.@@GetBuiltinBrand() === 'Number') {
      return $__NumberToString(this.@@getInternal('PrimitiveValue'), radix);
    }
    throw $__Exception('not_generic', ['Number.prototype.toString']);
  }

  valueOf(){
    if (typeof this === 'number') {
      return this;
    }
    if (this.@@GetBuiltinBrand() === 'Number') {
      return this.@@getInternal('PrimitiveValue');
    } else {
      throw $__Exception('not_generic', ['Number.prototype.valueOf']);
    }
  }

  clz() {
    var x = $__ToNumber(this);
    if (!x || !isFinite(x)) {
      return 32;
    } else {
      x = x < 0 ? x + 1 | 0 : x | 0;
      x -= (x / 0x100000000 | 0) * 0x100000000;
      return 32 - $__NumberToString(x, 2).length;
    }
  }
}

builtinClass(Number);


export function isNaN(number){
  return number !== number;
}

export function isFinite(number){
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

Number.@@extend({ isNaN, isFinite, isInteger, toInteger,
                  EPSILON, MAX_INTEGER, MAX_VALUE, MIN_VALUE,
                  NaN, NEGATIVE_INFINITY, POSITIVE_INFINITY });

