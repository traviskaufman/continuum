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

    $__EvaluateModule(loader, translated, this.@resolved, module => {
      $__setInternal(module, 'loader', loader);
      $__setInternal(module, 'resolved', this.@resolved);
      $__setInternal(module, 'mrl', this.@mrl);
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


private @strict, @resolve, @modules, @translate, @fetch;


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
    return $__EvaluateModule(this, src);
  }

  evalAsync(src, callback, errback){
    $__EvaluateModule(this, src, callback, errback);
  }

  get(mrl){
    const canonical = (this.@resolve)(mrl, this.baseURL);
    return this.@modules[canonical];
  }

  set(mrl, mod){
    const canonical = (this.@resolve)(mrl, this.baseURL);

    if (typeof canonical === 'string') {
      this.@modules[canonical] = mod;
    } else if ($__Type(canonical) === 'Object') {
      for (var key in canonical) {
        this.@modules[key] = canonical[key];
      }
    }
  }

  defineBuiltins(object = this.global){
    const desc = { configurable: true,
                   enumerable: false,
                   writable: true,
                   value: undefined };

    for (var key in std) {
      desc.value = std[key];
      $__DefineOwnProperty(object, key, desc);
    }

    return object;
  }
}

export function Module(object, mrl){
  object = $__ToObject(object);
  if ($__GetBuiltinBrand(object) === 'BuiltinModule') {
    return object;
  }
  var module = $__ToModule(object);
  $__setInternal(module, 'loader', System);
  $__setInternal(module, 'resolved', mrl || '');
  $__setInternal(module, 'mrl', mrl || '');
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


const internalLoader = $__internalLoader = new Loader(System, { global: this });
internalLoader.@strict = false;

System.@modules['@system'] = internalLoader.@modules['@system'] = new Module({
  Module: Module,
  System: System,
  Loader: Loader
}, '@system');

const std = internalLoader.eval(`
  module std = '@std';
  export std;
`).std;

for (let name in internalLoader.@modules) {
  System.@modules[name] = internalLoader.@modules[name];
}

$__each(std, key => $__define($__global, key, std[key], $__Type(std[key]) === 'Object' ? HIDDEN : FROZEN));
