var $Nil = (function(exports){
  var objects = require('../lib/objects'),
      utility = require('../lib/utility');

  var inherit = objects.inherit,
      define  = objects.define,
      tag     = utility.tag;

  var ToPrimitiveSymbol = require('./$Symbol').wellKnownSymbols.ToPrimitiveSymbol;

  function Undetectable(value){
    this.value = value;
  }

  define(Undetectable.prototype, {
    undetectable: true
  }, [
    function toString(){
      return 'undefined';
    },
    function valueOf(){
      return NaN;
    }
  ]);

  exports.Undetectable = Undetectable;


  function isUndetectable(value){
    return value instanceof Undetectable;
  }

  exports.isUndetectable = isUndetectable;


  function isUndefined(value){
    return value === undefined || value instanceof Undetectable;
  }

  exports.isUndefined = isUndefined;


  function isNullish(value){
    return value == null || value instanceof Undetectable;
  }

  exports.isNullish = isNullish;


  function isFalsey(value){
    return !value || value instanceof Undetectable;
  }

  exports.isFalsey = isFalsey;


  var nilToPrimitive = {
    Call: function(_, args){
      return args[0] === 'string' ? '' : 0;
    }
  };


  var desc = { Writable: false,
               Enumerable: false,
               Configurable: false };

  function $Nil(){
    this.value = this;
    tag(this);
  }

  exports.$Nil = $Nil;

  inherit($Nil, Undetectable, {
    type: '$Nil'
  }, [
    function toString(){
      return '';
    },
    function valueOf(){
      return 0;
    },
    function each(){},
    function get(key){
      return this;
    },
    function set(){},
    function describe(key){
      return [key, this, 0];
    },
    function remove(){},
    function has(){
      return false;
    },
    function enumerator(){
      var iter = new (require('./$Object').$Enumerator)([]);
      define($Nil.prototype, function enumerator(){
        return iter;
      });
      return iter;
    },
    (function(){ return function define(){} })(),
    function GetInheritance(){
      return null;
    },
    function SetInheritance(){
      return true;
    },
    function IsExtensible(){
      return true;
    },
    function PreventExtensions(){
      return true;
    },
    function HasProperty(){
      return false;
    },
    function HasOwnProperty(){
      return false;
    },
    function GetOwnProperty(){
      desc.Value = this;
      return desc;
    },
    function Get(key){
      if (key === ToPrimitiveSymbol) {
        return nilToPrimitive;
      }
      return this;
    },
    function GetP(){
      return this;
    },
    function SetP(){
      return true;
    },
    function Delete(){
      return true;
    },
    function DefineOwnProperty(){
      return true;
    },
    function Call(){
      return this;
    },
    function Construct(){
      return this;
    },
    function HasInstance(){
      return false;
    },
    function Keys(){
      return [];
    },
    function OwnPropertyKeys(){
      return [];
    },
    function Enumerate(){
      return [];
    },
    function Freeze(){
      return true;
    },
    function Seal(){
      return true;
    },
    function IsFrozen(){
      return true;
    },
    function IsSealed(){
      return true;
    }
  ]);


  return exports;
})(typeof module !== 'undefined' ? exports : {});
