var $Arguments = (function(exports){
  var objects     = require('../lib/objects'),
      utility     = require('../lib/utility'),
      errors      = require('../errors'),
      descriptors = require('./descriptors'),
      operations  = require('./operations'),
      $Object     = require('./$Object').$Object;

  var Hash    = objects.Hash,
      inherit = objects.inherit,
      define  = objects.define,
      ArgAccessor            = descriptors.ArgAccessor,
      $$ThrowException       = errors.$$ThrowException,
      $$IsCallable           = operations.$$IsCallable,
      $$IsAccessorDescriptor = descriptors.$$IsAccessorDescriptor;


  var _CW = 6,
      ECW = 7,
      __A = 8,
      _CA = 10;

  var $Arguments = exports.$Arguments = (function(){
    function $Arguments(length){
      $Object.call(this);
      this.define('length', length, _CW);
    }

    inherit($Arguments, $Object, {
      BuiltinBrand: 'BuiltinArguments',
      ParameterMap: null
    });

    return $Arguments;
  })();


  var $StrictArguments = exports.$StrictArguments = (function(){
    function $StrictArguments(args){
      $Arguments.call(this, args.length);
      for (var i=0; i < args.length; i++) {
        this.define(i+'', args[i], ECW);
      }

      this.define('arguments', intrinsics.ThrowTypeError, __A);
      this.define('caller', intrinsics.ThrowTypeError, __A);
    }

    inherit($StrictArguments, $Arguments);

    return $StrictArguments;
  })();



  var $MappedArguments = exports.$MappedArguments = (function(){
    function $MappedArguments(args, env, names, func){
      var mapped = new Hash;
      $Arguments.call(this, args.length);

      this.ParameterMap = new $Object;
      this.isMapped = false;

      for (var i=0; i < args.length; i++) {
        this.define(i+'', args[i], ECW);
        var name = names[i];
        if (i < names.length && !(name in mapped)) {
          this.isMapped = true;
          mapped[name] = true;
          this.ParameterMap.define(name, new ArgAccessor(name, env), _CA);
        }
      }

      this.define('callee', func, _CW);
    }

    inherit($MappedArguments, $Arguments, {
      ParameterMap: null
    }, [
      function Get(key){
        if (this.isMapped && this.ParameterMap.has(key)) {
          return this.ParameterMap.Get(key);
        } else {
          var val = this.GetP(this, key);
          if (key === 'caller' && $$IsCallable(val) && val.strict) {
            return $$ThrowException('strict_poison_pill');
          }
          return val;
        }
      },
      function GetOwnProperty(key){
        var desc = $Object.prototype.GetOwnProperty.call(this, key);
        if (desc === undefined) {
          return desc;
        }
        if (this.isMapped && this.ParameterMap.has(key)) {
          desc.Value = this.ParameterMap.Get(key);
        }
        return desc;
      },
      function DefineOwnProperty(key, desc, strict){
        if (!DefineOwn.call(this, key, desc, false) && strict) {
          return $$ThrowException('strict_lhs_assignment');
        }

        if (this.isMapped && this.ParameterMap.has(key)) {
          if ($$IsAccessorDescriptor(desc)) {
            this.ParameterMap.Delete(key, false);
          } else {
            if ('Value' in desc) {
              this.ParameterMap.Put(key, desc.Value, strict);
            }
            if ('Writable' in desc) {
              this.ParameterMap.Delete(key, false);
            }
          }
        }

        return true;
      },
      function Delete(key, strict){
        var result = $Object.prototype.Delete.call(this, key, strict);
        if (result.Abrupt) return result;

        if (result && this.isMapped && this.ParameterMap.has(key)) {
          this.ParameterMap.Delete(key, false);
        }

        return result;
      }
    ]);

    return $MappedArguments;
  })();



  var realm, intrinsics;

  define($StrictArguments, [
    function changeRealm(newRealm){
      realm = newRealm;
      intrinsics = realm ? realm.intrinsics : undefined;
    }
  ]);

  return exports;
})(typeof module !== 'undefined' ? exports : {});
