// #######################
// ####### 8 Types #######
// #######################

import {
  $$CreateObject,
  $$CurrentRealm,
  $$GetIntrinsic,
  $$HasArgument
} from '@@internals';



export function Type(argument){
  if (argument === null) {
    return 'Null';
  }
  switch (typeof argument) {
    case 'undefined': return 'Undefined';
    case 'function':
    case 'object':    return 'Object';
    case 'string':    return 'String';
    case 'number':    return 'Number';
    case 'boolean':   return 'Boolean';
  }
}


// ##############################################
// ### 8.3.18 ObjectCreate Abstract Operation ###
// ##############################################

export function ObjectCreate(proto){
  if (!$$HasArgument('proto')) {
    proto = $$GetIntrinsic($$CurrentRealm(), 'ObjectPrototype');
  }
  return $$CreateObject('Object', proto);
}


// ##############################################
// ### 8.4.2.3 ArrayCreate Abstract Operation ###
// ##############################################

export function ArrayCreate(len){
  return $$CreateObject('Array', len);
}

