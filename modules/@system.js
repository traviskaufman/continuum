$__EmptyClass = function(...args){ super(...args) }

{
  let ___ = 0x00,
      E__ = 0x01,
      _C_ = 0x02,
      EC_ = 3,
      __W = 0x04,
      E_W = 5,
      _CW = 6,
      ECW = 7,
      __A = 0x08,
      E_A = 9,
      _CA = 10,
      ECA = 11;

  let global = $__global;


  $__defineMethods = function defineMethods(obj, props){
    for (var i=0; i < props.length; i++) {
      $__SetInternal(props[i], 'Native', true);
      $__define(obj, props[i].name, props[i], _CW);
      $__remove(props[i], 'prototype');
    }
    return obj;
  };

  $__defineProps = function defineProps(obj, props){
    var keys = $__Enumerate(props, false, false);
    for (var i=0; i < keys.length; i++) {
      var name = keys[i],
          prop = props[name];

      $__define(obj, name, prop, _CW);

      if (typeof prop === 'function') {
        $__SetInternal(prop, 'Native', true);
        $__define(prop, 'name', name, ___);
        $__remove(prop, 'prototype');
      }
    }
    return obj;
  };

  $__setupFunctions = function setupFunctions(...funcs){
    var len = funcs.length;
    for (var i=0; i < len; i++) {
      $__SetInternal(funcs[i], 'Native', true);
      $__remove(funcs[i], 'prototype');
    }
  };

  $__defineConstants = function defineConstants(obj, props){
    var keys = $__Enumerate(props, false, false);
    for (var i=0; i < keys.length; i++) {
      $__define(obj, keys[i], props[keys[i]], 0);
    }
  };

  $__setupConstructor = function setupConstructor(ctor, proto){
    $__define(ctor, 'prototype', proto, ___);
    $__define(ctor, 'length', 1, ___);
    $__define(ctor.prototype, 'constructor', ctor, _CW);
    $__define(global, ctor.name, ctor, _CW);
    $__SetInternal(ctor, 'Native', true);
    $__SetInternal(ctor, 'NativeConstructor', true);
  };


  $__setLength = function setLength(f, length){
    if (typeof length === 'string') {
      $__define(f, 'length', length, ___);
    } else {
      var keys = $__Enumerate(length, false, false);
      for (var i=0; i < keys.length; i++) {
        var key = keys[i];
        $__define(f[key], 'length', length[key], ___);
      }
    }
  };

  $__setProperty = function setProperty(key, object, values){
    var keys = $__Enumerate(values, false, false),
        i = keys.length;

    while (i--) {
      $__define(object[keys[i]], key, values[keys[i]], ___);
    }
  };


  let hidden = { enumerable: false };

  $__hideEverything = function hideEverything(o){
    if (!o || typeof o !== 'object') return o;

    var keys = $__Enumerate(o, false, true),
        i = keys.length;

    while (i--) {
      $__update(o, keys[i], ~E__);
    }

    if (typeof o === 'function') {
      hideEverything(o.prototype);
    }

    return o;
  };
}





class Request {
  private @loader, @callback, @errback, @mrl, @resolved;

  constructor(loader, mrl, resolved, callback, errback){
    this.@loader = loader;
    this.@mrl = mrl;
    this.@resolved = resolved;
    this.@callback = callback;
    this.@errback = errback;
  }

  fulfill(src){
    var loader = this.@loader;

    var translated = (loader.@translate)(src, this.@mrl, loader.@baseURL, this.@resolved);
    if (loader.@strict) {
      translated = '"use strict";'+translated;
    }

    $__EvaluateModule(translated, loader.@global, this.@resolved, module => {
      $__SetInternal(module, 'loader', loader);
      $__SetInternal(module, 'resolved', this.@resolved);
      $__SetInternal(module, 'mrl', this.@mrl);
      loader.@modules[this.@resolved] = module;
      (this.@callback)(module);
    }, msg => this.reject(msg));
  }

  redirect(mrl, baseURL){
    var loader = this.@loader,
        resolved = this.@resolved = (loader.@resolve)(mrl, baseURL);

    this.@mrl = mrl;

    var module = loader.get(resolved);
    if (module) {
      (this.@callback)(module);
    } else {
      (loader.@fetch)(mrl, baseURL, this, resolved);
    }
  }

  reject(msg){
    (this.@errback)(msg);
  }
}

private @translate, @resolve, @fetch, @strict, @global, @baseURL, @modules;

export class Loader {
  constructor(parent, options){
    options = options || {};
    this.linkedTo   = options.linkedTo  || null;
    this.@translate = options.translate || parent.translate;
    this.@resolve   = options.resolve   || parent.resolve;
    this.@fetch     = options.fetch     || parent.fetch;
    this.@global    = options.global    || $__global;
    this.@baseURL   = options.baseURL   || (parent ? parent.@baseURL : '');
    this.@strict    = true;//options.strict === true;
    this.@modules   = $__ObjectCreate(null);
  }

  get global(){
    return this.@global;
  }

  get baseURL(){
    return this.@baseURL;
  }

  load(mrl, callback, errback){
    var key = (this.@resolve)(mrl, this.@baseURL),
        module = this.@modules[key];

    if (module) {
      callback(module);
    } else {
      (this.@fetch)(mrl, this.@baseURL, new Request(this, mrl, key, callback, errback), key);
    }
  }

  eval(src){
    return $__EvaluateModule(src, this.@global, this.@baseURL);
  }

  evalAsync(src, callback, errback){
    $__EvaluateModule(src, this.@global, this.@baseURL, callback, errback);
  }

  get(mrl){
    var canonical = (this.@resolve)(mrl, this.@baseURL);
    return this.@modules[canonical];
  }

  set(mrl, mod){
    var canonical = (this.@resolve)(mrl, this.@baseURL);

    if (typeof canonical === 'string') {
      this.@modules[canonical] = mod;
    } else {
      for (var k in canonical) {
        this.@modules[k] = canonical[k];
      }
    }
  }

  defineBuiltins(object){
    var desc = { configurable: true,
                 enumerable: false,
                 writable: true,
                 value: undefined };

    object || (object = this.@global);
    for (var k in std) {
      desc.value = std[k];
      $__DefineOwnProperty(object, k, desc);
    }

    return object;
  }
}

export let Module = function Module(object){
  if ($__GetNativeBrand(object) === 'Module') {
    return object;
  }
  return $__ToModule($__ToObject(object));
}

$__remove(Module, 'prototype');


export let System = new Loader(null, {
  fetch(relURL, baseURL, request, resolved) {
    var fetcher = resolved[0] === '@' ? $__Fetch : $__readFile;

    fetcher(resolved, src => {
      if (typeof src === 'string') {
        request.fulfill(src);
      } else {
        request.reject(src.message);
      }
    });
  },
  resolve(relURL, baseURL){
    return relURL[0] === '@' ? relURL : $__resolve(baseURL, relURL);
  },
  translate(src, relURL, baseURL, resolved) {
    return src;
  }
});

$__System = System;

System.@strict = false;
let std = System.eval(`
  module std = '@std';
  export std;
`).std;
System.@strict = true;
