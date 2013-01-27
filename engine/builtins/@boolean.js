// ################################
// ##### 15.6 Boolean Objects #####
// ################################

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

import {
  @@create: create
} from '@@symbols';



// #########################################################
// ### 15.6.4 Properties of the Boolean Prototype Object ###
// #########################################################

export class Boolean {
  // ##########################################
  // # 15.6.4.1 Boolean.prototype.constructor #
  // ##########################################
  constructor(value){
    value = ToBoolean(value);

    if (!isInitializing(this, 'BooleanValue')) {
      return value;
    }

    $$Set(this, 'BooleanValue', value);
  }

  // #######################################
  // # 15.6.4.2 Boolean.prototype.toString #
  // #######################################
  toString(){
    if (typeof this === 'boolean') {
      return this;
    } else if (hasBrand(this, 'BooleanWrapper')) {
      return $$Get(this, 'BooleanValue');
    }

    throw $$Exception('not_generic', ['Boolean.prototype.toString']);
  }

  // ######################################
  // # 15.6.4.3 Boolean.prototype.valueOf #
  // ######################################
  valueOf(){
    if (typeof this === 'boolean') {
      return this;
    } else if (hasBrand(this, 'BooleanWrapper')) {
      return $$Get(this, 'BooleanValue');
    }

    throw $$Exception('not_generic', ['Boolean.prototype.valueOf']);
  }
}


builtinClass(Boolean, 'BooleanWrapper');
$$Set(Boolean.prototype, 'BooleanValue', false);


extend(Boolean, {
  // #############################
  // # 15.6.3.2 Boolean.@@create #
  // #############################
  @@create(){
    const obj = OrdinaryCreateFromConstructor(this, '%BooleanPrototype%');
    $$Set(obj, 'BuiltinBrand', 'BooleanWrapper');
    $$Set(obj, 'BooleanValue', undefined);
    return obj;
  }
});
