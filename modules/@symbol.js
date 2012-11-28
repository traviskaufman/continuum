export function Symbol(name, isPublic){
  if (name == null) {
    throw $__Exception('unnamed_symbol', []);
  }
  return $__SymbolCreate(name, !!isPublic);
}

$__setupConstructor(Symbol, $__SymbolProto);
$__remove(Symbol.prototype, 'constructor');
