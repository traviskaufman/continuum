import {
  builtinFunction
} from '@@utilities';

import {
  $$CreateUndetectable,
  $$CreateNil,
  $$Get,
  $$IsUndetectable
} from '@@internals';


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


export const nil = $$CreateNil();
