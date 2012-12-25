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
    const loader   = this.@loader,
          resolved = this.@resolved = (loader.@resolve)(mrl, baseURL),
          module   = loader.get(resolved);

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


private @strict, @resolve, @modules, @translate, @fetch, @evaluate;


export class Loader {
  private @options, @parent;

  constructor(parent, options = {}){
    this.@strict  = true;
    this.@modules = $__ObjectCreate(null);
    this.@options = options = options || $__ToObject(options);
    this.@parent  = parent && parent.@options ? parent : System || {};
    this.linkedTo = options.linkedTo || null;
  }

  get global(){
    return this.@options.global || this.@parent.global || $__global;
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
    let canonical = (this.@resolve)(mrl, this.baseURL);

    if (typeof canonical === 'string') {
      this.@modules[canonical] = mod;
    } else if ($__Type(canonical) === 'Object') {
      for (var k in canonical) {
        this.@modules[k] = canonical[k];
      }
    }
  }

  defineBuiltins(object = this.global){
    var desc = { configurable: true,
                 enumerable: false,
                 writable: true,
                 value: undefined };

    for (var k in std) {
      desc.value = std[k];
      object.@@DefineOwnProperty(k, desc);
    }

    return object;
  }
}

Loader.prototype.@evaluate = $__EvaluateModule;


export function Module(object, mrl){
  object = $__ToObject(object);
  if (object.@@GetBuiltinBrand() === 'Module') {
    return object;
  }
  var module = $__ToModule(object);
  module.@@setInternal('loader', System);
  module.@@setInternal('resolved', mrl || '');
  module.@@setInternal('mrl', mrl || '');
  return module;
}

builtinFunction(Module);


export var System = new Loader(null, {
  global: $__global,
  baseURL: '',
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

System.@modules['@system'] = internalLoader.@modules['@system'] = new Module({
  Module: Module,
  System: System,
  Loader: Loader
}, '@system');

let std = internalLoader.eval(`
  module std = '@std';
  export std;
`).std;

for (let k in internalLoader.@modules) {
  System.@modules[k] = internalLoader.@modules[k];
}

std.@@each(key => $__global.@@define(key, std[key], $__Type(std[key]) === 'Object' ? HIDDEN : FROZEN));

