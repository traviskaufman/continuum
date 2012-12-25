var index = (function(exports){
  "use strict";
  var objects   = require('./lib/objects'),
      iteration = require('./lib/iteration'),
      runtime   = require('./runtime'),
      assembler = require('./assembler'),
      debug     = require('./debug'),
      constants = require('./constants'),
      errors    = require('./errors');

  var assign           = objects.assign,
      assignAll        = objects.assignAll,
      define           = objects.define,
      inherit          = objects.inherit,
      Realm            = runtime.Realm,
      Script           = runtime.Script,
      Renderer         = debug.Renderer,
      AbruptCompletion = errors.AbruptCompletion,
      $$ThrowException = errors.$$ThrowException,
      builtins         = runtime.builtins,
      $NativeFunction  = builtins.$NativeFunction;


  var exoticTemplates = {
    Array: function(){
      return function $ExoticArray(len){
        builtins.$Array.call(this, +len || 0);
        this.init.apply(this, arguments);
      };
    },
    Function: function(){
      return function $ExoticFunction(call, construct){
        builtins.$Object.call(this);
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


  assign(exports, [
    function createRealm(listener){
      return new Realm(listener);
    },
    function createRealmAsync(){
      return new Realm(true);
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
    function createAbruptCompletion(value){
      return new AbruptCompletion(value);
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


      inherit($Exotic, Super, {
        Native: true
      }, [
        function init(){},
        function remove(key){
          this.update(key, undefined);
        },
        function describe(key){
          return [key, this.get(key), this.query(key)];
        },
        (function(){
          return function define(key, value, attrs){
            this.set(key, value);
            this.update(key, attrs);
          };
        })(),
        function has(key){
          return this.query(key) !== undefined;
        },
        function each(callback){
          return $$ThrowException('missing_fundamental_handler', 'each');
        },
        function get(key){
          return $$ThrowException('missing_fundamental_handler', 'get');
        },
        function set(key, value){
          return $$ThrowException('missing_fundamental_handler', 'set');
        },
        function query(key){
          return $$ThrowException('missing_fundamental_handler', 'query');
        },
        function update(key, attr){
          return $$ThrowException('missing_fundamental_handler', 'update');
        }
      ]);

      if (Super.prototype.Call) {
        define($Exotic.prototype, [
          function call(){},
          function construct(){},
          $NativeFunction.prototype.Call,
          $NativeFunction.prototype.Construct,
          $NativeFunction.prototype.HasInstance
        ]);
      }

      if (handlers) {
        define($Exotic.prototype, handlers);
      }

      return $Exotic;
    }
  ]);


  function createInterceptor(name, construct){
    if (!construct && typeof name === 'function') {
      construct = name;
      name = fname(construct);
    }

    var Ctor = new $NativeFunction({
      name: name || '',
      length: construct.length,
      call: function(){
        var obj = new $IndexedInterceptor(construct.apply(null, arguments));
        obj.Prototype = Ctor.get('prototype');
        return obj;
      },
      construct: function(){
        var obj = new $IndexedInterceptor(construct.apply(null, arguments));
        obj.Prototype = Ctor.get('prototype');
        return obj;
      }
    });

    var proto = new builtins.$Object;
    proto.ConstructorName = name;
    proto.define('constructor', Ctor, 6);
    Ctor.define('prototype', proto, 4);

    return Ctor;
  }

  var $IndexedInterceptor = (function(){
    function $IndexedInterceptor(target){
      builtins.$Object.call(this);
      this.target = target;
      this.length = target.length;
      this.properties.set('length', target.length, 0);
    }

    inherit($IndexedInterceptor, builtins.$Object, {
      indexAttribute: 5
    }, [
      function remove(key){
        var index = +key;
        if (index >= 0 && index < this.target.length) {
          return delete this.target[index];
        }

        if (this.properties.has(key)) {
          return this.properties.remove(key);
        }
      },
      function describe(key){
        var index = +key;
        if (index >= 0 && index < this.target.length) {
          return [index+'', this.target[index], this.indexAttribute];
        }

        if (this.properties.has(key)) {
          return this.properties.describe(key);
        }
      },
      (function(){
        return function define(key, value, attrs){
          var index = +key;
          if (index >= 0 && index < this.target.length) {
            return this.target[index] = value;
          }

          if (this.properties.has(key)) {
            return this.properties.set(key, value, attrs);
          }
        };
      })(),
      function has(key){
        var index = +key;
        if (index >= 0 && index < this.target.length) {
          return true;
        }

        return this.properties.has(key);
      },
      function each(callback){
        var len = this.target.length;

        for (var i=0; i < len; i++) {
          callback([i+'', this.target[i], this.indexAttribute]);
        }

        this.properties.each(callback);
      },
      function get(key){
        var index = +key;
        if (index >= 0 && index < this.target.length) {
         return this.target[index];
        }

        if (this.properties.has(key)) {
          return this.properties.get(key);
        }
      },
      function set(key, value){
        var index = +key;
        if (index >= 0 && index < this.target.length) {
         return this.target[index] = value;
        }

        if (this.properties.has(key)) {
          return this.properties.set(key, value);
        }
      },
      function query(key){
        var index = +key;
        if (index >= 0 && index < this.target.length) {
          return this.indexAttribute;
        }

        if (this.properties.has(key)) {
          return this.properties.query(key);
        }
      },
      function update(key, attr){
        var index = +key;
        if (index >= 0 && index < this.target.length) {
          return false;
        }

        if (this.properties.has(key)) {
          return this.properties.update(key, attr);
        }
      }
    ]);

    return $IndexedInterceptor;
  })();

  function brainTransplant(func, call, construct){
    if (!(func instanceof $NativeFunction)) {
      func.Call = $NativeFunction.prototype.Call;
      func.Construct = $NativeFunction.prototype.Construct;
      if (call instanceof $NativeFunction) {
        construct = call.construct;
        call = call.call;
      }
      func.call = call;
      func.construct = construct;
    }
    return func;
  }


  define(exports, {
    Assembler : assembler.Assembler,
    Code      : assembler.Code,
    Realm     : Realm,
    Renderer  : Renderer,
    Script    : Script,
    constants : constants,
    iterate   : iteration.iterate,
    introspect: debug.introspect,
    createInterceptor: createInterceptor,
    brainTransplant: brainTransplant,
    utility: assignAll({}, [
      require('./lib/functions'),
      require('./lib/iteration'),
      require('./lib/objects'),
      require('./lib/traversal'),
      require('./lib/utility'),
      require('./lib/DoublyLinkedList'),
      require('./lib/Emitter'),
      require('./lib/Feeder'),
      require('./lib/HashMap'),
      require('./lib/ObjectMap'),
      require('./lib/HashSet'),
      require('./lib/LinkedList'),
      require('./lib/PropertyList'),
      require('./lib/Queue'),
      require('./lib/Stack')
    ]),
    debug: debug
  });

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});

