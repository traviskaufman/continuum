var Feeder = (function(module){
  var objects = require('./objects'),
      Queue   = require('./Queue');

  var define = objects.define;


  function Feeder(callback, context, pace){
    var self = this;
    this.queue = new Queue;
    this.active = false;
    this.pace = pace || 5;
    this.feeder = function feeder(){
      var count = Math.min(self.pace, self.queue.length);

      while (self.active && count--) {
        callback.call(context, self.queue.shift());
      }

      if (!self.queue.length) {
        self.active = false;
      } else if (self.active) {
        setTimeout(feeder, 15);
      }
    };
  }

  define(Feeder.prototype, [
    function push(item){
      this.queue.push(item);
      if (!this.active) {
        this.active = true;
        setTimeout(this.feeder, 15);
      }
      return this;
    },
    function pause(){
      this.active = false;
    }
  ]);

  return module.exports = Feeder;
})(typeof module !== 'undefined' ? module.exports : {});
