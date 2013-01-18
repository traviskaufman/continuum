import {
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
    return $__SymbolCreate(name, !!isPublic);
  }
}


builtinClass(Symbol);
