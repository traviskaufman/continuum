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

    var translated = (loader.@translate)(src, this.@mrl, loader.baseURL, this.@resolved);
    if (loader.@strict) {
      translated = '"use strict";\n'+translated;
    }

    loader.@evaluate(translated, this.@resolved, module => {
      module.@@setInternal('loader', loader);
      module.@@setInternal('resolved', this.@resolved);
      module.@@setInternal('mrl', this.@mrl);
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

private @translate, @resolve, @fetch, @strict, @modules, @evaluate;

export class Loader {
  constructor(parent, options){
    options = options || {};
    this.linkedTo   = options.linkedTo  || null;
    this.@strict    = true;
    this.@modules   = $__ObjectCreate(null);
    this.@translate = options.translate || parent.@translate;
    this.@resolve   = options.resolve   || parent.@resolve;
    this.@fetch     = options.fetch     || parent.@fetch;
    this.@@setInternal('global', options.global || (parent ? parent.global : $__global));
    this.@@setInternal('baseURL', options.baseURL || (parent ? parent.baseURL : ''));
  }

  get global(){
    return this.@@getInternal('global');
  }

  get baseURL(){
    return this.@@getInternal('baseURL');
  }

  load(mrl, callback, errback){
    var key = (this.@resolve)(mrl, this.baseURL),
        module = this.@modules[key];

    if (module) {
      callback(module);
    } else {
      (this.@fetch)(mrl, this.baseURL, new Request(this, mrl, key, callback, errback), key);
    }
  }

  eval(src){
    return this.@evaluate(src);
  }

  evalAsync(src, callback, errback){
    this.@evaluate(src, callback, errback);
  }

  get(mrl){
    var canonical = (this.@resolve)(mrl, this.baseURL);
    return this.@modules[canonical];
  }

  set(mrl, mod){
    var canonical = (this.@resolve)(mrl, this.baseURL);

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

    object || (object = this.global);
    for (var k in std) {
      desc.value = std[k];
      object.@@DefineOwnProperty(k, desc);
    }

    return object;
  }
}
Loader.prototype.@evaluate = $__EvaluateModule;


export function Module(object){
  if (object.@@GetBuiltinBrand() === 'BuiltinModule') {
    return object;
  }
  return $__ToModule($__ToObject(object));
}

builtinFunction(Module);


export let System = new Loader(null, {
  fetch(relURL, baseURL, request, resolved) {
    var fetcher = resolved[0] === '@' ? $__Fetch : $__readFile;

    fetcher(resolved, src => {
      if (typeof src === 'string') {
        request.fulfill(src);
      } else {
        request.reject(src);
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

$__SetDefaultLoader(System);


let internalLoader = $__internalLoader = new Loader(System, { global: this });
internalLoader.@strict = false;

let std = internalLoader.eval(`
  module std = '@std';
  export std;
`).std;


for (let k in internalLoader.@modules) {
  System.@modules[k] = internalLoader.@modules[k];
}

$__global.@toStringTag = 'global';
