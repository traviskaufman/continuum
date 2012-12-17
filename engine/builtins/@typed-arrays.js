

function wrappingClamp(number, min, max){
  if (number < min) {
    number += max;
  }
  return number < min ? min : number > max ? max : number;
}

internalFunction(wrappingClamp);


function createArrayBuffer(nativeBuffer, byteLength){
  var buffer = $__ObjectCreate(ArrayBufferPrototype);
  buffer.@@define('byteLength', byteLength, 0);
  buffer.@@setInternal('NativeBuffer', nativeBuffer);
  buffer.@@setInternal('ConstructorName', 'ArrayBuffer');
  buffer.@@SetBuiltinBrand('BuiltinArrayBuffer');
  return buffer;
}

internalFunction(createArrayBuffer);


function createTypedArray(Type, buffer, byteOffset, length){
  if (typeof buffer === 'number') {
    length = $__ToUint32(buffer);
    var byteLength = length * Type.BYTES_PER_ELEMENT;
    byteOffset = 0;
    buffer = new ArrayBuffer(byteLength);
    return $__TypedArrayCreate(Type.name, buffer, byteLength, byteOffset);

  } else {
    buffer = $__ToObject(buffer);

    if (buffer.@@GetBuiltinBrand() === 'ArrayBuffer') {
      byteOffset = $__ToUint32(byteOffset);
      if (byteOffset % Type.BYTES_PER_ELEMENT) {
        throw $__Exception('buffer_unaligned_offset', [Type.name]);
      }

      var bufferLength = buffer.byteLength,
          byteLength = length === undefined ? bufferLength - byteOffset : $__ToUint32(length) * Type.BYTES_PER_ELEMENT;

      if (byteOffset + byteLength > bufferLength) {
        throw $__Exception('buffer_out_of_bounds', [Type.name]);
      }

      length = byteLength / Type.BYTES_PER_ELEMENT;

      if ($__ToInteger(length) !== length) {
        throw $__Exception('buffer_unaligned_length', [Type.name]);
      }

      return $__TypedArrayCreate(Type.name, buffer, byteLength, byteOffset);

    } else {
      length = $__ToUint32(buffer.length);
      var byteLength = length * Type.BYTES_PER_ELEMENT;
      byteOffset = 0;
      buffer = new ArrayBuffer(length);

      var typedArray = $__TypedArrayCreate(Type.name, buffer, byteLength, byteOffset);

      for (var i=0; i < length; i++) {
        typedArray[i] = buffer[i];
      }

      return typedArray;
    }
  }
}

internalFunction(createTypedArray);


function set(Type, instance, array, offset){
  if (instance.@@GetBuiltinBrand() !== Type.name) {
    throw $__Exception('called_on_incompatible_object', [Type.name+'.prototype.set']);
  }

  offset = $__ToUint32(offset);
  array = $__ToObject(array);
  var srcLength = $__ToUint32(array.length),
      targetLength = instance.length;

  if (srcLength + offset > targetLength) {
    throw $__Exception('buffer_out_of_bounds', [Type.name+'.prototype.set']);
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


function subarray(Type, instance, begin, end){
  if (instance.@@GetBuiltinBrand() !== Type.name) {
    throw $__Exception('called_on_incompatible_object', [Type.name+'.prototype.subarray']);
  }

  var srcLength = instance.length;

  begin = $__ToInt32(begin);
  end = end === undefined ? srcLength : $__ToInt32(end);

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
    byteLength = $__ToUint32(byteLength);
    return createArrayBuffer($__NativeBufferCreate(byteLength), byteLength);
  }

  slice(begin = 0, end = this.byteLength){
    var sourceBuffer = $__ToObject(this),
        sourceNativeBuffer = sourceBuffer.@@getInternal('NativeBuffer');

    if (!sourceNativeBuffer) {
      throw $__Exception('called_on_incompatible_object', ['ArrayBuffer.prototype.slice']);
    }

    var byteLength = sourceBuffer.byteLength;
    begin = wrappingClamp($__ToInt32(begin), 0, byteLength);
    end = wrappingClamp($__ToInt32(end), 0, byteLength);

    return createArrayBuffer($__NativeBufferSlice(sourceNativeBuffer, begin, end), end - begin);
  }
}

builtinClass(ArrayBuffer);
const ArrayBufferPrototype = ArrayBuffer.prototype;

private @get, @set;

export class DataView {
  constructor(buffer, byteOffset = 0, byteLength = buffer.byteLength - byteOffset){
    buffer = $__ToObject(buffer);
    if (buffer.@@GetBuiltinBrand() !== 'ArrayBuffer') {
      throw $__Exception('bad_argument', ['DataView', 'ArrayBuffer']);
    }

    byteOffset = $__ToUint32(byteOffset);
    byteLength = $__ToUint32(byteLength);

    if (byteOffset + byteLength > buffer.byteLength) {
      throw $__Exception('buffer_out_of_bounds', ['DataView']);
    }

    this.@@define('byteLength', byteLength, 1);
    this.@@define('byteOffset', byteOffset, 1);
    this.@@define('buffer', buffer, 1);
    this.@@setInternal('View', $__NativeDataViewCreate(buffer, byteOffset, byteLength));
    this.@@SetBuiltinBrand('BuiltinDataView');
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
DataView.prototype.@get = $__DataViewGet
DataView.prototype.@set = $__DataViewSet



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
Float64Array.@@define('BYTES_PER_ELEMENT', 8, 0);


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
Float32Array.@@define('BYTES_PER_ELEMENT', 4, 0);


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
Int32Array.@@define('BYTES_PER_ELEMENT', 4, 0);


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
Int16Array.@@define('BYTES_PER_ELEMENT', 2, 0);


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
Int8Array.@@define('BYTES_PER_ELEMENT', 1, 0);


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
Uint32Array.@@define('BYTES_PER_ELEMENT', 4, 0);


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
Uint16Array.@@define('BYTES_PER_ELEMENT', 2, 0);


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
Uint8Array.@@define('BYTES_PER_ELEMENT', 1, 0);
