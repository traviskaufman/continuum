import {
  $$CreateObject,
  $$GetIntrinsic
} from '@@internals';

import {
  builtinClass
} from '@@utilities';

import {
  ToString
} from '@@operations';

const global = $$GetIntrinsic('global');

export class Error {
  constructor(message){
    message = ToString(message);
    if (this == null || this === global || this === ErrorPrototype) {
      return $$CreateObject('Error', 'Error', message);
    }
    this.message = message;
    return this;
  }

  toString(){
    return `${this.name}: ${this.message}`;
  }
}

builtinClass(Error, 'BuiltinError');


export class EvalError extends Error {
  constructor(message){
    message = ToString(message);
    if (this == null || this === global || this === EvalErrorPrototype) {
      return $$CreateObject('Error', 'EvalError', message);
    }
    this.message = message;
    return this;
  }
}

builtinClass(EvalError, 'BuiltinError');


export class RangeError extends Error {
  constructor(message){
    message = ToString(message);
    if (this == null || this === global || this === RangeErrorPrototype) {
      return $$CreateObject('Error', 'RangeError', message);
    }
    this.message = message;
    return this;
  }
}

builtinClass(RangeError, 'BuiltinError');


export class ReferenceError extends Error {
  constructor(message){
    message = ToString(message);
    if (this == null || this === global || this === ReferenceErrorPrototype) {
      return $$CreateObject('Error', 'ReferenceError', message);
    }
    this.message = message;
    return this;
  }
}

builtinClass(ReferenceError, 'BuiltinError');


export class SyntaxError extends Error {
  constructor(message){
    message = ToString(message);
    if (this == null || this === global || this === SyntaxErrorPrototype) {
      return $$CreateObject('Error', 'SyntaxError', message);
    }
    this.message = message;
    return this;
  }
}

builtinClass(SyntaxError, 'BuiltinError');


export class TypeError extends Error {
  constructor(message){
    message = ToString(message);
    if (this == null || this === global || this === TypeErrorPrototype) {
      return $$CreateObject('Error', 'TypeError', message);
    }
    this.message = message;
    return this;
  }
}

builtinClass(TypeError, 'BuiltinError');


export class URIError extends Error {
  constructor(message){
    message = ToString(message);
    if (this == null || this === global || this === URIErrorPrototype) {
      return $$CreateObject('Error', 'URIError', message);
    }
    this.message = message;
    return this;
  }
}

builtinClass(URIError, 'BuiltinError');


const ErrorPrototype          = Error.prototype,
      EvalErrorPrototype      = EvalError.prototype,
      RangeErrorPrototype     = RangeError.prototype,
      ReferenceErrorPrototype = ReferenceError.prototype,
      SyntaxErrorPrototype    = SyntaxError.prototype,
      TypeErrorPrototype      = TypeError.prototype,
      URIErrorPrototype       = URIError.prototype;
