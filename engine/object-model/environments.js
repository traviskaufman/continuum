var environments = (function(exports, undefined){
  "use strict";
  var objects = require('../lib/objects');

  var Hash     = objects.Hash,
      isObject = objects.isObject,
      ownKeys  = objects.keys,
      define   = objects.define,
      inherit  = objects.inherit,
      hide     = objects.hide,
      each     = require('../lib/iteration').each,
      tag      = require('../lib/utility').tag;

  var $$ThrowException = require('../errors').$$ThrowException,
      Uninitialized = require('../constants').SYMBOLS.Uninitialized;

  var normal = { Configurable: true,
                 Enumerable: true,
                 Writable: true,
                 Value: undefined };


  // #########################
  // ### EnvironmentRecord ###
  // #########################

  var EnvironmentRecord = exports.EnvironmentRecord = (function(){
    function EnvironmentRecord(bindings, outer){
      this.bindings = bindings;
      this.outer = outer || null;
      this.cache = new Hash;
      tag(this);
    }

    define(EnvironmentRecord.prototype, {
      bindings: null,
      withBase: undefined,
      type: 'Env',
      Environment: true
    });

    define(EnvironmentRecord.prototype, [
      function EnumerateBindings(){},
      function HasBinding(name){},
      function GetBindingValue(name, strict){},
      function SetMutableBinding(name, value, strict){},
      function DeleteBinding(name){},
      function WithBaseObject(){
        return this.withBase;
      },
      function HasThisBinding(){
        return false;
      },
      function HasSuperBinding(){
        return false;
      },
      function GetThisBinding(){},
      function GetSuperBase(){},
      function HasSymbolBinding(name){
        if (this.symbols) {
          return name in this.symbols;
        }
        return false;
      },
      function InitializeSymbolBinding(name, symbol){
        if (!this.symbols) {
          this.symbols = new Hash;
        } else if (name in this.symbols) {
          return $$ThrowException('symbol_redefine', name);
        }
        this.symbols[name] = symbol;
      },
      function GetSymbol(name){
        if (this.symbols && name in this.symbols) {
          return this.symbols[name];
        }
        return $$ThrowException('symbol_not_defined', name);
      }
    ]);

    return EnvironmentRecord;
  })();


  // ####################################
  // ### DeclarativeEnvironmentRecord ###
  // ####################################

  var DeclarativeEnvironmentRecord = exports.DeclarativeEnvironmentRecord = (function(){
    function DeclarativeEnvironmentRecord(outer){
      this.outer = outer || null;
      this.bindings = new Hash;
      this.consts = new Hash;
      this.deletables = new Hash;
      this.cache = new Hash;
      tag(this);
    }

    inherit(DeclarativeEnvironmentRecord, EnvironmentRecord, {
      type: 'DeclarativeEnv'
    }, [
      function destroy(){
        this.destroy = null;
        for (var k in this.bindings) {
          if (this.bindings[k] && this.bindings[k].destroy) {
            this.bindings[k].destroy();
          }
        }
      },
      function EnumerateBindings(){
        return ownKeys(this.bindings);
      },
      function HasBinding(name){
        return name in this.bindings;
      },
      function CreateMutableBinding(name, deletable){
        this.bindings[name] = undefined;
        if (deletable) {
          this.deletables[name] = true;
        }
      },
      function InitializeBinding(name, value){
        this.bindings[name] = value;
      },
      function GetBindingValue(name, strict){
        if (name in this.bindings) {
          var value = this.bindings[name];
          if (value === Uninitialized)
            return $$ThrowException('uninitialized_const', name);
          else
            return value;
        } else if (strict) {
          return $$ThrowException('not_defined', name);
        } else {
          return false;
        }
      },
      function SetMutableBinding(name, value, strict){
        if (name in this.consts) {
          if (this.bindings[name] === Uninitialized) {
            return $$ThrowException('uninitialized_const', name);
          } else if (strict) {
            return $$ThrowException('const_assign', name);
          }
        } else {
          this.bindings[name] = value;
        }
      },
      function CreateImmutableBinding(name){
        this.bindings[name] = Uninitialized;
        this.consts[name] = true;
      },
      function DeleteBinding(name){
        if (name in this.bindings) {
          if (name in this.deletables) {
            delete this.bindings[name];
            delete this.deletables[names];
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    ]);

    return DeclarativeEnvironmentRecord;
  })();


  // ###############################
  // ### ObjectEnvironmentRecord ###
  // ###############################

  var ObjectEnvironmentRecord = exports.ObjectEnvironmentRecord = (function(){
    function ObjectEnvironmentRecord(object, outer){
      this.bindings = object;
      this.outer = outer || null;
      this.cache = new Hash;
      tag(this);
    }

    inherit(ObjectEnvironmentRecord, EnvironmentRecord, {
      type: 'ObjectEnv'
    }, [
      function destroy(){
        this.destroy = null;
        this.bindings.destroy && this.bindings.destroy();
      },
      function EnumerateBindings(){
        return this.bindings.Enumerate(false, false);
      },
      function HasBinding(name){
        return this.bindings.HasProperty(name);
      },
      function CreateMutableBinding(name, deletable){
        return this.bindings.DefineOwnProperty(name, normal, true);
      },
      function InitializeBinding(name, value){
        normal.Value = value;
        var result = this.bindings.DefineOwnProperty(name, normal, true);
        normal.Value = undefined;
        return result;
      },
      function GetBindingValue(name, strict){
        if (this.bindings.HasProperty(name)) {
          return this.bindings.Get(name);
        } else if (strict) {
          return $$ThrowException('not_defined', name);
        }
      },
      function SetMutableBinding(name, value, strict){
        return this.bindings.Put(name, value, strict);
      },
      function DeleteBinding(name){
       return this.bindings.Delete(name, false);
      }
    ]);

    return ObjectEnvironmentRecord;
  })();


  // #################################
  // ### FunctionEnvironmentRecord ###
  // #################################

  exports.FunctionEnvironmentRecord = (function(){
    function FunctionEnvironmentRecord(receiver, method){
      this.outer = method.Scope;
      this.bindings = new Hash;
      this.consts = new Hash;
      this.deletables = new Hash;
      this.cache = new Hash;
      this.thisValue = receiver;
      this.HomeObject = method.HomeObject;
      this.MethodName = method.MethodName;
      tag(this);
    }

    inherit(FunctionEnvironmentRecord, DeclarativeEnvironmentRecord, {
      HomeObject: undefined,
      MethodName: undefined,
      thisValue: undefined,
      type: 'FunctionEnv'
    }, [
      function HasThisBinding(){
        return true;
      },
      function HasSuperBinding(){
        return this.HomeObject !== undefined;
      },
      function GetThisBinding(){
        return this.thisValue;
      },
      function GetSuperBase(){
        return this.HomeObject ? this.HomeObject.GetInheritance() : undefined;
      },
      function GetMethodName() {
        return this.MethodName;
      }
    ]);

    return FunctionEnvironmentRecord;
  })();


  // ###############################
  // ### GlobalEnvironmentRecord ###
  // ###############################

  exports.GlobalEnvironmentRecord = (function(){
    function GlobalEnvironmentRecord(global){
      this.thisValue = this.bindings = global;
      this.outer = null;
      this.cache = new Hash;
      global.env = this;
      hide(global, 'env');
      tag(this);
    }

    inherit(GlobalEnvironmentRecord, ObjectEnvironmentRecord, {
      outer: null,
      type: 'GlobalEnv'
    }, [
      function GetThisBinding(){
        return this.bindings;
      },
      function HasThisBinding(){
        return true;
      },
      function inspect(){
        return '[GlobalEnvironmentRecord]';
      }
    ]);

    return GlobalEnvironmentRecord;
  })();

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
