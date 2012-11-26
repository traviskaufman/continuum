var HashSet = (function(module){
  var objects   = require('../lib/objects'),
      functions = require('../lib/functions'),
      iteration = require('../lib/iteration'),
      DoublyLinkedList = require('../lib/DoublyLinkedList');

  var define        = objects.define,
      inherit       = objects.inherit,
      assign        = objects.assign,
      Hash          = objects.Hash,
      bind          = functions.bind,
      iterate       = functions.iterate,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


  var types = assign(new Hash, {
    'string': 'strings',
    'number': 'numbers',
    'undefined': 'others',
    'boolean': 'others',
    'object': 'others'
  });


  function HashSetIterator(set){
    this.item = set.list.sentinel;
    this.sentinel = set.list.sentinel;
  }

  inherit(HashSetIterator, Iterator, [
    function next(){
      var item = this.item = this.item.next;
      if (item === this.sentinel) {
        throw StopIteration;
      } else {
        return item.data;
      }
    }
  ]);

  function HashSet(){
    define(this, 'list', new DoublyLinkedList);
    this.clear();
  }

  define(HashSet.prototype, [
    function add(value){
      var data = this[types[typeof value]],
          item = data[value];

      if (!item) {
        this.list.push(value);
        data[value] = this.list.sentinel.prev;
        this.size = this.list.size;
      }
      return value;
    },
    function has(value){
      return value in this[types[typeof value]];
    },
    function remove(value){
      var data = this[types[typeof value]];

      if (value in data) {
        data[value].unlink();
        delete data[value];
        this.size = this.list.size;
        return true;
      }
      return false;
    },
    function clear(){
      define(this, {
        strings: new Hash,
        numbers: new Hash,
        others: new Hash
      });
      this.list.clear();
      this.size = 0;
    },
    function values(){
      var out = [];
      iterate(this, bind(_push, out));
      return out;
    },
    function __iterator__(){
      return new HashSetIterator(this);
    }
  ]);

  return module.exports = HashSet;
})(typeof module !== 'undefined' ? module : {});
