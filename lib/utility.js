var utility = (function(exports){
  var objects   = require('./objects'),
      functions = require('./functions');

  var Hash      = objects.Hash,
      applybind = functions.applybind;

  var seed = Math.random().toString(36).slice(2),
      count = (Math.random() * (1 << 30)) | 0;

  exports.uid = function uid(){
    return seed + count++;
  }

  exports.pushAll = applybind([].push, []);

  exports.nextTick = typeof process !== 'undefined'
                    ? process.nextTick
                    : function nextTick(f){ setTimeout(f, 1) };


  exports.numbers = (function(cache){
    return function numbers(start, end){
      if (!isFinite(end)) {
        end = start;
        start = 0;
      }
      var length = end - start,
          curr;

      if (end > cache.length) {
        while (length--)
          cache[curr = length + start] = '' + curr;
      }
      return cache.slice(start, end);
    };
  })([]);


  function quotes(s) {
    s = (''+s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
    var singles = 0,
        doubles = 0,
        i = s.length;

    while (i--) {
      if (s[i] === '"') {
        doubles++;
      } else if (s[i] === "'") {
        singles++;
      }
    }

    if (singles > doubles) {
      return '"' + s.replace(/"/g, '\\"') + '"';
    } else {
      return "'" + s.replace(/'/g, "\\'") + "'";
    }
  }
  exports.quotes = quotes;


  function unique(strings){
    var seen = new Hash,
        out = [];

    for (var i=0; i < strings.length; i++) {
      if (!(strings[i] in seen)) {
        seen[strings[i]] = true;
        out.push(strings[i]);
      }
    }

    return out;
  }
  exports.unique = unique;


  var MAX_INTEGER = 9007199254740992;

  function toInteger(v){
    if (v === Infinity) {
      return MAX_INTEGER;
    } else if (v === -Infinity) {
      return -MAX_INTEGER;
    } else {
      return v - 0 >> 0;
    }
  }
  exports.toInteger = toInteger;


  function isNaN(number){
    return number !== number;
  }
  exports.isNaN = isNaN;


  function isFinite(number){
    return typeof value === 'number'
               && value === value
               && value < Infinity
               && value > -Infinity;
  }
  exports.isFinite = isFinite;


  function isInteger(value) {
    return typeof value === 'number'
               && value === value
               && value > -MAX_INTEGER
               && value < MAX_INTEGER
               && value >> 0 === value;
  }
  exports.isInteger = isInteger;

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
