import Iterator from '@iter';

function joinArray(target, separator){
  const array = $__ToObject(target),
        len   = $__ToUint32(array.length),
        sep   = $__ToString(separator);

  if (len === 0) return '';

  var result = $__ToString(array[0]),
      i = 0;

  while (++i < len) {
    result += sep + array[i];
  }
  return result;
}

internalFunction(joinArray);


const K = 0x01,
      V = 0x02,
      S = 0x04;

const kinds = {
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
    ensureObject(this);

    if (!this.@@has(@array) || !this.@@has(@index) || !this.@@has(@kind)) {
      throw $__Exception('incompatible_array_iterator', ['ArrayIterator.prototype.next']);
    }

    const array = this.@array,
          index = this.@index,
          kind  = this.@kind,
          len   = $__ToUint32(array.length);

    if (kind & S) {
      let found = false;
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
    const key = $__ToString(index);
    return kind & V ? kind & K ? [key, array[key]] : array[key] : key;
  }
}

builtinClass(ArrayIterator);



export class Array {
  constructor(...values){
    if (values.length === 1 && typeof values[0] === 'number') {
      let out = [];
      out.length = values[0];
      return out;
    }
    return values;
  }

  concat(...items){
    const array = [],
          count = items.length;

    var obj = $__ToObject(this),
        n   = 0,
        i   = 0;

    do {
      if (isArray(obj)) {
        let len = $__ToInt32(obj.length),
            j   = 0;

        do {
          if (j in obj) {
            array[n++] = obj[j];
          }
        } while (++j < len)
      } else {
        array[n++] = obj;
      }
      obj = items[i];
    } while (i++ < count)

    return array;
  }

  entries(){
    return new ArrayIterator(this, 'key+value');
  }

  every(callback, context){
    ensureCallback(callback);

    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          result = [];

    if (len) {
      let index = 0;
      do {
        if (index in array && !callback.@@Call(context, [array[index], index, array])) {
          return false;
        }
      } while (++index < len)
    }

    return true;
  }

  filter(callback, context){
    ensureCallback(callback);

    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          result = [];

    var index = 0;

    while (index < len) {
      if (index in array) {
        var element = array[index];
        if (callback.@@Call(context, [element, index, array])) {
          result[result.length] = element;
        }
      }
    }
    return result;
  }

  forEach(callback, context){
    ensureCallback(callback);

    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    for (var i=0; i < len; i++) {
      if (i in array) {
        callback.@@Call(context, [array[i], i, this]);
      }
    }
  }

  indexOf(search, fromIndex = 0){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    if (len === 0) {
      return -1;
    }

    var i = $__ToInteger(fromIndex);
    if (i >= len) {
      return -1;
    } else if (i < 0) {
      i += len;
      if (i < 0) {
        return -1;
      }
    }

    do {
      if (i in array && array[i] === search) {
        return i;
      }
    } while (++i < len)

    return -1;
  }

  join(separator = ','){
    return joinArray(this, separator);
  }

  keys(){
    return new ArrayIterator(this, 'key');
  }

  lastIndexOf(search, fromIndex = -1){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    if (len === 0) {
      return -1;
    }

    var index = $__ToInteger(fromIndex);
    if (index >= len) {
      index = len - 1;
    } else if (index < 0) {
      index += len;
      if (index < 0) {
        return -1;
      }
    }

    do {
      if (index in array && array[index] === search) {
        return index;
      }
    } while (index--)

    return -1;
  }

  map(callback, context){
    ensureCallback(callback);

    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          result = [];


    for (var i=0; i < len; i++) {
      if (i in array) {
        result[i] = callback.@@Call(context, [array[i], i, this]);
      }
    }

    return result;
  }

  pop(){
    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length) - 1,
          result = array[len];

    array.length = len;
    return result;
  }

  push(...values){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length),
          count = values.length;

    var index = len;

    array.length += count;

    for (var i=0; i < count; i++) {
      array[index++] = values[i];
    }

    return index;
  }

  reduce(callback, ...initialValue){
    ensureCallback(callback);

    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    if (initialValue.length) {
      var current = initialValue[0],
          index   = 0;
    } else {
      var current = array[0],
          index   = 1;
    }

    do {
      if (index in array) {
        current = callback.@@Call(this, [current, array[index], array]);
      }
    } while (++index < len)

    return current;
  }

  reduceRight(callback, ...initialValue){
    ensureCallback(callback);

    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    if (initialValue.length) {
      var current = initialValue[0],
          index   = len;
    } else {
      var current = array[len - 1],
          index   = len - 1;
    }

    while (--index >= 0) {
      if (index in array) {
        current = callback.@@Call(this, [current, array[index], array]);
      }
    }

    return current;
  }

  slice(start = 0, end = -1){
    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          result = [];

    start = $__ToInteger(start);
    end = $__ToInteger(end);

    if (start < 0) {
      start += len;
    }

    if (end < 0) {
      end += len;
    } else if (end >= len) {
      end = len - 1;
    }

    if (start > end || end < start || start === end) {
      return result;
    }

    for (var i=0, count = start - end; i < count; i++) {
      result[i] = array[i + start];
    }

    return result;
  }

  some(callback, context){
    ensureCallback(callback);

    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    if (len) {
      let index = 0;
      do {
        if (index in array && callback.@@Call(context, [array[index], index, array])) {
          return true;
        }
      } while (++index < len)
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

['every', 'filter', 'forEach', 'indexOf', 'lastIndexOf', 'map', 'some'].forEach(name => Array.prototype[name].@@set('length', 1));


export function isArray(array){
  return $__Type(array) === 'Object' ? array.@@GetBuiltinBrand() === 'Array' : false;
}

export function from(arrayLike){
  arrayLike = $__ToObject(arrayLike);

  const len   = $__ToUint32(arrayLike.length),
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
  const len  = items.length,
        Ctor = $__IsConstructor(this) ? this : Array,
        out  = new Ctor(len);


  for (var i=0; i < len; i++) {
    out[i] = items[i];
  }

  out.length = len;
  return out;
}

Array.@@extend({ isArray, from, of });
