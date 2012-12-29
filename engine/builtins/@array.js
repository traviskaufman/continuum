import Iterator from '@iter';
import { Set, add, has } from '@set';
import { min, max, floor } from '@math';

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

    if (!$__has(this, @array) || !$__has(this, @index) || !$__has(this, @kind)) {
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



function defaultComparefn(x, y){
  return 1 - ($__ToString(x) < $__ToString(y));
}

internalFunction(defaultComparefn);


function truncate(value, shift){
  return value >> shift << shift;
}

internalFunction(truncate);



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

    let obj   = $__ToObject(this),
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
        if (index in array && !$__Call(callbackfn, context, [array[index], index, array])) {
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
          if ($__Call(callbackfn, context, [element, index, array])) {
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

    for (let i=0; i < len; i++) {
      if (i in array) {
        $__Call(callbackfn, context, [array[i], i, this]);
      }
    }
  }

  indexOf(search, fromIndex = 0){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    if (len === 0) {
      return -1;
    }

    let index = $__ToInteger(fromIndex);
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

    let result = '0' in array ? $__ToString(array[0]) : '',
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

    let index = $__ToInteger(fromIndex);
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
        result[i] = $__Call(callbackfn, context, [array[i], i, this]);
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

    let index = len;

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
        accumulator = $__Call(callbackfn, this, [accumulator, array[index], array]);
      }
    } while (++index < len)

    return accumulator;
  }

  reduceRight(callbackfn, ...initialValue){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    let accumulator, index;

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
        accumulator = $__Call(callbackfn, this, [accumulator, array[index], array]);
      }
    } while (--index >= 0)

    return accumulator;
  }

  reverse(){
    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          middle = floor(len / 2);

    let lower = -1;
    while (++lower !== middle) {
      const upper       = len - lower - 1,
            lowerP      = $__ToString(lower),
            upperP      = $__ToString(upper),
            lowerValue  = array[lowerP],
            upperValue  = array[upperP];

      if (upperP in array) {
        PutPropertyOrThrow(array, lowerP, upperValue, 'Array.prototype.reverse');
        if (lowerP in array) {
          PutPropertyOrThrow(array, upperP, lowerValue, 'Array.prototype.reverse');
        } else {
          DeletePropertyOrThrow(array, upperP, 'Array.prototype.reverse');
        }
      } else if (lowerP in array) {
        PutPropertyOrThrow(array, upperP, lowerValue, 'Array.prototype.reverse');
      } else {
        DeletePropertyOrThrow(array, lowerP, 'Array.prototype.reverse');
      }
    }

    return array;
  }

  slice(start = 0, end = this.length){
    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          result = [];

    start = $__ToInteger(start);
    if (start < 0) {
      start = max(len + start, 0);
    }

    end = $__ToInteger(end);
    if (end < 0) {
      end = max(len + end, 0);
    } else {
      end = min(end, len);
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
        PutPropertyOrThrow(array, newIndex, array[oldIndex], 'Array.prototype.shift');
      } else {
        DeletePropertyOrThrow(array, newIndex, 'Array.prototype.shift');
      }
      newIndex++;
    } while (++oldIndex < len)

    PutPropertyOrThrow(array, 'length', len - 1, 'Array.prototype.shift');
    return result;
  }

  some(callbackfn, context = undefined){
    const array = $__ToObject(this),
          len   = $__ToUint32(array.length);

    ensureCallback(callbackfn);

    if (len) {
      let index = 0;
      do {
        if (index in array && $__Call(callbackfn, context, [array[index], index, array])) {
          return true;
        }
      } while (++index < len)
    }

    return false;
  }

  sort(comparefn = defaultComparefn){
    const array = $__ToObject(this),
          len   = array.length;

    ensureCallback(comparefn);

    if (len >= 2) {
      let trunc = 1;

      for (var start = truncate(len - 2, trunc); start >= 0; start -= 2) {
        if (comparefn(array[start], array[start + 1]) > 0) {
          [array[start], array[start + 1]] = [array[start + 1], array[start]];
        }
      }

      if (len > 2) {
        let arrayA = array,
            arrayB = new Array(len),
            size   = 2;

        do {
          let start  = truncate(len - 1, ++trunc),
              countA = start + size,
              countB = len;

          countA = min(countA, len);

          while (start >= 0) {
            let toIndex   = start,
                fromA     = toIndex,
                fromB     = countA,
                continues = true;

            do {
              if (fromA < countA) {
                if (fromB < countB) {
                  if (comparefn(arrayA[fromA], arrayA[fromB]) > 0) {
                    arrayB[toIndex++] = arrayA[fromB++];
                  } else {
                    arrayB[toIndex++] = arrayA[fromA++];
                  }
                } else {
                  while (fromA < countA) {
                    arrayB[toIndex++] = arrayA[fromA++];
                  }
                  continues = false;
                }
              } else {
                while (fromB < countB) {
                  arrayB[toIndex++] = arrayA[fromB++];
                }
                continues = false;
              }
            } while (continues)

            countB = start;
            start -= 2 * size;
            countA = start + size;
          }

          [arrayA, arrayB] = [arrayB, arrayA];
          size *= 2;
        } while (len > size);

        if (!(trunc & 1)) {
          for (var i = len - 1; i >= 0; i--) {
            array[i] = arrayA[i];
          }
        }
      }
    }

    return array;
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
          PutPropertyOrThrow(result, index, array[from], 'Array.prototype.splice');
        }
        index++;
      } while (index < deleteCount)

      PutPropertyOrThrow(result, 'length', deleteCount, 'Array.prototype.splice');
    }

    const count = len - deleteCount;

    if (itemCount < deleteCount) {
      let index = start;

      while (index < count) {
        let from = index + deleteCount,
            to   = index + itemCount;

        if (from in array) {
          PutPropertyOrThrow(array, to, array[from], 'Array.prototype.splice');
        } else {
          DeletePropertyOrThrow(array, to, 'Array.prototype.splice');
        }
        index++;
      }
    } else if (itemCount > deleteCount) {
      let index = count;

      while (index > start) {
        let from = index + deleteCount - 1,
            to   = index + itemCount - 1;

        if (from in array) {
          PutPropertyOrThrow(array, to, array[from], 'Array.prototype.splice');
        } else {
          DeletePropertyOrThrow(array, to, 'Array.prototype.splice');
        }

        index--;
      }
    }

    if (itemCount) {
      let itemIndex = 0,
          index     = start;

      do {
        PutPropertyOrThrow(array, index++, items[itemIndex++], 'Array.prototype.splice');
      } while (itemIndex < itemCount)
    }

    PutPropertyOrThrow(array, 'length', len - deleteCount + itemCount, 'Array.prototype.splice');

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
    let func = array.join;

    if (typeof func !== 'function') {
      func = $__ObjectToString;
    }

    return $__Call(func, array, []);
  }

  unshift(...values){
    const array  = $__ToObject(this),
          len    = $__ToUint32(array.length),
          newLen = len + values.length;

    if (len === newLen) {
      return newLen;
    }

    PutPropertyOrThrow(array, 'length', newLen, 'Array.prototype.unshift');

    let oldIndex = len,
        newIndex = newLen;

    while (oldIndex-- > 0) {
      newIndex--;
      if (oldIndex in array) {
        PutPropertyOrThrow(array, newIndex, array[oldIndex], 'Array.prototype.unshift');
      } else {
        DeletePropertyOrThrow(array, newIndex, 'Array.prototype.unshift');
      }
    }

    while (newIndex-- > 0) {
      PutPropertyOrThrow(array, newIndex, values[newIndex], 'Array.prototype.unshift');
    }

    return newLen;
  }

  values(){
    return new ArrayIterator(this, 'value');
  }
}

builtinClass(Array);
const ArrayPrototype = Array.prototype;
$__define(ArrayPrototype, @@iterator, ArrayPrototype.values);

['push'].forEach(name => $__set(ArrayPrototype[name], 'length', 1));

export function isArray(array){
  return $__Type(array) === 'Object' ? $__GetBuiltinBrand(array) === 'Array' : false;
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

extend(Array, { isArray, from, of });
