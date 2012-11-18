var index = (function(exports){
  var runtime   = require('./runtime'),
      assembler = require('./assembler'),
      debug     = require('./debug'),
      constants = require('./constants'),
      utility   = require('./utility');

  var Realm = runtime.Realm,
      Script = runtime.Script,
      $NativeFunction = runtime.$NativeFunction,
      Renderer = debug.Renderer;

  utility.assign(exports, [
    function createRealm(listener){
      return new Realm(listener);
    },
    function createScript(options){
      return new Script(options);
    },
    function createCode(options){
      return new Script(options).bytecode;
    },
    function createRenderer(handlers){
      return new Renderer(handlers);
    },
    function createFunction(o){
      return new $NativeFunction(o)
    }
  ]);

  utility.define(exports, {
    Assembler : assembler.Assembler,
    Code      : assembler.Code,
    Realm     : Realm,
    Renderer  : Renderer,
    Script    : Script,
    utility   : utility,
    constants : constants,
    iterate   : utility.iterate,
    introspect: debug.introspect
  });

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});

