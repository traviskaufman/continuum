import Iterator from '@iter';

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

    var obj   = $__ToObject(this),
        n     = 0,
        index = 0;

    do {
      if (isArray(obj)) {
        let len = $__ToInt32(obj.length),
            i   = 0;

        do {
          if (i in obj) {
            array[n++] = obj[i];
          }
        } while (++i < len)
      } else {
        array[n++] = obj;
      }
      obj = items[index];
    } while (index++ < count)

    return array;
  }

  entries(){
    return new ArrayIterator(this, 'key+value');
  }

  every(callbackfn, context){
    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length);

    ensureCallback(callbackfn);

    if (len) {
      let index = 0;
      do {
        if (index in array && !callbackfn.@@Call(context, [array[index], index, array])) {
          return false;
        }
      } while (++index < len)
    }

    return true;
  }

  filter(callbackfn, context){
    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          result = [];

    ensureCallback(callbackfn);

    if (len) {
      let index = 0;
      do {
        if (index in array) {
          let element = array[index];
          if (callbackfn.@@Call(context, [element, index, array])) {
            result[result.length] = element;
          }
        }
      } while (++index < len)
    }

    return result;
  }

  forEach(callbackfn, context){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    ensureCallback(callbackfn);

    for (var i=0; i < len; i++) {
      if (i in array) {
        callbackfn.@@Call(context, [array[i], i, this]);
      }
    }
  }

  indexOf(search, fromIndex = 0){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    if (len === 0) {
      return -1;
    }

    var index = $__ToInteger(fromIndex);
    if (index >= len) {
      return -1;
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
    } while (++index < len)

    return -1;
  }

  join(...separator){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length),
          sep   = $__ToString(separator.length ? separator[0] : ',');

    if (len === 0) {
      return '';
    }

    var result = $__ToString(array[0]),
        index  = 0;

    while (++index < len) {
      result += sep + array[index];
    }

    return result;
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

  map(callbackfn, context){
    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          result = [];

    ensureCallback(callbackfn);

    for (var i=0; i < len; i++) {
      if (i in array) {
        result[i] = callbackfn.@@Call(context, [array[i], i, this]);
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

  reduce(callbackfn, ...initialValue){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    var accumulator, index;

    ensureCallback(callbackfn);


    if (initialValue.length) {
      accumulator = initialValue[0];
      index = 0;
    } else {
      accumulator = array[0];
      index = 1;
    }

    do {
      if (index in array) {
        accumulator = callbackfn.@@Call(this, [accumulator, array[index], array]);
      }
    } while (++index < len)

    return accumulator;
  }

  reduceRight(callbackfn, ...initialValue){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    var accumulator, index;

    ensureCallback(callbackfn);

    if (initialValue.length) {
      accumulator = initialValue[0];
      index = len - 1;
    } else {
      accumulator = array[len - 1];
      index = len - 2;
    }

    do {
      if (index in array) {
        accumulator = callbackfn.@@Call(this, [accumulator, array[index], array]);
      }
    } while (--index >= 0)

    return accumulator;
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

  some(callbackfn, context){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    ensureCallback(callbackfn);

    if (len) {
      let index = 0;
      do {
        if (index in array && callbackfn.@@Call(context, [array[index], index, array])) {
          return true;
        }
      } while (++index < len)
    }

    return false;
  }

  toString(){
    const array = $__ToObject(this);
    var func = array.join;

    if (typeof func !== 'function') {
      func = $__ObjectToString;
    }

    return func.@@Call(array, []);
  }

  values(){
    return new ArrayIterator(this, 'value');
  }

  @iterator(){
    return new ArrayIterator(this, 'key+value');
  }
}

builtinClass(Array);

['every', 'filter', 'forEach', 'indexOf', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some'
].forEach(name => Array.prototype[name].@@set('length', 1));


export function isArray(array){
  return $__Type(array) === 'Object' ? array.@@GetBuiltinBrand() === 'Array' : false;
}

export function from(arrayLike){
  arrayLike = $__ToObject(arrayLike);

  const len  = $__ToUint32(arrayLike.length),
        Ctor = $__IsConstructor(this) ? this : Array,
        out  = new Ctor(len);

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
