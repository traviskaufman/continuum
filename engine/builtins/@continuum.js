import {
  builtinFunction
} from '@@utilities';

import {
  $$CreateUndetectable,
  $$CreateNil,
  $$Get,
  $$IsUndetectable,
  $$Signal
} from '@@internals';


export const nil = $$CreateNil();

export function createUndetectable(value){
  return $$CreateUndetectable(value);
}

builtinFunction(createUndetectable);


export function unwrapUndetectable(value){
  if ($$IsUndetectable(value)) {
    return $$Get(value, 'value');
  }
}

builtinFunction(unwrapUndetectable);


export function isUndetectable(value){
  return $$IsUndetectable(value);
}

builtinFunction(isUndetectable);


export function signal(type, ...values){
  $$Signal(type, ...values);
}
