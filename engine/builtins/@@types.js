// #######################
// ####### 8 Types #######
// #######################


import {
  $$ArgumentCount,
  $$CreateObject,
  $$CreateInternalObject,
  $$CurrentRealm,
  $$Get,
  $$GetIntrinsic,
  $$HasArgument,
  $$Set
} from '@@internals';

import {
  toBoolean
} from '@@utilities';


// #########################################
// ##### 8.1 ECMAScript Language Types #####
// #########################################


// ################################
// ### 8.1.1 The Undefined Type ###
// ################################

let und;
export const undefined = und;


// ###########################
// ### 8.1.2 The Null Type ###
// ###########################

// null


// ##############################
// ### 8.1.3 The Boolean Type ###
// ##############################

// true
// false


// #############################
// ### 8.1.4 The String Type ###
// #############################

// #############################
// ### 8.1.5 The Number Type ###
// #############################

export const NaN = +'NaN';
export const Infinity = 1 / 0;



// #############################
// ### 8.1.6 The Object Type ###
// #############################

// ###############################
// # 8.1.6.1 Property Attributes #
// ###############################

const descriptorTypes = $$CreateInternalObject();

const Descriptor = $$CreateInternalObject();
$$Set(Descriptor, '_type', 'Descriptor');
$$Set(descriptorTypes, 'Descriptor', Descriptor);


// Data Descriptors
const DataDescriptor = $$CreateInternalObject(Descriptor);
$$Set(DataDescriptor, '_type', 'DataDescriptor');
$$Set(descriptorTypes, 'DataDescriptor', DataDescriptor);

export function createDataDescriptor(value, writable, enumerable, configurable){
  const desc = $$CreateInternalObject(DataDescriptor);
  $$Set(desc, 'Configurable', configurable || false);
  $$Set(desc, 'Enumerable', enumerable || false);
  $$Set(desc, 'Writable', writable || false);
  $$Set(desc, 'Value', value);
  return desc;
}

// Accessor Descriptors
const AccessorDescriptor = $$CreateInternalObject(Descriptor);
$$Set(AccessorDescriptor, '_type', 'AccessorDescriptor');
$$Set(descriptorTypes, 'AccessorDescriptor', AccessorDescriptor);

export function createAccessorDescriptor(get, set, enumerable, configurable){
  const desc = $$CreateInternalObject(AccessorDescriptor);
  $$Set(desc, 'Configurable', configurable || false);
  $$Set(desc, 'Enumerable', enumerable || false);
  $$Set(desc, 'Set', set);
  $$Set(desc, 'Get', get);
  return desc;
}

export function copyDescriptor(desc){
  const DescType = $$Get(descriptorTypes, $$Get(desc, '_type'));
  const copy = $$CreateInternalObject(DescType);

  $$Set(copy, 'Configurable', $$Get(desc, 'Configurable'));
  $$Set(copy, 'Writable', $$Get(desc, 'Writable'));

  if (DescType === DataDescriptor) {
    $$Set(copy, 'Enumerable', $$Get(desc, 'Enumerable'));
    $$Set(copy, 'Value', $$Get(desc, 'Value'));
  } else if (DescType === AccessorDescriptor) {
    $$Set(copy, 'Get', $$Get(desc, 'Get'));
    $$Set(copy, 'Set', $$Get(desc, 'Set'));
  }

  return copy;
}


export function isPrimitive(value){
  switch (typeof value) {
    case 'undefined':
    case 'string':
    case 'number':
    case 'boolean':
      return true;
    default:
      return value === null;
  }
}

export function Type(value){
  switch (typeof value) {
    case 'object':
      return value === null ? 'Null' : 'Object';
    case 'undefined':
      return 'Undefined';
    case 'function':
      return 'Object';
    case 'string':
      return 'String';
    case 'number':
      return 'Number';
    case 'boolean':
      return 'Boolean';
  }
}

function GetInheritance(){}
function SetInheritance(){}
function IsExtensible(){}
function PreventExtensions(){}
function HasOwnProperty(){}
function GetOwnProperty(){}
function GetP(){}
function SetP(){}
function Delete(){}
function DefineOwnProperty(){}
function Enumerate(){}
function Keys(){}
function OwnPropertyKeys(){}
function Freeze(){}
function Seal(){}
function IsFrozen(){}
function IsSealed(){}

function Call(){}
function Construct(){}



// #############################################
// # 8.1.6.3 Well-Known Symbols and Intrinsics #
// #############################################
/*
@@create
@@hasInstance
@@iterator
@@ToPrimitive
@@toStringTag


'%Object%'
'%ObjectPrototype%'
'%ObjProto_toString%'
'%Function%'
'%FunctionPrototype%'
'%Array%'
'%ArrayPrototype%'
'%ArrayIteratorPrototype%'
'%Map%'
'%MapPrototype%'
'%MapIteratorPrototype%'
'%WeakMap%'
'%WeakMapPrototype%'
'%Set%'
'%SetPrototype%'
'%SetIteratorPrototype%'
'%StopIteration%'
*/
// ####################################################
// ### 8.2.2 The List and Record Specification Type ###
// ####################################################


// ######################################################
// ### 8.2.3 The Completion Record Specification Type ###
// ######################################################

const empty = $$CreateInternalObject();

const CompletionRecord = $$CreateInternalObject();
$$Set(CompletionRecord, '_type', 'CompletionRecord');
$$Set(CompletionRecord, 'type', 'normal');
$$Set(CompletionRecord, 'value', undefined);
$$Set(CompletionRecord, 'target', empty);

export function createCompletionRecord(type, value, target = empty){
  const completion = $$CreateInternalObject(CompletionRecord);
  $$Set(completion, 'type', type);
  $$Set(completion, 'value', value);
  $$Set(completion, 'target', target);
  return completion;
}


// ############################
// # 8.2.3.1 NormalCompletion #
// ############################

const emptyCompletion = createCompletionRecord('normal');

export function NormalCompletion(argument){
  const completion = $$CreateInternalObject(emptyCompletion);
  $$Set(completion, 'value', argument);
  return completion;
}


// ##############################
// # 8.2.3.3 Throw an Exception #
// ##############################

const thrownCompletion = createCompletionRecord('throw');

export function ThrowAnException(argument){
  const completion = $$CreateInternalObject(thrownCompletion);
  $$Set(completion, 'value', argument);
  throw completion;
}


// ##########################
// # 8.2.3.4 ReturnIfAbrupt #
// ##########################

export function ReturnIfAbrupt(argument){
  if (argument && $$Get(argument, '_type') === 'CompletionRecord') {
    if ($$Get(argument, 'type') !== 'normal') {
      throw argument;
    }
    return $$Get(argument, 'value');
  }
  return argument;
}


// ##############################################
// ### 8.2.4 The Reference Specification Type ###
// ##############################################

const Reference = $$CreateInternalObject();
$$Set(Reference, '_type', 'Reference');
$$Set(Reference, 'base', undefined);
$$Set(Reference, 'name', '');
$$Set(Reference, 'strict', false);
$$Set(Reference, 'thisValue', undefined);



// ##############################################
// ### 8.3.18 ObjectCreate Abstract Operation ###
// ##############################################

export function ObjectCreate(proto){
  if (!$$ArgumentCount()) {
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

