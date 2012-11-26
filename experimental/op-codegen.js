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
    each = utility.each;

function FixedStructure(data){
  this.data = data;
  this.offset = data.position;
  data.position += this.bytes;
}

function Type(){}


var types = Object.create(null);

function NumericType(name, bytes){
  var getter = 'get'+name,
      setter = 'set'+name;

  var Numeric = function(data, offset, value){
    this.data = data;
    if (value !== undefined) {
      this.offset = offset;
      this.set(value);
    } else {
      this.offset = data.position || 0;
    }
    data.position = this.offset + bytes;
  };

  define(Numeric, [
    function get(data, offset){
      return data[getter](offset, true);
    },
    function set(data, offset, value){
      return data[setter](offset, value, true);
    }
  ]);

  Numeric.prototype = this;

  define(this, {
    constructor: Numeric,
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

  return types[name] = Numeric;
}

inherit(NumericType, Type);

var int8    = new NumericType('Int8', 1),
    uint8   = new NumericType('Uint8', 1),
    int16   = new NumericType('Int16', 2),
    uint16  = new NumericType('Uint16', 2),
    int32   = new NumericType('Int32', 4),
    uint32  = new NumericType('Uint32', 4),
    float32 = new NumericType('Float32', 4),
    float64 = new NumericType('Float64', 8);


function StructType(name, fields){
  var Struct = function(data, offset, value){
    define(this, 'data', data);
    this.offset = offset == null ? data.position || 0 : offset;
    data.position = this.offset + this.bytes;
    if (value !== undefined) {
      this.set(value);
    }
  };

  define(Struct, [
    function get(data, offset){
      return new Struct(data, offset).get();
    },
    function set(data, offset, value){
      new Struct(data, offset, value);
    }
  ]);

  Struct.prototype = this;


  var currentOffset = 0,
      names = [],
      getters = [],
      setters = [];

  each(fields, function(field, name){
    var cased = name[0].toUpperCase()+name.slice(1),
        type = typeof field === 'string' ? types[field] : field,
        offset = currentOffset;

    currentOffset += type.prototype.bytes;
    names.push(name);
    getters.push('get'+cased);
    setters.push('set'+cased);

    Struct.prototype['get'+cased] = function(){
      return type.get(this.data, this.offset + offset);
    };

    Struct.prototype['set'+cased] = function(value){
      return type.set(this.data, this.offset + offset, value);
    };
  });



  define(this, {
    constructor: Struct,
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

  return types[name] = Struct;
}

var Location = new StructType('Location', {
  line: Uint32,
  column: Uint32
});

var Range = new StructType('Range', {
  start: Location,
  end: Location
});


var types = [
  {
    id: 'SourceLocation',
    type: 'struct',
    description: 'A specific position in sourcecode.',
    properties: [
      { name: 'line', type: 'uint32' },
      { name: 'column', type: 'uint32' }
    ]
  },
  {
    id: 'SourceRange',
    type: 'struct',
    description: 'A specific section of sourcecode.',
    properties: [
      { name: 'start', type: 'SourceLocation' },
      { name: 'end', type: 'SourceLocation' }
    ]
  },
}



var data = new DataView(new ArrayBuffer(16));
var buff = new Uint32Array(data.buffer);

var x = new Range(data, 0, { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } });

console.log(buff);


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
