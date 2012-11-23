var Emitter = (function(module){
  var objects   = require('./objects'),
      iteration = require('./iteration');

  var define   = objects.define,
      Hash     = objects.Hash,
      each     = iteration.each;

 function Emitter(){
    '_events' in this || define(this, '_events', new Hash);
  }

  define(Emitter.prototype, [
    function on(type, handler){
      var events = this._events;
      each(type.split(/\s+/), function(event){
        if (!(event in events)) {
          events[event] = [];
        }
        events[event].push(handler);
      });
    },
    function off(type, handler){
      var events = this._events;
      each(type.split(/\s+/), function(event){
        if (event in events) {
          var index = '__index' in handler ? handler.__index : events[event].indexOf(handler);
          if (~index) {
            events[event].splice(index, 1);
          }
        }
      });
    },
    function once(type, handler){
      function one(val){
        this.off(type, one);
        handler.call(this, val);
      }
      this.on(type, one);
    },
    function emit(type, val){
      var handlers = this._events['*'];

      if (handlers) {;
        for (var i=0; i < handlers.length; i++) {
          handlers[i].call(this, type, val);
        }
      }

      handlers = this._events[type];
      if (handlers) {
        for (var i=0; i < handlers.length; i++) {
          handlers[i].call(this, val);
        }
      }
    }
  ]);

  return module.exports = Emitter;
})(typeof module !== 'undefined' ? module : {});
