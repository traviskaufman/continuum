var $Proxy = (function(module){
  var objects = require('../lib/objects'),
      errors = require('../errors'),
      operators = require('./operators'),
      descriptors = require('./descriptors'),
      operations = require('./operations'),
      $Object = require('./$Object');

  var inherit = objects.inherit,
      is = objects.is,
      define = objects.define,
      ToPropertyDescriptor = descriptors.toPropertyDescriptor,
      FromGenericPropertyDescriptor = descriptors.fromGenericPropertyDescriptor,
      NormalizeAndCompletePropertyDescriptor = descriptors.normalizeAndCompletePropertyDescriptor
      CopyAttributes = descriptors.copyAttributes,
      IsDataDescriptor = descriptors.isDataDescriptor,
      IsAccessorDescriptor = descriptors.isAccessorDescriptor,
      ThrowException = errors.ThrowException,
      ToBoolean = operators.ToBoolean,
      ToString = operators.ToString,
      ToUint32 = operators.ToUint32,
      IsCallable = operations.isCallable

  function IsCompatibleDescriptor(){
    return true;
  }

  function GetMethod(handler, trap){
    var result = handler.Get(trap);

    if (result && result.Abrupt) {
      return result;
    }

    if (result !== undefined && !IsCallable(result)) {
      return ThrowException('proxy_non_callable_trap');
    }
    return result;
  }

  function TrapDefineOwnProperty(proxy, key, descObj, strict){
    var handler = proxy.ProxyHandler,
        target = proxy.ProxyTarget,
        trap = GetMethod(handler, 'defineProperty'),
        normalizedDesc = ToPropertyDescriptor(descObj);

    if (trap && trap.Abrupt) {
      return trap;
    }

    if (trap === undefined) {
      return target.DefineOwnProperty(key, normalizedDesc, strict);
    } else {
      var normalizedDescObj = FromGenericPropertyDescriptor(normalizedDesc);
      CopyAttributes(descObj, normalizedDescObj);

      var trapResult = trap.Call(handler, [target, key, normalizedDescObj]),
          success = ToBoolean(trapResult),
          targetDesc = target.GetOwnProperty(key),
          extensible = target.IsExtensible();

      if (!extensible && targetDesc === undefined) {
        return ThrowException('proxy_extensibility_inconsistent');
      } else if (targetDesc !== undefined && !IsCompatibleDescriptor(extensible, targetDesc, ToPropertyDescriptor(normalizedDesc))) {
        return ThrowException('proxy_incompatible_descriptor');
      } else if (!normalizedDesc.Configurable) {
        if (targetDesc === undefined || targetDesc.Configurable) {
          return ThrowException('proxy_configurability_inconsistent')
        }
      } else if (strict) {
        return ThrowException('strict_property_redefinition');
      }
      return false;
    }
  }


  function TrapGetOwnProperty(proxy, key){
    var handler = proxy.ProxyHandler,
        target = proxy.ProxyTarget,
        trap = GetMethod(handler, 'getOwnPropertyDescriptor');

    if (trap && trap.Abrupt) {
      return trap;
    }

    if (trap === undefined) {
      return target.GetOwnProperty(key);
    } else {
      var trapResult = trap.Call(handler, [target, key]);
      if (trapResult && trapResult.Abrupt) {
        return trapResult;
      }

      var desc = NormalizeAndCompletePropertyDescriptor(trapResult),
          targetDesc = target.GetOwnProperty(key);
      if (targetDesc && targetDesc.Abrupt) {
        return targetDesc;
      }

      if (desc === undefined) {
        if (targetDesc !== undefined) {
          if (!targetDesc.Configurable) {
            return ThrowException('proxy_configurability_inconsistent');
          } else if (!target.IsExtensible()) {
            return ThrowException('proxy_extensibility_inconsistent');
          }
          return;
        }
      }

      var extensible = target.IsExtensible();
      if (!extensible && targetDesc === undefined) {
        return ThrowException('proxy_extensibility_inconsistent');
      } else if (targetDesc !== undefined && !IsCompatibleDescriptor(extensible, targetDesc, ToPropertyDescriptor(desc))) {
        return ThrowException('proxy_incompatible_descriptor');
      } else if (!ToBoolean(desc.Get('configurable'))) {
        if (targetDesc === undefined || targetDesc.Configurable) {
          return ThrowException('proxy_configurability_inconsistent')
        }
      }
      return desc;
    }
  }



  function $Proxy(target, handler){
    this.ProxyHandler = handler;
    this.ProxyTarget = target;
    this.BuiltinBrand = target.BuiltinBrand;
    if ('Call' in target) {
      this.HasInstance = $Function.prototype.HasInstance;
      this.Call = ProxyCall;
      this.Construct = ProxyConstruct;
    }
    if ('PrimitiveValue' in target) {
      this.PrimitiveValue = target.PrimitiveValue;
    }
  }

  inherit($Proxy, $Object, {
    Proxy: true
  }, [
    function GetInheritance(){
      var trap = GetMethod(this.ProxyHandler, 'getPrototypeOf');

      if (trap && trap.Abrupt) {
        return trap;
      }

      if (trap === undefined) {
        return this.ProxyTarget.GetInheritance();
      } else {
        var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget]);
        if (trapResult && trapResult.Abrupt) {
          return trapResult;
        }

        var targetProto = this.ProxyTarget.GetInheritance();
        if (targetProto && targetProto.Abrupt) {
          return targetProto;
        }

        if (trapResult !== targetProto) {
          return ThrowException('proxy_inconsistent', 'getPrototypeOf');
        } else {
          return targetProto;
        }
      }
    },
    function IsExtensible(){
      var trap = GetMethod(this.ProxyHandler, 'isExtensible');

      if (trap && trap.Abrupt) {
        return trap;
      }

      if (trap === undefined) {
        return this.ProxyTarget.IsExtensible();
      }
      var proxyIsExtensible = ToBoolean(trap.Call(this.ProxyHandler, [this.ProxyTarget]));
      if (trapResult && trapResult.Abrupt) {
        return trapResult;
      }

      var targetIsExtensible  = this.ProxyTarget.IsExtensible();
      if (targetIsExtensible && targetIsExtensible.Abrupt) {
        return targetIsExtensible;
      }

      if (proxyIsExtensible !== targetIsExtensible) {
        return ThrowException('proxy_extensibility_inconsistent');
      }
      return targetIsExtensible;
    },
    function GetP(receiver, key){
      var trap = GetMethod(this.ProxyHandler, 'get');
      if (trap && trap.Abrupt) {
        return trap;
      }

      if (trap === undefined) {
        return this.ProxyTarget.GetP(receiver, key);
      }

      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key, receiver]);
      if (trapResult && trapResult.Abrupt) {
        return trapResult;
      }

      var desc = this.ProxyTarget.GetOwnProperty(key);
      if (desc && desc.Abrupt) {
        return desc;
      }

      if (desc !== undefined) {
        if (IsDataDescriptor(desc) && desc.Configurable === false && desc.Writable === false) {
          if (!is(trapResult, desc.Value)) {
            return ThrowException('proxy_inconsistent', 'get');
          }
        } else if (IsAccessorDescriptor(desc) && desc.Configurable === false && desc.Get === undefined) {
          if (trapResult !== undefined) {
            return ThrowException('proxy_inconsistent', 'get');
          }
        }
      }

      return trapResult;
    },
    function SetP(receiver, key, value){
      var trap = GetMethod(this.ProxyHandler, 'set');

      if (trap && trap.Abrupt) {
        return trap;
      }

      if (trap === undefined) {
        return this.ProxyTarget.SetP(receiver, key, value);
      }

      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key, value, receiver]);
      if (trapResult && trapResult.Abrupt) {
        return trapResult;
      }

      var success = ToBoolean(trapResult);

      if (success) {
        var desc = this.ProxyTarget.GetOwnProperty(key);
        if (desc && desc.Abrupt) {
          return desc;
        }

        if (desc !== undefined) {
          if (IsDataDescriptor(desc) && desc.Configurable === false && desc.Writable === false) {
            if (!is(value, desc.Value)) {
              return ThrowException('proxy_inconsistent', 'set');
            }
          }
        } else if (IsAccessorDescriptor(desc) && desc.Configurable === false) {
          if (desc.Set !== undefined) {
            return ThrowException('proxy_inconsistent', 'set');
          }
        }
      }

      return success;
    },
    function GetOwnProperty(key){
      return TrapGetOwnProperty(this, key);
    },
    function DefineOwnProperty(key, desc, strict){
      var descObj = FromGenericPropertyDescriptor(desc);
      if (descObj && descObj.Abrupt) {
        return descObj;
      }

      return TrapDefineOwnProperty(this, key, descObj, strict);
    },
    function HasOwnProperty(key){
      var trap = GetMethod(this.ProxyHandler, 'hasOwn');
      if (trap && trap.Abrupt) {
        return trap;
      }
      if (trap === undefined) {
        return this.ProxyTarget.HasOwnProperty(key);
      }

      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key]);
      if (trapResult && trapResult.Abrupt) {
        return trapResult;
      }

      var success = ToBoolean(trapResult);

      if (success === false) {
        var targetDesc = this.ProxyTarget.GetOwnProperty(key);
        if (targetDesc && targetDesc.Abrupt) {
          return targetDesc;
        }

        if (desc !== undefined && targetDesc.Configurable === false) {
          return ThrowException('proxy_inconsistent', 'hasOwn');
        } else if (!this.ProxyTarget.IsExtensible() && targetDesc !== undefined) {
          return ThrowException('proxy_non_extensible', 'hasOwn');
        }
      }
      return success;
    },
    function HasProperty(key){
      var trap = GetMethod(this.ProxyHandler, 'has');
      if (trap && trap.Abrupt) {
        return trap;
      }
      if (trap === undefined) {
        return this.ProxyTarget.HasProperty(key);
      }

      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key]);
      if (trapResult && trapResult.Abrupt) {
        return trapResult;
      }

      var success = ToBoolean(trapResult);

      if (success === false) {
        var targetDesc = this.ProxyTarget.GetOwnProperty(key);
        if (targetDesc && targetDesc.Abrupt) {
          return targetDesc;
        }

        if (desc !== undefined && targetDesc.Configurable === false) {
          return ThrowException('proxy_inconsistent', 'has');
        } else if (!this.ProxyTarget.IsExtensible() && targetDesc !== undefined) {
          return ThrowException('proxy_non_extensible', 'has');
        }
      }
      return success;
    },
    function Delete(key, strict){
      var trap = GetMethod(this.ProxyHandler, 'deleteProperty');
      if (trap && trap.Abrupt) {
        return trap;
      }
      if (trap === undefined) {
        return this.ProxyTarget.Delete(key, strict);
      }
      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget, key]);
      if (trapResult && trapResult.Abrupt) {
        return trapResult;
      }

      var success = ToBoolean(trapResult);

      if (success === true) {
        var targetDesc = this.ProxyTarget.GetOwnProperty(key);
        if (targetDesc && targetDesc.Abrupt) {
          return targetDesc;
        }

        if (desc !== undefined && targetDesc.Configurable === false) {
          return ThrowException('proxy_inconsistent', 'delete');
        } else if (!this.ProxyTarget.IsExtensible() && targetDesc !== undefined) {
          return ThrowException('proxy_non_extensible', 'delete');
        }
        return true;
      } else if (strict) {
        return ThrowException('strict_delete_failure');
      } else {
        return false;
      }
    },
    function Enumerate(includePrototype, onlyEnumerable){
      if (onlyEnumerable) {
        var type = includePrototype ? 'enumerate' : 'keys';
      } else {
        var type = 'getOwnPropertyNames',
            recurse = includePrototype;
      }

      var trap = GetMethod(this.ProxyHandler, type);
      if (trap && trap.Abrupt) {
        return trap;
      }

      if (trap === undefined) {
        return this.ProxyTarget.Enumerate(includePrototype, onlyEnumerable);
      }

      var trapResult = trap.Call(this.ProxyHandler, [this.ProxyTarget]);
      if (trapResult && trapResult.Abrupt) {
        return trapResult;
      }

      if (typeof trapResult !== 'object' || trapResult === null) {
        return ThrowException('proxy_non_object_result', type);
      }

      var len = ToUint32(trapResult.Get('length'));
      if (len && len.Abrupt) {
        return len;
      }

      var array = [],
          seen = new Hash;

      for (var i = 0; i < len; i++) {
        var element = ToString(trapResult.Get(''+i));
        if (element && element.Abrupt) {
          return element;
        }

        if (element in seen) {
          return ThrowException('proxy_duplicate', type);
        }
        seen[element] = true;

        if (!includePrototype && !this.ProxyTarget.IsExtensible() && !this.ProxyTarget.HasOwnProperty(element)) {
          return ThrowException('proxy_non_extensible', type);
        }

        array[i] = element;
      }

      var props = this.ProxyTarget.Enumerate(includePrototype, onlyEnumerable);
      if (props && props.Abrupt) {
        return props;
      }

      var len = props.length;

      for (var i=0; i < len; i++) {
        if (!(props[i] in seen)) {
          var targetDesc = this.ProxyTarget.GetOwnProperty(props[i]);
          if (targetDesc && targetDesc.Abrupt) {
            return targetDesc;
          }

          if (targetDesc && !targetDesc.Configurable) {
            return ThrowException('proxy_inconsistent', type);
          }

          if (targetDesc && !this.ProxyTarget.IsExtensible()) {
            return ThrowException('proxy_non_extensible', type);
          }
        }
      }

      return array;
    }
  ]);

  function ProxyCall(thisValue, args){
    var trap = GetMethod(this.ProxyHandler, 'apply');
    if (trap && trap.Abrupt) {
      return trap;
    }

    if (trap === undefined) {
      return this.ProxyTarget.Call(thisValue, args);
    }

    return trap.Call(this.ProxyHandler, [this.ProxyTarget, thisValue, new $InternalArray(args)]);
  }

  function ProxyConstruct(args){
    var trap = GetMethod(this.ProxyHandler, 'construct');
    if (trap && trap.Abrupt) {
      return trap;
    }

    if (trap === undefined) {
      return this.ProxyTarget.Construct(args);
    }

    return trap.Call(this.ProxyHandler, [this.ProxyTarget, new $InternalArray(args)]);
  }

  return module.exports = $Proxy;
})(typeof module !== 'undefined' ? module : {});
