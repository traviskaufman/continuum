var natives = (function(module){
  var HashMap = require('../lib/HashMap'),
      inherit = require('../lib/objects').inherit,
      isObject = require('../lib/objects').isObject,
      each = require('../lib/iteration').each,
      fname = require('../lib/functions').fname;

  function BulkMap(){
    HashMap.apply(this, arguments);
  }

  inherit(BulkMap, HashMap, [
    function add(name, value){
      if (typeof name === 'string') {
        this.set(name, value);
      } else if (typeof name === 'function') {
        this.set(fname(name), name);
      } else if (isObject(name)) {
        each(name, function(value, name){
          this.set(name, value);
        }, this);
      }
      return this.size;
    }
  ]);


  return module.exports = new BulkMap;
})(typeof module !== 'undefined' ? module : {});
