var constants = (function(exports){
  "use strict";
  var objects = require('./lib/objects');

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

  exports.BINARYOPS = new Constants(['instanceof', 'in', '==', '!=', '===', '!==', '<', '>',
                                   '<=', '>=', '*', '/','%', '+', '-', '<<', '>>', '>>>', '|', '&', '^', 'string+']);
  exports.UNARYOPS = new Constants(['delete', 'void', 'typeof', '+', '-', '~', '!']);
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
    },
    function DefaultValue(hint){
      return hint === 'String' ? 'undefined' : NaN;
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

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
