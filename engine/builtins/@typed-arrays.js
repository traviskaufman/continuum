import {
  $$Exception,
  $$Get,
  $$Set
} from '@@internals';

import {
  ObjectCreate
} from '@@types';

import {
  builtinClass,
  define,
  hasBrand,
  internalFunction
} from '@@utilities';

import {
  ToInteger,
  ToObject,
  ToInt32,
  ToUint32
} from '@@operations';

import {
  $$DataViewGet,
  $$DataViewSet,
  $$NativeBufferCreate,
  $$NativeBufferSlice,
  $$NativeDataViewCreate,
  $$TypedArrayCreate
} from '@@typed-arrays';

function wrappingClamp(number, min, max){
  if (number < min) {
    number += max;
  }
  return number < min ? min : number > max ? max : number;
}

internalFunction(wrappingClamp);

function createArrayBuffer(nativeBuffer, byteLength){
  var buffer = ObjectCreate(ArrayBufferPrototype);
  define(buffer, 'byteLength', byteLength, 0);
  $$Set(buffer, 'NativeBuffer', nativeBuffer);
  $$Set(buffer, 'ConstructorName', 'ArrayBuffer');
  $$Set(buffer, 'BuiltinBrand', 'BuiltinArrayBuffer');
  return buffer;
}

internalFunction(createArrayBuffer);


function createTypedArray(Type, buffer, byteOffset, length){
  if (typeof buffer === 'number') {
    length = ToUint32(buffer);
    var byteLength = length * Type.BYTES_PER_ELEMENT;
    byteOffset = 0;
    buffer = new ArrayBuffer(byteLength);
    return $$TypedArrayCreate(Type.name, buffer, byteLength, byteOffset);

  } else {
    buffer = ToObject(buffer);

    if (hasBrand(buffer, 'BuiltinArrayBuffer')) {
      byteOffset = ToUint32(byteOffset);
      if (byteOffset % Type.BYTES_PER_ELEMENT) {
        throw $$Exception('buffer_unaligned_offset', [Type.name]);
      }

      var bufferLength = buffer.byteLength,
          byteLength = length === undefined ? bufferLength - byteOffset : ToUint32(length) * Type.BYTES_PER_ELEMENT;

      if (byteOffset + byteLength > bufferLength) {
        throw $$Exception('buffer_out_of_bounds', [Type.name]);
      }

      length = byteLength / Type.BYTES_PER_ELEMENT;

      if (ToInteger(length) !== length) {
        throw $$Exception('buffer_unaligned_length', [Type.name]);
      }

      return $$TypedArrayCreate(Type.name, buffer, byteLength, byteOffset);

    } else {
      length = ToUint32(buffer.length);
      var byteLength = length * Type.BYTES_PER_ELEMENT;
      byteOffset = 0;
      buffer = new ArrayBuffer(length);

      var typedArray = $$TypedArrayCreate(Type.name, buffer, byteLength, byteOffset);

      for (var i=0; i < length; i++) {
        typedArray[i] = buffer[i];
      }

      return typedArray;
    }
  }
}

internalFunction(createTypedArray);


function set(Type, instance, array, offset){
  if (!hasBrand(instance, 'Builtin'+Type.name)) {
    throw $$Exception('called_on_incompatible_object', [Type.name+'.prototype.set']);
  }

  offset = ToUint32(offset);
  array = ToObject(array);
  var srcLength = ToUint32(array.length),
      targetLength = instance.length;

  if (srcLength + offset > targetLength) {
    throw $$Exception('buffer_out_of_bounds', [Type.name+'.prototype.set']);
  }

  var temp = new Type(srcLength),
      k = 0;

  while (k < srcLength) {
    temp[k] = array[k];
  }

  k = offset;
  while (k < targetLength) {
    instance[k] = temp[k - offset];
  }
}

internalFunction(set);


function subarray(Type, instance, begin, end = instance.length){
  if (!hasBrand(instance, 'Builtin'+Type.name)) {
    throw $$Exception('called_on_incompatible_object', [Type.name+'.prototype.subarray']);
  }

  var srcLength = instance.length;

  begin = ToInt32(begin);
  end = end === undefined ? srcLength : ToInt32(end);

  begin = wrappingClamp(begin, 0, srcLength);
  end = wrappingClamp(end, 0, srcLength);

  if (end < begin) {
    [begin, end] = [end, begin];
  }

  return new Type(instance.buffer, instance.byteOffset + begin * Type.BYTES_PER_ELEMENT, end - begin);
}

internalFunction(subarray);


export class ArrayBuffer {
  constructor(byteLength){
    byteLength = ToUint32(byteLength);
    return createArrayBuffer($$NativeBufferCreate(byteLength), byteLength);
  }

  slice(begin = 0, end = this.byteLength){
    var sourceBuffer = ToObject(this),
        sourceNativeBuffer = $$Get(sourceBuffer, 'NativeBuffer');

    if (!sourceNativeBuffer) {
      throw $$Exception('called_on_incompatible_object', ['ArrayBuffer.prototype.slice']);
    }

    var byteLength = sourceBuffer.byteLength;
    begin = wrappingClamp(ToInt32(begin), 0, byteLength);
    end = wrappingClamp(ToInt32(end), 0, byteLength);

    return createArrayBuffer($$NativeBufferSlice(sourceNativeBuffer, begin, end), end - begin);
  }
}

builtinClass(ArrayBuffer);
const ArrayBufferPrototype = ArrayBuffer.prototype;

private @get, @set;

export class DataView {
  constructor(buffer, byteOffset = 0, byteLength = buffer.byteLength - byteOffset){
    buffer = ToObject(buffer);
    if (!hasBrand(buffer, 'BuiltinArrayBuffer')) {
      throw $$Exception('bad_argument', ['DataView', 'ArrayBuffer']);
    }

    byteOffset = ToUint32(byteOffset);
    byteLength = ToUint32(byteLength);

    if (byteOffset + byteLength > buffer.byteLength) {
      throw $$Exception('buffer_out_of_bounds', ['DataView']);
    }

    define(this, 'byteLength', byteLength, 1);
    define(this, 'byteOffset', byteOffset, 1);
    define(this, 'buffer', buffer, 1);
    $$Set(this, 'View', $$NativeDataViewCreate(buffer, byteOffset, byteLength));
    $$Set(this, 'BuiltinBrand', 'BuiltinDataView');
  }

  getUint8(byteOffset){
    return this.@get('Uint8', byteOffset);
  }

  getUint16(byteOffset, littleEndian){
    return this.@get('Uint16', byteOffset, littleEndian);
  }

  getUint32(byteOffset, littleEndian){
    return this.@get('Uint32', byteOffset, littleEndian);
  }

  getInt8(byteOffset){
    return this.@get('Int8', byteOffset);
  }

  getInt16(byteOffset, littleEndian){
    return this.@get('Int16', byteOffset, littleEndian);
  }

  getInt32(byteOffset, littleEndian){
    return this.@get('Int32', byteOffset, littleEndian);
  }

  getFloat32(byteOffset, littleEndian){
    return this.@get('Float32', byteOffset, littleEndian);
  }

  getFloat64(byteOffset, littleEndian){
    return this.@get('Float64', byteOffset, littleEndian);
  }

  setUint8(byteOffset, value){
    return this.@set('Uint8', byteOffset, value);
  }

  setUint16(byteOffset, value, littleEndian){
    return this.@set('Uint16', byteOffset, value, littleEndian);
  }

  setUint32(byteOffset, value, littleEndian){
    return this.@set('Uint32', byteOffset, value, littleEndian);
  }

  setInt8(byteOffset, value){
    return this.@set('Int8', byteOffset, value);
  }

  setInt16(byteOffset, value, littleEndian){
    return this.@set('Int16', byteOffset, value, littleEndian);
  }

  setInt32(byteOffset, value, littleEndian){
    return this.@set('Int32', byteOffset, value, littleEndian);
  }

  setFloat32(byteOffset, value, littleEndian){
    return this.@set('Float32', byteOffset, value, littleEndian);
  }

  setFloat64(byteOffset, value, littleEndian){
    return this.@set('Float64', byteOffset, value, littleEndian);
  }
}

builtinClass(DataView);
DataView.prototype.@get = $$DataViewGet
DataView.prototype.@set = $$DataViewSet



export class Float64Array {
  constructor(buffer, byteOffset, length) {
    return createTypedArray(Float64Array, buffer, byteOffset, length);
  }

  set(array, offset) {
    return set(Float64Array, this, array, offset);
  }

  subarray(begin, end) {
    return subarray(Float64Array, this, begin, end);
  }
}

builtinClass(Float64Array);
define(Float64Array, 'BYTES_PER_ELEMENT', 8, 0);


export class Float32Array {
  constructor(buffer, byteOffset, length) {
    return createTypedArray(Float32Array, buffer, byteOffset, length);
  }

  set(array, offset) {
    return set(Float32Array, this, array, offset);
  }

  subarray(begin, end) {
    return subarray(Float32Array, this, begin, end);
  }
}

builtinClass(Float32Array);
define(Float32Array, 'BYTES_PER_ELEMENT', 4, 0);


export class Int32Array {
  constructor(buffer, byteOffset, length) {
    return createTypedArray(Int32Array, buffer, byteOffset, length);
  }

  set(array, offset) {
    return set(Int32Array, this, array, offset);
  }

  subarray(begin, end) {
    return subarray(Int32Array, this, begin, end);
  }
}

builtinClass(Int32Array);
define(Int32Array, 'BYTES_PER_ELEMENT', 4, 0);


export class Int16Array {
  constructor(buffer, byteOffset, length) {
    return createTypedArray(Int16Array, buffer, byteOffset, length);
  }

  set(array, offset) {
    return set(Int16Array, this, array, offset);
  }

  subarray(begin, end) {
    return subarray(Int16Array, this, begin, end);
  }
}

builtinClass(Int16Array);
define(Int16Array, 'BYTES_PER_ELEMENT', 2, 0);


export class Int8Array {
  constructor(buffer, byteOffset, length) {
    return createTypedArray(Int8Array, buffer, byteOffset, length);
  }

  set(array, offset) {
    return set(Int8Array, this, array, offset);
  }

  subarray(begin, end) {
    return subarray(Int8Array, this, begin, end);
  }
}

builtinClass(Int8Array);
define(Int8Array, 'BYTES_PER_ELEMENT', 1, 0);


export class Uint32Array {
  constructor(buffer, byteOffset, length) {
    return createTypedArray(Uint32Array, buffer, byteOffset, length);
  }

  set(array, offset) {
    return set(Uint32Array, this, array, offset);
  }

  subarray(begin, end) {
    return subarray(Uint32Array, this, begin, end);
  }
}

builtinClass(Uint32Array);
define(Uint32Array, 'BYTES_PER_ELEMENT', 4, 0);


export class Uint16Array {
  constructor(buffer, byteOffset, length) {
    return createTypedArray(Uint16Array, buffer, byteOffset, length);
  }

  set(array, offset) {
    return set(Uint16Array, this, array, offset);
  }

  subarray(begin, end) {
    return subarray(Uint16Array, this, begin, end);
  }
}

builtinClass(Uint16Array);
define(Uint16Array, 'BYTES_PER_ELEMENT', 2, 0);


export class Uint8Array {
  constructor(buffer, byteOffset, length) {
    return createTypedArray(Uint8Array, buffer, byteOffset, length);
  }

  set(array, offset) {
    return set(Uint8Array, this, array, offset);
  }

  subarray(begin, end) {
    return subarray(Uint8Array, this, begin, end);
  }
}

builtinClass(Uint8Array);
define(Uint8Array, 'BYTES_PER_ELEMENT', 1, 0);
