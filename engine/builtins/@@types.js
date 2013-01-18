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


const MISSING = $$CreateInternalObject();

const ENUMERABLE   = 0x1,
      CONFIGURABLE = 0x2,
      WRITABLE     = 0x4,
      ACCESSOR     = 0x8;

// #########################################
// ##### 8.1 ECMAScript Language Types #####
// #########################################


// ################################
// ### 8.1.1 The Undefined Type ###
// ################################

export const undefined = void 0;


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


// ########################################################
// ### 8.2.5 The Property Descriptor Specification Type ###
// ########################################################


const Descriptor = $$CreateInternalObject();
$$Set(Descriptor, '_type', 'Descriptor');
$$Set(Descriptor, 'Configurable', MISSING);
$$Set(Descriptor, 'Enumerable', MISSING);
$$Set(Descriptor, 'Writable', MISSING);
$$Set(Descriptor, 'Value', MISSING);
$$Set(Descriptor, 'Set', MISSING);
$$Set(Descriptor, 'Get', MISSING);

const defaults = $$CreateInternalObject(Descriptor);
$$Set(defaults, 'Configurable', false);
$$Set(defaults, 'Enumerable', false);
$$Set(defaults, 'Writable', false);
$$Set(defaults, 'Value', undefined);
$$Set(defaults, 'Set', undefined);
$$Set(defaults, 'Get', undefined);

// Data Descriptors
const DataDescriptor = $$CreateInternalObject(Descriptor);
$$Set(DataDescriptor, '_attrs', 0);

export function createDataDescriptor(value, writable, enumerable, configurable){
  const desc = $$CreateInternalObject(DataDescriptor);
  let attrs = 0;

  if (configurable !== MISSING) {
    if (configurable = !!(configurable)) {
      attrs |= CONFIGURABLE;
    }
    $$Set(desc, 'Configurable', configurable);
  }

  if (enumerable !== MISSING) {
    if (enumerable = !!(enumerable)) {
      attrs |= ENUMERABLE;
    }
    $$Set(desc, 'Enumerable', !!(enumerable));
  }

  if (writable !== MISSING) {
    if (writable = !!(writable)) {
      writable |= WRITABLE;
    }
    $$Set(desc, 'Writable', !!(writable));
  }

  if (value !== MISSING) {
    $$Set(desc, 'Value', value);
  }

  $$Set(desc, 'attrs', attrs);
  return desc;
}

// Accessor Descriptors
const AccessorDescriptor = $$CreateInternalObject(Descriptor);
$$Set(DataDescriptor, '_attrs', ACCESSOR);

export function createAccessorDescriptor(get, set, enumerable, configurable){
  const desc = $$CreateInternalObject(AccessorDescriptor);
  let attrs = ACCESSOR;

  if (configurable !== MISSING) {
    if (configurable = ToBoolean(configurable)) {
      attrs |= CONFIGURABLE;
    }
    $$Set(desc, 'Configurable', configurable);
  }

  if (enumerable !== MISSING) {
    if (enumerable = ToBoolean(enumerable)) {
      attrs |= ENUMERABLE;
    }
    $$Set(desc, 'Enumerable', enumerable);
  }

  if (get !== MISSING) {
    $$Set(desc, 'Set', get);
  }

  if (set !== MISSING) {
    $$Set(desc, 'Get', set);
  }

  $$Set(desc, 'attrs', attrs);
  return desc;
}

const normal = createDataDescriptor(undefined, true, true, true);

function defineNormal(obj, key, value){
  $$Set(normal, 'Value', value);
  const result = OrdinaryDefineOwnProperty(obj, key, normal);
  $$Set(normal, 'Value', undefined);
  return result;
}


// ################################
// # 8.2.5.1 IsAccessorDescriptor #
// ################################

function isMissing(Desc, field){
  return $$Get(Desc, 'Get') === MISSING;
}

export function IsAccessorDescriptor(Desc){
  return Desc !== undefined && !isMissing(Desc, 'Get') || !isMissing(Desc, 'Set');
}

// ################################
// # 8.2.5.2 IsAccessorDescriptor #
// ################################

export function IsDataDescriptor(Desc){
  return Desc !== undefined && !isMissing(Desc, 'Value') || !isMissing(Desc, 'Writable');
}

// ###############################
// # 8.2.5.3 IsGenericDescriptor #
// ###############################

export function IsGenericDescriptor(Desc){
  return Desc !== undefined && !(IsAccessorDescriptor(Desc) || IsDataDescriptor(Desc));
}

// ##################################
// # 8.2.5.4 FromPropertyDescriptor #
// ##################################

function isEmptyOrdinaryObject(obj){
  return true;
}

export function FromPropertyDescriptor(Desc){
  if (Desc === undefined) {
    return undefined;
  } else if ($$Has(Desc, 'Origin')) {
    return $$Get(Desc, 'Origin');
  }

  const obj = ObjectCreate();
  $$Assert(isOrdinaryEmptyObject(obj));

  if ($$Has(Desc, 'Value')) {
    defineNormal(obj, 'value', $$Get(Desc, 'Value'));
  }
  if ($$Has(Desc, 'Writable')) {
    defineNormal(obj, 'writable', $$Get(Desc, 'Writable'));
  }
  if ($$Has(Desc, 'Get')) {
    defineNormal(obj, 'get', $$Get(Desc, 'Get'));
  }
  if ($$Has(Desc, 'Set')) {
    defineNormal(obj, 'set', $$Get(Desc, 'Set'));
  }
  if ($$Has(Desc, 'Enumerable')) {
    defineNormal(obj, 'enumerable', $$Get(Desc, 'Enumerable'));
  }
  if ($$Has(Desc, 'Configurable')) {
    defineNormal(obj, 'configurable', $$Get(Desc, 'Configurable'));
  }

  return obj;
}



// ################################
// # 8.2.5.5 ToPropertyDescriptor #
// ################################

function getOrMissing(Obj, key){
  return HasProperty(Obj, key) ? Get(Obj, key) : MISSING;
}

export function ToPropertyDescriptor(Obj){
  if (Type(Obj) !== 'Object') {
    throw $$Exception(); // TODO
  }

  let enumerable   = getOrMissing(Obj, 'enumerable'),
      configurable = getOrMissing(Obj, 'configurable'),
      value        = getOrMissing(Obj, 'value'),
      writable     = getOrMissing(Obj, 'writable'),
      getter       = getOrMissing(Obj, 'get'),
      setter       = getOrMissing(Obj, 'set');

  if (getter !== MISSING || setter !== MISSING) {
    if (value !== MISSING || writable !== MISSING) {
      throw $$Exception(); // TODO
    }
    if (getter !== MISSING && getter !== undefined && !IsCallable(getter)) {
      throw $$Exception(); // TODO
    }
    if (setter !== MISSING && setter !== undefined && !IsCallable(setter)) {
      throw $$Exception(); // TODO
    }
    var desc = createAccessorDescriptor(get, set, enumerable, configurable);
  } else {
    var desc = createDataDescriptor(value, writable, enumerable, configurable);
  }

  $$Set(desc, 'Origin', obj);
  return desc;
}


// ######################################
// # 8.2.5.6 CompletePropertyDescriptor #
// ######################################

function copy(Desc, LikeDesc, field){
  if (!$$Has(Desc, field)) {
    $$Set(Desc, field, $$Get(LikeDesc, field));
  }
}

export function CompletePropertyDescriptor(Desc, LikeDesc){
  $$Assert(LikeDesc === undefined || $$Get(LikeDesc, '_type') === 'Descriptor');
  $$Assert($$Get(Desc, '_type') === 'Descriptor');

  if (LikeDesc === undefined) {
    LikeDesc = defaults;
  }

  if (IsGenericDescriptor(Desc) || IsDataDescriptor(Desc)) {
    copy(Desc, LikeDesc, 'Value');
    copy(Desc, LikeDesc, 'Writable');
  } else {
    copy(Desc, LikeDesc, 'Get');
    copy(Desc, LikeDesc, 'Set');
  }

  copy(Desc, LikeDesc, 'Enumerable');
  copy(Desc, LikeDesc, 'Configurable');
  return Desc;
}


export function ObjectCreate(proto){
  if (!$$ArgumentCount()) {
    proto = $$GetIntrinsic($$CurrentRealm(), 'ObjectPrototype');
  }
  return $$CreateObject('Object', proto);
}


// ###########################################
// # 11.2.2.3 ArrayCreate Abstract Operation #
// ###########################################

export function ArrayCreate(length){
  return $$CreateArray($$CurrentRealm(), length);
}
