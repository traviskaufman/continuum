var collections = (function(exports){
  "use strict";
  var objects   = require('../lib/objects'),
      traversal = require('../lib/traversal'),
      utility   = require('../lib/utility');

  var Hash    = objects.Hash,
      create  = objects.create,
      define  = objects.define,
      inherit = objects.inherit,
      hasOwn  = objects.hasOwn,
      jsonify = traversal.jsonify,
      tag     = utility.tag;

  exports.MapData = (function(){
    function LinkedItem(key, next){
      this.key = key;
      this.next = next;
      this.previous = next.previous;
      next.previous = next.previous.next = this;
    }

    define(LinkedItem.prototype, [
      function unlink(){
        this.next.previous = this.previous;
        this.previous.next = this.next;
        this.next = this.previous = this.value = this.key = null;
        return this.value;
      }
    ]);


    function MapData(){
      tag(this);
      this.guard = create(LinkedItem.prototype);
      this.guard.key = {};
      this.reset();
    }

    MapData.sigil = create(null);

    define(MapData.prototype, {
      type: 'MapData'
    });

    define(MapData.prototype, [
      function toJSON(key){
        var entries = [];
        this.forEach(function(value, key){
          console.log(value, key);
          entries.push([jsonify(key), jsonify(value)]);
        });
        return { type: 'MapData',
                 entries: entries };
      },
      function reset(){
        this.size = 0;
        this.numbers = [];
        this.strings = new Hash;
        this.others = new Hash;
        this.lastLookup = this.guard.next = this.guard.previous = this.guard;
      },
      function clone(){
        var result = new MapData;
        this.forEach(function(value, key){
          result.set(key, value);
        });
        return result;
      },
      function forEach(callback, context){
        var item  = this.guard.next,
            index = 0;

        context = context || this;

        while (item !== this.guard) {
          callback.call(context, item.value, item.key, this);
          item = item.next;
        }
      },
      function clear(){
        var next, item = this.guard.next;

        while (item !== this.guard) {
          next = item.next;
          if (item.key !== null && typeof item.key === 'object') {
            delete item.key.storage[this.id];
          }
          item.next = item.previous = item.value = item.key = null;
          item = next;
        }

        this.reset();
      },
      function add(key){
        this.size++;
        return new LinkedItem(key, this.guard);
      },
      function lookup(key){
        var type = typeof key;
        if (key === this) {
          return this.guard;
        } else if (key !== null && type === 'object') {
          return key.storage[this.id];
        } else {
          var storage = this.getStorage(key);
          if (hasOwn(storage, key)) {
            return storage[key];
          }
        }
      },
      function getStorage(key){
        var type = typeof key;
        if (type === 'string') {
          return this.strings;
        } else if (type === 'number') {
          return key === 0 && 1 / key === -Infinity ? this.others : this.numbers;
        } else {
          return this.others;
        }
      },
      function set(key, value){
        var type = typeof key;
        if (key !== null && type === 'object') {
          var item = key.storage[this.id] || (key.storage[this.id] = this.add(key));
        } else {
          var items = this.getStorage(key),
              item  = items[key] || (items[key] = this.add(key));
        }
        item.value = value;
      },
      function get(key){
        var item = this.lookup(key);
        if (item) {
          return item.value;
        }
      },
      function has(key){
        return !!this.lookup(key);
      },
      function remove(key){
        if (key !== null && typeof key === 'object') {
          var item = key.storage[this.id];
          if (item) {
            delete key.storage[this.id];
          }
        } else {
          var items = this.getStorage(key),
              item  = items[key];

          if (item) {
            delete items[key];
          }
        }

        if (item) {
          item.unlink();
          this.size--;
          return true;
        }
        return false;
      },
      function after(key){
        if (key === MapData.sigil) {
          var item = this.guard;
        } else if (key === this.lastLookup.key) {
          var item = this.lastLookup;
        } else {
          var item = this.lookup(key);
        }
        if (item && item.next !== this.guard) {
          this.lastLookup = item.next;
          return [item.next.key, item.next.value];
        }
      }
    ]);

    return MapData;
  })();


  exports.WeakMapData = (function(){
    function WeakMapData(){
      tag(this);
    }

    define(WeakMapData.prototype, {
      type: 'WeakMapData'
    });
    define(WeakMapData.prototype, [
      function set(key, value){
        if (value === undefined) {
          value = Empty;
        }
        key.storage[this.id] = value;
      },
      function get(key){
        var value = key.storage[this.id];
        if (value !== Empty) {
          return value;
        }
      },
      function has(key){
        return key.storage[this.id] !== undefined;
      },
      function remove(key){
        var item = key.storage[this.id];
        if (item !== undefined) {
          key.storage[this.id] = undefined;
          return true;
        }
        return false;
      }
    ]);

    return WeakMapData;
  })();


  return exports;
})(typeof module !== 'undefined' ? exports : {});
