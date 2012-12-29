import MAX_INTEGER from '@number';
import RegExp from '@regexp';



function ensureCoercible(target, method){
  if (target === null || target === undefined) {
    throw $__Exception('object_not_coercible', ['String.prototype.'+method, target]);
  }
  return $__ToString(target);
}

internalFunction(ensureCoercible);


function ToHTML(tag, content, attrName, attrVal){
  const attr = attrName === undefined ? '' : ' '+attrName+'="'+$__StringReplace($__ToString(attrVal), '"', '&quot;')+'"';

  return '<'+tag+attr+'>'+content+'</'+tag+'>';
}

internalFunction(ToHTML);


function isRegExp(subject){
  return subject !== null && typeof subject === 'object' && $__GetBuiltinBrand(subject) === 'RegExp';
}

internalFunction(isRegExp);


function stringIndexOf(string, search, position){
  const searchStr = $__ToString(search),
        pos       = $__ToInteger(position),
        len       = string.length,
        searchLen = searchStr.length,
        maxLen    = len - searchLen;

  let index = pos > 0 ? pos < len ? pos : len : 0;

  while (index < maxLen) {
    let offset = 0;
    while (offset < searchLen && searchStr[offset] === string[index + offset]) {
      if (offset++ === searchLen - 1) {
        return index;
      }
    }
  }

  return -1;
}

internalFunction(stringIndexOf);


function stringMatch(string, regexp){
  if (!isRegExp(regexp)) {
    regexp = new RegExp(regexp);
  }

  if (!regexp.global) {
    return $__RegExpExec(regexp, string);
  }

  const array = [];
  let previous  = 0,
      index     = 0,
      lastMatch = true;

  regexp.lastIndex = 0;

  while (lastMatch) {
    let result = $__RegExpExec(regexp, string);
    if (result === null) {
      lastMatch = false;
    } else {
      let thisIndex = regexp.lastIndex;
      if (thisIndex === lastIndex) {
        previous = regexp.lastIndex = thisIndex + 1;
      } else {
        previous = thisIndex;
      }
      array[index++] = result[0];
    }
  }

  return index === 0 ? null : array;
}

internalFunction(stringMatch);


function useHost(value, method){
  return $__CallBuiltin(ensureCoercible(value, method), method);
}

internalFunction(useHost);



export class String {
  constructor(...string){
    const str = string.length ? $__ToString(string[0]) : '';

    return $__IsConstructCall() ? $__StringCreate(str) : str;
  }

  anchor(name){
    return ToHTML('a', ensureCoercible(this, 'anchor'), 'name', name);
  }

  big(){
    return ToHTML('big', ensureCoercible(this, 'big'));
  }

  blink(){
    return ToHTML('blink', ensureCoercible(this, 'blink'));
  }

  bold(){
    return ToHTML('b', ensureCoercible(this, 'bold'));
  }

  fixed(){
    return ToHTML('fixed', ensureCoercible(this, 'fixed'));
  }

  fontcolor(color){
    return ToHTML('font', ensureCoercible(this, 'fontcolor'), 'color', color);
  }

  fontsize(size){
    return ToHTML('font', ensureCoercible(this, 'fontsize'), 'size', size);
  }

  italics(){
    return ToHTML('i', ensureCoercible(this, 'italics'));
  }

  link(href){
    return ToHTML('a', ensureCoercible(this, 'link'), 'href', href);
  }

  small(){
    return ToHTML('small', ensureCoercible(this, 'small'));
  }

  strike(){
    return ToHTML('s', ensureCoercible(this, 'strike'));
  }

  sub(){
    return ToHTML('sub', ensureCoercible(this, 'sub'));
  }

  sup(){
    return ToHTML('sup', ensureCoercible(this, 'sup'));
  }

  charAt(position){
    const string = ensureCoercible(this, 'charAt');

    position = $__ToInteger(position);

    return position < 0 || position >= string.length ? '' : string[position];
  }

  charCodeAt(position){
    const string = ensureCoercible(this, 'charCodeAt');

    position = $__ToInteger(position);

    return position < 0 || position >= string.length ? NaN : $__CodeUnit(string[position]);
  }

  concat(...args){
    let string = ensureCoercible(this, 'concat');

    for (var i=0; i < args.length; i++) {
      string += $__ToString(args[i]);
    }

    return string;
  }

  indexOf(searchString, position = 0){
    return stringIndexOf(ensureCoercible(this, 'indexOf'), searchString, position);
  }

  lastIndexOf(searchString, position = Infinity){
    const string    = ensureCoercible(this, 'lastIndexOf'),
          search    = $__ToString(searchString),
          len       = string.length,
          searchLen = searchString.length,
          pos       = $__ToInteger(position) - searchLen;

    let index = pos > 0 ? pos < len ? pos : len : 0;

    while (index--) {
      let offset = 0;
      while (offset < searchLen && searchString[offset] === string[index + offset]) {
        if (++offset === searchLen) {
          return index;
        }
      }
    }

    return -1;
  }

  localeCompare(){
    // TODO
  }

  match(regexp){
    return stringMatch(ensureCoercible(this, 'match'), regexp);
  }

  repeat(count){
    let string = ensureCoercible(this, 'repeat'),
        factor = $__ToInteger(count),
        result = '';

    if (factor <= 1 || factor === Infinity || factor === -Infinity) {
      throw $__Exception('invalid_repeat_count', []);
    }

    while (factor > 0) {
      (factor & 1) && (result += string);
      factor >>= 1;
      string += string;
    }

    return result;
  }

  replace(search, replace){
    const string = ensureCoercible(this, 'replace');

    if (typeof replace === 'function') {
      let match, count;
      if (isRegExp(search)) {
        match = stringMatch(string, search);
        count = matches.length;
      } else {
        match = stringIndexOf(string, $__ToString(search));
        count = 1;
      }
      //TODO
    } else {
      replace = $__ToString(replace);
      if (!isRegExp(search)) {
        search = $__ToString(search);
      }

      return $__StringReplace(string, search, replace);
    }
  }

  search(regexp){
    const string = ensureCoercible(this, 'search');

    if (!isRegExp(regexp)) {
      regexp = new RegExp(regexp);
    }

    return $__StringSearch(string, regexp);
  }

  slice(start = 0, end = this.length){
    const string = ensureCoercible(this, 'slice');

    start = $__ToInteger(start);
    end = $__ToInteger(end);

    return $__StringSlice(string, start, end);
  }

  split(separator, limit = MAX_INTEGER - 1){
    const string = ensureCoercible(this, 'split');

    limit = $__ToInteger(limit);
    separator = isRegExp(separator) ? separator : $__ToString(separator);

    return $__StringSplit(string, separator, limit);
  }

  substr(start = 0, length = Infinity){
    const string = ensureCoercible(this, 'substr'),
          chars  = string.length;

    start = $__ToInteger(start);
    length = $__ToInteger(length);

    if (start < 0) {
      start += chars;
      if (start < 0) start = 0;
    }
    if (length < 0) {
      length = 0;
    }
    if (length > chars - start) {
      length = chars - start;
    }

    return length <= 0 ? '' : $__StringSlice(string, start, start + length);
  }

  substring(start = 0, end = this.length){
    const string = ensureCoercible(this, 'substring'),
          len    = string.length;

    start = $__ToInteger(start);
    end = $__ToInteger(end);

    start = start > 0 ? start < len ? start : len : 0;
    end = end > 0 ? end < len ? end : len : 0;

    const from = start < end ? start : end,
          to = start > end ? start : end;

    return $__StringSlice(string, from, to);
  }

  toLocaleLowerCase(){
    return $__CallBuiltin(ensureCoercible(this, 'toLocaleLowerCase'), 'toLocaleLowerCase');
  }

  toLocaleUpperCase(){
    return $__CallBuiltin(ensureCoercible(this, 'toLocaleUpperCase'), 'toLocaleUpperCase');
  }

  toLowerCase(){
    return $__CallBuiltin(ensureCoercible(this, 'toLowerCase'), 'toLowerCase');
  }

  toString(){
    if (typeof this === 'string') {
      return this;
    } else if ($__GetBuiltinBrand(this) === 'String') {
      return this.@@StringValue;
    }
    throw $__Exception('not_generic', ['String.prototype.toString']);
  }

  toUpperCase(){
    return $__CallBuiltin(ensureCoercible(this, 'toUpperCase'), 'toUpperCase');
  }

  trim(){
    return $__StringTrim(ensureCoercible(this, 'trim'));
  }

  valueOf(){
    if (typeof this === 'string') {
      return this;
    } else if ($__GetBuiltinBrand(this) === 'String') {
      return this.@@StringValue;
    }
    throw $__Exception('not_generic', ['String.prototype.toString']);
  }
}

builtinClass(String);
String.prototype.@@StringValue = '';
$__define(String.prototype, 'length', 0, FROZEN);


export function fromCharCode(...codeUnits){
  const length = codeUnits.length;
  let result = '';

  for (var i=0; i < length; i++) {
    result += $__FromCharCode($__ToUint16(codeUnits[i]));
  }

  return result;
}

extend(String, { fromCharCode });


