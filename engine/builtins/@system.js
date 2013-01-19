import {
  ToObject
} from '@@operations';

import {
  ObjectCreate,
  Type
} from '@@types';

import {
  builtinClass,
  builtinFunction,
  define,
  hasBrand
} from '@@utilities';

import {
  $$CurrentRealm,
  $$EvaluateModule,
  $$EvaluateModuleAsync,
  $$Fetch,
  $$Get,
  $$GetIntrinsic,
  $$Resolve,
  $$Set,
  $$SetIntrinsic,
  $$ToModule
} from '@@internals';


class Request {
  private @loader, @callback, @errback, @mrl, @resolved;

  constructor(loader, mrl, resolved, callback, errback){
    this.@loader   = loader;
    this.@mrl      = mrl;
    this.@resolved = resolved;
    this.@callback = callback;
    this.@errback  = errback;
  }

  fulfill(src){
    const loader = this.@loader;
    let translated = (loader.@translate)(src, this.@mrl, loader.baseURL, this.@resolved);

    if (loader.@strict) {
      translated = '"use strict";\n' + translated;
    }

    $$EvaluateModuleAsync(loader, translated, this.@resolved, module => {
      $$Set(module, 'loader', loader);
      $$Set(module, 'resolved', this.@resolved);
      $$Set(module, 'mrl', this.@mrl);
      loader.@modules[this.@resolved] = module;
      (this.@callback)(module);
    }, msg => this.reject(msg));
  }

  redirect(mrl, baseURL){
    const loader   = this.@loader,
          resolved = (loader.@resolve)(mrl, baseURL),
          module   = loader.get(resolved);

    this.@resolved = resolved;
    this.@mrl = mrl;

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


private @strict, @resolve, @modules, @translate, @fetch;


export class Loader {
  private @options, @parent;

  constructor(parent, options = {}){
    this.@strict  = true;
    this.@modules = ObjectCreate(null);
    this.@options = ToObject(options);
    this.@parent  = parent && parent.@options ? parent : typeof System === 'undefined' ? {} : System;
    this.linkedTo = this.@options.linkedTo || null;
  }

  get global(){
    return this.@options.global || this.@parent.global || $$GetIntrinsic('global');
  }

  get baseURL(){
    return this.@options.baseURL || this.@parent.baseURL || '';
  }

  get @translate(){
    return this.@options.translate || this.@parent.@translate;
  }

  get @resolve(){
    return this.@options.resolve || this.@parent.@resolve;
  }

  get @fetch(){
    return this.@options.fetch || this.@parent.@fetch;
  }

  load(mrl, callback, errback){
    const canonical = (this.@resolve)(mrl, this.baseURL),
          module    = this.@modules[canonical];

    if (module) {
      callback(module);
    } else {
      (this.@fetch)(mrl, this.baseURL, new Request(this, mrl, canonical, callback, errback), canonical);
    }
  }

  // TODO feedback: Loader#eval needs an optional? name/mrl parameter
  eval(src, mrl = ''){
    return $$EvaluateModule(this, src, mrl);
  }

  // TODO feedback: Loader#evalAsync needs an optional? name/mrl parameter
  evalAsync(src, callback, errback, mrl = ''){
    $$EvaluateModuleAsync(this, src, mrl, callback, errback);
  }

  get(mrl){
    const canonical = (this.@resolve)(mrl, this.baseURL);

    return this.@modules[canonical];
  }

  set(mrl, mod){
    const canonical = (this.@resolve)(mrl, this.baseURL);

    if (typeof canonical === 'string') {
      this.@modules[canonical] = mod;
    } else if (Type(canonical) === 'Object') {
      for (let mrl in canonical) {
        this.@modules[mrl] = canonical[mrl];
      }
    }
  }

  defineBuiltins(object = this.global){
    const obj = object == null ? {} : ToObject(object);

    for (let [key, val] of std) {
      obj[key] = val;
    }

    return obj;
  }
}

builtinClass(Loader);


// TODO feedback: Module needs an optional? name/mrl parameter
export function Module(object, mrl = ''){
  object = ToObject(object);

  if (hasBrand(object, 'BuiltinModule')) {
    return object;
  }

  const module = $$ToModule(object);
  $$Set(module, 'loader', System);
  $$Set(module, 'resolved', mrl);
  $$Set(module, 'mrl', mrl);
  return module;
}

builtinFunction(Module);


export const System = new Loader(null, {
  global: $$GetIntrinsic('global'),
  baseURL: '',
  fetch(relURL, baseURL, request, resolved) {
    const fetcher = resolved[0] === '@' ? $$Fetch : $__readFile;

    fetcher(resolved, src => {
      if (typeof src === 'string') {
        request.fulfill(src);
      } else {
        request.reject(src);
      }
    });
  },
  resolve(relURL, baseURL){
    return relURL[0] === '@' ? relURL : $$Resolve(baseURL, relURL);
  },
  translate(src, relURL, baseURL, resolved) {
    return src;
  }
});


const builtins = new Loader(System);
builtins.@strict = false;

$$SetIntrinsic($$CurrentRealm(), 'internalLoader', builtins);
$$Set($$CurrentRealm(), 'loader', System);

System.@modules['@system'] = builtins.@modules['@system'] = new Module({
  Module: Module,
  System: System,
  Loader: Loader
}, '@system');


const std = builtins.eval(`
  module std = '@std';
  export std;
`).std;


for (let name in builtins.@modules) {
  System.@modules[name] = builtins.@modules[name];
}

{
  const global = $$GetIntrinsic('global'),
        FROZEN = 0,
        HIDDEN = 6;

  for (let [key, val] of std) {
    define(global, key, val, Type(val) === 'Object' ? HIDDEN : FROZEN);
  }
}
