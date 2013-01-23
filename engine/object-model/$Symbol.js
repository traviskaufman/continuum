var $Symbol = (function(exports){
  var objects = require('../lib/objects'),
      utility = require('../lib/utility');

  var inherit = objects.inherit,
      define  = objects.define,
      assign  = objects.assign,
      Hash    = objects.Hash,
      tag     = utility.tag,
      uid     = utility.uid;


  // ###############
  // ### $Symbol ###
  // ###############

  var padding = ['', '0', '00', '000', '0000', '00000', '000000', '0000000', '00000000'];

  function zeroPad(number, places){
    var num  = ''+number,
        len  = num.length,
        diff = places - len;

    if (diff > 0) {
      return padding[diff] + num;
    }
    return num;
  }


  var $Symbol = exports.$Symbol = (function(){
    var postfix = uid();

    function $Symbol(name, isPublic){
      this.Name = name;
      this.Private = !isPublic;
      tag(this);
      this.gensym = '@@@'+zeroPad(this.id, 8)+postfix;
    }

    define($Symbol.prototype, {
      BuiltinBrand: 'BuiltinSymbol',
      Extensible: false,
      Private: true,
      Name: null,
      type: '$Symbol'
    });

    define($Symbol.prototype, [,
      function toStringTag(){
        return 'Symbol';
      },
      function each(){},
      function get(){},
      function set(){},
      function describe(){},
      function remove(){},
      function has(){
        return false;
      },
      function toString(){
        return this.gensym;
      },
      function GetInheritance(){
        return null;
      },
      function SetInheritance(v){
        return false;
      },
      function IsExtensible(){
        return false;
      },
      function PreventExtensions(){},
      function HasOwnProperty(){
        return false;
      },
      function GetOwnProperty(){},
      function Get(key){
      },
      function GetP(receiver, key){
        if (key === 'toString') {
          return require('../runtime').intrinsics['%ObjProto_toString%'];
        }
      },
      function SetP(receiver, key, value){
        return false;
      },
      function Delete(key){
        return true;
      },
      function DefineOwnProperty(key, desc){
        return false;
      },
      function enumerator(){
        var iter = new (require('./$Object').$Enumerator)([]);
        define($Symbol.prototype, function enumerator(){
          return iter;
        });
        return iter;
      },
      function Keys(){
        return [];
      },
      function OwnPropertyKeys(){
        return [];
      },
      function Enumerate(){
        return []
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

    return $Symbol;
  })();

  var $WellKnownSymbol = exports.$WellKnownSymbol = (function(){
    function $WellKnownSymbol(name){
      $Symbol.call(this, '@'+name, true);
    }

    inherit($WellKnownSymbol, $Symbol);

    return $WellKnownSymbol;
  })();

  exports.wellKnownSymbols = assign(new Hash, {
    create     : new $WellKnownSymbol('create'),
    hasInstance: new $WellKnownSymbol('hasInstance'),
    iterator   : new $WellKnownSymbol('iterator'),
    ToPrimitive: new $WellKnownSymbol('ToPrimitive'),
    toStringTag: new $WellKnownSymbol('toStringTag')
  });

  var $InternalSymbol = exports.$InternalSymbol = (function(){
    function $InternalSymbol(name){
      $Symbol.call(this, '@'+name, false);
    }

    inherit($InternalSymbol, $Symbol);

    return $InternalSymbol;
  })();

  exports.internalSymbols = assign(new Hash, {
    BooleanValue: new $InternalSymbol('BooleanValue'),
    DateValue   : new $InternalSymbol('DateValue'),
    NumberValue : new $InternalSymbol('NumberValue'),
    StringValue : new $InternalSymbol('StringValue'),
    MISSING     : new $InternalSymbol('MISSING')
  });

  return exports;
})(typeof module !== 'undefined' ? exports : {});
