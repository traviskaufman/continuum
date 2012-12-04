export class Error {
  constructor(message){
    this.message = message;
  }

  toString(){
    return this.name + ': ' + this.message;
  }
}

builtinClass(Error, 'BuiltinError');


export class EvalError extends Error {
  constructor(message){
    this.message = message;
  }
}

builtinClass(EvalError, 'BuiltinError');


export class RangeError extends Error {
  constructor(message){
    this.message = message;
  }
}

builtinClass(RangeError, 'BuiltinError');

export class ReferenceError extends Error {
  constructor(message){
    this.message = message;
  }
}

builtinClass(ReferenceError, 'BuiltinError');

export class SyntaxError extends Error {
  constructor(message){
    this.message = message;
  }
}

builtinClass(SyntaxError, 'BuiltinError');

export class TypeError extends Error {
  constructor(message){
    this.message = message;
  }
}

builtinClass(TypeError, 'BuiltinError');

export class URIError extends Error {
  constructor(message){
    this.message = message;
  }
}

builtinClass(URIError, 'BuiltinError');
