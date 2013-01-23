import {
  $$CreateInternalObject,
  $$Get,
  $$Set
} from '@@internals';

import {
  extendInternal
} from '@@utilities';

import {
  MISSING
} from '@@internal-symbols';


private @descriptor;


const Desc = extendInternal($$CreateInternalObject(), {
  _type: 'Descriptor',
  Configurable: MISSING,
  Enumerable: MISSING,
  Writable: MISSING,
  Value: MISSING,
  Get: MISSING,
  Set: MISSING
});


export class Descriptor {
  constructor(desc = $$CreateInternalObject(Desc)){
    this.@descriptor = desc;
  }

  get(){
    return this.@descriptor;
  }

  set(Descriptor){
    this.@descriptor = Descriptor;
  }

  get configurable(){
    return $$Get(this.@descriptor, 'Configurable');
  }

  get enumerable(){
    return $$Get(this.@descriptor, 'Enumerable');
  }

  get writable(){
    return $$Get(this.@descriptor, 'Writable');
  }

  get value(){
    return $$Get(this.@descriptor, 'Value');
  }

  get get(){
    return $$Get(this.@descriptor, 'Get');
  }

  get set(){
    return $$Get(this.@descriptor, 'Set');
  }

  set configurable(value){
    $$Set(this.@descriptor, 'Configurable', value);
  }

  set enumerable(value){
    $$Set(this.@descriptor, 'Enumerable', value);
  }

  set writable(value){
    $$Set(this.@descriptor, 'Writable', value);
  }

  set value(value){
    $$Set(this.@descriptor, 'Value', value);
  }

  set get(value){
    $$Set(this.@descriptor, 'Get', value);
  }

  set set(value){
    $$Set(this.@descriptor, 'Set', value);
  }
}




export class DataDescriptor extends Descriptor {
  constructor(configurable = MISSING, enumerable = MISSING, writable = MISSING, value = MISSING){
    super();
    this.configurable = configurable;
    this.enumerable = enumerable;
    this.writable = writable;
    this.value = value;
  }
}



export class AccessorDescriptor extends Descriptor {
  constructor(configurable = MISSING, enumerable = MISSING, get = MISSING, set = MISSING){
    super();
    this.configurable = configurable;
    this.enumerable = enumerable;
    this.get = get;
    this.set = set;
  }
}

export const defaults = new Descriptor;
defaults.configurable = false;
defaults.enumerable = false;
defaults.writable = false;
defaults.value = undefined;
defaults.set = undefined;
defaults.get = undefined;
