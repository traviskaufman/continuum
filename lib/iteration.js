var iteration = (function(exports){
  var objects   = require('./objects'),
      functions = require('./functions');

  var define   = objects.define,
      ownKeys  = objects.keys,
      isObject = objects.isObject,
      call     = functions.call,
      apply    = functions.apply;


  var StopIteration = exports.StopIteration = global.StopIteration || {};

  function Iterator(){}

  define(Iterator.prototype, [
    function __iterator__(){
      return this;
    }
  ]);

  exports.Iterator = Iterator;

  function Item(key, value){
    this[0] = key;
    this[1] = value;
  }

  exports.Item = Item;
  define(Item.prototype, {
    isItem: true,
    length: 2
  }, [
    function toString(){
      return this[0] + '';
    },
    function valueOf(){
      return this[1];
    }
  ]);

  function createItem(key, value){
    return new Item(key, value);
  }

  exports.createItem = createItem;


  function iterate(o, callback, context){
    if (o == null) return;
    var type = typeof o;
    context = context || o;
    if (type === 'number' || type === 'boolean') {
      callback.call(context, new Item(0, o));
    } else {
      o = Object(o);
      var iterator = o.__iterator__ || o.iterator;

      if (typeof iterator === 'function') {
        var iter = iterator.call(o);
        if (iter && typeof iter.next === 'function') {
          try {
            while (1) callback.call(context, iter.next());
          } catch (e) {
            if (e === StopIteration) return;
            throw e;
          }
        }
      }

      if (type !== 'function' && o.length) {
        try {
          for (var i=0; i < o.length; i++) {
            callback.call(context, new Item(i, o[i]));
          }
        } catch (e) {
          if (e === StopIteration) return;
          throw e;
        }
      } else {
        var keys = ownKeys(o);
        try {
          for (var i=0; i < keys.length; i++) {
            var key = keys[i];
            callback.call(context, new Item(key, o[key]));
          }
        } catch (e) {
          if (e === StopIteration) return;
          throw e;
        }
      }
    }
  }
  exports.iterate = iterate;


  function each(o, callback, context){
    if (!o) return;
    if (context === undefined) {
      if (typeof o === 'object' && 'length' in o) {
        for (var i=0; i < o.length; i++) {
          callback(o[i], i, o);
        }
      } else if (isObject(o)) {
        var keys = ownKeys(o);
        for (var i=0; i < keys.length; i++) {
          var key = keys[i];
          callback(o[key], key, o);
        }
      }
    } else {
      if (typeof o === 'object' && 'length' in o) {
        for (var i=0; i < o.length; i++) {
          callback.call(context, o[i], i, o);
        }
      } else if (isObject(o)) {
        var keys = ownKeys(o);
        for (var i=0; i < keys.length; i++) {
          var key = keys[i];
          callback.call(context, o[key], key, o);
        }
      }
    }
  }
  exports.each = each;


  function map(o, callback, context){
    if (context === undefined) {
      if (typeof o === 'object' && 'length' in o) {
        var out = new Array(o.length);

        for (var i=0; i < o.length; i++) {
          out[i] = callback(o[i], i, o);
        }
      } else if (isObject(o)) {
        var out = ownKeys(o);

        for (var i=0; i < out.length; i++) {
          var key = out[i];
          out[i] = callback(o[key], key, o);
        }
      }
    } else {
      if (typeof o === 'object' && 'length' in o) {
        var out = new Array(o.length);

        for (var i=0; i < o.length; i++) {
          out[i] = callback.call(context, o[i], i, o);
        }
      } else if (isObject(o)) {
        var out = ownKeys(o);

        for (var i=0; i < out.length; i++) {
          var key = out[i];
          out[i] = callback.call(context, o[key], key, o);
        }
      }
    }

    return out;
  }
  exports.map = map;


  function fold(o, initial, callback){
    if (callback) {
      var val = initial, i = 0;
    } else {
      if (typeof initial === 'string') {
        callback = fold[initial];
      } else {
        callback = initial;
      }

      var val = o[0], i = 1;
    }
    for (; i < o.length; i++) {
      val = callback(val, o[i], i, o);
    }
    return val;
  }
  exports.fold = fold;

  fold['+'] = function(a, b){ return a + b };
  fold['*'] = function(a, b){ return a - b };
  fold['-'] = function(a, b){ return a * b };
  fold['/'] = function(a, b){ return a / b };


  function repeat(n, args, callback){
    if (typeof args === 'function') {
      callback = args;
      for (var i=0; i < n; i++) {
        callback();
      }
    } else {
      for (var i=0; i < n; i++) {
        callback.apply(this, args);
      }
    }
  }
  exports.repeat = repeat;


  function generate(n, callback){
    var out = new Array(n);
    for (var i=0; i < n; i++) {
      out[i] = callback(i, n, out);
    }
    return out;
  }
  exports.generate = generate;


  return exports;
})(typeof module !== 'undefined' ? module.exports : {});

