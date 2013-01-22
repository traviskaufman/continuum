import {
  Type
} from '@@types';

import {
  ToString
} from '@@operations';

import {
  builtinClass,
  builtinFunction,
  hasBrand
} from '@@utilities';

import {
  $$Exception,
  $$IsConstruct
} from '@@internals';

import {
  $$RegExpCreate,
  $$RegExpExec,
  $$RegExpTest,
  $$RegExpToString
} from '@@regexp';


export class RegExp {
  constructor(pattern, flags){
    if ($$IsConstruct()) {
      if (pattern === undefined) {
        pattern = '';
      } else if (hasBrand(pattern, 'BuiltinRegExp')) {
        if (flags !== undefined) {
          throw $$Exception('regexp_flags', []);
        }
      } else {
        pattern = ToString(pattern);
      }
    } else if (flags === undefined && hasBrand(pattern, 'BuiltinRegExp')) {
      return pattern;
    }
    return $$RegExpCreate(pattern, flags);
  }

  exec(string){
    if (hasBrand(this, 'BuiltinRegExp')) {
      return $$RegExpExec(this, ToString(string));
    }

    throw $$Exception('not_generic', ['RegExp.prototype.exec']);
  }

  test(string){
    if (hasBrand(this, 'BuiltinRegExp')) {
      return $$RegExpTest(this, ToString(string));
    }

    throw $$Exception('not_generic', ['RegExp.prototype.test']);
  }

  toString(){
    if (hasBrand(this, 'BuiltinRegExp')) {
      return $$RegExpToString(this);
    }

    throw $$Exception('not_generic', ['RegExp.prototype.toString']);
  }
}

builtinClass(RegExp);


export function exec(regexp, string){
  if (hasBrand(regexp, 'BuiltinRegExp')) {
    return $$RegExpExec(regexp, ToString(string));
  }
  throw $$Exception('not_generic', ['@regexp.exec']);
}

builtinFunction(exec);


export function test(regexp, string){
  if (hasBrand(regexp, 'BuiltinRegExp')) {
    return $$RegExpTest(regexp, [ToString(string)]);
  }
  throw $$Exception('not_generic', ['@regexp.test']);
}

builtinFunction(test);
