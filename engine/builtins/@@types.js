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


const CompletionRecord = $$CreateInternalObject();
$$Set(CompletionRecord, '_type', 'CompletionRecord');
$$Set(CompletionRecord, 'type', 'normal');
$$Set(CompletionRecord, 'value', undefined);
$$Set(CompletionRecord, 'target', MISSING);

export function createCompletionRecord(type, value, target = MISSING){
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

const descriptorDefaults = $$CreateInternalObject(Descriptor);
$$Set(descriptorDefaults, 'Configurable', false);
$$Set(descriptorDefaults, 'Enumerable', false);
$$Set(descriptorDefaults, 'Writable', false);
$$Set(descriptorDefaults, 'Value', undefined);
$$Set(descriptorDefaults, 'Set', undefined);
$$Set(descriptorDefaults, 'Get', undefined);

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

export function IsAccessorDescriptor(Desc){
  return Desc !== undefined && $$Get(Desc, 'Get') !== MISSING || $$Get(Desc, 'Set') !== MISSING;
}

// ################################
// # 8.2.5.2 IsAccessorDescriptor #
// ################################

export function IsDataDescriptor(Desc){
  return Desc !== undefined && $$Get(Desc, 'Value') !== MISSING || $$Get(Desc, 'Writable') !== MISSING;
}

// ###############################
// # 8.2.5.3 IsGenericDescriptor #
// ###############################

export function IsGenericDescriptor(Desc){
  return Desc !== undefined && !IsAccessorDescriptor(Desc) && !IsDataDescriptor(Desc);
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

export function ToPropertyDescriptor(Obj){
  if (Type(Obj) !== 'Object') {
    throw $$Exception(); // TODO desc must be object
  }

  const enumerable   = HasProperty(Obj, 'enumerable')   ? Get(Obj, 'enumerable')   : MISSING,
        configurable = HasProperty(Obj, 'configurable') ? Get(Obj, 'configurable') : MISSING,
        value        = HasProperty(Obj, 'value')        ? Get(Obj, 'value')        : MISSING,
        writable     = HasProperty(Obj, 'writable')     ? Get(Obj, 'writable')     : MISSING,
        getter       = HasProperty(Obj, 'get')          ? Get(Obj, 'get')          : MISSING,
        setter       = HasProperty(Obj, 'set')          ? Get(Obj, 'set')          : MISSING;

  let desc;

  if (getter !== MISSING || setter !== MISSING) {
    if (value !== MISSING || writable !== MISSING) {
      throw $$Exception(); // TODO accessor + data
    }
    if (getter !== MISSING && getter !== undefined && !IsCallable(getter)) {
      throw $$Exception(); // TODO non-callable getter
    }
    if (setter !== MISSING && setter !== undefined && !IsCallable(setter)) {
      throw $$Exception(); // TODO non-callable setter
    }
    desc = createAccessorDescriptor(get, set, enumerable, configurable);
  } else {
    desc = createDataDescriptor(value, writable, enumerable, configurable);
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

export function CompletePropertyDescriptor(Desc, LikeDesc = descriptorDefaults){
  $$Assert($$Get(LikeDesc, '_type') === 'Descriptor');
  $$Assert($$Get(Desc, '_type') === 'Descriptor');

  if (IsDataDescriptor(Desc) || IsGenericDescriptor(Desc)) {
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
