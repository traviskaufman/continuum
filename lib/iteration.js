var iteration = (function(exports){
  var objects   = require('./objects'),
      functions = require('./functions');

  var define  = objects.define,
      ownKeys = objects.keys,
      call    = functions.call,
      apply   = functions.apply;


  var StopIteration = exports.StopIteration = global.StopIteration || {};

  function Iterator(){}

  define(Iterator.prototype, [
    function __iterator__(){
      return this;
    }
  ]);

  exports.Iterator = Iterator;


  function iterate(o, callback, context){
    if (o == null) return;
    var type = typeof o;
    context = context || o;
    if (type === 'number' || type === 'boolean') {
      callback.call(context, o, 0, o);
    } else {
      o = Object(o);
      var iterator = o.__iterator__ || o.iterator;

      if (typeof iterator === 'function') {
        var iter = iterator.call(o);
        if (iter && typeof iter.next === 'function') {
          var i=0;
          try {
            while (1) callback.call(context, iter.next());
          } catch (e) {
            if (e === StopIteration) return;
            throw e;
          }
        }
      }

      if (type !== 'function' && o.length) {
        for (var i=0; i < o.length; i++) {
          callback.call(context, o[i], i, o);
        }
      } else {
        var keys = ownKeys(o);
        for (var i=0; i < keys.length; i++) {
          callback.call(context, o[keys[i]], keys[i], o);
        }
      }
    }
  }
  exports.iterate = iterate;


  function each(o, callback){
    for (var i=0; i < o.length; i++) {
      callback(o[i], i, o);
    }
  }
  exports.each = each;


  function map(o, callback){
    var out = new Array(o.length);
    for (var i=0; i < o.length; i++) {
      out[i] = callback(o[i], i);
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

