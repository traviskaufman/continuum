var functions = (function(exports){
  var _slice = [].slice,
      _concat = [].concat,
      _push = [].push;

  function toArray(o){
    var len = o.length;
    if (!len) return [];
    if (len === 1) return [o[0]];
    if (len === 2) return [o[0], o[1]];
    if (len === 3) return [o[0], o[1], o[2]];
    if (len > 9)   return _slice.call(o);
    if (len === 4) return [o[0], o[1], o[2], o[3]];
    if (len === 5) return [o[0], o[1], o[2], o[3], o[4]];
    if (len === 6) return [o[0], o[1], o[2], o[3], o[4], o[5]];
    if (len === 7) return [o[0], o[1], o[2], o[3], o[4], o[5], o[6]];
    if (len === 8) return [o[0], o[1], o[2], o[3], o[4], o[5], o[6], o[7]];
    if (len === 9) return [o[0], o[1], o[2], o[3], o[4], o[5], o[6], o[7], o[8]];
  }
  exports.toArray = toArray;

  function slice(o, start, end){
    if (!o.length) {
      return [];
    } else if (!end && !start) {
      return toArray(o);
    } else {
      return _slice.call(o, start, end);
    }
  }
  exports.slice = slice;


  var _call, _apply, _bind;

  if (typeof Function.prototype.bind === 'function' && !('prototype' in Function.prototype.bind)) {
    _bind = Function.prototype.bind;
    _call = Function.prototype.call;
    _apply = Function.prototype.apply;
  } else {
    void function(){
      function bind(receiver){
        if (typeof this !== 'function') {
          throw new TypeError("Function.prototype.bind called on non-callable");
        }

        var args = toArray(arguments),
            params = '',
            F = this;

        for (var i=1; i < args.length; i++) {
          if (i > 1) params += ',';
          params += '$['+i+']';
        }

        var bound = function(){
          if (this instanceof bound) {
            var p = params;
            for (var i=0; i < arguments.length; i++) {
              p += ',_['+i+']';
            }
            return new Function('F,$,_', 'return new F('+p+')')(F, args, arguments);
          } else {
            var a = toArray(args);
            for (var i=0; i < arguments.length; i++) {
              a[a.length] = arguments[i];
            }
            return _call.apply(F, a);
          }
        };

        return bound;
      }

      var iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = 'javascript:';
      _call = iframe.contentWindow.Function.prototype.call;
      _apply = _call.apply;
      _bind = bind;
      document.body.removeChild(iframe);
    }();
  }

  var __ = partial.__ = {};

  function partial(f){
    var argv = [],
        argc = 0,
        holes = 0;

    for (var i=1; i < arguments.length; i++) {
      if (arguments[i] === __) {
        holes++;
      }
      argv[argc++] = arguments[i];
    }

    if (holes) {
      return function(){
        var extra = arguments.length > holes ? arguments.length - holes : 0,
            args = [],
            j = 0;

        for (var i=0; i < argc; i++) {
          args[i] = argv[i] === __ ? arguments[j++] : argv[i];
        }

        while (extra--) {
          args[i++] = arguments[j++];
        }

        return f.apply(this, args);
      };
    } else if (argc) {
      return function(){
        return f.apply(this, _concat.apply(argv, arguments));
      };
    } else {
      return function(){
        return f.apply(this, arguments);
      };
    }
  }
  exports.partial = partial;


  function bind(f, receiver){
    var argv = [],
        argc = 0;

    for (var i=2; i < arguments.length; i++) {
      argv[argc++] = arguments[i];
    }

    if (argc) {
      return function(){
        return f.apply(receiver, _concat.apply(argv, arguments));
      };
    } else {
      return function(){
        return f.apply(receiver, arguments);
      };
    }
  }
  exports.bind = bind;


  var bindbind  = exports.bindbind  = bind(_bind, _bind),
      callbind  = exports.callbind  = partial(bind, _call),
      applybind = exports.applybind = partial(bind, _apply),
      bindapply = exports.bindapply = applybind(_bind),
      call      = exports.call      = callbind(_call),
      apply     = exports.apply     = callbind(_apply);

  var nil = [null];

  exports.applyNew = function applyNew(Ctor, args){
    return new (bindapply(Ctor, nil.concat(args)));
  }

  exports.pushable = bindbind([].push);

  var hasOwn   = callbind({}.hasOwnProperty),
      toSource = callbind(function(){}.toString);

  var hidden = { configurable: true,
                 enumerable: false,
                 writable: true,
                 value: undefined }

  var defineProperty = Object.defineProperty && !('prototype' in Object.defineProperty)
                       ? Object.defineProperty
                       : function defineProperty(o, k, d){ o[k] = d.value };

  exports.fname = (function(){
    if (Function.name === 'Function') {
      return function fname(f){
        return f ? f.name || '' : '';
      };
    }
    return function fname(f){
      if (typeof f !== 'function') {
        return '';
      }

      if (!hasOwn(f, 'name')) {
        var match = toSource(f).match(/^\n?function\s?(\w*)?_?\(/);
        if (match) {
          hidden.value = match[1];
          defineProperty(f, 'name', hidden);
        }
      }

      return f.name || '';
    };
  })();

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});

