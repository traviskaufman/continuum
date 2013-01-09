// ##############################################
// ##### 11 Internal Methods and Properties #####
// ##############################################

import {
  $$ArgumentCount,
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

$$Set(OrdinaryObject, 'GetInheritance', function(){
  return $$Get(this, 'Prototype');
});


// #############################
// # 11.1.2 [[SetInheritance]] #
// #############################

$$Set(OrdinaryObject, 'SetInheritance', function(V){
  $$Assert(Type(V) === 'Object' || Type(V) === 'Null');

  if (!$$Invoke(this, 'IsExtensible')) { // spec bug, https://bugs.ecmascript.org/show_bug.cgi?id=1191
    return false;
  }

  $$Set(this, 'Prototype', V);
  return true;
});


// ###########################
// # 11.1.3 [[IsExtensible]] #
// ###########################

$$Set(OrdinaryObject, 'IsExtensible', function(){;
  return $$Get(this, 'Extensible');
});


// ################################
// # 11.1.4 [[PreventExtensions]] #
// ################################

$$Set(OrdinaryObject, 'PreventExtensions', function(){;
  $$Set(this, 'Extensible', false);
});


// #############################
// # 11.1.5 [[HasOwnProperty]] #
// #############################

$$Set(OrdinaryObject, 'HasOwnProperty', function(P){;
  $$Assert(IsPropertyKey(P));
  return $$HasProperty(this, P);
});


// #############################
// # 11.1.6 [[GetOwnProperty]] #
// #############################

$$Set(OrdinaryObject, 'GetOwnProperty', function(P){;
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

$$Set(OrdinaryObject, 'DefineOwnProperty', function(P, Desc){;
  return OrdinaryDefineOwnProperty(this, P, Desc);
});


// 11.1.7.1 OrdinaryDefineOwnProperty

export function OrdinaryDefineOwnProperty(O, P, Desc){
  const current    = OrdinaryGetOwnProperty(O, P),
        extensible = $$Invoke(O, 'IsExtensible'); // spec bug, https://bugs.ecmascript.org/show_bug.cgi?id=1191

  return ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current);
}


// 11.1.7.2 IsCompatiblePropertyDescriptor

export function IsCompatiblePropertyDesriptor(Extensible, Desc, Current) {
  return ValidateAndApplyPropertyDescriptor(undefined, undefined, Extensible, Desc, Current);
}


// 11.1.7.3 ValidateAndApplyPropertyDescriptor

function attributesFromDescriptor(Desc){
}

export function ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current){
  $$Assert(O === undefined || IsPropertyKey(P));

  let changeType = 'reconfigured';

  // New property
  if (current === undefined) {
    if (!extensible) {
      return false;
    }

    $$Assert(extensible === true);

    if (IsGenericDescriptor(Desc) || IsDataDescriptor(Desc)) {
      if (O !== undefined) {
        $$CreateProperty(O, )
        create an own data property named P of object O whose [[Value]], [[Writable]], [[Enumerable]] and [[Configurable]] attribute values are described by Desc.
        If the value of an attribute field of Desc is absent, the attribute of the newly created property is set to its default value.
      }
    }

    if (O !== undefined) {
      if ($$IsGenericDescriptor(Desc) || $$IsDataDescriptor(Desc)) {
        O.define(P, Desc.Value, Desc.Enumerable | (Desc.Configurable << 1) | (Desc.Writable << 2));
      } else {
        O.define(P, new Accessor(Desc.Get, Desc.Set), Desc.Enumerable | (Desc.Configurable << 1) | 8);
      }

      if (O.Notifier) {
        var changeObservers = O.Notifier.ChangeObservers;
        if (changeObservers.size) {
          var record = $$CreateChangeRecord('new', O, P);
          $$EnqueueChangeRecord(record, changeObservers);
        }
      }
    }
    return extensible === true;
  }

  // Empty Descriptor
  if (!('Get' in Desc || 'Set' in Desc || 'Value' in Desc)) {
    if (!('Writable' in Desc || 'Enumerable' in Desc || 'Configurable' in Desc)) {
      return true;
    }
  }

  //Equal Descriptor
  if (Desc.Writable === current.Writable && Desc.Enumerable === current.Enumerable && Desc.Configurable === current.Configurable) {
    if (Desc.Get === current.Get && Desc.Set === current.Set && is(Desc.Value, current.Value)) {
      return true;
    }
  }

  if (!current.Configurable) {
    if (Desc.Configurable || 'Enumerable' in Desc && Desc.Enumerable !== current.Enumerable) {
      return false;
    } else {
      var currentIsData = $$IsDataDescriptor(current),
          DescIsData = $$IsDataDescriptor(Desc);

      if (currentIsData !== DescIsData) {
        return false;
      } else if (currentIsData && DescIsData) {
        if (!current.Writable && 'Value' in Desc && !is(Desc.Value, current.Value)) {
          return false;
        }
      } else if ('Set' in Desc && Desc.Set !== current.Set) {
        return false;
      } else if ('Get' in Desc && Desc.Get !== current.Get) {
        return false;
      }
    }
  }

  if (O === undefined) {
    return true;
  }

  'Configurable' in Desc || (Desc.Configurable = current.Configurable);
  'Enumerable' in Desc || (Desc.Enumerable = current.Enumerable);

  if ($$IsAccessorDescriptor(Desc)) {
    O.update(P, Desc.Enumerable | (Desc.Configurable << 1) | 8);
    if ($$IsDataDescriptor(current)) {
      O.set(P, new Accessor(Desc.Get, Desc.Set));
    } else {
      var accessor = current.getAccessor();
      'Set' in Desc && (accessor.Set = Desc.Set);
      'Get' in Desc && (accessor.Get = Desc.Get);
      ('Set' in Desc || 'Get' in Desc) && O.set(P, accessor);
    }
  } else {
    if ($$IsAccessorDescriptor(current)) {
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

  return true;
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

export function ArrayCreate(len){
  return $$CreateObject('Array', len);
}

