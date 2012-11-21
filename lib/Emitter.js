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
    function on(events, handler){
      each(events.split(/\s+/), function(event){
        if (!(event in this)) {
          this[event] = [];
        }
        this[event].push(handler);
      }, this._events);
    },
    function off(events, handler){
      each(events.split(/\s+/), function(event){
        if (event in this) {
          var index = '__index' in handler ? handler.__index : this[event].indexOf(handler);
          if (~index) {
            this[event].splice(index, 1);
          }
        }
      }, this._events);
    },
    function once(events, handler){
      function one(val){
        this.off(events, one);
        handler.call(this, val);
      }
      this.on(events, one);
    },
    function emit(event, val){
      var handlers = this._events['*'];

      if (handlers) {;
        for (var i=0; i < handlers.length; i++) {
          handlers[i].call(this, event, val);
        }
      }

      handlers = this._events[event];
      if (handlers) {
        for (var i=0; i < handlers.length; i++) {
          handlers[i].call(this, val);
        }
      }
    }
  ]);

  return module.exports = Emitter;
})(typeof module !== 'undefined' ? module : {});
