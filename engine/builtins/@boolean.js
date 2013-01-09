import {
  $$ArgumentCount,
  $$Exception,
  $$Get,
  $$Set
} from '@@internals';

import {
  OrdinaryCreateFromConstructor,
  ToBoolean
} from '@@operations';

import {
  Type
} from '@@types';

import {
  builtinClass,
  define,
  extend,
  hasBrand,
  isInitializing
} from '@@utilities';



export class Boolean {
  constructor(value){
    value = ToBoolean(value);

    if (!isInitializing(this, 'BooleanValue')) {
      return value;
    }

    $$Set(this, 'BooleanValue', value);
  }

  toString(){
    if (typeof this === 'boolean') {
      return this;
    } else if (hasBrand(this, 'BooleanWrapper')) {
      return $$Get(this, 'BooleanValue');
    }

    throw $$Exception('not_generic', ['Boolean.prototype.toString']);
  }

  valueOf(){
    if (typeof this === 'boolean') {
      return this;
    } else if (hasBrand(this, 'BooleanWrapper')) {
      return $$Get(this, 'BooleanValue');
    }

    throw $$Exception('not_generic', ['Boolean.prototype.valueOf']);
  }
}


builtinClass(Boolean);

$$Set(Boolean.prototype, 'BooleanValue', false);

extend(Boolean, {
  @@create(){
    const obj = OrdinaryCreateFromConstructor(this, '%BooleanPrototype%');
    $$Set(obj, 'BuiltinBrand', 'BooleanWrapper');
    $$Set(obj, 'BooleanValue', undefined);
    return obj;
  }
});
