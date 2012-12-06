private @test, @exec, @toString;

export class RegExp {
  constructor(pattern, flags){
    if ($__IsConstructCall()) {
      if (pattern === undefined) {
        pattern = '';
      } else if (typeof pattern === 'string') {
      } else if (pattern && pattern.@@GetBuiltinBrand() === 'RegExp') {
        if (flags !== undefined) {
          throw $__Exception('regexp_flags', []);
        }
      } else {
        pattern = $__ToString(pattern);
      }
      return $__RegExpCreate(pattern, flags);
    } else {
      if (flags === undefined && pattern) {
        if (pattern && pattern.@@GetBuiltinBrand() === 'RegExp') {
          return pattern;
        }
      }
      return $__RegExpCreate(pattern, flags);
    }
  }

  exec(string){
    if (this.@@GetBuiltinBrand() === 'RegExp') {
      return this.@exec($__ToString(string));
    }
    throw $__Exception('not_generic', ['RegExp.prototype.exec']);
  }

  test(string){
    if (this.@@GetBuiltinBrand() === 'RegExp') {
      return this.@test($__ToString(string));
    }
    throw $__Exception('not_generic', ['RegExp.prototype.test']);
  }

  toString(){
    if (this.@@GetBuiltinBrand() === 'RegExp') {
      return this.@toString();
    }
    throw $__Exception('not_generic', ['RegExp.prototype.toString']);
  }
}

builtinClass(RegExp);
RegExp.prototype.@test = $__RegExpTest;
RegExp.prototype.@exec = $__RegExpExec;
RegExp.prototype.@toString = $__RegExpToString;

export function exec(regexp, string){
  if (regexp && regexp.@@GetBuiltinBrand() === 'RegExp') {
    return $__RegExpExec.@@Call(regexp, $__ToString(string));
  }
  throw $__Exception('not_generic', ['@regexp.exec']);
}

builtinFunction(exec);


export function test(regexp, string){
  if (regexp && regexp.@@GetBuiltinBrand() === 'RegExp') {
    return $__RegExpTest.@@Call(regexp, [$__ToString(string)]);
  }
  throw $__Exception('not_generic', ['@regexp.test']);
}

builtinFunction(test);
