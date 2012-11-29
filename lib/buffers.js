var buffers = (function(global, exports){
  if ('DataView' in global) {
    exports.DataView = global.DataView;
    exports.ArrayBuffer = global.ArrayBuffer;
    return exports;
  }

  var objects = require('./objects'),
      define = objects.define,
      create = objects.create,
      hide = objects.hide;

  var log = Math.log,
      pow = Math.pow,
      LN2 = Math.LN2,
      _slice = [].slice,
      chr = String.fromCharCode;

  var endian = {
    little: { 1: [0],
              2: [1, 0],
              4: [3, 2, 1, 0],
              8: [7, 6, 5, 4, 3, 2, 1, 0] },
    big:    { 1: [0],
              2: [0, 1],
              4: [0, 1, 2, 3],
              8: [0, 1, 2, 3, 4, 5, 6, 7] }
  };


  var chars = create(null),
      indices = [];

  void function(i){
    for (i = 0; i < 0x100; ++i) {
      chars[indices[i] = chr(i)] = i;
      if (i >= 0x80) {
        chars[chr(0xf700 + i)] = i;
      }
    }
  }();


  function DataView(buffer, byteOffset, byteLength){
    if (!(buffer instanceof ArrayBuffer)) {
      throw new TypeError('DataView must be initialized with an ArrayBuffer');
    }

    this.byteOffset = byteOffset === undefined ? buffer.byteOffset | 0 : byteOffset >>> 0;
    this.byteLength = byteLength === undefined ? (buffer.byteLength - this.byteOffset) | 0 : byteLength >>> 0;
    this.buffer = buffer;
  }

  exports.DataView = DataView;


  define(DataView.prototype, [
    function getUint8(byteOffset){
      var b = this.buffer._data,
          off = byteOffset + this.byteOffset;
      return b[off];
    },
    function getUint16(byteOffset, littleEndian){
      var b = this.buffer._data,
          o = (littleEndian ? endian.little : endian.big)[2],
          off = byteOffset + this.byteOffset;
      return (b[off + o[1]] << 8) | b[off + o[0]];
    },
    function getUint32(byteOffset, littleEndian){
      var b = this.buffer._data,
          o = (littleEndian ? endian.little : endian.big)[4],
          off = byteOffset + this.byteOffset;
      return (((((b[off + o[3]] << 8) | b[off + o[2]]) << 8) | b[off + o[1]]) << 8) | b[off + o[0]];
    },
    function getInt8(byteOffset){
      var b = this.getUint8(byteOffset);
      return b & 0x80 ? b - 0x100 : b;
    },
    function getInt16(byteOffset, littleEndian){
      var b = this.getUint16(byteOffset, littleEndian);
      return b & 0x8000 ? b - 0x10000 : b;
    },
    function getInt32(byteOffset, littleEndian){
      var b = this.getUint32(byteOffset, littleEndian);
      return b & 0x80000000 ? b - 0x100000000 : b;
    },
    function getFloat32(byteOffset, littleEndian){
      return readFloat(this.buffer._data, this.byteOffset + byteOffset, littleEndian, 23, 4);
    },
    function getFloat64(byteOffset, littleEndian){
      return readFloat(this.buffer._data, this.byteOffset + byteOffset, littleEndian, 52, 8);
    },

    function setUint8(byteOffset, value){
      var b = this.buffer._data,
          off = byteOffset + this.byteOffset;

      boundsCheck(off, 1, b.length);

      b[off] = value & 0xff;
    },
    function setUint16(byteOffset, value, littleEndian){
      var b = this.buffer._data,
          o = (littleEndian ? endian.little : endian.big)[2],
          off = byteOffset + this.byteOffset;

      boundsCheck(off, 2, b.length);

      b[off + o[0]] =  value & 0x00ff;
      b[off + o[1]] = (value & 0xff00) >>> 8;
    },
    function setUint32(byteOffset, value, littleEndian){
      var b = this.buffer._data,
          o = (littleEndian ? endian.little : endian.big)[4],
          off = byteOffset + this.byteOffset;

      boundsCheck(off, 4, b.length);

      b[off + o[0]] =  value & 0x000000ff;
      b[off + o[1]] = (value & 0x0000ff00) >>> 8;
      b[off + o[2]] = (value & 0x00ff0000) >>> 16;
      b[off + o[3]] = (value & 0xff000000) >>> 24;
    },
    function setInt8(byteOffset, value){
      if (value < 0) value |= 0x100;
      this.setUint8(byteOffset, value);
    },
    function setInt16(byteOffset, value, littleEndian){
      if (value < 0) value |= 0x10000;
      this.setUint16(byteOffset, value, littleEndian);
    },
    function setInt32(byteOffset, value, littleEndian){
      if (value < 0) value |= 0x100000000;
      this.setUint32(byteOffset, value, littleEndian);
    },
    function setFloat32(byteOffset, value, littleEndian){
      writeFloat(this.buffer._data, this.byteOffset + byteOffset, value, littleEndian, 23, 4);
    },
    function setFloat64(byteOffset, value, littleEndian){
      writeFloat(this.buffer._data, this.byteOffset + byteOffset, value, littleEndian, 52, 8);
    }
  ]);

  function boundsCheck(offset, size, max){
    if (offset < 0) {
      throw new RangeError('Tried to write to a negative index');
    } else if (offset + size > max) {
      throw new RangeError('Tried to write '+size+' bytes past the end of a buffer at index '+offset+' of '+max);
    }
  }

  var ArrayBuffer = exports.ArrayBuffer = (function(){
    function readString(string){
      var array = [],
          cycles = string.length % 8,
          i = 0;

      while (cycles--) {
        array[i] = chars[string[i++]];
      }

      cycles = string.length >> 3;

      while (cycles--) {
        array.push(chars[string[i++]],  // 1
                   chars[string[i++]],  // 2
                   chars[string[i++]],  // 3
                   chars[string[i++]],  // 4
                   chars[string[i++]],  // 5
                   chars[string[i++]],  // 6
                   chars[string[i++]],  // 7
                   chars[string[i++]]); // 8
      }

      return array;
    }

    function writeString(array){
      try {
        return chr.apply(null, array);
      } catch (err) {}

      var string = '',
          cycles = array.length % 8,
          i = 0;

      while (cycles--) {
        string += indices[array[i++]];
      }

      cycles = array.length >> 3;

      while (cycles--) {
        string += indices[array[i++]]  // 1
                + indices[array[i++]]  // 2
                + indices[array[i++]]  // 3
                + indices[array[i++]]  // 4
                + indices[array[i++]]  // 5
                + indices[array[i++]]  // 6
                + indices[array[i++]]  // 7
                + indices[array[i++]]; // 8
      }

      return string;
    }

    function zerodArray(size){
      var data = new Array(size);
      while (size--) {
        data[size] = 0;
      }
      return data;
    }


    function ArrayBuffer(len){
      if (len == null) {
        this._data = [];
      } else {
        var type = typeof len;
        if (type === 'number') {
          this._data = zerodArray(len);
        } else if (type === 'string') {
          this._data = readString(len);
        } else if (type === 'object') {
          if (len instanceof ArrayBuffer) {
            this._data = len._data.slice();
          } else if (len.length) {
            this._data = _slice.call(len);
          } else if ((len /= 1) > 0) {
            this._data = zerodArray(len);
          }
        }
      }

      if (!this._data) {
        throw new TypeError('unable to convert input to size or buffer');
      }

      hide(this, '_data');
      this.byteLength = this._data.length;
    }

    define(ArrayBuffer.prototype, [
      function slice(begin, end){
        if (begin == null) {
          begin = 0;
        } else if (begin < 0) {
          begin += this.byteLength;
          if (begin < 0) begin = 0;
        } else if (begin >= this.byteLength) {
          begin = this.byteLength;
        }

        if (end == null) {
          end = this.byteLength;
        } else if (end < 0) {
          end += this.byteLength;
          if (end < 0) end = 0;
        } else if (end >= this.byteLength) {
          end = this.byteLength;
        }


        var ab = new ArrayBuffer(0);
        ab._data = this._data.slice(begin, end);
        ab.byteLength = ab._data.length;
        return ab;
      }
    ]);

    return ArrayBuffer;
  })();


  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  function readFloat(buffer, offset, littleEndian, mLen, bytes){
    var e, m,
        eLen = bytes * 8 - mLen - 1,
        eMax = (1 << eLen) - 1,
        eBias = eMax >> 1,
        nBits = -7,
        i = littleEndian ? bytes - 1 : 0 ,
        d = littleEndian ? -1 : 1,
        s = buffer[offset + i];

    i += d;

    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = e * 0x100 + buffer[offset + i], i += d, nBits -= 8);

    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 0x100 + buffer[offset + i], i += d, nBits -= 8);

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : s ? -Infinity : Infinity;
    } else {
      m = m + pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * pow(2, e - mLen);
  }

  function writeFloat(buffer, offset, value, littleEndian, mLen, bytes){
    var e, m, c,
        eLen = bytes * 8 - mLen - 1,
        eMax = (1 << eLen) - 1,
        eBias = eMax >> 1,
        rt = (mLen === 23 ? pow(2, -24) - pow(2, -77) : 0),
        i = littleEndian ? 0 : bytes - 1,
        d = littleEndian ? 1 : -1,
        s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

    value < 0 && (value = -value);

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = (log(value) / LN2) | 0;
      if (value * (c = pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * pow(2, eBias - 1) * pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 0x100, mLen -= 8);

    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 0x100, eLen -= 8);

    buffer[offset + i - d] |= s * 0x80;
  }

  return exports;
})(this, typeof module !== 'undefined' ? exports : {});
