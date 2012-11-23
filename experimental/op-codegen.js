//!#es6

function indent(parts, ...values){
  var combined = '';
  for (var [index, part] of parts) {
    combined += part;
    if (index in value) {
      combined += values[index];
    }
  }
  combined.split('\n')
}

function opcode(name, body){
  return `
    function ${name}(){
      ${body}
      return cmds[++ip];
    }
  `;
}

function binary(name, op){
  return opcode(name, `
    ${completion('lhs', 'sp - 2')}
    ${completion('rhs', 'sp - 1')}
    stack[--sp] = lhs ${op} rhs;
  `);
}

function unary(name, op){
  return opcode(name, `
    ${completion('arg', 'sp - 1')}
    stack[sp - 1] = ${op}arg;
  `);
}

function type(name, type){
  return opcode(name, `
    ${completion('arg', 'sp - 1')}
    stack[sp - 1] = typeof arg === "${type}";
  `);
}

function method(name, method){
  return opcode(name, `
    ${completion('lhs', 'sp - 2')}
    ${completion('rhs', 'sp - 1')}
    stack[--sp] = rhs.${method}(lhs);
  `);
}


function completion(name, sp){
  return `
    var ${name} = stack[${sp}];
    if (${name} && ${name}.Completion) {
      if (${name}.Abrupt) {
        error = ${name};
        return unwind;
      } else {
        stack[${sp}] = ${name} = ${name}.value;
      }
    }
  `;
}


var code = `
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
  ${binary('CONCAT', '+ "" +')}
  ${binary('SUB', '-')}
  ${binary('SHL', '<<')}
  ${binary('SHR', '>>')}
  ${binary('SAR', '>>>')}
  ${binary('BIT_OR', '|')}
  ${binary('BIT_AND', '&')}
  ${binary('BIT_XOR', '^')}
`;


console.log(code);
