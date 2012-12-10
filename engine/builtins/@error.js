const global = this;

export class Error {
  constructor(message){
    var err = this == null || this === global ? $__ObjectCreate(ErrorPrototype) : this;
    err.message = $__ToString(message);
    return err;
  }

  toString(){
    return this.name + ': ' + this.message;
  }
}

builtinClass(Error, 'BuiltinError');



export class EvalError extends Error {
  constructor(message){
    var err = this == null || this === global ? $__ObjectCreate(EvalErrorPrototype) : this;
    err.message = $__ToString(message);
    return err;
  }
}

builtinClass(EvalError, 'BuiltinError');


export class RangeError extends Error {
  constructor(message){
    var err = this == null || this === global ? $__ObjectCreate(RangeErrorPrototype) : this;
    err.message = $__ToString(message);
    return err;
  }
}

builtinClass(RangeError, 'BuiltinError');

export class ReferenceError extends Error {
  constructor(message){
    var err = this == null || this === global ? $__ObjectCreate(ReferenceErrorPrototype) : this;
    err.message = $__ToString(message);
    return err;
  }
}

builtinClass(ReferenceError, 'BuiltinError');

export class SyntaxError extends Error {
  constructor(message){
    var err = this == null || this === global ? $__ObjectCreate(SyntaxErrorPrototype) : this;
    err.message = $__ToString(message);
    return err;
  }
}

builtinClass(SyntaxError, 'BuiltinError');

export class TypeError extends Error {
  constructor(message){
    var err = this == null || this === global ? $__ObjectCreate(TypeErrorPrototype) : this;
    err.message = $__ToString(message);
    return err;
  }
}

builtinClass(TypeError, 'BuiltinError');

export class URIError extends Error {
  constructor(message){
    var err = this == null || this === global ? $__ObjectCreate(URIErrorPrototype) : this;
    err.message = $__ToString(message);
    return err;
  }
}

builtinClass(URIError, 'BuiltinError');

const ErrorPrototype = Error.prototype,
      EvalErrorPrototype = EvalError.prototype,
      RangeErrorPrototype = RangeError.prototype,
      ReferenceErrorPrototype = ReferenceError.prototype,
      SyntaxErrorPrototype = SyntaxError.prototype,
      TypeErrorPrototype = TypeError.prototype;
