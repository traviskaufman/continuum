export function RegExp(pattern, flags){
  if ($__IsConstructCall()) {
    if (pattern === undefined) {
      pattern = '';
    } else if (typeof pattern === 'string') {
    } else if (typeof pattern === 'object' && $__GetBuiltinBrand(pattern) === 'RegExp') {
      if (flags !== undefined) {
        throw $__Exception('regexp_flags', []);
      }
    } else {
      pattern = $__ToString(pattern);
    }
    return $__RegExpCreate(pattern, flags);
  } else {
    if (flags === undefined && pattern) {
      if (typeof pattern === 'object' && $__GetBuiltinBrand(pattern) === 'RegExp') {
        return pattern;
      }
    }
    return $__RegExpCreate(pattern, flags);
  }
}

$__setupConstructor(RegExp, $__RegExpProto);


export function exec(regexp, string){
  if ($__GetBuiltinBrand(regexp) === 'RegExp') {
    return $__RegExpExec(regexp, '' + string);
  } else {
    throw $__Exception('not_generic', ['@regexp.exec']);
  }
}

export function test(regexp, string){
  if ($__GetBuiltinBrand(regexp) === 'RegExp') {
    return $__RegExpTest(regexp, '' + string);
  } else {
    throw $__Exception('not_generic', ['@regexp.test']);
  }
}


$__defineProps(RegExp.prototype, {
  exec(string){
    if ($__GetBuiltinBrand(this) === 'RegExp') {
      return $__RegExpExec(this, '' + string);
    } else {
      throw $__Exception('not_generic', ['RegExp.prototype.exec']);
    }
  },
  test(string){
    if ($__GetBuiltinBrand(this) === 'RegExp') {
      return $__RegExpTest(this, '' + string);
    } else {
      throw $__Exception('not_generic', ['RegExp.prototype.test']);
    }
  },
  toString(){
    if ($__GetBuiltinBrand(this) === 'RegExp') {
      return $__RegExpToString(this);
    } else {
      throw $__Exception('not_generic', ['RegExp.prototype.toString']);
    }
  }
});

