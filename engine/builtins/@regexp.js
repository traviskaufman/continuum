function isRegExp(o){
  return $__Type(o) === 'Object' && $__GetBuiltinBrand(o) === 'BuiltinRegExp';
}

export class RegExp {
  constructor(pattern, flags){
    if ($__isConstruct()) {
      if (pattern === undefined) {
        pattern = '';
      } else if (typeof pattern === 'string') {
      } else if (isRegExp(pattern)) {
        if (flags !== undefined) {
          throw $__Exception('regexp_flags', []);
        }
      } else {
        pattern = $__ToString(pattern);
      }
      return $__RegExpCreate(pattern, flags);
    } else {
      if (flags === undefined && isRegExp(pattern)) {
        return pattern;
      }
      return $__RegExpCreate(pattern, flags);
    }
  }

  exec(string){
    if (isRegExp(this)) {
      return $__RegExpExec(this, $__ToString(string));
    }
    throw $__Exception('not_generic', ['RegExp.prototype.exec']);
  }

  test(string){
    if (isRegExp(this)) {
      return $__RegExpTest(this, $__ToString(string));
    }
    throw $__Exception('not_generic', ['RegExp.prototype.test']);
  }

  toString(){
    if (isRegExp(this)) {
      return $__RegExpToString(this);
    }
    throw $__Exception('not_generic', ['RegExp.prototype.toString']);
  }
}

builtinClass(RegExp);


export function exec(regexp, string){
  if (isRegExp(regexp)) {
    return $__RegExpExec(regexp, $__ToString(string));
  }
  throw $__Exception('not_generic', ['@regexp.exec']);
}

builtinFunction(exec);


export function test(regexp, string){
  if (isRegExp(regexp)) {
    return $__RegExpTest(regexp, [$__ToString(string)]);
  }
  throw $__Exception('not_generic', ['@regexp.test']);
}

builtinFunction(test);
