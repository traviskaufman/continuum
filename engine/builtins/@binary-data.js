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
    if (Type(this) !== 'Object' || $$Get(this, 'BuiltinBrand') !== 'BuiltinData') {
      throw $$Exception('not_generic', ['Data.prototype.update']);
    }

    const R = $$Call($$Get(this, 'DataType'), 'Convert', [val]);
    $$Call(this, 'SetValue', [Dereference(R)]);
  }
}

extend(Data, {
  array(number){
    if (Type(this) !== 'Object' || $$Get(this, 'BuiltinBrand') !== 'BuiltinDataType') {
      throw $$Exception('not_generic', ['DataType.prototype.array']);
    }

    return new ArrayType(this, number);
  }
});

builtinClass(Data);


export class DataType extends Function {

}

set(DataType, 'prototype', Data);
builtinClass(DataType);



export class ArrayType extends DataType {

}

builtinClass(ArrayType);



export class StructType extends DataType {

}

builtinClass(StructType);
