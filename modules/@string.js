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
  attrVal = $__ToString(attrVal);
  var attr = attrName === undefined ? '' : ' '+attrName+'="'+$__StringReplace(attrVal, '"', '&quot;')+'"';
  return '<'+tag+attr+'>'+content+'</'+tag+'>';
}

internalFunction(ToHTML);

function isRegExp(subject){
  return subject !== null && typeof subject === 'object' && subject.@@GetBuiltinBrand() === 'RegExp';
}

internalFunction(isRegExp);

function stringIndexOf(string, search, position){
  search = $__ToString(search);
  position = $__ToInteger(position);

  var len = string.length,
      searchLen = search.length,
      i = position > 0 ? position < len ? position : len : 0,
      maxLen = len - searchLen;

  while (i < maxLen) {
    var j = 0;
    while (j < searchLen && search[j] === string[i + j]) {
      if (j++ === searchLen - 1) {
        return i;
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
    return regexp.exec(string);
  }
  regexp.lastIndex = 0;
  var array = [],
      previous = 0,
      lastMatch = true,
      n = 0;

  while (lastMatch) {
    var result = regexp.exec(string);
    if (result === null) {
      lastMatch = false;
    } else {
      var thisIndex = regexp.lastIndex;
      if (thisIndex === lastIndex) {
        previous = regexp.lastIndex = thisIndex + 1;
      } else {
        previous = thisIndex;
      }
      array[n++] = result[0];
    }
  }

  return n === 0 ? null : array;
}

internalFunction(stringMatch);


function useHost(value, method){
  return $__CallBuiltin(ensureCoercible(value, method), method);
}

internalFunction(useHost);



export class String {
  constructor(string){
    string = arguments.length ? $__ToString(string) : '';
    return $__IsConstructCall() ? $__StringCreate(string) : string;
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
    var string = ensureCoercible(this, 'charAt');
    position = $__ToInteger(position);
    return position < 0 || position >= string.length ? '' : string[position];
  }

  charCodeAt(position){
    var string = ensureCoercible(this, 'charCodeAt');
    position = $__ToInteger(position);
    return position < 0 || position >= string.length ? NaN : $__CodeUnit(string[position]);
  }

  concat(...args){
    var string = ensureCoercible(this, 'concat');
    for (var i=0; i < args.length; i++) {
      string += $__ToString(args[i]);
    }
    return string;
  }

  indexOf(search){
    return stringIndexOf(ensureCoercible(this, 'indexOf'), search, arguments[1]);
  }

  lastIndexOf(search){
    var string = ensureCoercible(this, 'lastIndexOf'),
        len = string.length,
        position = $__ToNumber(arguments[1]);

    search = $__ToString(search);
    var searchLen = search.length;

    position = position !== position ? Infinity : $__ToInteger(position);
    position -= searchLen;

    var i = position > 0 ? position < len ? position : len : 0;

    while (i--) {
      var j = 0;
      while (j < searchLen && search[j] === string[i + j]) {
        if (j++ === searchLen - 1) {
          return i;
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
    var string = ensureCoercible(this, 'repeat'),
        n = $__ToInteger(count),
        o = '';

    if (n <= 1 || n === Infinity || n === -Infinity) {
      throw $__Exception('invalid_repeat_count', []);
    }

    while (n > 0) {
      n & 1 && (o += string);
      n >>= 1;
      string += string;
    }

    return o;
  }

  replace(search, replace){
    var string = ensureCoercible(this, 'replace');

    if (typeof replace === 'function') {
      var match, count;
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
    var string = ensureCoercible(this, 'search');
    if (!isRegExp(regexp)) {
      regexp = new RegExp(regexp);
    }
    return $__StringSearch(string, regexp);
  }

  slice(start, end){
    var string = ensureCoercible(this, 'slice');
    start = $__ToInteger(start);
    if (end === undefined) {
      return $__StringSlice(string, start);
    } else {
      return $__StringSlice(string, start, $__ToInteger(end));
    }
  }

  split(separator, limit){
    var string = ensureCoercible(this, 'split');
    limit = limit === undefined ? MAX_INTEGER - 1 : $__ToInteger(limit);
    separator = isRegExp(separator) ? separator : $__ToString(separator);
    return $__StringSplit(string, separator, limit);
  }

  substr(start, length){
    var string = ensureCoercible(this, 'substr'),
        start = $__ToInteger(start),
        chars = string.length;

    length = length === undefined ? Infinity : $__ToInteger(length);

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

  substring(start, end){
    var string = ensureCoercible(this, 'substring'),
        start = $__ToInteger(start),
        len = string.length;

    end = end === undefined ? len : $__ToInteger(end);

    start = start > 0 ? start < len ? start : len : 0;
    end = end > 0 ? end < len ? end : len : 0;

    var from = start < end ? start : end,
        to = start > end ? start : end;

    return $__StringSlice(string, from, to);
  }

  toLocaleLowerCase(){
    return useHost(this, 'toLocaleLowerCase');
  }

  toLocaleUpperCase(){
    return useHost(this, 'toLocaleUpperCase');
  }

  toLowerCase(){
    return useHost(this, 'toLowerCase');
  }

  toString(){
    if (this.@@GetBuiltinBrand() === 'String') {
      return this.@@getInternal('PrimitiveValue');
    }
    throw $__exception('not_generic', ['String.prototype.toString']);
  }

  toUpperCase(){
    return useHost(this, 'toUpperCase');
  }

  trim(){
    return $__StringTrim(ensureCoercible(this, 'trim'));
  }

  valueOf(){
    if (this.@@GetBuiltinBrand() === 'String') {
      return this.@@getInternal('PrimitiveValue');
    }
    throw $__Exception('not_generic', ['String.prototype.valueOf']);
  }
}

builtinClass(String);

String.prototype.@@DefineOwnProperty(@@PrimitiveValue, {
  configurable: true,
  enumerable: false,
  get: $__GetPrimitiveValue,
  set: $__SetPrimitiveValue
});


export function fromCharCode(...codeUnits){
  var length = codeUnits.length,
      str = '';
  for (var i=0; i < length; i++) {
    str += $__FromCharCode($__ToUint16(codeUnits[i]));
  }
  return str;
}

String.@@extend({ fromCharCode });



