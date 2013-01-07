import {
  @@BooleanValue: BooleanValue
} from '@@symbols';

import {
  $$Exception,
  $$Get,
  $$IsConstruct
} from '@@internals';

import {
  ToBoolean
} from '@@operations';

import {
  Type
} from '@@types';

import {
  builtinClass,
  define,
  hasBrand
} from '@@utilities';



export class Boolean {
  constructor(value){
    value = ToBoolean(value);
    return $$IsConstruct() ? $__BooleanCreate(value) : value;
  }

  toString(){
    const type = Type(this);

    if (type === 'Boolean') {
      return this;
    } else if (type === 'Object' && hasBrand(this, 'BooleanWrapper')) {
      return this.@@BooleanValue ? 'true' : 'false';
    }

    throw $$Exception('not_generic', ['Boolean.prototype.toString']);
  }

  valueOf(){
    const type = Type(this);

    if (type === 'Boolean') {
      return this;
    } else if (type === 'Object' && hasBrand(this, 'BooleanWrapper')) {
      return this.@@BooleanValue;
    }

    throw $$Exception('not_generic', ['Boolean.prototype.valueOf']);
  }
}


builtinClass(Boolean);

define(Boolean.prototype, @@BooleanValue, false);
