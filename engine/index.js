var index = (function(exports){
  var runtime   = require('./runtime'),
      assembler = require('./assembler'),
      debug     = require('./debug'),
      constants = require('./constants'),
      utility   = require('./utility'),
      errors    = require('./errors');

  var Realm = runtime.Realm,
      Script = runtime.Script,
      Renderer = debug.Renderer,
      $NativeFunction = runtime.$NativeFunction,
      builtins = runtime.builtins;


  var exoticTemplates = {
    Array: function(){
      return function $ExoticArray(len){
        builtins.$Array.call(this, +len || 0);
        this.init.apply(this, arguments);
      };
    },
    Function: function(){
      return function $ExoticFunction(call, construct){
        this.call = call;
        if (construct) {
          this.construct = construct;
        }
        this.init.apply(this, arguments);
      }
    },
    Object: function(){
      return function $ExoticObject(){
        builtins.$Object.call(this);
        this.init.apply(this, arguments);
      }
    }
  };


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
    function createFunction(options){
      return new $NativeFunction(options);
    },
    function createExotic(inherits, handlers){
      if (typeof inherits === 'string') {
        if (!(inherits in exoticTemplates)) {
          inherits = 'Object';
        }
        var $Exotic = exoticTemplates[inherits]();
      } else if (!handlers) {
        handlers = inherits;
      }

      if (!$Exotic) {
        $Exotic = exoticTemplates.Object();
        inherits = 'Object';
      }

      var Super = builtins['$'+inherits];


      utility.inherit($Exotic, Super, {
        Native: true,
      }, [
        function init(){},
        function remove(key){
          this.update(key, undefined);
        },
        function describe(key){
          return [key, this.get(key), this.query(key)];
        },
        function define(key, value, attrs){
          this.set(key, value);
          this.update(key, attrs);
        },
        function has(key){
          return this.query(key) !== undefined;
        },
        function each(callback){
          return errors.ThrowException('missing_fundamental_handler', 'each');
        },
        function get(key){
          return errors.ThrowException('missing_fundamental_handler', 'get');
        },
        function set(key, value){
          return errors.ThrowException('missing_fundamental_handler', 'set');
        },
        function query(key){
          return errors.ThrowException('missing_fundamental_handler', 'query');
        },
        function update(key, attr){
          return errors.ThrowException('missing_fundamental_handler', 'update');
        }
      ]);

      if (Super.prototype.Call) {
        utility.define($Exotic.prototype, [
          function call(){},
          function construct(){},
          $NativeFunction.prototype.Call,
          $NativeFunction.prototype.Construct,
          $NativeFunction.prototype.HasInstance,
        ]);
      }

      if (handlers) {
        utility.define($Exotic.prototype, handlers);
      }

      return $Exotic;
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

