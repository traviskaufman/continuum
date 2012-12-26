import Iterator from '@iter';
import { Set, add, has } from '@set';
import { min, max } from '@math';

const arrays = new Set;

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

  every(callbackfn, context = undefined){
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

  filter(callbackfn, context = undefined){
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

  forEach(callbackfn, context = undefined){
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
    const array = $__ToObject(this);

    if (has(arrays, array)) {
      return '';
    }
    add(arrays, array);

    const sep = $__ToString(separator.length ? separator[0] : ','),
          len = $__ToUint32(array.length);

    if (len === 0) {
      return '';
    }

    var result = '0' in array ? $__ToString(array[0]) : '',
        index  = 0;

    while (++index < len) {
      result += index in array ? ',' + $__ToString(array[index]) : ',';
    }

    arrays.delete(array);
    return result;
  }

  keys(){
    return new ArrayIterator(this, 'key');
  }

  lastIndexOf(search, fromIndex = this.length){
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

  map(callbackfn, context = undefined){
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
          len    = $__ToUint32(array.length) - 1;

    if (len >= 0) {
      const result = array[len];
      array.length = len;
      return result;
    }
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

    let accumulator, index;

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

  slice(start = 0, end = this.length){
    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          result = [];

    start = $__ToInteger(start);
    end = $__ToInteger(end);

    if (start < 0) {
      start += len;
      if (start < 0) {
        start = 0;
      }
    }

    if (end < 0) {
      end += len;
      if (end < 0) {
        return result;
      }
    } else if (end >= len) {
      end = len;
    }

    if (start < end) {
      let newIndex = 0,
          oldIndex = start;

      do {
        result[newIndex++] = array[oldIndex++];
      } while (oldIndex < end)
    }

    return result;
  }

  shift(){
    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          result = array[0];

    if (!len) {
      return result;
    }

    let oldIndex = 1,
        newIndex = 0;

    do {
      if (oldIndex in array) {
        array[newIndex] = array[oldIndex];
      } else if (!delete array[newIndex]) {
        throw $__Exception('delete_array_index', ['Array.prototype.shift', newIndex]);
      }
      newIndex++;
    } while (++oldIndex < len)

    array.length = len - 1;
    return result;
  }

  some(callbackfn, context = undefined){
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

  splice(start, deleteCount, ...items){
    const array     = $__ToObject(this),
          len       = $__ToUint32(array.length),
          itemCount = items.length,
          result    = [];

    start = $__ToInteger(start);
    if (start < 0) {
      start = max(len + start, 0);
    } else {
      start = min(start, len);
    }

    deleteCount = min(max($__ToInteger(deleteCount), 0), len - start);

    if (deleteCount > 0) {
      let index = 0;

      do {
        let from = index + start;

        if (from in array) {
          result[index] = array[from];
        }

        index++;
      } while (index < deleteCount)

      result.length = deleteCount;
    }

    const count = len - deleteCount;

    if (itemCount < deleteCount) {
      let index = start;

      while (index < count) {
        let from = index + deleteCount,
            to   = index + itemCount;

        if (from in array) {
          array[to] = array[from];
        } else if (!delete array[to]) {
          throw $__Exception('delete_array_index', ['Array.prototype.splice', to]);
        }

        index++;
      }
    } else if (itemCount > deleteCount) {
      let index = count;

      while (index > start) {
        let from = index + deleteCount - 1,
            to   = index + itemCount - 1;

        if (from in array) {
          array[to] = array[from];
        } else if (!delete array[to]) {
          throw $__Exception('delete_array_index', ['Array.prototype.splice', to]);
        }

        index--;
      }
    }

    if (itemCount) {
      let itemIndex = 0,
          index     = start;

      do {
        array[index++] = items[itemIndex++];
      } while (itemIndex < itemCount)
    }

    array.length = len - deleteCount + itemCount;

    return result;
  }

  toLocaleString(){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    if (len === 0 || has(arrays, array)) {
      return '';
    }
    add(arrays, array);

    let nextElement = array[0],
        result = nextElement == null ? '' : nextElement.toLocaleString(),
        index  = 0;

    while (++index < len) {
      result += ',';
      nextElement = array[index];
      if (nextElement != null) {
        result += nextElement.toLocaleString();
      }
    }

    arrays.delete(array);
    return result;
  }

  toString(){
    const array = $__ToObject(this);
    var func = array.join;

    if (typeof func !== 'function') {
      func = $__ObjectToString;
    }

    return func.@@Call(array, []);
  }

  unshift(...values){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length),
          newLen = len + values.length;

    if (len === newLen) {
      return newLen;
    }

    array.length = newLen;

    let oldIndex = len,
        newIndex = newLen;

    while (oldIndex-- > 0) {
      newIndex--;
      if (oldIndex in array) {
        array[newIndex] = array[oldIndex];
      } else if (!delete array[newIndex]) {
        throw $__Exception('delete_array_index', ['Array.prototype.unshift', newIndex]);
      }
    }

    while (newIndex-- > 0) {
      array[newIndex] = values[newIndex];
    }

    return newLen;
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
