import Iterator from '@iter';

function joinArray(array, separator){
  array = $__ToObject(array);

  var result = '',
      len = $__ToUint32(array.length);

  if (len === 0) {
    return result;
  }

  if (typeof separator !== 'string') {
    separator = $__ToString(separator);
  }

  for (var i=0; i < len; i++) {
    if (i) result += separator;
    result += $__ToString(array[i]);
  }

  return result;
}

internalFunction(joinArray);


var K = 0x01,
    V = 0x02,
    S = 0x04;

var kinds = {
  'key': 1,
  'value': 2,
  'key+value': 3,
  'sparse:key': 5,
  'sparse:value': 6,
  'sparse:key+value': 7
};

class ArrayIterator extends Iterator {
  private @array, // IteratedObject
          @index, // ArrayIteratorNextIndex
          @kind;  // ArrayIterationKind

  constructor(array, kind){
    this.@array = $__ToObject(array);
    this.@index = 0;
    this.@kind = kinds[kind];
  }

  next(){
    if (!$__IsObject(this)) {
      throw $__Exception('called_on_non_object', ['ArrayIterator.prototype.next']);
    }
    if (!(this.@@has(@array) && this.@@has(@index) && this.@@has(@kind))) {
      throw $__Exception('incompatible_array_iterator', ['ArrayIterator.prototype.next']);
    }

    var array = this.@array,
        index = this.@index,
        kind  = this.@kind,
        len   = $__ToUint32(array.length),
        key   = $__ToString(index);

    if (kind & S) {
      var found = false;
      while (!found && index < len) {
        found = index in array;
        if (!found) {
          index++;
        }
      }
    }

    if (index >= len) {
      this.@index = Infinity;
      throw $__StopIteration;
    }

    this.@index = index + 1;

    if (kind & V) {
      var value = array[key];
      if (kind & K) {
        return [key, value];
      }
      return value;
    }
    return key;
  }
}

builtinClass(ArrayIterator);



export class Array {
  constructor(...values){
    if (values.length === 1 && typeof values[0] === 'number') {
      var out = [];
      out.length = values[0];
      return out;
    } else {
      return values;
    }
  }

  concat(...items){
    var obj   = $__ToObject(this),
        array = [],
        count = items.length,
        n     = 0,
        i     = 0;

    do {
      if (obj && typeof obj === 'object' && obj.@@GetBuiltinBrand() === 'BuiltinArray') {
        var len = obj.length;
        for (var j=0; j < len; j++) {
          if (j in obj) {
            array[n++] = obj[j];
          }
        }
      } else {
        array[n++] = obj;
      }
      obj = items[i++];
    } while (i <= count)

    return array;
  }

  every(callback, context){
    var array  = $__ToObject(this),
        len    = $__ToUint32(array.length),
        result = [];

    if (typeof callback !== 'function') {
      throw $__Exception('callback_must_be_callable', ['Array.prototype.every']);
    }

    for (var i = 0; i < len; i++) {
      if (i in array && !callback.@@Call(context, [array[i], i, array])) {
        return false;
      }
    }

    return true;
  }

  filter(callback, context){
    var array  = $__ToObject(this),
        len    = $__ToUint32(array.length),
        result = [],
        count  = 0;

    if (typeof callback !== 'function') {
      throw $__Exception('callback_must_be_callable', ['Array.prototype.filter']);
    }

    for (var i = 0; i < len; i++) {
      if (i in array) {
        var element = array[i];
        if (callback.@@Call(context, [element, i, this])) {
          result[count++] = element;
        }
      }
    }

    return result;
  }

  forEach(callback, context){
    var array = $__ToObject(this),
        len   = $__ToUint32(array.length);

    if (typeof callback !== 'function') {
      throw $__Exception('callback_must_be_callable', ['Array.prototype.forEach']);
    }

    for (var i=0; i < len; i++) {
      if (i in array) {
        callback.@@Call(context, [array[i], i, this]);
      }
    }
  }

  indexOf(search, fromIndex){
    var array = $__ToObject(this),
        len   = $__ToUint32(array.length);

    if (len === 0) {
      return -1;
    }

    var i = $__ToInteger(fromIndex);
    if (i > len) {
      return -1;
    }

    for (; i < len; i++) {
      if (i in array && array[i] === search) {
        return i;
      }
    }

    return -1;
  }

  items(){
    return new ArrayIterator(this, 'key+value');
  }

  join(separator){
    return joinArray(this, arguments.length ? separator : ',');
  }

  keys(){
    return new ArrayIterator(this, 'key');
  }

  lastIndexOf(search, fromIndex){
    var array = $__ToObject(this),
        len   = $__ToUint32(array.length);

    if (len === 0) {
      return -1;
    }

    var i = arguments.length > 1 ? $__ToInteger(fromIndex) : len - 1;

    if (i >= len) {
      i = len - 1;
    } else if (i < 0) {
      i += i;
    }

    for (; i >= 0; i--) {
      if (i in array && array[i] === search) {
        return i;
      }
    }

    return -1;
  }

  map(callback, context){
    var array  = $__ToObject(this),
        len    = $__ToUint32(array.length),
        result = [];

    if (typeof callback !== 'function') {
      throw $__Exception('callback_must_be_callable', ['Array.prototype.map']);
    }

    for (var i=0; i < len; i++) {
      if (i in array) {
        result[i] = callback.@@Call(context, [array[i], i, this]);
      }
    }
    return result;
  }

  pop(){
    var array  = $__ToObject(this),
        len    = $__ToUint32(array.length),
        result = array[len - 1];

    array.length = len - 1;
    return result;
  }

  push(...values){
    var array = $__ToObject(this),
        len   = $__ToUint32(array.length),
        count = values.length;

    for (var i=0; i < valuesLen; i++) {
      array[len++] = count[i];
    }
    return len;
  }

  reduce(callback, initial){
    var array  = $__ToObject(this),
        len    = $__ToUint32(array.length),
        result = [];

    if (typeof callback !== 'function') {
      throw $__Exception('callback_must_be_callable', ['Array.prototype.reduce']);
    }

    var i = 0;
    if (arguments.length === 1) {
      initial = array[0];
      i = 1;
    }

    for (; i < len; i++) {
      if (i in array) {
        initial = callback.@@Call(this, [initial, array[i], array]);
      }
    }
    return initial;
  }

  reduceRight(callback, initial){
    var array  = $__ToObject(this),
        len    = $__ToUint32(array.length),
        result = [];

    if (typeof callback !== 'function') {
      throw $__Exception('callback_must_be_callable', ['Array.prototype.reduceRight']);
    }

    var i = len - 1;
    if (arguments.length === 1) {
      initial = array[i];
      i--;
    }

    for (; i >= 0; i--) {
      if (i in array) {
        initial = callback.@@Call(this, [initial, array[i], array]);
      }
    }
    return initial;
  }

  slice(start, end){
    var array  = $__ToObject(this),
        len    = $__ToUint32(array.length),
        result = [];

    start = start === undefined ? 0 : +start || 0;
    end = end === undefined ? len - 1 : +end || 0;

    if (start < 0) {
      start += len;
    }

    if (end < 0) {
      end += len;
    } else if (end >= len) {
      end = len - 1;
    }

    if (start > end || end < start || start === end) {
      return [];
    }

    for (var i=0, count = start - end; i < count; i++) {
      result[i] = array[i + start];
    }

    return result;
  }

  some(callback, context){
    var array  = $__ToObject(this),
        len    = $__ToUint32(array.length),
        result = [];

    if (typeof callback !== 'function') {
      throw $__Exception('callback_must_be_callable', ['Array.prototype.some']);
    }

    for (var i = 0; i < len; i++) {
      if (i in array && callback.@@Call(context, [array[i], i, array])) {
        return true;
      }
    }

    return false;
  }

  toString(){
    return joinArray(this, ',');
  }

  values(){
    return new ArrayIterator(this, 'value');
  }

  @iterator(){
    return new ArrayIterator(this, 'key+value');
  }
}

builtinClass(Array);

[ 'every', 'filter', 'forEach', 'indexOf', 'lastIndexOf',
  'map', 'reduce', 'reduceRight', 'some'
].forEach(name => Array.prototype[name].@@set('length', 1));


export function isArray(array){
  return array ? array.@@GetBuiltinBrand() === 'BuiltinArray' : false;
}

export function from(arrayLike){
  arrayLike = $__ToObject(arrayLike);
  var len   = $__ToUint32(arrayLike.length),
      Ctor  = $__IsConstructor(this) ? this : Array,
      out   = new Ctor(len);

  for (var i = 0; i < len; i++) {
    if (i in arrayLike) {
      out[i] = arrayLike[i];
    }
  }

  out.length = len;
  return out;
}

export function of(...items){
  var len  = $__ToInteger(items.length),
      Ctor = $__IsConstructor(this) ? this : Array,
      out  = new Ctor(len);

  for (var i=0; i < len; i++) {
    out[i] = items[i];
  }

  out.length = len;
  return out;
}

Array.@@extend({ isArray, from, of });
