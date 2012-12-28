export class RegExp {
  constructor(pattern, flags){
    if ($__IsConstructCall()) {
      if (pattern === undefined) {
        pattern = '';
      } else if (typeof pattern === 'string') {
      } else if (pattern && $__GetBuiltinBrand(pattern) === 'RegExp') {
        if (flags !== undefined) {
          throw $__Exception('regexp_flags', []);
        }
      } else {
        pattern = $__ToString(pattern);
      }
      return $__RegExpCreate(pattern, flags);
    } else {
      if (flags === undefined && pattern && $__GetBuiltinBrand(pattern) === 'RegExp') {
        return pattern;
      }
      return $__RegExpCreate(pattern, flags);
    }
  }

  exec(string){
    if ($__GetBuiltinBrand(this) === 'RegExp') {
      return $__RegExpExec(this, $__ToString(string));
    }
    throw $__Exception('not_generic', ['RegExp.prototype.exec']);
  }

  test(string){
    if ($__GetBuiltinBrand(this) === 'RegExp') {
      return $__RegExpTest(this, $__ToString(string));
    }
    throw $__Exception('not_generic', ['RegExp.prototype.test']);
  }

  toString(){
    if ($__GetBuiltinBrand(this) === 'RegExp') {
      return $__RegExpToString(this);
    }
    throw $__Exception('not_generic', ['RegExp.prototype.toString']);
  }
}

builtinClass(RegExp);


export function exec(regexp, string){
  if (regexp && $__GetBuiltinBrand(regexp) === 'RegExp') {
    return $__RegExpExec(regexp, $__ToString(string));
  }
  throw $__Exception('not_generic', ['@regexp.exec']);
}

builtinFunction(exec);


export function test(regexp, string){
  if (regexp && $__GetBuiltinBrand(regexp) === 'RegExp') {
    return $__RegExpTest(regexp, [$__ToString(string)]);
  }
  throw $__Exception('not_generic', ['@regexp.test']);
}

builtinFunction(test);
