var lower = (function(module){
  var objects = require('../lib/objects');


  function TEMPLATE(){
    var len = arguments.length,
        args = new Array(len);

    for (var i=0; i < len; i++) {
      var item = arguments[i];
      args[i] = item && item.__origin ? item.__origin : item;
    }

    if (this instanceof TEMPLATE) {
      var result = $f.Construct(args);
    } else {
      var self = this && this.__origin ? this.__origin : this;
      var result = $f.Call(self, args);
    }

    return result && result.lower ? result.lower(true) : result;
  }

  TEMPLATE = 'return '+TEMPLATE;



  function Lowerer(prototypes){
    this.prototypes = !!prototypes;
  }

  objects.define(Lowerer.prototype, [
    function dispatch(target){
      if (!target || !objects.isObject(target)) {
        return target;
      }
      if (target.lowered) {
        return target.lowered;
      }
      var proto = target;
      while (proto) {
        if (proto.type in this) {
          return this[proto.type](target);
        }
        var inherits = proto.constructor.inherits;
        if (inherits) {
          proto = inherits.prototype;
        } else {
          return null;
        }
      }
      return null;
    },
    function lowerObject($obj, out){
      var self = this;

      $obj.each(function(prop){
        if (prop[0] === '__proto__') return;

        var key = self.dispatch(prop[0]);

        if (key === 'prototype' && typeof out === 'function') {
          out.prototype = self.dispatch(prop[1]);
        }

        if (objects.hasOwn(out, key)) return;

        var desc = {
          enumerable: !!(prop[2] & E),
          configurable: !!(prop[2] & C)
        };
        if (prop[2] & A) {
          if (prop[1]) {
            desc.get = self.dispatch(prop[1].Get);
            desc.set = self.dispatch(prop[1].Set);
          } else {
            desc.get = desc.set = undefined;
          }
        } else {
          if (prop[2] & W) {
            desc.writable = true;
          }
          desc.value = self.dispatch(prop[1]);
        }

        objects.defineProperty(out, key, desc);
      });

      objects.define(out, '__origin', $obj);
      return out;
    },
    function $Function(target){
      var name = (''+this.dispatch(target.get('name'))).replace(/^@@?/, '');

      try {
        var out = new Function('$f', TEMPLATE.replace(/TEMPLATE/g, name))(target);
      } catch (e) {
        var out = new Function('$f', TEMPLATE.replace(/TEMPLATE/g, '_'+name))(target);
      }

      if (this.prototypes) {
        objects.setPrototypeOf(out, this.dispatch(target.GetInheritance()));
      }
      return this.lowerObject(target, out);
    },
    function $NativeFunction(target){
      return this.lowerObject(target, target.call || target.Call);
    },
    function $Symbol(target){
      var name = '@'+target.Name;
      return objects.define(objects.create(null), {
        private: target.Private,
        toString: function toString(){
          return name;
        },
        value: function valueOf(){
          return name;
        }
      });
    },
    function $Object(target){
      return this.lowerObject(target, this.prototypes ? objects.create(this.dispatch(target.GetInheritance())) : {});
    }
  ]);

  return module.exports = function lower(object, prototypes){
    return new Lowerer(prototypes).dispatch(object);
  };

})(typeof module === 'undefined' ? {} : module);
