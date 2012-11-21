var PropertyList = (function(module){
  var objects   = require('./objects'),
      iteration = require('./iteration');

  var isObject      = objects.isObject,
      define        = objects.define,
      inherit       = objects.inherit,
      Hash          = objects.Hash,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;

  var proto = require('./utility').uid();

  var PropertyListIterator = (function(){
    var types = {
      keys: 0,
      values: 1,
      attributes: 2
    };

    function PropertyListIterator(list, type){
      this.list = list;
      this.type = type ? types[type] : 'items';
      this.index = 0;
    }

    inherit(PropertyListIterator, Iterator, [
      function next(){
        var props = this.list.props, property;
        while (!property) {
          if (this.index >= props.length) {
            throw StopIteration;
          }
          property = props[this.index++];
        }
        return this.type === 'items' ? property : property[this.type];
      }
    ]);

    return PropertyListIterator;
  })();

  function PropertyList(){
    this.hash = new Hash;
    this.props = [];
    this.holes = 0;
    this.length = 0;
  }

  define(PropertyList.prototype, [
    function get(key){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index !== undefined) {
        return this.props[index][1];
      }
    },
    function getAttribute(key){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index !== undefined) {
        return this.props[index][2];
      } else {
        return null;
      }
    },
    function getProperty(key){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index !== undefined) {
        return this.props[index];
      } else {
        return null;
      }
    },
    function set(key, value, attr){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name],
          prop;

      if (index === undefined) {
        index = this.hash[name] = this.props.length;
        prop = this.props[index] = [key, value, 0];
        this.length++;
      } else {
        prop = this.props[index];
        prop[1] = value;
      }

      if (attr !== undefined) {
        prop[2] = attr;
      }
      return true;
    },
    function initialize(props){
      var len = props.length;
      for (var i=0; i < len; i += 3) {
        var index = this.hash[props[i]] = this.props.length;
        this.props[index] = [props[i], props[i + 1], props[i + 2]];
      }
    },
    function setAttribute(key, attr){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index !== undefined) {
        this.props[index][2] = attr;
        return true;
      } else {
        return false;
      }
    },
    function setProperty(prop){
      var key = prop[0],
          name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index === undefined) {
        index = this.hash[name] = this.props.length;
        this.length++;
      }
      this.props[index] = prop;
    },
    function remove(key){
      var name = key === '__proto__' ? proto : key,
          index = this.hash[name];
      if (index !== undefined) {
        this.hash[name] = undefined;
        this.props[index] = undefined;
        this.holes++;
        this.length--;
        return true;
      } else {
        return false;
      }
    },
    function has(key){
      var name = key === '__proto__' ? proto : key;
      return this.hash[name] !== undefined;
    },
    function hasAttribute(key, mask){
      var name = key === '__proto__' ? proto : key,
          attr = this.getAttribute(name);
      if (attr !== null) {
        return (attr & mask) > 0;
      }
    },
    function compact(){
      var props = this.props,
          len = props.length,
          index = 0,
          prop;

      this.hash = new Hash;
      this.props = [];
      this.holes = 0;

      for (var i=0; i < len; i++) {
        if (prop = props[i]) {
          var name = prop[0] === '__proto__' ? proto : prop[0];
          this.props[index] = prop;
          this.hash[name] = index++;
        }
      }
    },
    function forEach(callback, context){
      var len = this.props.length,
          index = 0,
          prop;

      context = context || this;

      for (var i=0; i < len; i++) {
        if (prop = this.props[i]) {
          callback.call(context, prop, index++, this);
        }
      }
    },
    function map(callback, context){
      var out = [],
          len = this.props.length,
          index = 0,
          prop;

      context = context || this;

      for (var i=0; i < len; i++) {
        if (prop = this.props[i]) {
          out[index] = callback.call(context, prop, index++, this);
        }
      }

      return out;
    },
    function translate(callback, context){
      var out = new PropertyList;

      out.length = this.length;
      context = context || this;

      this.forEach(function(prop, index){
        prop = callback.call(context, prop, index, this);
        var name = prop[0] === '__proto__' ? proto : prop[0];
        out.props[index] = prop;
        out.hash[name] = index;
      });

      return out;
    },
    function filter(callback, context){
      var out = new PropertyList,
          index = 0;

      context = context || this;

      this.forEach(function(prop, i){
        if (callback.call(context, prop, i, this)) {
          var name = prop[0] === '__proto__' ? proto : prop[0];
          out.props[index] = prop;
          out.hash[name] = index++;
        }
      });

      return out;
    },
    function clone(deep){
      return this.translate(function(prop, i){
        return deep ? prop.slice() : prop;
      });
    },
    function keys(){
      return this.map(function(prop){
        return prop[0];
      });
    },
    function values(){
      return this.map(function(prop){
        return prop[1];
      });
    },
    function items(){
      return this.map(function(prop){
        return prop.slice();
      });
    },
    function merge(list){
      each(list, this.setProperty, this);
    },
    function __iterator__(type){
      return new PropertyListIterator(this, type);
    }
  ]);

  if (require('util')) {
    void function(){
      var insp = require('util').inspect;

      function Token(value){
        this.value = value + '';
      }

      Token.prototype.inspect = function(){ return this.value };

      define(PropertyList.prototype, function inspect(){
        var out = new Hash;

        this.forEach(function(prop){
          var key = typeof prop[0] === 'string' ? prop[0] : '_@_'+insp(prop[0]);

          var attrs = (prop[2] & 0x01 ? 'E' : '_') +
                      (prop[2] & 0x02 ? 'C' : '_') +
                      (prop[2] & 0x04 ? 'W' :
                       prop[2] & 0x08 ? 'A' : '_');

          out[key] = new Token(attrs + ' ' + (isObject(prop[1]) ? prop[1].NativeBrand : prop[1]));
        });

        return insp(out).replace(/'_@_@(\w+)'/g, '@$1');
      });
    }();
  }

  return module.exports = PropertyList;
})(typeof module !== 'undefined' ? module : {});
