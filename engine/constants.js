var constants = (function(exports){
  var objects = require('../lib/objects');

  var create  = objects.create,
      define  = objects.define,
      ownKeys = objects.keys,
      Hash    = objects.Hash;

  function Constants(array){
    this.hash = new Hash;
    for (var i=0; i < array.length; i++) {
      this.hash[array[i]] = i;
    }
    this.array = array;
  }

  define(Constants.prototype, [
    function getIndex(key){
      return this.hash[key];
    },
    function getKey(index){
      return this.array[index];
    }
  ]);



  function Token(name){
    this.name = name;
  }

  define(Token.prototype, [
    function toString(){
      return this.name;
    },
    function inspect(){
      return '['+this.name+']';
    }
  ]);


  function BuiltinBrand(name){
    this.name = name;
    this.brand = '[object '+name+']';
  }

  define(BuiltinBrand.prototype, [
    function toString(){
      return this.name;
    },
    function inspect(){
      return this.name;
    }
  ]);


  exports.BRANDS = {
    BooleanWrapper      : new BuiltinBrand('Boolean'),
    GlobalObject        : new BuiltinBrand('global'),
    BuiltinArguments    : new BuiltinBrand('Arguments'),
    BuiltinArrayIterator: new BuiltinBrand('ArrayIterator'),
    BuiltinArray        : new BuiltinBrand('Array'),
    BuiltinDate         : new BuiltinBrand('Date'),
    BuiltinError        : new BuiltinBrand('Error'),
    BuiltinFunction     : new BuiltinBrand('Function'),
    BuiltinIterator     : new BuiltinBrand('Iterator'),
    BuiltinJSON         : new BuiltinBrand('JSON'),
    BuiltinMap          : new BuiltinBrand('Map'),
    BuiltinMath         : new BuiltinBrand('Math'),
    BuiltinModule       : new BuiltinBrand('Module'),
    BuiltinObject       : new BuiltinBrand('Object'),
    BuiltinRegExp       : new BuiltinBrand('RegExp'),
    BuiltinSet          : new BuiltinBrand('Set'),
    BuiltinSymbol       : new BuiltinBrand('Symbol'),
    BuiltinWeakMap      : new BuiltinBrand('WeakMap'),
    NumberWrapper       : new BuiltinBrand('Number'),
    StopIteration       : new BuiltinBrand('StopIteration'),
    StringWrapper       : new BuiltinBrand('String'),
    BuiltinArrayBuffer  : new BuiltinBrand('ArrayBuffer'),
    BuiltinInt8Array    : new BuiltinBrand('Int8Array'),
    BuiltinUint8Array   : new BuiltinBrand('Uint8Array'),
    BuiltinInt16Array   : new BuiltinBrand('Int16Array'),
    BuiltinUint16Array  : new BuiltinBrand('Uint16Array'),
    BuiltinInt32Array   : new BuiltinBrand('Int32Array'),
    BuiltinUint32Array  : new BuiltinBrand('Uint32Array'),
    BuiltinFloat32Array : new BuiltinBrand('Float32Array'),
    BuiltinFloat64Array : new BuiltinBrand('Float64Array')
  };


  exports.BINARYOPS = new Constants(['instanceof', 'in', '==', '!=', '===', '!==', '<', '>',
                                   '<=', '>=', '*', '/','%', '+', '-', '<<', '>>', '>>>', '|', '&', '^', 'string+']);
  exports.UNARYOPS = new Constants(['delete', 'void', 'typeof', '+', '-', '~', '!']);
  exports.ENTRY = new Constants(['ENV', 'FINALLY', 'TRYCATCH', 'FOROF' ]);
  exports.FUNCTYPE = new Constants(['NORMAL', 'METHOD', 'ARROW' ]);
  exports.SCOPE = new Constants(['EVAL', 'FUNCTION', 'GLOBAL', 'MODULE' ]);

  exports.SYMBOLS = {
    Break            : new Token('Break'),
    Pause            : new Token('Pause'),
    Throw            : new Token('Throw'),
    Empty            : new Token('Empty'),
    Resume           : new Token('Resume'),
    Return           : new Token('Return'),
    Normal           : new Token('Normal'),
    Abrupt           : new Token('Abrupt'),
    Builtin          : new Token('Builtin'),
    Continue         : new Token('Continue'),
    Reference        : new Token('Reference'),
    Completion       : new Token('Completion'),
    Uninitialized    : new Token('Uninitialized')
  };

  var E = 0x1,
      C = 0x2,
      W = 0x4,
      A = 0x8;

  exports.ATTRIBUTES = {
    ENUMERABLE  : E,
    CONFIGURABLE: C,
    WRITABLE    : W,
    ACCESSOR    : A,
    ___: 0,
    E__: E,
    _C_: C,
    EC_: E | C,
    __W: W,
    E_W: E | W,
    _CW: C | W,
    ECW: E | C | W,
    __A: A,
    E_A: E | A,
    _CA: C | A,
    ECA: E | C | A
  };

  exports.AST = new Constants(ownKeys(require('esprima').Syntax));

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
