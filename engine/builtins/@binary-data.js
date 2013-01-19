import {
  $$Invoke,
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

    const R = $$Invoke($$Get(this, 'DataType'), 'Convert', [val]);
    $$Invoke(this, 'SetValue', [Dereference(R)]);
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

