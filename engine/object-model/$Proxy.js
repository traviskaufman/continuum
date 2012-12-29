var $Proxy = (function(module){
  "use strict";
  var objects     = require('../lib/objects'),
      errors      = require('../errors'),
      constants   = require('./constants'),
      operators   = require('./operators'),
      descriptors = require('./descriptors'),
      operations  = require('./operations'),
      $Object     = require('./$Object').$Object,
      $Array      = require('./$Array');

  var inherit     = objects.inherit,
      is          = objects.is,
      define      = objects.define,
      isUndefined = constants.isUndefined,
      $$ToPropertyDescriptor          = descriptors.$$ToPropertyDescriptor,
      $$FromGenericPropertyDescriptor = descriptors.$$FromGenericPropertyDescriptor,
      $$CopyAttributes                = descriptors.$$CopyAttributes,
      $$IsDataDescriptor              = descriptors.$$IsDataDescriptor,
      $$IsAccessorDescriptor          = descriptors.$$IsAccessorDescriptor,
      $$ThrowException                = errors.$$ThrowException,
      $$ToBoolean                     = operators.$$ToBoolean,
      $$ToString                      = operators.$$ToString,
      $$ToUint32                      = operators.$$ToUint32,
      $$IsCallable                    = operations.$$IsCallable,
      $$GetMethod                     = operations.$$GetMethod,
      $$CreateListFromArray           = operations.$$CreateListFromArray,
      $$IsCompatibleDescriptor        = operations.$$IsCompatibleDescriptor;



  function $$TrapDefineOwnProperty(proxy, key, descObj, strict){
    var handler = proxy.ProxyHandler,
        target = proxy.ProxyTarget;

    var trap = $$GetMethod(handler, 'defineProperty');
    if (trap && trap.Abrupt) return trap;

    var normalizedDesc = $$ToPropertyDescriptor(descObj);


    if (trap === undefined) {
      return target.DefineOwnProperty(key, normalizedDesc, strict);
    } else {
      var normalizedDescObj = $$FromGenericPropertyDescriptor(normalizedDesc);
      $$CopyAttributes(descObj, normalizedDescObj);

      var trapResult = trap.Call(handler, [target, key, normalizedDescObj]),
          success = $$ToBoolean(trapResult),
          targetDesc = target.GetOwnProperty(key),
          extensible = target.IsExtensible();

      if (!extensible && targetDesc === undefined) {
        return $$ThrowException('proxy_extensibility_inconsistent');
      } else if (targetDesc !== undefined && !$$IsCompatibleDescriptor(extensible, targetDesc, $$ToPropertyDescriptor(normalizedDesc))) {
        return $$ThrowException('proxy_incompatible_descriptor');
      } else if (!normalizedDesc.Configurable) {
        if (targetDesc === undefined || targetDesc.Configurable) {
          return $$ThrowException('proxy_configurability_inconsistent')
        }
      } else if (strict) {
        return $$ThrowException('strict_property_redefinition');
      }
      return false;
    }
  }


  function $$TrapGetOwnProperty(proxy, key){
    var handler = proxy.ProxyHandler,
        target = proxy.ProxyTarget;

    var trap = $$GetMethod(handler, 'getOwnPropertyDescriptor');
    if (trap && trap.Abrupt) return trap;

    if (trap === undefined) {
      return target.GetOwnProperty(key);
    } else {
      var trapResult = trap.Call(handler, [target, key]);
      if (trapResult && trapResult.Abrupt) return trapResult;

      if (trapResult) {
        var desc = $$ToCompletePropertyDescriptor($$FromPropertyDescriptor(object));
        $$CopyAttributes(trapResult, desc);
      }

      var targetDesc = target.GetOwnProperty(key);
      if (targetDesc && targetDesc.Abrupt) return targetDesc;

      if (desc === undefined && targetDesc !== undefined) {
        if (!targetDesc.Configurable) {
          return $$ThrowException('proxy_configurability_inconsistent');
        } else if (!target.IsExtensible()) {
          return $$ThrowException('proxy_extensibility_inconsistent');
        }
        return;
      }

      var extensible = target.IsExtensible();
      if (!extensible && targetDesc === undefined) {
        return $$ThrowException('proxy_extensibility_inconsistent');
      } else if (targetDesc !== undefined && !$$IsCompatibleDescriptor(extensible, targetDesc, $$ToPropertyDescriptor(desc))) {
        return $$ThrowException('proxy_incompatible_descriptor');
      } else if (desc !== undefined && !$$ToBoolean(desc.Get('configurable')) && targetDesc && targetDesc.Configurable) {
        return $$ThrowException('proxy_configurability_inconsistent')
      }

      return desc;
    }
  }


  var proto = require('../lib/utility').uid();

  function checkDuplicates(array){
    var seen = new Hash;

    for (var i=0; i < array.length; i++) {
      var element = array[i] === '__proto__' ? proto : array[i];
      if (element in seen) {
        return $$ThrowException('proxy_duplicate', type);
      }
      seen[element] = true;
    }

    return seen;
  }

  function getHasInstance(){
    var HasInstance = require('../runtime').builtins.$Function.prototype.HasInstance;
    getHasInstance = function(){
      return HasInstance;
    };
    return HasInstance;
  }

  function $Proxy(target, handler){
    this.ProxyHandler = handler;
    this.ProxyTarget = target;
    this.BuiltinBrand = target.BuiltinBrand;

    if (target.Call) {
      this.Call = ProxyCall;
      this.HasInstance = getHasInstance();
      this.Construct = ProxyConstruct;
    }

    if (target.getPrimitiveValue) {
      this.getPrimitiveValue = ProxyGetPrimitiveValue;
      this.setPrimitiveValue = ProxySetPrimitiveValue;
    }
  }

  inherit($Proxy, $Object, {
    Proxy: true
  }, [
    function GetInheritance(){
      var trap = $$GetMethod(this.ProxyHandler, 'getPrototypeOf');
      if (trap && trap.Abrupt) return trap;

      if (trap === undefined) {
        return this.ProxyTarget.GetInheritance();
      } else {
        var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget]);
        if (trapResult && trapResult.Abrupt) return trapResult;

        var targetProto = this.ProxyTarget.GetInheritance();
        if (targetProto && targetProto.Abrupt) return targetProto;

        if (trapResult !== targetProto) {
          return $$ThrowException('proxy_inconsistent', 'getPrototypeOf');
        } else {
          return targetProto;
        }
      }
    },
    function IsExtensible(){
      var trap = $$GetMethod(this.ProxyHandler, 'isExtensible');
      if (trap && trap.Abrupt) return trap;

      if (trap === undefined) {
        return this.ProxyTarget.IsExtensible();
      }

      var proxyIsExtensible = $$ToBoolean(trap.Call(this.ProxyHandler, [this.ProxyTarget]));
      if (trapResult && trapResult.Abrupt) return trapResult;

      var targetIsExtensible = this.ProxyTarget.IsExtensible();
      if (targetIsExtensible && targetIsExtensible.Abrupt) return targetIsExtensible;

      if (proxyIsExtensible !== targetIsExtensible) {
        return $$ThrowException('proxy_extensibility_inconsistent');
      }
      return targetIsExtensible;
    },
    function GetP(receiver, key){
      var trap = $$GetMethod(this.ProxyHandler, 'get');
      if (trap && trap.Abrupt) return trap;

      if (trap === undefined) {
        return this.ProxyTarget.GetP(receiver, key);
      }

      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key, receiver]);
      if (trapResult && trapResult.Abrupt) return trapResult;

      var desc = this.ProxyTarget.GetOwnProperty(key);
      if (desc && desc.Abrupt) return desc;

      if (desc !== undefined) {
        if ($$IsDataDescriptor(desc) && desc.Configurable === false && desc.Writable === false) {
          if (!is(trapResult, desc.Value)) {
            return $$ThrowException('proxy_inconsistent', 'get');
          }
        } else if ($$IsAccessorDescriptor(desc) && desc.Configurable === false && desc.Get === undefined) {
          if (trapResult !== undefined) {
            return $$ThrowException('proxy_inconsistent', 'get');
          }
        }
      }

      return trapResult;
    },
    function SetP(receiver, key, value){
      var trap = $$GetMethod(this.ProxyHandler, 'set');
      if (trap && trap.Abrupt) return trap;

      if (trap === undefined) {
        return this.ProxyTarget.SetP(receiver, key, value);
      }

      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key, value, receiver]);
      if (trapResult && trapResult.Abrupt) {
        return trapResult;
      }

      var success = $$ToBoolean(trapResult);

      if (success) {
        var desc = this.ProxyTarget.GetOwnProperty(key);
        if (desc && desc.Abrupt) return desc;

        if (desc !== undefined) {
          if ($$IsDataDescriptor(desc) && desc.Configurable === false && desc.Writable === false) {
            if (!is(value, desc.Value)) {
              return $$ThrowException('proxy_inconsistent', 'set');
            }
          }
        } else if ($$IsAccessorDescriptor(desc) && desc.Configurable === false) {
          if (desc.Set !== undefined) {
            return $$ThrowException('proxy_inconsistent', 'set');
          }
        }
      }

      return success;
    },
    function GetOwnProperty(key){
      return $$TrapGetOwnProperty(this, key);
    },
    function DefineOwnProperty(key, desc, strict){
      var descObj = $$FromGenericPropertyDescriptor(desc);
      if (descObj && descObj.Abrupt) return descObj;

      return $$TrapDefineOwnProperty(this, key, descObj, strict);
    },
    function HasOwnProperty(key){
      var trap = $$GetMethod(this.ProxyHandler, 'hasOwn');
      if (trap && trap.Abrupt) return trap;

      if (trap === undefined) {
        return this.ProxyTarget.HasOwnProperty(key);
      }

      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key]);
      if (trapResult && trapResult.Abrupt) return trapResult;

      var success = $$ToBoolean(trapResult);

      if (success === false) {
        var targetDesc = this.ProxyTarget.GetOwnProperty(key);
        if (targetDesc && targetDesc.Abrupt) return targetDesc;

        if (desc !== undefined && targetDesc.Configurable === false) {
          return $$ThrowException('proxy_inconsistent', 'hasOwn');
        } else if (!this.ProxyTarget.IsExtensible() && targetDesc !== undefined) {
          return $$ThrowException('proxy_non_extensible', 'hasOwn');
        }
      }
      return success;
    },
    function HasProperty(key){
      var trap = $$GetMethod(this.ProxyHandler, 'has');
      if (trap && trap.Abrupt) return trap;

      if (trap === undefined) {
        return this.ProxyTarget.HasProperty(key);
      }

      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key]);
      if (trapResult && trapResult.Abrupt) return trapResult;

      var success = $$ToBoolean(trapResult);

      if (success === false) {
        var targetDesc = this.ProxyTarget.GetOwnProperty(key);
        if (targetDesc && targetDesc.Abrupt) return targetDesc;

        if (targetDesc !== undefined && targetDesc.Configurable === false) {
          return $$ThrowException('proxy_inconsistent', 'has');
        } else if (!this.ProxyTarget.IsExtensible() && targetDesc !== undefined) {
          return $$ThrowException('proxy_non_extensible', 'has');
        }
      }
      return success;
    },
    function Delete(key, strict){
      var trap = $$GetMethod(this.ProxyHandler, 'deleteProperty');
      if (trap && trap.Abrupt) return trap;

      if (trap === undefined) {
        return this.ProxyTarget.Delete(key, strict);
      }
      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key]);
      if (trapResult && trapResult.Abrupt) return trapResult;

      var success = $$ToBoolean(trapResult);

      if (success === true) {
        var targetDesc = this.ProxyTarget.GetOwnProperty(key);
        if (targetDesc && targetDesc.Abrupt) return targetDesc;

        if (targetDesc !== undefined && targetDesc.Configurable === false) {
          return $$ThrowException('proxy_inconsistent', 'delete');
        } else if (!this.ProxyTarget.IsExtensible() && targetDesc !== undefined) {
          return $$ThrowException('proxy_non_extensible', 'delete');
        }
        return true;
      } else if (strict) {
        return $$ThrowException('strict_delete_failure');
      }
      return false;
    },
    function Enumerate(includePrototype, onlyEnumerable){
      if (onlyEnumerable) {
        var type = includePrototype ? 'enumerate' : 'keys';
      } else {
        var type = 'getOwnPropertyNames',
            recurse = includePrototype;
      }

      var trap = $$GetMethod(this.ProxyHandler, type);
      if (trap && trap.Abrupt) return trap;

      if (trap === undefined) {
        return this.ProxyTarget.Enumerate(includePrototype, onlyEnumerable);
      }

      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget]);
      if (trapResult && trapResult.Abrupt) return trapResult;

      if (typeof trapResult !== 'object' || trapResult === null) {
        return $$ThrowException('proxy_non_object_result', type);
      }

      if (trapResult.array) {
        var array = trapResult.array;
      } else {
        var len = $$ToUint32(trapResult.Get('length'));
        if (len && len.Abrupt) return len;

        var array = new Array(len);

        for (var i = 0; i < len; i++) {
          var element = $$ToPropertyKey(trapResult.Get(i+''));
          if (element && element.Abrupt) return element;

          if (!includePrototype && !this.ProxyTarget.IsExtensible() && !this.ProxyTarget.HasOwnProperty(element)) {
            return $$ThrowException('proxy_non_extensible', type);
          }

          array[i] = element;
        }
      }

      var seen = checkDuplicates(array);
      if (seen.Abrupt) return seen;

      var props = this.ProxyTarget.Enumerate(includePrototype, onlyEnumerable);
      if (props && props.Abrupt) return props;

      for (var i=0; i < props.length; i++) {
        var element = props[i] === '__proto__' ? proto : props[i];
        if (!(element in seen)) {
          var targetDesc = this.ProxyTarget.GetOwnProperty(props[i]);
          if (targetDesc && targetDesc.Abrupt) return targetDesc;

          if (targetDesc) {
            if (!targetDesc.Configurable) {
              return $$ThrowException('proxy_inconsistent', type);
            }

            if (!this.ProxyTarget.IsExtensible()) {
              return $$ThrowException('proxy_non_extensible', type);
            }
          }
        }
      }

      return array;
    }
  ]);

  function ProxyCall(thisValue, args){
    var trap = $$GetMethod(this.ProxyHandler, 'apply');
    if (trap && trap.Abrupt) return trap;

    if (trap === undefined) {
      return this.ProxyTarget.Call(thisValue, args);
    }

    return trap.Call(this.ProxyHandler, [this.ProxyTarget, thisValue, new $Array(args)]);
  }

  function ProxyConstruct(args){
    var trap = $$GetMethod(this.ProxyHandler, 'construct');
    if (trap && trap.Abrupt) return trap;

    if (trap === undefined) {
      return this.ProxyTarget.Construct(args);
    }

    return trap.Call(this.ProxyHandler, [this.ProxyTarget, new $Array(args)]);
  }

  function ProxyGetPrimitiveValue(){
    return this.ProxyTarget.getPrimitiveValue();
  }

  function ProxySetPrimitiveValue(value){
    return this.ProxyTarget.setPrimitiveValue(value);
  }

  return module.exports = $Proxy;
})(typeof module !== 'undefined' ? module : {});
