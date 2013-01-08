(function(global, continuum){

var utility          = continuum.utility,
    Feeder           = utility.Feeder,
    ObjectMap        = utility.ObjectMap,
    uid              = utility.uid,
    fname            = utility.fname,
    hasOwn           = utility.hasOwn,
    define           = utility.define,
    each             = utility.each,
    safeDefine       = utility.safeDefine,
    isObject         = utility.isObject,
    isExtensible     = utility.isExtensible,
    ownProperties    = utility.properties,
    getPrototypeOf   = utility.getPrototypeOf,
    getBrandOf       = utility.getBrandOf,
    describeProperty = utility.describeProperty,
    defineProperty   = utility.defineProperty,
    block            = continuum.block,
    createPanel      = continuum.createPanel,
    isUndetectable   = continuum.isUndetectable,
    render           = continuum.render,
    _                = continuum._;


var body         = _(document.body),
    input        = createPanel('editor'),
    stdout       = createPanel('console'),
    inspector    = createPanel('inspector'),
    instructions = createPanel('instructions');

void function(){
  var main = createPanel('panel', null, {
    name: 'container',
    top: {
      left: {
        size: 250,
        top: {
          size: .7,
          label: 'Instructions',
          name: 'instructions',
          content: instructions,
          scroll: true
        },
        bottom: {
          label: 'stdout',
          name: 'output',
          content: stdout,
          scroll: true
        },
      },
      right: {
        label: 'Inspector',
        name: 'view',
        content: inspector,
        scroll: true
      },
    },
    bottom: {
      name: 'input',
      size: .3,
      content: input
    }
  });

  //var settings = createPanel('pulldown');
  //main.append(settings);

  instructions.children.shift();

  var scroll = _(document.querySelector('.CodeMirror-scroll')),
      scrollbar = input.append(createPanel('scrollbar', scroll)),
      child = input.child();

  scroll.removeClass('scrolled');
  child.removeClass('scroll-container');
  child.style('right', null);
  scrollbar.right(0);
  scrollbar.width(scrollbar.width() + 2);
  main.splitter.right(0);
}();

var results = [];

function inspect(o){
  var tree = inspector.append(createPanel('result', render('normal', o)));
  results.push(tree);
  inspector.element.scrollTop = inspector.element.scrollHeight;
  inspector.refresh();
  return tree;
}

inspector.on('dblclick', function(e){
  e.preventDefault();
});

input.on('entry', function(evt){
  realm.evaluateAsync(evt.value);
});

var ops = new Feeder(function(op){
  instructions.addInstruction(op);
});



var realm = window.realm = continuum.createRealmAsync();
//realm.debugBuiltins = true;
realm.on('throw', inspect);
realm.on('write', stdout.write, stdout);
realm.on('clear', function(){
  each(results, function(result){
    result.remove();
  });
});

realm.on('backspace', stdout.backspace, stdout);
realm.on('inspect', function(values, expand){
  each(values.array, function(value){
    var tree = inspect(value);
    if (expand) {
      tree.expand();
      setTimeout(function(){
        inspector.element.scrollTop = inspector.element.scrollHeight;
        inspector.refresh();
      }, 1);
    }
  });
});

realm.on('debug', function(sp, stack){
  console.log(sp, stack.slice());
})

realm.on('pause', function(){
  var overlay = body.append(block('.overlay')),
      unpause = body.append(createPanel('button', 'Unpause', 'unpause'));

  body.addClass('paused');
  input.disable();
  unpause.once('click', function(){
    body.removeClass('paused');
    input.enable();
    unpause.remove();
    overlay.remove();
    realm.resume();
  });
});

realm.on('ready', function(){
  if (location.hash === '#experimental') {
    initializeDOM(realm);
  }

  inspect(realm.evaluate('this')).expand();
  realm.on('complete', function(completion){
    if (!isUndetectable(completion) || completion.value !== 'quiet') {
      inspect(completion);
    }
  });

  setTimeout(function(){
    realm.on('op', function(op, tos){
      ops.push([op, tos]);
    });
  }, 100);
});



function initializeDOM(realm){
  var wrap = (function(){
    var map = new ObjectMap;
    var id = map.tag;

    function unwrap(value){
      if (isObject(value)) {
        if (value.object) {
          value = value.object;
        }
      }
      return value;
    }

    function wrap(value){
      if (isObject(value)) {
        if (value instanceof $ExoticObject) {
          return value;
        }

        if (map.has(value)) {
          return map.get(value);
        }

        var wrapper = typeof value === 'function' ? new $ExoticFunction(value) : new $ExoticObject(value);

        map.set(value, wrapper);
        return wrapper;

      } else if (typeof value === 'string' && value.length > 100) {
        value = value.slice(0, 100);
      }
      return value;
    }

    function attrsToDesc(attr){
      if (attr < 0) {
        var val = false;
        attr = ~attr;
      } else {
        var val = true;
      }
      var desc = {
        enumerable: (attr & 1) ? val : !val,
        configurable: (attr & 2) ? val : !val
      };
      if (attr & 4) {
        desc.writable = val;
      }
      return desc;
    }

    function descToAttrs(desc){
      if (desc) {
        var attrs = desc.enumerable | (desc.configurable << 1) | (desc.writable << 2);
        if ('get' in desc || 'set' in desc) {
         attrs |= 0x08;
        }
        return attrs;
      }
    }

    function safeDefineProperty(o, key, desc){
      try {
        return defineProperty(o, key, desc);
      } catch (e) {}
    }

    function getDescriptor(o, key){
      if (hasOwn(o, key)) {
        try {
          return describeProperty(o, key);
        } catch (e) {}
      }
    }


    var handlers = (function(){
      return [
        function init(object){
          this.object = object;
          this.Extensible = isExtensible(object);
          this.Prototype = wrap(getPrototypeOf(object));

          if (object !== location) {
            var ctor = object.constructor;
            if (ctor) {
              if (ctor.prototype === object) {
                this.IsProto = true;
              }
              this.ConstructorName = fname(ctor) || getBrandOf(ctor);
            }
          }

          if (!this.ConstructorName) {
            this.ConstructorName = getBrandOf(object);
          }

          if (typeof object === 'function') {
            try {
              fname(object);
            } catch (e) {}
          }
        },
        function remove(key){
          if (this.properties.has(key)) {
            return this.properties.remove(key);
          }
          delete this.object[key];
        },
        function describe(key){
          if (key === id) return;
          if (this.properties.has(key)) {
            return this.properties.describe(key);
          }
          var desc = getDescriptor(this.object, key);
          if (desc) {
            var attrs = descToAttrs(desc);
            if ('value' in desc) {
              var val = wrap(desc.value);
            } else if ('get' in desc || 'set' in desc) {
              var val = { Get: wrap(desc.get),
                          Set: wrap(desc.set) };
            }
            return [key, val, attrs];
          }
        },
        function define(key, value, attrs){
          if (this.properties.has(key)) {
            return this.properties.set(key, value, attrs);
          }
          this.object[key] = unwrap(value);
          return;
          var desc = attrsToDesc(attrs);
          desc.value = unwrap(value);
          safeDefineProperty(this.object, key, desc);
        },
        function has(key){
          if (key === id) return false;
          return this.properties.has(key) || key in this.object;
        },
        function each(callback){
          this.properties.each(callback, this);
          var keys = ownProperties(this.object);
          for (var i=0; i < keys.length; i++) {
            if (keys[i] !== id) {
              var val = this.describe(keys[i]);
              val && callback(val);
            }
          }
        },
        function get(key){
          if (this.properties.has(key)) {
            return this.properties.get(key);
          }

          try {
            return wrap(this.object[key]);
          } catch (e) {
            console.log(e);
          }
        },
        function set(key, value){
          if (this.properties.has(key)) {
            return this.properties.set(key, value);
          }
          this.object[key] = unwrap(value);
        },
        function query(key){
          if (this.properties.has(key)) {
            return this.properties.query(key);
          }
          var desc = describeProperty(this.object, key);
          if (desc) {
            return descToAttrs(desc);
          }
        },
        function update(key, attr){
          if (this.properties.has(key)) {
            return this.properties.update(key, attr);
          }
          safeDefineProperty(this.object, key, attrsToDesc(attr));
        }
      ];
    })();

    var applyNew = utility.applyNew,
        $ExoticObject = continuum.createExotic('Object', handlers),
        $ExoticFunction = continuum.createExotic('Function', handlers);

    define($ExoticFunction.prototype, [
      function Call(receiver, args){
        try {
          return wrap(this.call.apply(unwrap(receiver), map(args, unwrap)));
        } catch (e) {
          return continuum.createAbruptCompletion(wrap(e));
        }
      },
      function Construct(args){
        try {
          return wrap(applyNew(this.call, args.map(unwrap)));
        } catch (e) {
          return continuum.createAbruptCompletion(wrap(e));
        }
      }
    ]);

    return wrap;
  })();

  var oproto = wrap(Object.prototype);
  oproto.properties.setProperty(['__proto__', null, 6, {
    Get: { Call: function(r){ return r.GetInheritence() } },
    Set: { Call: function(r, a){ return r.SetInheritence(a[0]) } }
  }]);

  realm.global.set('document', wrap(document));
  realm.global.set('window', wrap((0, eval)('this')));

}

})(this, continuum);
