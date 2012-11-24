
var indexDesc = { configurable: false,
                  enumerable: true,
                  writable: true,
                  value: void 1337 };


export class ArrayBuffer {
  constructor(len){
    if (!$__IsConstructCall()) {
      return new ArrayBuffer(len);
    }
    $__define(this, 'byteLength', len >>> 0, 1);
    $__SetInternal(this, 'NativeBuffer', $__NativeBufferCreate(len));
    $__SetBuiltinBrand(this, 'BuiltinArrayBuffer');
  }
}




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


function set(Type, instance, array, offset){
  if ($__GetBuiltinBrand(instance) !== Type.name) {
    throw $__Exception('called_on_incompatible_object', [Type.name+'.prototype.set']);
  }

  offset >>>= 0;
  array = $__ToObject(array);
  var srcLength = array.length,
      targetLength = instance.length;

  if (srcLength + offset > targetLength) {
    throw $__Exception('typed_array_out_of_bounds', [Type.name+'.prototype.set']);
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

function subarray(Type, instance, begin, end){
  if ($__GetBuiltinBrand(instance) !== Type.name) {
    throw $__Exception('called_on_incompatible_object', [Type.name+'.prototype.subarray']);
  }

  var srcLength = instance.length;

  begin >>= 0;
  if (begin < 0) begin += srcLength;
  end = end === undefined ? srcLength : end >> 0;
  if (end < 0) end += srcLength;

  if (begin < 0) begin = 0;
  if (end < 0) end = 0;
  if (begin >= srcLength) begin = srcLength;
  if (end >= srcLength) end = srcLength;
  if (end < begin) [begin, end] = [end, begin];


  return new Type(instance.buffer, instance.byteOffset + begin * Type.BYTES_PER_ELEMENT, end - begin);
}

function createTypedArray(Type, buffer, byteOffset, length){
  var byteLength;
  if (typeof buffer === 'number') {

    length = buffer >>> 0;
    byteLength = length * Type.BYTES_PER_ELEMENT;
    byteOffset = 0;
    buffer = new ArrayBuffer(byteLength);

    return $__TypedArrayCreate(Type.name, buffer, byteLength, byteOffset)
  } else {
    buffer = $__ToObject(buffer);

    if ($__GetBuiltinBrand(buffer) === 'ArrayBuffer') {

      byteOffset >>>= 0;
      if (byteOffset % Type.BYTES_PER_ELEMENT) {
        throw $__Exception('typed_array_unaligned_offset', Type.name);
      }

      var bufferLength = buffer.byteLength,
          byteLength = length === undefined ? bufferLength - byteOffset : (length >>> 0) * Type.BYTES_PER_ELEMENT;

      if (byteOffset + byteLength > bufferLength) {
        throw $__Exception('typed_array_out_of_bounds', Type.name);
      }

      length = byteLength / Type.BYTES_PER_ELEMENT;

      if ((length >>> 0) !== length) {
        throw $__Exception('typed_array_unaligned_length', Type.name);
      }

      return $__TypedArrayCreate(Type.name, buffer, byteLength, byteOffset)
    } else {

      length = buffer.length >>> 0;
      byteLength = length * Type.BYTES_PER_ELEMENT;
      byteOffset = 0;
      buffer = new ArrayBuffer(length);

      var object = $__TypedArrayCreate(Type.name, buffer, byteLength, byteOffset);

      for (var i=0; i < length; i++) {
        object[i] = buffer[i];
      }

      return object;
    }
  }
}


{
  function setupArrayBuffer(Ctor, bytes){
    if (bytes) {
      $__defineConstants(Ctor, { BYTES_PER_ELEMENT: bytes });
    }
    $__setupConstructor(Ctor, Ctor.prototype);
    $__SetBuiltinBrand(Ctor.prototype, 'Builtin'+Ctor.name);
  }

  setupArrayBuffer(ArrayBuffer);
  setupArrayBuffer(Int8Array, 1);
  setupArrayBuffer(Uint8Array, 1);
  setupArrayBuffer(Int16Array, 2);
  setupArrayBuffer(Uint16Array, 2);
  setupArrayBuffer(Int32Array, 4);
  setupArrayBuffer(Uint32Array, 4);
  setupArrayBuffer(Float32Array, 4);
  setupArrayBuffer(Float64Array, 8);
}

$__ArrayBufferProto = ArrayBuffer.prototype;
$__Float32ArrayProto = Float32Array.prototype;
$__Float64ArrayProto = Float64Array.prototype;
$__Float64ArrayProto = Float64Array.prototype;
$__Int16ArrayProto = Int16Array.prototype;
$__Int32ArrayProto = Int32Array.prototype;
$__Int8ArrayProto = Int8Array.prototype;
$__Uint16ArrayProto = Uint16Array.prototype;
$__Uint32ArrayProto = Uint32Array.prototype;
$__Uint8ArrayProto = Uint8Array.prototype;
