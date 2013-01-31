import {
  $$CreateObject,
  $$Exception
} from '@@internals';

import {
  builtinClass
} from '@@utilities';


export class Symbol {
  constructor(name, isPublic){
    if (name == null) {
      throw $$Exception('unnamed_symbol', []);
    }
    return $$CreateObject('Symbol', name, !!isPublic);
  }
}


builtinClass(Symbol);
