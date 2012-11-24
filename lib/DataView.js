var DataView = (function(global, exports){
  if ('DataView' in global) {
    return global.DataView;
  }

  var objects = require('./objects'),
      define = objects.define;


  var log = Math.log,
      pow = Math.pow,
      LN2 = Math.LN2,
      create = Object.create,
      char = String.fromCharCode;

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
      chars[indices[i] = char(i)] = i;
      if (i >= 0x80) {
        chars[char(0xf700 + i)] = i;
      }
    }
  }();


  function DataView(buffer, byteOffset, byteLength){
    this.buffer = new ArrayBuffer(buffer);
    this.byteOffset = byteOffset === undefined ? 0 : byteOffset;
    this.byteLength = byteLength === undefined ? buffer.length - this.byteOffset : byteLength;

    if (typeof this.byteOffset !== 'number') {
      throw new TypeError('byteOffset is not a number');
    }
    if (typeof this.byteLength !== 'number') {
      throw new TypeError('byteLength is not a number');
    }
    if (this.byteOffset < 0) {
      throw new RangeError('byteOffset is negative');
    }
    if (this.byteLength < 0) {
      throw new RangeError('byteLength is negative');
    }
  }


  define(DataView.prototype, [
    function getFloat64(byteOffset, littleEndian) {
      return readFloat(this.buffer.data, this.byteOffset + byteOffset, littleEndian, true);
    },
    function getFloat32(byteOffset, littleEndian) {
      return readFloat(this.buffer.data, this.byteOffset + byteOffset, littleEndian, false);
    },
    function getInt32(byteOffset, littleEndian) {
      var b = this.getUint32(byteOffset, littleEndian);
      return b > 0x7fffffff ? b - 0x100000000 : b;
    },
    function getInt16(byteOffset, littleEndian) {
      var b = this.getUint16(byteOffset, littleEndian);
      return b > 0x7fff ? b - 0x10000 : b;
    },
    function getInt8(byteOffset) {
      var b = this.getUint8(byteOffset);
      return b > 0xfe ? b - 0x100 : b;
    },
    function getUint32(byteOffset, littleEndian) {
      var b = readBytes(this, littleEndian, byteOffset, 4);
      return (b[3] * 0x1000000) + (b[2] << 16) + (b[1] << 8) + b[0];
    },
    function getUint16(byteOffset, littleEndian) {
      var b = readBytes(this, littleEndian, byteOffset, 2);
      return (b[1] << 8) + b[0];
    },
    function getUint8(byteOffset) {
      return this.buffer.charCodeAt(byteOffset) & 0xff;
    },
    function setUint8(byteOffset, value){
      writeBytes(this, byteOffset, false, 1, value & 0xff);
    },
    function setInt8(byteOffset, value){
      writeBytes(this, byteOffset, false, 1, value >= 0 ? value & 0xff : 0xff + value + 1);
    },
    function setUint16(byteOffset, value, littleEndian){
      writeBytes(this, byteOffset, littleEndian, 2, (value & 0xff00) >>> 8,
                                                     value & 0x00ff);
    },
    function setInt16(byteOffset, value, littleEndian){
      if (value < 0) value = 0xffff + value + 1;
      writeBytes(this, byteOffset, littleEndian, 2, (value & 0xff00) >>> 8,
                                                     value & 0x00ff);
    },
    function setUint32(byteOffset, value, littleEndian){
      writeBytes(this, byteOffset, littleEndian, 4, (value >>> 24) & 0xff,
                                                    (value >>> 16) & 0xff,
                                                    (value >>> 8)  & 0xff,
                                                     value         & 0xff);
    },
    function setInt32(byteOffset, value, littleEndian){
      if (value < 0) value = 0xffffffff + value + 1
      writeBytes(this, byteOffset, littleEndian, 4, (value >>> 24) & 0xff,
                                                    (value >>> 16) & 0xff,
                                                    (value >>> 8)  & 0xff,
                                                     value         & 0xff);
    },
    function setFloat64(byteOffset, value, littleEndian){
      writeFloat(this.buffer.data, this.byteOffset + byteOffset, value, littleEndian, true);
    },
    function setFloat32(byteOffset, value, littleEndian){
      writeFloat(this.buffer.data, this.byteOffset + byteOffset, value, littleEndian, false);
    },
  ]);


  function readBytes(view, littleEndian, offset, bytes){
    var b = view.buffer.data,
        o = littleEndian === true ? endian.little[bytes] : endian.big[bytes];
        out = new Array(bytes);

    offset += view.byteOffset;

    if (bytes === 8) {
      out[7] = b[offset + o[7]] & 0xff;
      out[6] = b[offset + o[6]] & 0xff;
      out[5] = b[offset + o[5]] & 0xff;
      out[4] = b[offset + o[4]] & 0xff;
    }
    if (bytes === 4) {
      out[3] = b[offset + o[3]] & 0xff;
      out[2] = b[offset + o[2]] & 0xff;
    }
    if (bytes === 2) {
      out[1] = b[offset + o[1]] & 0xff;
    }

    out[0] = b[offset + o[0]] & 0xff;
    return out;
  }

  function writeBytes(view, byteOffset, littleEndian, bytes, b0, b1, b2, b3, b4, b5, b6, b7) {
    var b = view.buffer.data,
        o = littleEndian === true ? endian.little[bytes] : endian.big[bytes];

    if (byteOffset < 0) {
      throw new RangeError('Tried to write to a negative index');
    }
    byteOffset += view.byteOffset;
    if (byteOffset + bytes > b.length) {
      byteOffset += bytes;
      throw new RangeError('Tried to write past the end of a buffer at index '+byteOffset+' of '+b.length);
    }

    view.buffer.string = null;

    if (bytes === 8) {
      b[byteOffset + o[7]] = b7;
      b[byteOffset + o[6]] = b6;
      b[byteOffset + o[5]] = b5;
      b[byteOffset + o[4]] = b4;
    }
    if (bytes === 4) {
      b[byteOffset + o[3]] = b3;
      b[byteOffset + o[2]] = b2;
    }
    if (bytes === 2) {
      b[byteOffset + o[1]] = b1;
    }

    b[byteOffset + o[0]] = b0;
  }


  var ArrayBuffer = (function(){
    var _slice = [].slice;

    function readString(string){
      var array = [],
          cycles = string.length % 8,
          i = 0;

      while (cycles--) {
        array[i] = chars[string[i++]];
      }

      cycles = string.length >> 3;

      while (cycles--) {
        array.push(chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]],
                   chars[string[i++]]);
      }

      return array;
    }

    function writeString(array){
      try {
        return char.apply(null, array);
      } catch (err) {}

      var string = '',
          cycles = array.length % 8,
          i = 0;

      while (cycles--) {
        string += indices[array[i++]];
      }

      cycles = array.length >> 3;

      while (cycles--) {
        string += indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]]
                + indices[array[i++]];
      }

      return string;
    }


    function ArrayBuffer(len){
      this.byteLength = this.length = len >>> 0;
      var data = this.data = new Array(this.length);

      var cycles = this.length % 8,
          i = 0;

      while (cycles--) {
        data[i] = 0;
      }

      cycles = this.length >> 3;

      while (cycles--) {
        data.push(0, 0, 0, 0, 0, 0, 0, 0);
      }
    }

    define(ArrayBuffer.prototype, [
    ]);

    return ArrayBuffer;
  })();



  // float read/write from Node.js

  function readFloat(buffer, offset, littleEndian, isDouble) {
    if (isDouble) {
      var mLen = 52,
          bytes = 8;
    } else {
      var mLen = 23,
          bytes = 4;
    }
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
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity);
    } else {
      m = m + pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * pow(2, e - mLen);
  }

  function writeFloat(buffer, offset, value, littleEndian, isDouble) {
    if (isDouble) {
      var mLen = 52,
          bytes = 8;
    } else {
      var mLen = 23,
          bytes = 4;
    }
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

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

    buffer[offset + i - d] |= s * 128;
  }

  return module.exports = DataView;
})(this, typeof module !== 'undefined' ? module : {});
