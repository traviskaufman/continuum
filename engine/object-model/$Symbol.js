var $Symbol = (function(exports){
  var objects = require('../lib/objects'),
      utility = require('../lib/utility');

  var inherit = objects.inherit,
      define  = objects.define,
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
          return require('../runtime').intrinsics.ObjectToString;
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
      },
      function DefaultValue(){
        return '[object Symbol]';
      }
    ]);

    return $Symbol;
  })();

  var $WellKnownSymbol = exports.$WellKnownSymbol = (function(){
    var symbols = exports.wellKnownSymbols = new Hash;

    function $WellKnownSymbol(name){
      $Symbol.call(this, '@'+name, true);
    }

    inherit($WellKnownSymbol, $Symbol);


    function addWellKnownSymbol(name){
      return symbols[name] = new $WellKnownSymbol(name);
    }

    exports.addWellKnownSymbol = addWellKnownSymbol;

    addWellKnownSymbol('toStringTag');
    addWellKnownSymbol('iterator');
    addWellKnownSymbol('hasInstance');
    addWellKnownSymbol('create');
    addWellKnownSymbol('BooleanValue');
    addWellKnownSymbol('StringValue');
    addWellKnownSymbol('NumberValue');
    addWellKnownSymbol('DateValue');
    addWellKnownSymbol('ToPrimitive');

    return $WellKnownSymbol;
  })();


  return exports;
})(typeof module !== 'undefined' ? exports : {});
