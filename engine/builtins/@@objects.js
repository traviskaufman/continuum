// ##############################################
// ##### 11 Internal Methods and Properties #####
// ##############################################

import {
  $$ArgumentCount,
  $$CreateArray,
  $$CreateObject,
  $$CreateInternalObject,
  $$CurrentRealm,
  $$Get,
  $$GetPropertyAttribute,
  $$GetPropertyValue,
  $$GetIntrinsic,
  $$HasArgument,
  $$Set,
  $$SetPropertyAttribute,
  $$SetPropertyValue
} from '@@internals';

import {
  createAccessorDescriptor,
  createDataDescriptor,
  Type
} from '@@types';

const E = 0x1,
      C = 0x2,
      W = 0x4,
      A = 0x8,
      ___ = 0,
      E__ = E,
      _C_ = C,
      EC_ = E | C,
      __W = W,
      E_W = E | W,
      _CW = C | W,
      ECW = E | C | W,
      __A = A,
      E_A = E | A,
      _CA = C | A,
      ECA = E | C | A;


// ##########################################################################
// ### 11.1 Ordinary Object Internal Methods and Internal Data Properties ###
// ##########################################################################

const OrdinaryObject = $$CreateInternalObject();


// #############################
// # 11.1.1 [[GetInheritance]] #
// #############################

$$Set(OrdinaryObject, function GetInheritance(){
  return $$Get(this, 'Prototype');
});


// #############################
// # 11.1.2 [[SetInheritance]] #
// #############################

$$Set(OrdinaryObject, function SetInheritance(V){
  $$Assert(Type(V) === 'Object' || Type(V) === 'Null');

  if (!$$Get(this, 'Extensible')) {
    return false;
  }

  $$Set(this, 'Prototype', V);
  return true;
});


// ###########################
// # 11.1.3 [[IsExtensible]] #
// ###########################

$$Set(OrdinaryObject, function IsExtensible(){
  return $$Get(this, 'Extensible');
});


// ################################
// # 11.1.4 [[PreventExtensions]] #
// ################################

$$Set(OrdinaryObject, function PreventExtensions(){
  $$Set(this, 'Extensible', false);
});


// #############################
// # 11.1.5 [[HasOwnProperty]] #
// #############################

$$Set(OrdinaryObject, function HasOwnProperty(P){
  $$Assert(IsPropertyKey(P));
  return $$HasProperty(this, P);
});


// #############################
// # 11.1.6 [[GetOwnProperty]] #
// #############################

$$Set(OrdinaryObject, function GetOwnProperty(P){
  $$Assert(IsPropertyKey(P));
  return OrdinaryGetOwnProperty(this, P);
});


// 11.1.6.1 OrdinaryGetOwnProperty

export function OrdinaryGetOwnProperty(O, P){
  $$Assert(IsPropertyKey(P));

  if (!$$HasProperty(O, P)) {
    return undefined;
  }

  const attr = $$GetPropertyAttribute(O, P),
        val  = $$GetPropertyValue(O, P);

  if (attr & A) {
    return createAccessorDescriptor($$Get(val, 'Get'), $$Get(val, 'Set'), attr & E, attr & C);
  }

  return createDataDescriptor(val, attr & W, attr & E, attr & C);
}


// ################################
// # 11.1.7 [[DefineOwnProperty]] #
// ################################

$$Set(OrdinaryObject, function DefineOwnProperty(P, Desc){;
  return OrdinaryDefineOwnProperty(this, P, Desc);
});


// 11.1.7.1 OrdinaryDefineOwnProperty

export function OrdinaryDefineOwnProperty(O, P, Desc){
  const current    = OrdinaryGetOwnProperty(O, P),
        extensible = $$Get(O, 'Extensible');

  return ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current);
}


// 11.1.7.2 IsCompatiblePropertyDescriptor

export function IsCompatiblePropertyDescriptor(Extensible, Desc, Current) {
  return ValidateAndApplyPropertyDescriptor(undefined, undefined, Extensible, Desc, Current);
}


// 11.1.7.3 ValidateAndApplyPropertyDescriptor

function attributesFromDescriptor(Desc){
  if ($$Has(Desc, 'attrs')) {
    return $$Get(Desc, 'attrs');
  }

  if ($$Has(Desc, 'Get') || $$Has(Desc, 'Set')) {
    $$Assert(!$$Has(Desc, 'Value') && !$$Has(Desc, 'Writable'));
    return $$Get(Desc, 'Enumerable') | ($$Get(Desc, 'Configurable') << 1) | 8;
  }
  return $$Get(Desc, 'Enumerable') | ($$Get(Desc, 'Configurable') << 1) | ($$Get(Desc, 'Writable') << 2);
}

const Accessor = $$CreateInternalObject();
$$Set(Accessor, '_type', 'Accessor');
$$Set(Accessor, 'Get', undefined);
$$Set(Accessor, 'Set', undefined);

function createAccessor(Desc){
  const accessor = $$CreateInternalObject(Accessor);
  $$Set(accessor, 'Get', $$Get(Desc, 'Get'));
  $$Set(accessor, 'Set', $$Get(Desc, 'Set'));
  return accessor;
}

function same(a, b, field){
  return SameValue($$Get(a, field), $$Get(b, field));
}

export function ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current){
  $$Assert(O === undefined || IsPropertyKey(P));


  // New property
  if (current === undefined) {
    if (!extensible) {
      return false;
    }

    $$Assert(extensible === true);

    if (O !== undefined) {
      if (IsGenericDescriptor(Desc) || IsDataDescriptor(Desc)) {
        $$CreateProperty(O, P, $$Get(Desc, 'Value'), attributesFromDescriptor(Desc));
      } else {
        $$CreateProperty(O, P, createAccessor(Desc), attributesFromDescriptor(Desc));
      }

      if ($$Has(O, 'Notifier')) {
        const changeObservers = $$Get($$Get(O, 'Notifier'), 'ChangeObservers');
        if ($$Get(changeObservers, 'size')) {
          EnqueueChangeRecord(CreateChangeRecord('new', O, P), changeObservers);
        }
      }
    }

    return true;
  }


  // Empty Descriptor
  if (!($$Has(Desc, 'Get') || $$Has(Desc, 'Set') || $$Has(Desc, 'Value'))) {
    if (!($$Has(Desc, 'Writable') || $$Has(Desc, 'Configurable') || $$Has(Desc, 'Enumerable'))) {
      return true;
    }
  }

  //Equal Descriptor
  if (same(Desc, current, 'Value') && same(Desc, current, 'Get') && same(Desc, current, 'Set')) {
    if (same(Desc, current, 'Writable') && same(Desc, current, 'Enumerable') && same(Desc, current, 'Configurable')) {
      return true;
    }
  }

  let changeType = 'reconfigured';

  if ($$Get(current, 'Configurable') === false) {
    if ($$Get(Desc, 'Configurable')) {
      return false;
    }
    if ($$Has(Desc, 'Enumerable') && !same(Desc, current, 'Enumerable')) {
      return false;
    }
  }
/*
  if (!IsGenericDescriptor(Desc)) {
    if (IsDataDescriptor(current) !== IsDataDescriptor(Desc)) {
      if ($$Get(current, 'Configurable') === false) {
        return false;
      }

      if (IsDataDescriptor(current)) {
        if (O !== undefined) {

        }
      }
    }

    if (currentIsData && descIsData) {

    if (currentIsData) {
      if (!$$Get(current, 'Writable') && $$Has(Desc, 'Value') && !same(Desc, current, 'Value')) {
        return false;
      }
    } else if ($$Has(Desc, 'Set') && !same(Desc, current, 'Set')) {
      return false;
    } else if ($$Has(Desc, 'Get') && !same(Desc, current, 'Get')) {
      return false;
    }
  }

  if (O === undefined) {
    return true;
  }

  'Configurable' in Desc || (Desc.Configurable = current.Configurable);
  'Enumerable' in Desc || (Desc.Enumerable = current.Enumerable);

  if (IsAccessorDescriptor(Desc)) {
    O.update(P, Desc.Enumerable | (Desc.Configurable << 1) | 8);
    if (IsDataDescriptor(current)) {
      O.set(P, new Accessor(Desc.Get, Desc.Set));
    } else {
      var accessor = current.getAccessor();
      'Set' in Desc && (accessor.Set = Desc.Set);
      'Get' in Desc && (accessor.Get = Desc.Get);
      ('Set' in Desc || 'Get' in Desc) && O.set(P, accessor);
    }
  } else {
    if (IsAccessorDescriptor(current)) {
      current.Writable = true;
    }
    'Writable' in Desc || (Desc.Writable = current.Writable);
    O.update(P, Desc.Enumerable | (Desc.Configurable << 1) | (Desc.Writable << 2));
    if ('Value' in Desc) {
      O.set(P, Desc.Value);
      changeType = 'updated';
    }
  }

  if (O.Notifier) {
    var changeObservers = O.Notifier.ChangeObservers;
    if (changeObservers.size) {
      var record = $$CreateChangeRecord(changeType, O, P, current);
      $$EnqueueChangeRecord(record, changeObservers);
    }
  }

  return true;*/
}



// ###########################################
// # 11.1.18 ObjectCreate Abstract Operation #
// ###########################################

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
