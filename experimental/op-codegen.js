/*
function indent(parts, ...values){
  var combined = '';
  for (var [index, part] of parts) {
    combined += part;
    if (index in value) {
      combined += values[index];
    }
  }
  combined.split('\n');
}

function opcode(name, body){
  return `
function ${name}(){
  ${body}
  return cmds[++ip];
}`;
}

function binary(name, op){
  return opcode(name, `
  ${completion('lhs', 'sp - 2')}
  ${completion('rhs', 'sp - 1')}
  stack[--sp] = lhs ${op} rhs;`);
}

function unary(name, op){
  return opcode(name, `
  ${completion('arg', 'sp - 1')}
  stack[sp - 1] = ${op}arg;`);
}

function type(name, type){
  return opcode(name, `
  ${completion('arg', 'sp - 1')}
  stack[sp - 1] = typeof arg === '${type}';`);
}

function method(name, method){
  return opcode(name, `
  ${completion('lhs', 'sp - 2')}
  ${completion('rhs', 'sp - 1')}
  stack[--sp] = rhs.${method}(lhs);`);
}


function completion(name, sp){
  return `var ${name} = stack[${sp}];
  if (${name} && ${name}.Completion) {
    if (${name}.Abrupt) {
      error = ${name};
      return unwind;
    } else {
      stack[${sp}] = ${name} = ${name}.value;
    }
  }`;
}


 `
${method('INSTANCE_OF', 'HasInstance')}
${method('IN', 'HasProperty')}
${unary('VOID', 'void ')}
${unary('TO_NUMBER', '+')}
${unary('NEGATE',    '-')}
${unary('BIT_NOT', '~')}
${unary('NOT', '!')}
${type('IS_BOOLEAN', 'boolean')}
${type('IS_NUMBER', 'number')}
${type('IS_STRING', 'string')}
${type('IS_UNDEFINED', 'undefined')}
${binary('EQ', '==')}
${binary('NEQ', '!=')}
${binary('STRICT_EQ',  '===')}
${binary('STRICT_NEQ', '!==')}
${binary('LT', '<')}
${binary('GT', '>')}
${binary('LTE', '<=')}
${binary('GTE', '>=')}
${binary('MUL', '*')}
${binary('DIV', '/')}
${binary('MOD', '%')}
${binary('ADD', '+')}
${binary('CONCAT', '+ '' +')}
${binary('SUB', '-')}
${binary('SHL', '<<')}
${binary('SHR', '>>')}
${binary('SAR', '>>>')}
${binary('BIT_OR', '|')}
${binary('BIT_AND', '&')}
${binary('BIT_XOR', '^')}
`;

*/

var utility = require('../lib/objects').assignAll({}, [
  require('../lib/functions'),
  require('../lib/iteration'),
  require('../lib/objects'),
  require('../lib/traversal'),
  require('../lib/utility')
]);

var define = utility.define,
    inherit = utility.inherit,
    create = utility.create,
    iterate = utility.iterate,
    getProperties = utility.getProperties,
    StopIteration = utility.StopIteration,
    map = utility.map,
    each = utility.each;



function Reference(base, name){
  this.base = base;
  this.name = name;
}

define(Reference.prototype, [
  function isResolved(){
    return this.name in this.base;
  },
  function get(){
    return this.base[this.name];
  },
  function set(value){
    this.base[this.name] = value;
  },
  function valueOf(){
    return this.base[this.name];
  },
  function toString(){
    return ''+this.base[this.name];
  }
]);

function Type(){}


var types = create(null),
    definitions = create(null);


function getType(name){
  if (name in types) {
    return types[name];
  } else if (name in definitions) {
    var def = definitions[name];
    if (def.kind in kinds) {
      return types[name] = kinds[def.kind](def);
    } else {
      throw new TypeError('Unknown kind "'+def.kind+'"');
    }
  } else {
    throw new TypeError('Unknown type "'+name+'"');
  }
}

function register(types){
  each(types, function(def){
    definitions[def.id] = def;
  });
}

function NumericType(name, bytes){
  var getter = 'get'+name,
      setter = 'set'+name;

  var NumericT = function(data, offset, value){
    this.data = data;
    if (value !== undefined) {
      this.offset = offset;
      this.set(value);
    } else {
      this.offset = data.position || 0;
    }
    data.position = this.offset + bytes;
  };

  define(NumericT, [
    function get(data, offset){
      return data[getter](offset, true);
    },
    function set(data, offset, value){
      return data[setter](offset, value, true);
    },
    function sizeof(value){
      return bytes;
    }
  ]);

  NumericT.prototype = this;

  define(this, {
    constructor: NumericT,
    bytes: bytes
  });
  define(this, [
    function get(){
      return this.data[getter](this.offset, true);
    },
    function set(value){
      return this.data[setter](this.offset, value, true);
    }
  ]);

  return types[name] = NumericT;
}

inherit(NumericType, Type);


function StructType(name, fields){
  var StructT = function(data, offset, value){
    define(this, 'data', data);
    this.offset = offset == null ? data.position || 0 : offset;
    data.position = this.offset + this.bytes;
    if (value !== undefined) {
      this.set(value);
    }
  };

  define(StructT, [
    function get(data, offset){
      return new StructT(data, offset).get();
    },
    function set(data, offset, value){
      new StructT(data, offset, value);
    },
    function sizeof(value){
      return currentOffset;
    }
  ]);

  StructT.prototype = this;

  var currentOffset = 0,
      names = [],
      getters = [],
      setters = [];

  each(fields, function(field){
    var cased = field.name[0].toUpperCase() + field.name.slice(1),
        Type = getType(field.type),
        offset = currentOffset;

    currentOffset += Type.prototype.bytes;
    names.push(field.name);
    getters.push('get'+cased);
    setters.push('set'+cased);

    StructT.prototype['get'+cased] = function(){
      return Type.get(this.data, this.offset + offset);
    };

    StructT.prototype['set'+cased] = function(value){
      return Type.set(this.data, this.offset + offset, value);
    };
  });

  define(this, {
    constructor: StructT,
    bytes: currentOffset
  });

  define(this, [
    function get(){
      var out = {};
      for (var i=0; i < names.length; i++) {
        out[names[i]] = this[getters[i]]();
      }
      return out;
    },
    function set(value){
      for (var i=0; i < names.length; i++) {
        if (names[i] in value) {
          this[setters[i]](value[names[i]]);
        }
      }
    }
  ]);

  return types[name] = StructT;
}


var ArrayType = (function(){
  function ArrayType(name, ElementType){
    ElementType = getType(ElementType);
    var LengthType = getType('uint32'),
        elementBytes = ElementType.prototype.bytes,
        lengthBytes = LengthType.prototype.bytes;

    var ArrayT = function(data, offset, value){
      define(this, 'data', data);
      this.offset = offset == null ? data.position || 0 : offset;
      if (value !== undefined) {
        data.position = this.offset + ArrayT.sizeof(value);
        this.set(value);
      }
    };

    define(ArrayT, [
      function get(data, offset){
        return new ArrayT(data, offset).get();
      },
      function set(data, offset, value){
        new ArrayT(data, offset, value);
      },
      function sizeof(value){
        return value.length * elementBytes + lengthBytes;
      }
    ]);

    define(ArrayT, 'ElementType', ElementType);

    ArrayT.prototype = this;

    define(this, {
      constructor: ArrayT
    });

    define(this, [
      function getSize(){
        return this.getLength() * elementBytes + lengthBytes;
      },
      function setLength(len){
        return LengthType.set(this.data, this.offset, len);
      },
      function getLength(){
        return LengthType.get(this.data, this.offset);
      },
      function getIndex(index){
        return ElementType.get(this.data, this.offset + lengthBytes + index * elementBytes);
      },
      function setIndex(index, value){
        return ElementType.set(this.data, this.offset + lengthBytes + index * elementBytes, value);
      },
      function getItem(index){
        return new ElementType(this.data, this.offset + lengthBytes + index * elementBytes);
      }
    ]);


    return ArrayT;
  }

  define(ArrayType.prototype, [
    function get(){
      var len = this.getLength(),
          out = new Array(len);

      for (var i=0; i < len; i++) {
        out[i] = this.getIndex(i);
      }
      return out;
    },
    function set(value){
      this.setLength(value.length);
      for (var i=0; i < value.length; i++) {
        if (i in value) {
          this.setIndex(i, value[i]);
        }
      }
    },
    function forEach(callback, context){
      var len = this.getLength();
      context = context || this;
      for (var i=0; i < len; i++) {
        callback.call(context, this.setIndex(i), i, this);
      }
    },
    function __iterator__(type){
      return new ArrayTypeIterator(this, type || 'item');
    }
  ]);

  function ArrayTypeIterator(array, kind){
    define(this, {
      length: array.getLength(),
      index: 0,
      array: array,
      kind: kind
    });
  }

  define(ArrayTypeIterator.prototype, [
    function next(){
      if (this.index >= this.length) {
        throw StopIteration;
      }
      if (this.kind === 'value') {
        return this.array.getIndex(this.index++);
      } else if (this.kind === 'item') {
        return this.array.getItem(this.index++);
      } else {
        return [this.index, this.array.getIndex(this.index++)];
      }
    }
  ]);

  return ArrayType;
})();


function BitfieldType(name, fields, Type){
  Type = getType(Type);
  var bytes = Type.prototype.bytes;

  var BitfieldT = function(data, offset, value){
    define(this, 'data', data);
    this.offset = offset == null ? data.position || 0 : offset;
    data.position = this.offset + bytes;
    if (value !== undefined) {
      this.set(value);
    }
  };

  define(BitfieldT, [
    function get(data, offset){
      return new BitfieldT(data, offset).get();
    },
    function set(data, offset, value){
      new BitfieldT(data, offset, value);
    },
    function sizeof(value){
      return bytes;
    }
  ]);

  BitfieldT.prototype = this;

  var names = create(null),
      flags = [];

  each(fields, function(field){
    var cased = field.name[0].toUpperCase() + field.name.slice(1),
        flag = field.value;

    names[field.name] = flag;

    BitfieldT.prototype['get'+cased] = function(){
      return (Type.get(this.data, this.offset) & flag) > 0;
    };

    BitfieldT.prototype['set'+cased] = function(value){
      var val = Type.get(this.data, this.offset);
      Type.set(this.data, this.offset, value ? val | flag : val & ~flag);
    };
  });


  define(this, {
    constructor: BitfieldT,
    bytes: bytes
  });

  define(this, [
    function get(){
      var out = {},
          value = Type.get(this.data, this.offset);

      for (var k in names) {
        out[k] = (value & names[k]) > 0
      }
      return out;
    },
    function set(value){
      if (typeof value === 'number') {
        var val = value;
      } else {
        var val = 0;
        for (var k in names) {
          if (k in value) {
            value[k] ? (val |= names[k]) : (val &= ~names[k]);
          }
        }
      }
      Type.set(this.data, this.offset, val);
    }
  ]);

  return BitfieldT;
}

function PointerType(name, PointeeType, alloc){
  var AddressType = getType('uint32'),
      addressSize = AddressType.prototype.bytes;

  PointeeType = getType(PointeeType);

  alloc = alloc || function(pointer, value){
    var address = pointer.data.position || 0;
    AddressType.set(pointer.data, pointer.offset, address);
    pointer.data.position += PointeeType.sizeof(value);
    return address;
  };

  var PointerT = function(data, offset, value){
    define(this, 'data', data);
    this.offset = offset == null ? data.position || 0 : offset;
    if (value !== undefined) {
      this.set(value);
    }
  };

  define(PointerT, [
    function get(data, offset){
      return new PointerT(data, offset).get();
    },
    function set(data, offset, value){
      new PointerT(data, offset, value);
    },
    function sizeof(value){
      return addressSize;
    }
  ]);

  define(PointerT, 'PointeeType', PointeeType);

  PointerT.prototype = this;

  define(this, {
    constructor: PointerT,
    bytes: addressSize
  });

  define(this, [
    function getAddress(){
      return AddressType.get(this.data, this.offset);
    },
    function setAddress(value){
      return AddressType.set(this.data, this.offset, value);
    },
    function get(){
      return PointeeType.get(this.data, this.getAddress());
    },
    function set(value){
      var address = this.getAddress() || alloc(this, value);
      PointeeType.set(this.data, address, value);
    }
  ]);

  if (PointeeType instanceof ArrayType) {
    var ElementType = PointeeType.elementType,
        elementSize = ElementType.prototype.bytes,
        LengthType = getType('uint32'),
        lengthBytes = LengthType.prototype.byte;

    define(this, [
      function getSize(){
        return this.getLength() * elementSize + lengthBytes;
      },
      function setLength(len){
        return LengthType.set(this.data, this.getAddress(), len);
      },
      function getLength(){
        return LengthType.get(this.data, this.getAddress());
      },
      function getIndex(index){
        return ElementType.get(this.data, this.getAddress() + lengthBytes + index * elementSize);
      },
      function setIndex(index, value){
        return ElementType.set(this.data, this.getAddress() + lengthBytes + index * elementSize, value);
      },
      function getItem(index){
        return new ElementType(this.data, this.getAddress() + lengthBytes + index * elementSize);
      }
    ]);
  }

  return PointerT;
}

var kinds = {
  number: function(def){
    return new NumericType(def.id[0].toUpperCase() + def.id.slice(1), def.bytes);
  },
  struct: function(def){
    return new StructType(def.id, def.properties);
  },
  array: function(def){
    return new ArrayType(def.id, def.elementType);
  },
  bitfield: function(def){
    return new BitfieldType(def.id, def.fields, def.type)
  },
  pointer: function(def){
    return new PointerType(def.id, def.pointeeType);
  }
};

register([
  {
    id: 'int8',
    kind: 'number',
    description: 'signed 8 bit integer',
    bytes: 1
  },
  {
    id: 'uint8',
    kind: 'number',
    description: 'unsigned 8 bit integer',
    bytes: 1
  },
  {
    id: 'int16',
    kind: 'number',
    description: 'signed 16 bit integer',
    bytes: 2
  },
  {
    id: 'uint16',
    kind: 'number',
    description: 'unsigned 16 bit integer',
    bytes: 2
  },
  {
    id: 'int32',
    kind: 'number',
    description: 'signed 32 bit integer',
    bytes: 4
  },
  {
    id: 'uint32',
    kind: 'number',
    description: 'unsigned 32 bit integer',
    bytes: 4
  },
  {
    id: 'float32',
    kind: 'number',
    description: '32 bit ieee754 float',
    bytes: 4
  },
  {
    id: 'float64',
    kind: 'number',
    description: '64 bit ieee754 double',
    bytes: 8
  },
  {
    id: 'string',
    kind: 'array',
    elementType: 'uint16'
  },
  {
    id: 'String',
    kind: 'pointer',
    pointeeType: 'string'
  },
  {
    id: 'Strings',
    kind: 'array',
    elementType: 'String'
  },
  {
    id: 'SourceLocation',
    kind: 'struct',
    description: 'A specific position in sourcecode.',
    properties: [
      { name: 'line', type: 'uint32' },
      { name: 'column', type: 'uint32' }
    ]
  },
  {
    id: 'SourceRange',
    kind: 'struct',
    description: 'A specific section of sourcecode.',
    properties: [
      { name: 'start', type: 'SourceLocation' },
      { name: 'end', type: 'SourceLocation' }
    ]
  },
  {
    id: 'Descriptor',
    kind: 'bitfield',
    type: 'uint8',
    fields: [
      { name: 'enumerable', value: 0x01 },
      { name: 'configurable', value: 0x02 },
      { name: 'writable', value: 0x04 },
      { name: 'accessor', value: 0x08 },
    ]
  },
  {
    id: 'CodeFlags',
    kind: 'bitfield',
    fields: [
      { name: 'topLevel', value: 0x01 },
      { name: 'strict', value: 0x02 },
      { name: 'usesSuper', value: 0x04 },
      { }
    ]
  },
  {
    id: 'Code',
    kind: 'struct',
    properties: [
      { name: 'flags', type: 'CodeFlags' },
      { name: 'loc', type: 'SourceRange' }
    ]
  },
  {
    id: 'Descriptors',
    kind: 'array',
    elementType: 'Descriptor'
  },
  {


  }
]);

void function(){
  var string = getType('string'),
      getter = string.prototype.get,
      setter = string.prototype.set,
      charCode = String.fromCharCode;

  define(string.prototype, [
    function get(){
      return charCode.apply(null, getter.call(this));
    },
    function set(value){
      return setter.call(this, map(new String(value), function(chr){
        return chr.charCodeAt(0);
      }));
    }
  ]);
}();


var data = new DataView(new ArrayBuffer(1600));
var buff = new Uint32Array(data.buffer);

var Strings = getType('Strings');

var x = new Strings(data, 0, Object.keys(global));

x.forEach(function(v){
  console.log(v.getAddress());
});


// var x = new Range(data, 0, { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } });

// console.log(buff);


/*
{ topLevel: true,
  imports: [],
  path: [],
  range: [ 0, 15 ],
  loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
  LexicalDeclarations: [],
  transfers: [],
  ScopeType: 2,
  Type: 0,
  VarDeclaredNames: [ 'x' ],
  NeedsSuperBinding: false,
  Strict: false,
  ops:
   [ LITERAL(5),
     GET(),
     LITERAL(10),
     GET(),
     BINARY(13),
     GET(),
     VAR('x'),
     COMPLETE() ],
  filename: undefined }

*/
