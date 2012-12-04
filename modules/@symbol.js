export class Symbol {
  constructor(name, isPublic){
    if (name == null) {
      throw $__Exception('unnamed_symbol', []);
    }
    return $__SymbolCreate(name, !!isPublic);
  }
}

builtinClass(Symbol);
