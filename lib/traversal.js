var traversal = (function(exports){
  var objects   = require('./objects'),
      functions = require('./functions'),
      utility   = require('./utility'),
      Queue     = require('./Queue');

  var isObject       = objects.isObject,
      hasOwn         = objects.hasOwn,
      create         = objects.create,
      ownKeys        = objects.keys,
      ownProperties  = objects.properties,
      getPrototypeOf = objects.getPrototypeOf,
      Hash           = objects.Hash,
      uid            = utility.uid,
      toArray        = functions.toArray;



  function clone(o, hidden){
    function recurse(from, to, key){
      try {
        var val = from[key];
        if (!isObject(val)) {
          return to[key] = val;
        }
        if (from[key] === val) {
          if (hasOwn(from[key], tag)) {
            return to[key] = from[key][tag];
          }
          to[key] = enqueue(from[key]);
        }
      } catch (e) {}
    }

    function enqueue(o){
      var out = o instanceof Array ? [] : create(getPrototypeOf(o));
      tagged.push(o);
      var keys = list(o);
      for (var i=0; i < keys.length; i++) {
        queue.push([o, out, keys[i]]);
      }
      o[tag] = out;
      return out;
    }

    var queue = new Queue,
        tag = uid(),
        tagged = [],
        list = hidden ? ownProperties : ownKeys,
        out = enqueue(o);

    while (queue.length) {
      recurse.apply(this, queue.shift());
    }

    for (var i=0; i < tagged.length; i++) {
      delete tagged[tag];
    }

    return out;
  }
  exports.clone = clone;

  function walk(root, callback){
    var queue = new Queue([[root]]),
        branded = [],
        tag = uid();

    while (queue.length) {
      recurse(queue.shift());
    }

    for (var i=0; i < branded.length; i++) {
      delete branded[i][tag];
    }

    function recurse(node){
      if (!isObject(node)) return;
      var keys = ownKeys(node);
      for (var i=0; i < keys.length; i++) {
        var key = keys[i],
            item = node[key];

        if (isObject(item) && !hasOwn(item, tag)) {
          item[tag] = true;
          branded.push(item);
          var result = callback(item, node);
          if (result === walk.RECURSE) {
            queue.push(item);
          } else if (result === walk.BREAK) {
            return queue.empty();
          }
        }
      }
    }
  }
  exports.walk = walk;

  var BREAK    = walk.BREAK    = new Number(1),
      CONTINUE = walk.CONTINUE = new Number(2),
      RECURSE  = walk.RECURSE  = new Number(3);

  exports.collector = (function(){
    function path(){
      var parts = toArray(arguments);

      for (var i=0; i < parts.length; i++) {

        if (typeof parts[i] === 'function') {
          return function(o){
            for (var i=0; i < parts.length; i++) {
              var part = parts[i],
                  type = typeof part;

              if (type === 'string') {
                o = o[part];
              } else if (type === 'function') {
                o = part(o);
              }
            }
            return o;
          };
        }
      }

      return function(o){
        for (var i=0; i < parts.length; i++) {
          o = o[parts[i]];
        }
        return o;
      };
    }


    function collector(o){
      var handlers = new Hash;
      for (var k in o) {
        if (o[k] instanceof Array) {
          handlers[k] = path(o[k]);
        } else if (typeof o[k] === 'function') {
          handlers[k] = o[k];
        } else {
          handlers[k] = o[k];
        }
      }

      return function(node){
        var items  = [];

        function walker(node, parent){
          if (!node) return CONTINUE;

          if (node instanceof Array) {
            return RECURSE;
          }

          var handler = handlers[node.type];

          if (handler === true) {
            items.push(node);
          } else if (handler === RECURSE || handler === CONTINUE) {
            return handler;
          } else if (typeof handler === 'string') {
            if (node[handler]) {
              walk(node[handler], walker);
            }
          } else if (typeof handler === 'function') {
            var item = handler(node);
            if (item !== undefined) {
              items.push(item);
            }
          } else

          return CONTINUE;
        }

        walk(node, walker);

        return items;
      };
    }

    return collector;
  })();

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
