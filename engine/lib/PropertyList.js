var PropertyList = (function(module){
  var objects   = require('./objects'),
      iteration = require('./iteration');

  var isObject      = objects.isObject,
      define        = objects.define,
      inherit       = objects.inherit,
      Hash          = objects.Hash,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration;


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
      var index = this.hash['$'+key];
      if (index !== undefined) {
        return this.props[index][1];
      }
    },
    function set(key, value){
      var name = '$'+key,
          index = this.hash[name];

      if (index === undefined) {
        index = this.hash[name] = this.props.length;
        this.props[index] = [key, value, 7];
        this.length++;
      } else {
        this.props[index][1] = value;
      }

      return true;
    },
    function query(key){
      var index = this.hash['$'+key];
      return index === undefined ? null : this.props[index][2];
    },
    function update(key, attr){
      var index = this.hash['$'+key];

      if (index !== undefined) {
        this.props[index][2] = attr;
        return true;
      }

      return false;
    },
    function describe(key){
      var index = this.hash['$'+key];
      return index === undefined ? null : this.props[index];
    },
    function define(key, value, attr){
      var name = '$'+key,
          index = this.hash[name];

      if (index === undefined) {
        index = this.hash[name] = this.props.length;
        this.props[index] = [key, value, attr];
        this.length++;
      } else {
        var prop = this.props[index];
        prop[1] = value;
        prop[2] = attr;
      }

      return this;
    },
    function remove(key){
      var name = '$'+key,
          index = this.hash[name];

      if (index !== undefined) {
        this.hash[name] = undefined;
        this.props[index] = undefined;
        this.length--;
        return true;
      }

      return false;
    },
    function has(key){
      return this.hash['$'+key] !== undefined;
    },
    function setProperty(prop){
      var name = '$'+prop[0],
          index = this.hash[name];

      if (index === undefined) {
        index = this.hash[name] = this.props.length;
        this.length++;
      }

      this.props[index] = prop;
    },
    function hasAttribute(key, mask){
      var attr = this.query('$'+key);
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
          this.props[index] = prop;
          this.hash['$'+prop[0]] = index++;
        }
      }
    },
    function each(callback, context){
      var len = this.props.length,
          index = 0,
          prop;

      context || (context = this);

      for (var i=0; i < len; i++) {
        if (prop = this.props[i]) {
          callback.call(context, prop);
        }
      }
    },
    function map(callback, context){
      var out = [],
          len = this.props.length,
          index = 0,
          prop;

      context || (context = this);

      for (var i=0; i < len; i++) {
        if (prop = this.props[i]) {
          out[index] = callback.call(context, prop);
        }
      }

      return out;
    },
    function translate(callback, context){
      var out = new PropertyList,
          index = 0;

      out.length = this.length;
      context || (context = this);

      this.each(function(prop){
        prop = callback.call(context, prop);
        out.props[index++] = prop;
        out.hash['$'+prop[0]] = index;
      });

      return out;
    },
    function filter(callback, context){
      var out = new PropertyList,
          index = 0;

      context || (context = this);

      this.each(function(prop){
        if (callback.call(context, prop)) {
          out.props[index] = prop;
          out.hash['$'+prop[0]] = index++;
        }
      });

      return out;
    },
    function clone(deep){
      return this.translate(function(prop){
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
      iterate(list, this.define, this);
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

        this.each(function(prop){
          var attrs = []
          if (typeof prop[0] === 'string') {
            var key = prop[0];
            if (!(prop[2] & 0x01)) {
              attrs.push('hidden');
            }
          } else {
            var key = '_@_@'+prop[0].Name;
            if (prop[0].Private) {
              attrs.push('private');
            }
          }

          if (!(prop[2] & 0x02)) {
            attrs.push('frozen');
          }

          if (prop[2] & 0x08) {
            attrs.push('accessor');
          } else if (!(prop[2] & 0x04)) {
            attrs.push('readonly');
          }

          out[key] = new Token(attrs.join('/') + ' ' + (isObject(prop[1]) ? prop[1].BuiltinBrand : prop[1]));
        });

        return insp(out).replace(/'_@_@(\w+)'/g, '@$1');
      });
    }();
  }

  return module.exports = PropertyList;
})(typeof module !== 'undefined' ? module : {});
