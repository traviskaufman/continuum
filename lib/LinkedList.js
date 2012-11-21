var LinkedList = (function(module){
  var objects   = require('../lib/objects'),
      iteration = require('../lib/iteration');

  var define        = objects.define,
      inherit       = objects.inherit,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


  function LinkedListIterator(list){
    this.item = list.sentinel;
    this.sentinel = list.sentinel;
  }

  inherit(LinkedListIterator, Iterator, [
    function next(){
      this.item = this.item.next;
      if (this.item === this.sentinel) {
        throw StopIteration;
      }
      return this.item.data;
    }
  ]);


  function Item(data){
    this.data = data;
  }

  define(Item.prototype, [
    function link(item){
      item.next = this;
      return item;
    },
    function unlink(){
      var next = this.next;
      this.next = next.next;
      next.next = null;
      return this;
    },
    function clear(){
      var data = this.data;
      this.data = undefined;
      this.next = null;
      return data;
    }
  ]);

  function Sentinel(){
    this.next = null;
  }

  inherit(Sentinel, Item, [
    function unlink(){
      return this;
    },
    function clear(){}
  ]);

  function find(list, value){
    if (list.lastFind && list.lastFind.next.data === value) {
      return list.lastFind;
    }

    var item = list.tail,
        i = 0;

    while ((item = item.next) !== list.sentinel) {
      if (item.next.data === value) {
        return list.lastFind = item;
      }
    }
  }

  function LinkedList(){
    var sentinel = new Sentinel;
    this.size = 0;
    define(this, {
      sentinel: sentinel,
      tail: sentinel,
      lastFind: null
    });
  }

  define(LinkedList.prototype, [
    function push(value){
      this.tail = this.tail.link(new Item(value));
      return ++this.size;
    },
    function pop() {
      var tail = this.tail,
          data = tail.data;
      this.tail = tail.next;
      tail.next = null;
      tail.data = undefined;
      return data;
    },
    function insert(value, before){
      var item = find(this, before);
      if (item) {
        var inserted = new Item(value);
        inserted.next = item.next;
        item.next = inserted;
        return ++this.size;
      }
      return false;
    },
    function remove(value){
      var item = find(this, value);
      if (item) {
        item.unlink();
        return --this.size;
      }
      return false;
    },
    function replace(value, replacement){
      var item = find(this, value);
      if (item) {
        var replacer = new Item(replacement);
        replacer.next = item.next.next;
        item.next.next = null;
        item.next = replacer;
        return true;
      }
      return false;
    },
    function has(value) {
      return !!find(this, value);
    },
    function items(){
      var item = this.tail,
          array = [];

      while (item !== this.sentinel) {
        array.push(item.data);
        item = item.next;
      }

      return array;
    },
    function clear(){
      var next,
          item = this.tail;

      while (item !== this.sentinel) {
        next = item.next;
        item.clear();
        item = next;
      }

      this.tail = this.sentinel;
      this.size = 0;
      return this;
    },
    function clone(){
      var items = this.items(),
          list = new LinkedList,
          i = items.length;

      while (i--) {
        list.push(items[i]);
      }
      return list;
    },
    function __iterator__(){
      return new LinkedListIterator(this);
    }
  ]);

  return module.exports = LinkedList;
})(typeof module !== 'undefined' ? module : {});
