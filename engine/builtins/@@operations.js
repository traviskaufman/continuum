// #####################################
// ####### 9 Abstract Operations #######
// #####################################


import {
  abs,
  floor,
  sign,
  hasBuiltinBrand,
  call
} from '@@utilities';

import {
  Type,
  ObjectCreate,
  ArrayCreate
} from '@@types';

import {
  $$CallInternal,
  $$CreateObject,
  $$CreateInternalObject,
  $$CurrentRealm,
  $$Exception,
  $$GetInternal,
  $$GetIntrinsic,
  $$HasArgument,
  $$HasInternal,
  $$StringToNumber,
  $$SetInternal
} from '@@internals';

import {
  @@ToPrimitive: ToPrimitive
} from '@@symbols';



// ###########################################
// ##### 9.1 Type Conversion and Testing #####
// ###########################################

// #########################
// ### 9.1.1 ToPrimitive ###
// #########################


export function ToPrimitive(argument, PreferredType){
  if (Type(argument) !== 'Object') {
    return argument;
  }

  let hint;
  if (!$$HasArgument('PreferredType')) {
    hint = 'default';
  } else if (PreferredType === 'String') {
    hint = 'string';
  } else {
    hint = 'number';
  }

  const exoticToPrim = Get(argument, @@ToPrimitive);
  if (exoticToPrim !== undefined) {
    if (!IsCallable(exoticToPrim)) {
      throw $$Exception('cannot_convert_to_primitive', []);
    }
    const result = call(exoticToPrim, argument);
    if (Type(result) !== 'Object') {
      return result;
    } else {
      throw $$Exception('cannot_convert_to_primitive', []);
    }
  }

  if (hint === 'default') {
    hint = 'number';
  }

  return OrdinaryToPrimitive(argument, hint);
}

export function OrdinaryToPrimitive(O, hint){
  // Assert: Type(O) is Object
  // Assert: Type(hint) is String and its value is either "string" or "number"
  let tryFirst, trySecond;

  if (hint === 'string') {
    tryFirst = 'toString';
    trySecond = 'valueOf';
  } else {
    tryFirst = 'valueOf';
    trySecond = 'toString';
  }

  const first = Get(O, tryFirst);
  if (IsCallable(first)) {
    const result = call(first, O);
    if (Type(result) !== 'Object') {
      return result;
    }
  }

  const second = Get(O, trySecond);
  if (IsCallable(second)) {
    const result = call(second, O);
    if (Type(result) !== 'Object') {
      return result;
    }
  }

  throw $$Exception('cannot_convert_to_primitive', []);
}

// #######################
// ### 9.1.2 ToBoolean ###
// #######################

export function ToBoolean(argument){
  switch (Type(argument)) {
    case 'Boolean':
      return argument;
    case 'Undefined':
    case 'Null':
      return false;
    case 'Number':
      return argument !== 0 && argument === argument;
    case 'String':
      return argument !== '';
    case 'Object':
      return true;
  }
}


// ######################
// ### 9.1.3 ToNumber ###
// ######################

export function ToNumber(argument){
  switch (Type(argument)) {
    case 'Number':
      return argument;
    case 'Undefined':
      return NaN;
    case 'Null':
      return 0;
    case 'Boolean':
      return argument === true ? 1 : 0;
    case 'String':
      return $$StringToNumber(argument);
    case 'Object':
      return ToNumber(ToPrimitive(argument), 'Number');
  }
}

// #######################
// ### 9.1.4 ToInteger ###
// #######################

export function ToInteger(argument){
  const number = ToNumber(argument);

  if (isNaN(number)) {
    return 0;
  }

  if (number === 0 || number === Infinity || number === -Infinity) {
    return number;
  }

  return sign(number) * floor(abs(number));
}


// #####################
// ### 9.1.5 ToInt32 ###
// #####################

export function ToInt32(argument){
  const number = ToNumber(argument);
  if (number === 0 || number !== number || number === Infinity || number === -Infinity) {
    return 0;
  }

  const int = sign(number) * floor(abs(number));
        int32bit = int % 0x100000000;

  if (int32bit >= 0x80000000) {
    return int32bit - 0x80000000;
  }
  return int32bit;
}


// ######################
// ### 9.1.6 ToUint32 ###
// ######################

export function ToUint32(argument){
  const number = ToNumber(argument);
  if (number === 0 || number !== number || number === Infinity || number === -Infinity) {
    return 0;
  }

  return (sign(number) * floor(abs(number))) % 0x100000000;
}


// ######################
// ### 9.1.7 ToUint16 ###
// ######################

export function ToUint16(argument){
  const number = ToNumber(argument);
  if (number === 0 || number !== number || number === Infinity || number === -Infinity) {
    return 0;
  }

  return (sign(number) * floor(abs(number))) % 0x10000;
}


// ######################
// ### 9.1.8 ToString ###
// ######################

export function ToString(argument){
  switch (Type(argument)) {
    case 'String':
      return argument;
    case 'Undefined':
      return 'undefined';
    case 'Number':
      return $$CallInternal(argument, 'toString');
    case 'Null':
      return 'null';
    case 'Boolean':
      return argument === true ? 'true' : 'false';
    case 'Object':
      return ToString(ToPrimitive(argument, 'String'));
  }
}


// ######################
// ### 9.1.9 ToObject ###
// ######################

export function ToObject(argument){
  const type = Type(argument);
  switch (type) {
    case 'Object':
      return argument;
    case 'Undefined':
      throw $$Exception('undefined_to_object', []);
    case 'Null':
      throw $$Exception('null_to_object', []);
    case 'Boolean':
    case 'Number':
    case 'String':
      return $$CreateObject(type, argument);
  }
}


// ############################
// ### 9.1.10 ToPropertyKey ###
// ############################

export function ToPropertyKey(argument){
  if (!argument) {
    return argument + '';
  }

  const type = Type(argument);
  if (type === 'String' || type === 'Object' && hasBuiltinBrand(argument, 'BuiltinSymbol')) {
    return argument;
  }
  return ToString(argument);
}



// #############################################
// ### 9.2 Testing and Comparison Operations ###
// #############################################


// ##################################
// ### 9.2.1 CheckObjectCoercible ###
// ##################################

export function CheckObjectCoercible(argument){
  if (argument === null) {
    throw $$Exception('null_to_object', []);
  } else if (argument === undefined) {
    throw $$Exception('undefined_to_object', []);
  }
  return argument;
}

// ########################
// ### 9.2.2 IsCallable ###
// ########################

export function IsCallable(argument){
  return Type(argument) === 'Object' && $$HasInternal(argument, 'Call');
}


// #######################
// ### 9.2.3 SameValue ###
// #######################

export function SameValue(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
}


// ###########################
// ### 9.2.4 IsConstructor ###
// ###########################

export function IsConstructor(argument){
  return Type(argument) === 'Object' && $$HasInternal(argument, 'Construct');
}

// ###########################
// ### 9.2.5 IsPropertyKey ###
// ###########################

export function IsPropertyKey(argument){
  const type = Type(argument);
  return type === 'String' || type === 'Object' && hasBuiltinBrand(argument, 'BuiltinSymbol');
}




// #################################
// ### 9.3 Operations on Objects ###
// #################################


// #################
// ### 9.3.1 Get ###
// #################

export function Get(O, P){
  // Assert: Type(O) is Object.
  // Assert: IsPropertyKey(P) is true.
  return $$CallInternal(O, 'GetP', [O, P]);
}


// #################
// ### 9.3.2 Put ###
// #################

export function Put(O, P, V, Throw){
  // Assert: Type(O) is Object.
  // Assert: IsPropertyKey(P) is true.
  // Assert: Type(Throw) is Boolean.
  const success = $$CallInternal(O, 'SetP', [O, P, V]);
  if (Throw && !success) {
    throw $$Exception('strict_cannot_assign', [P]);
  }
  return success;
}


// ###################################
// ### 9.3.3 CreateOwnDataProperty ###
// ###################################

const normalDescriptor = $$CreateInternalObject();
$$SetInternal(normalDescriptor, 'Writable', true);
$$SetInternal(normalDescriptor, 'Enumerable', true);
$$SetInternal(normalDescriptor, 'Configurable', true);

export function CreateOwnDataProperty(O, P, V){
  // Assert: Type(O) is Object.
  // Assert: IsPropertyKey(P) is true.
  // Assert: O does not have an own property whose key is P.
  const extensible = $$CallInternal(O, 'IsExtensible');
  if (!extensible) {
    return extensible;
  }
  $$SetInternal(normalDescriptor, 'Value', V);
  const result = $$CallInternal(O, 'DefineOwnProperty', [P, normalDescriptor]);
  $$SetInternal(normalDescriptor, 'Value', undefined);
  return result;
}


// ###################################
// ### 9.3.4 DefinePropertyOrThrow ###
// ###################################

export function DefinePropertyOrThrow(O, P, desc){
  // Assert: Type(O) is Object.
  // Assert: IsPropertyKey(P) is true.
  const success = $$CallInternal(O, 'DefineOwnProperty', [P, desc]);
  if (!success) {
    throw $$Exception('redefine_disallowed', [P]);
  }
  return success;
}

// ###################################
// ### 9.3.5 DeletePropertyOrThrow ###
// ###################################

export function DeletePropertyOrThrow(O, P){
  // Assert: Type(O) is Object.
  // Assert: IsPropertyKey(P) is true.
  const success = $$CallInternal(O, 'Delete', [P]); // TODO: rename to DeleteProperty
  if (!success) {
    throw $$Exception('strict_delete_property', [P, Type(O)]);
  }
  return success;
}


// #########################
// ### 9.3.6 HasProperty ###
// #########################

export function HasProperty(O, P){
  // Assert: Type(O) is Object.
  // Assert: IsPropertyKey(P) is true.
  return $$CallInternal(O, 'HasProperty', [P]);
}


// #######################
// ### 9.3.7 GetMethod ###
// #######################

export function GetMethod(O, P){
  // Assert: Type(O) is Object.
  // Assert: IsPropertyKey(P) is true.
  const func = $$CallInternal(O, 'GetP', [O, P]);
  if (func === undefined) {
    return func;
  }

  if (!IsCallable(func)) {
    throw $$Exception('property_not_function', [P]);
  }

  return func;
}


// ####################
// ### 9.3.8 Invoke ###
// ####################

const emptyArgs = [];

export function Invoke(O, P, args){
  // Assert: P is a valid property key.
  args || (args = emptyArgs);

  const obj  = ToObject(O),
        func = GetMethod(obj, P);

  if (func === undefined) {
    throw $$Exception('property_not_function', [P]);
  }

  return $$CallInternal(func, 'Call', [O, $$GetInternal(args, 'array')]);
}

// ################################
// ### 9.3.9 TestIfSecureObject ###
// ################################

function TestIfSecureObject(O, immutable){}


// ###############################
// ### 9.3.10 MakeObjectSecure ###
// ###############################

function MakeObjectSecure(O, immutable){}


// ##################################
// ### 9.3.11 CreateArrayFromList ###
// ##################################

function CreateArrayFromList(elements){
  // Assert: elements is a List whose elements are all ECMAScript language values.
  const array = ArrayCreate(0),
        len   = $$GetInternal(elements, 'length');

  for (var n=0; n < len; n++) {
    CreateOwnDataProperty(array, ToString(n), $$GetInternal(elements, n));
    // Assert: the call to CreateOwnDataProperty will never throw
  }

  return array;
}


// ##################################
// ### 9.3.12 OrdinaryHasInstance ###
// ##################################

export function OrdinaryHasInstance(C, O){
  if (!IsCallable(C)) {
    return false;
  }

  if ($$HasInternal(C, 'BoundTargetFunction')) {
    return O instanceof $$GetInternal(C, 'BoundTargetFunction');
  }

  if (Type(O) !== 'Object') {
    return false;
  }

  const P = Get(C, 'prototype');
  if (Type(P) !== 'Object') {
    throw $$Exception('instanceof_nonobject_proto');
  }

  do {
    O = $$CallInternal(O, 'GetInheritance');
    if (O === P) {
      return true;
    }
  } while (O)

  return false;
}


// ############################################
// ### 9.3.13 OrdinaryCreateFromConstructor ###
// ############################################

export function OrdinaryCreateFromConstructor(constructor, intrinsicDefaultProto){
  if (Type(constructor) !== 'Object') {
    throw $$Exception('construct_non_constructor', [Type(constructor)]);
  }

  let proto = constructor.prototype;

  return ObjectCreate(Type(proto) === 'Object' ? proto : intrinsicDefaultProto);
}

//%Object%
//%ObjectPrototype%
//%ObjProto_toString%
//%Function%
//%FunctionPrototype%
//%Array%
//%ArrayPrototype%
//%ArrayIteratorPrototype%
//%Map%
//%MapPrototype%
//%MapIteratorPrototype%
//%WeakMap%
//%WeakMapPrototype%
//%Set%
//%SetPrototype%
//%SetIteratorPrototype%
//%StopIteration%
