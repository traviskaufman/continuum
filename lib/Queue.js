var Queue = (function(module){
  var objects   = require('./objects'),
      functions = require('./functions'),
      iteration = require('./iteration');

  var isObject      = objects.isObject,
      define        = objects.define,
      inherit       = objects.inherit,
      toArray       = functions.toArray,
      pushable      = functions.pushable,
      iterate       = iteration.iterate,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


  function QueueIterator(queue){
    this.queue = queue;
    this.index = queue.index;
  }

  inherit(QueueIterator, Iterator, [
    function next(){
      if (this.index === this.queue.items.length) {
        throw StopIteration;
      }
      return this.queue.items[this.index++];
    }
  ]);

  function Queue(iterable){
    this.index = this.length = 0;
    if (iterable != null) {
      if (iterable instanceof Queue) {
        this.items = iterable.items.slice(iterable.front);
        this.length = this.items.length;
      } else {
        this.items = [];
        iterate(iterable, this.push, this);
      }
    } else {
      this.items = [];
    }
  }

  define(Queue.prototype, [
    function push(item){
      this.items.push(item);
      this.length++;
      return this;
    },
    function shift(){
      if (this.length) {
        var item = this.items[this.index];
        this.items[this.index++] = null;
        this.length--;
        if (this.index === 500) {
          this.items = this.items.slice(this.index);
          this.index = 0;
        }
        return item;
      }
    },
    function empty(){
      this.length = 0;
      this.index = 0;
      this.items = [];
      return this;
    },
    function front(){
      return this.items[this.index];
    },
    function item(depth){
      return this.items[this.index + depth];
    },
    function __iterator__(){
      return new QueueIterator(this);
    }
  ]);

  return module.exports = Queue;
})(typeof module !== 'undefined' ? module : {});
