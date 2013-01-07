import {
  $$Call,
  $$Exception,
  $$Get,
  $$Set
} from '@@internals';

import {
  builtinClass,
  define,
  extend,
  hasBrand,
  set
} from '@@utilities';

import {
  Type
} from '@@types';


class Data {
  constructor(){
    throw $$Exception('abstract', 'Data');
  }

  update(value){
    if (Type(this) !== 'Object' || !hasBrand(this, 'BuiltinData')) {
      throw $$Exception('not_generic', ['Data.prototype.update']);
    }

    const R = $$Call($$Get(this, 'DataType'), 'Convert', [val]);
    $$Call(this, 'SetValue', [Dereference(R)]);
  }
}

extend(Data, {
  array(number){
    if (Type(this) !== 'Object' || !hasBrand(this, 'BuiltinDataType')) {
      throw $$Exception('not_generic', ['DataType.prototype.array']);
    }

    return new ArrayType(this, number);
  }
});

builtinClass(Data);


export class DataType extends Function {
  constructor(){

  }
}

set(DataType, 'prototype', Data);
builtinClass(DataType);



export class ArrayType extends DataType {

}

builtinClass(ArrayType);



export class StructType extends DataType {

}

builtinClass(StructType);


var uint8, uint16, uint32 : Type
var int8, int16, int32 : Type
var float32, float64 : Type


function uint8(){}

$$Set(uint8, 'DataType', uint8.name);

function Convert(){}

Let t be one of the above built-in data type objects.

t.[[Prototype]] = Function.prototype

t.[[DataType]] = the name of t as a string (e.g., “uint8” for uint8)

t.[[Convert]](val : Any) → reference[block]
    Let R = a reference to a new number-block of the appropriate size for t
    If val = true
        R := 1
    Else If val = false
        R := 0
    Else If val is an ECMAScript number in the domain of this type
        R := val
    Else If val is a UInt64 or Int64 and val.[[Value]] is in the domain of t
        R := val.[[Value]]
    Else Throw TypeError
    Return R
t.[[IsSame]](u : Type)
    Return t.[[DataType]] = u.[[Type]]

t.[[Cast]](val : Any) → number-block
    Let V = t.[[Convert]](val)
    If !IsError(V)
        Return Dereference(V.value)
    If val = Infinity or val = NaN
        Return 0
    If val is an ECMAScript number
        Return t.[[CCast]](val)
    If val is a UInt64 or Int64
        Return t.[[CCast]](val.[[Value]])
    If val is a numeric string, possibly prefixed by “0x” or “0X” for uints or /(-)?(0[xX])?/ for ints
        Let V = ParseNumber(val)
        Return uintk.[[CCast]](V)
    Throw TypeError

t.[[CCast]](n : number) → number-block
    TODO: do roughly what C does

t.[[Call]](val : Any) → Number
    Let x ?= t.[[Cast]](x)
    Let R = a reference to a new number block with value x
    Return t.[[Reify]](R)

t.[[Reify]](R : reference[number-block])
    Let x = Dereference(R)
    If t.[[DataType]] = “uint64”
        Return a new UInt64 with [[Value]] x
    If t.[[DataType]] = “int64”
        Return a new Int64 with [[Value]] x
    Return x

For each built-in type object t with suffix k (e.g., for uint32, k = 32):

t.bytes = k / 8
